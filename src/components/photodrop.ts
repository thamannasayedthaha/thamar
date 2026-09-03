import QRCode from 'qrcode'
import type { WeddingConfig } from '../types'
import { renderWcWash } from './watercolor'

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

export function renderPhotoDrop(config: WeddingConfig): string {
  const { url, note } = config.photoUpload
  const { monogram } = config.couple

  const action = url
    ? `<a class="photodrop__link label-caps" href="${url}" target="_blank" rel="noopener noreferrer">Open the album</a>`
    : `<p class="photodrop__pending">The album is almost ready — check back soon.</p>`

  const code = url
    ? `<canvas data-photodrop-qr width="188" height="188" role="img"
        aria-label="QR code linking to the shared photo album"></canvas>`
    : `<div class="photodrop__placeholder">${cameraMark()}<span>Your QR will live here</span></div>`

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
          <div class="photodrop__qr">${code}</div>
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

export async function initPhotoDrop(config: WeddingConfig): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-photodrop-qr]')
  const { url } = config.photoUpload
  if (!canvas || !url) return

  await QRCode.toCanvas(canvas, url, {
    width: 188,
    margin: 1,
    color: { dark: '#54634c', light: '#fffdf8' },
  })
}
