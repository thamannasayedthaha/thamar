import { wedding } from '../config'
import { loadYouTubeApi, type YtPlayer } from '../youtube'

const OPENED_KEY = 'thamar-opened'

/** First landing holds for four full envelope cycles, whether or not the page is ready sooner. */
const MIN_VISIBLE_MS = 10000
const MAX_WAIT_MS = 10600
const MESSAGE_MS = 950
const SWAP_MS = 350
const LOADER_VOLUME = 70

const MESSAGES = [
  'Unsealing your invitation…',
  'Pressing the wax seal…',
  'Cueing Simply the Best…',
  'Folding in the good news…',
  'Setting a place for you…',
  'Tying the ribbon…',
  'Warming up the sangeet stage…',
  'Counting down to 04 · 10 · 2026…',
  'Almost yours…',
]

/** Billianne — Simply the Best (from the soundtrack mixtape). */
const LOADER_SONG_ID =
  wedding.soundtrack.tracks.find((track) => track.id === 'she-asked')?.youtubeId ?? 'lVCqH2kl9fI'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function whenReady(): Promise<void> {
  const started = performance.now()

  const fonts = document.fonts?.ready ?? Promise.resolve()
  const loaded =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))

  await Promise.race([Promise.all([fonts, loaded]), wait(MAX_WAIT_MS)])

  const elapsed = performance.now() - started
  if (elapsed < MIN_VISIBLE_MS) await wait(MIN_VISIBLE_MS - elapsed)
}

function cycleMessages(root: HTMLElement): () => void {
  const msg = root.querySelector<HTMLElement>('.loader__msg')
  if (!msg) return () => {}

  let index = 0
  let swapTimer = 0

  const timer = window.setInterval(() => {
    index = (index + 1) % MESSAGES.length
    msg.classList.add('is-swapping')
    swapTimer = window.setTimeout(() => {
      msg.textContent = MESSAGES[index]
      msg.classList.remove('is-swapping')
    }, SWAP_MS)
  }, MESSAGE_MS + SWAP_MS)

  return () => {
    window.clearInterval(timer)
    window.clearTimeout(swapTimer)
  }
}

function alreadyOpened(): boolean {
  try {
    return sessionStorage.getItem(OPENED_KEY) === '1'
  } catch {
    return false
  }
}

function markOpened(): void {
  try {
    sessionStorage.setItem(OPENED_KEY, '1')
  } catch {
    /* ignore blocked storage */
  }
}

function hideLoader(root: HTMLElement): void {
  document.documentElement.classList.remove('is-loading')
  document.documentElement.classList.add('is-loaded')
  root.remove()
}

/** Plays Billianne’s Simply the Best under the envelope; returns a stop/fade helper. */
function startLoaderSong(root: HTMLElement): () => void {
  let player: YtPlayer | null = null
  let stopped = false
  let started = false
  let fadeTimer = 0

  const host = document.createElement('div')
  host.className = 'loader__yt'
  host.setAttribute('aria-hidden', 'true')
  host.innerHTML = '<div id="loader-yt-player"></div>'
  root.appendChild(host)

  const cue = document.createElement('button')
  cue.type = 'button'
  cue.className = 'loader__song'
  cue.hidden = true
  cue.setAttribute('aria-label', 'Play Simply the Best by Billianne')
  cue.innerHTML = '<span aria-hidden="true">♪</span> Simply the Best — Billianne'
  root.appendChild(cue)

  const tryPlay = () => {
    if (stopped || !player || started) return
    try {
      player.setVolume(LOADER_VOLUME)
      player.playVideo()
    } catch {
      cue.hidden = false
    }
  }

  const onGesture = () => {
    tryPlay()
    if (started) cue.hidden = true
  }

  cue.addEventListener('click', (event) => {
    event.stopPropagation()
    onGesture()
  })
  root.addEventListener('pointerdown', onGesture)

  void loadYouTubeApi()
    .then((YT) => {
      if (stopped) return
      player = new YT.Player('loader-yt-player', {
        height: '1',
        width: '1',
        videoId: LOADER_SONG_ID,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (stopped) return
            event.target.setVolume(LOADER_VOLUME)
            event.target.playVideo()
            // If autoplay is blocked, surface a gentle tap cue after a beat.
            window.setTimeout(() => {
              if (!stopped && !started) cue.hidden = false
            }, 900)
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              started = true
              cue.hidden = true
            }
          },
          onError: () => {
            if (!stopped) cue.hidden = false
          },
        },
      })
    })
    .catch(() => {
      if (!stopped) cue.hidden = false
    })

  return () => {
    if (stopped) return
    stopped = true
    root.removeEventListener('pointerdown', onGesture)
    cue.remove()

    if (!player) {
      host.remove()
      return
    }

    let volume = LOADER_VOLUME
    fadeTimer = window.setInterval(() => {
      volume = Math.max(0, volume - 12)
      try {
        player?.setVolume(volume)
      } catch {
        /* player may already be gone */
      }
      if (volume <= 0) {
        window.clearInterval(fadeTimer)
        try {
          player?.stopVideo()
          player?.destroy()
        } catch {
          /* ignore */
        }
        player = null
        host.remove()
      }
    }, 60)
  }
}

export function initLoader(): void {
  const root = document.getElementById('site-loader')
  if (!root) return

  if (alreadyOpened()) {
    hideLoader(root)
    return
  }

  const stopMessages = cycleMessages(root)
  const stopSong = startLoaderSong(root)

  const dismiss = () => {
    if (root.classList.contains('is-done')) return
    markOpened()
    stopMessages()
    stopSong()
    root.classList.add('is-done')
    document.documentElement.classList.remove('is-loading')
    window.setTimeout(() => root.remove(), 800)
  }

  void whenReady().then(dismiss)
}
