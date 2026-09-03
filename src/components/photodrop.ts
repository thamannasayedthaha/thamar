import QRCode from 'qrcode'
import type { WeddingConfig } from '../types'
import { renderWcWash } from './watercolor'

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>
}

type BarcodeDetectorCtor = new (options?: { formats: string[] }) => BarcodeDetectorLike

function cameraMark(): string {
  return `
    <svg class="photodrop__camera" viewBox="0 0 88 72" aria-hidden="true">
      <rect x="8" y="20" width="72" height="46" rx="10" fill="#fbf9f4" stroke="#8c9c82" stroke-width="2"/>
      <path d="M28 20l6-10h20l6 10" fill="#f3dedc" stroke="#8c9c82" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="44" cy="44" r="12" fill="#ecdcfd" stroke="#655974" stroke-width="2"/>
      <circle cx="44" cy="44" r="5" fill="#655974"/>
      <circle cx="68" cy="32" r="3" fill="#f4d35e"/>
      <path d="M62 12c4-6 12-4 12 2 0 6-8 8-12 12-4-4-12-6-12-12 0-6 8-8 12-2z" fill="#e8b7be"/>
    </svg>
  `
}

function scannerFrame(hasAlbum: boolean): string {
  return `
    <div class="photodrop__scanner" data-photodrop-scanner>
      <div class="photodrop__viewfinder" role="group" aria-label="QR scanner">
        <video class="photodrop__video" data-photodrop-video playsinline muted></video>
        <canvas class="photodrop__code" data-photodrop-qr width="188" height="188" hidden></canvas>
        <div class="photodrop__corners" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </div>
        <div class="photodrop__scanline" aria-hidden="true"></div>
        <div class="photodrop__idle" data-photodrop-idle>
          ${cameraMark()}
          <span>Tap to scan</span>
        </div>
      </div>
      <p class="photodrop__status" data-photodrop-status>
        ${hasAlbum ? 'Scan with your phone, or open the scanner' : 'Point your camera at the album QR'}
      </p>
      <button type="button" class="photodrop__scan-btn label-caps" data-photodrop-toggle>
        Open scanner
      </button>
    </div>
  `
}

export function renderPhotoDrop(config: WeddingConfig): string {
  const { url, note } = config.photoUpload
  const { monogram } = config.couple
  const hasAlbum = Boolean(url.trim())

  const action = hasAlbum
    ? `<a class="photodrop__link label-caps" href="${url}" target="_blank" rel="noopener noreferrer">Open the album</a>`
    : `<p class="photodrop__pending">The album is almost ready — check back soon.</p>`

  const polaroid = (side: string, image: string, caption: string) => `
    <figure class="photodrop__polaroid photodrop__polaroid--${side}" aria-hidden="true">
      <img src="${image}" alt="" />
      <figcaption>${caption}</figcaption>
    </figure>
  `

  return `
    <section class="section" id="photos" aria-labelledby="photodrop-heading">
      <h2 id="photodrop-heading" class="section__title">Share the Love</h2>
      <p class="section__lede">${note}</p>
      <div class="photodrop__stage">
        ${renderWcWash('wc--wash-photodrop')}
        ${polaroid('left', config.gallery[0]?.src ?? '', `#${monogram.replace('&', '')}2026`)}
        ${polaroid('right', config.gallery[2]?.src ?? config.gallery[1]?.src ?? '', 'Cheers!')}
        <div class="photodrop__card">
          <span class="photodrop__seal" aria-hidden="true">${monogram}</span>
          <p class="photodrop__kicker label-caps">Drop a keepsake</p>
          <div class="photodrop__qr">${scannerFrame(hasAlbum)}</div>
          <ol class="photodrop__steps">
            <li><span>1</span>Scan</li>
            <li><span>2</span>Open</li>
            <li><span>3</span>Add your photos</li>
          </ol>
          ${action}
        </div>
      </div>
    </section>
  `
}

function getBarcodeDetector(): BarcodeDetectorCtor | null {
  return (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector ?? null
}

function looksLikeUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export async function initPhotoDrop(config: WeddingConfig): Promise<void> {
  const root = document.querySelector<HTMLElement>('[data-photodrop-scanner]')
  if (!root) return

  const video = root.querySelector<HTMLVideoElement>('[data-photodrop-video]')
  const qrCanvas = root.querySelector<HTMLCanvasElement>('[data-photodrop-qr]')
  const idle = root.querySelector<HTMLElement>('[data-photodrop-idle]')
  const status = root.querySelector<HTMLElement>('[data-photodrop-status]')
  const toggle = root.querySelector<HTMLButtonElement>('[data-photodrop-toggle]')
  if (!video || !qrCanvas || !idle || !status || !toggle) return

  const albumUrl = config.photoUpload.url.trim()
  const idleStatus = albumUrl
    ? 'Scan with your phone, or open the scanner'
    : 'Point your camera at the album QR'

  if (albumUrl) {
    await QRCode.toCanvas(qrCanvas, albumUrl, {
      width: 188,
      margin: 1,
      color: { dark: '#54634c', light: '#fffdf8' },
    })
    qrCanvas.hidden = false
    qrCanvas.setAttribute('role', 'img')
    qrCanvas.setAttribute('aria-label', 'QR code linking to the shared photo album')
    root.classList.add('has-code')
    idle.hidden = true
  }

  let stream: MediaStream | null = null
  let raf = 0
  let scanning = false
  let handled = false

  const setStatus = (message: string) => {
    status.textContent = message
  }

  const stopScanner = (message = idleStatus) => {
    scanning = false
    cancelAnimationFrame(raf)
    stream?.getTracks().forEach((track) => track.stop())
    stream = null
    video.srcObject = null
    root.classList.remove('is-scanning')
    if (albumUrl) {
      qrCanvas.hidden = false
      idle.hidden = true
    } else {
      idle.hidden = false
    }
    toggle.textContent = 'Open scanner'
    setStatus(message)
  }

  const openResult = (raw: string) => {
    if (handled || !looksLikeUrl(raw)) return

    handled = true
    root.classList.add('is-found')
    setStatus('Got it — opening the link…')
    stopScanner('Got it — opening the link…')
    window.setTimeout(() => root.classList.remove('is-found'), 1200)
    window.open(raw, '_blank', 'noopener,noreferrer')
  }

  const tick = async (detector: BarcodeDetectorLike) => {
    if (!scanning || handled) return

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      try {
        const codes = await detector.detect(video)
        const hit = codes.find((code) => code.rawValue)?.rawValue
        if (hit) {
          openResult(hit)
          return
        }
      } catch {
        /* keep scanning */
      }
    }

    raf = requestAnimationFrame(() => {
      void tick(detector)
    })
  }

  const startScanner = async () => {
    if (scanning) {
      handled = false
      stopScanner()
      return
    }

    const Detector = getBarcodeDetector()
    if (!Detector) {
      setStatus(
        albumUrl
          ? 'Live scanning needs Chrome or Edge — use your phone camera on the code above.'
          : 'QR scanning needs Chrome or Edge on this device.',
      )
      return
    }

    if (!window.isSecureContext) {
      setStatus('Camera scanning needs a secure (https) connection.')
      return
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
      })
    } catch {
      setStatus('Camera permission is needed to scan.')
      return
    }

    video.srcObject = stream
    await video.play()
    scanning = true
    handled = false
    qrCanvas.hidden = true
    idle.hidden = true
    root.classList.add('is-scanning')
    root.classList.remove('is-found')
    toggle.textContent = 'Close scanner'
    setStatus('Align the QR inside the frame')

    const detector = new Detector({ formats: ['qr_code'] })
    raf = requestAnimationFrame(() => {
      void tick(detector)
    })
  }

  toggle.addEventListener('click', () => {
    void startScanner()
  })

  idle.addEventListener('click', () => {
    void startScanner()
  })

  window.addEventListener('pagehide', () => stopScanner())
}
