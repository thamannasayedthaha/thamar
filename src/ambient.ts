import { isMixtapeSessionPlaying, pauseMixtapePlayback } from './mixtape'

const MUTED_KEY = 'thamar-music-off'
const VOLUME = 0.7
const SONG_SRC = '/audio/simply-the-best.mp3'

const icons = {
  on: `<svg class="music-toggle__icon music-toggle__icon--on" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 18.2a2.7 2.7 0 1 1-2.4-2.68V7.15l10-2.1v9.48a2.7 2.7 0 1 1-2.4-2.68V7.55L10 8.95z"/></svg>`,
  off: `<svg class="music-toggle__icon music-toggle__icon--off" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 18.2a2.7 2.7 0 1 1-2.4-2.68V7.15l10-2.1v9.48a2.7 2.7 0 1 1-2.4-2.68V7.55L10 8.95z"/><path d="M4.2 5.1 19.8 18.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
}

let audio: HTMLAudioElement | null = null
let wanted = true
let ducked = false
let unlockBound = false

function readMuted(): boolean {
  try {
    return sessionStorage.getItem(MUTED_KEY) === '1'
  } catch {
    return false
  }
}

function writeMuted(off: boolean): void {
  try {
    if (off) sessionStorage.setItem(MUTED_KEY, '1')
    else sessionStorage.removeItem(MUTED_KEY)
  } catch {
    /* preference still applies for this visit */
  }
}

function syncToggles(): void {
  const on = wanted
  document.querySelectorAll<HTMLButtonElement>('[data-music-toggle]').forEach((button) => {
    button.classList.toggle('is-on', on)
    button.setAttribute('aria-pressed', String(on))
    button.setAttribute('aria-label', on ? 'Turn music off' : 'Turn music on')
  })
}

function isRunning(): boolean {
  return Boolean(audio && !audio.paused && !audio.ended)
}

function isAudible(): boolean {
  return Boolean(isRunning() && audio && !audio.muted && audio.volume > 0)
}

function applyAudible(): void {
  if (!audio) return
  audio.muted = false
  audio.volume = VOLUME
}

/**
 * Start (or restart) audible playback. Never falls back to muted —
 * muted autoplay gets stuck silent in Chrome until a gesture.
 */
export function playAmbient(): Promise<boolean> {
  ensurePlayer()
  if (!audio || !wanted || ducked) return Promise.resolve(false)
  if (isAudible()) {
    syncToggles()
    return Promise.resolve(true)
  }

  // Silent autoplay leftover — stop it and try with sound.
  if (isRunning() && audio.muted) {
    audio.pause()
  }

  applyAudible()
  const start = audio.play()
  if (!start) {
    syncToggles()
    return Promise.resolve(isAudible())
  }

  return start
    .then(() => {
      applyAudible()
      syncToggles()
      return isAudible()
    })
    .catch(() => {
      syncToggles()
      return false
    })
}

/** Unmute + play inside a user-gesture turn (browser autoplay unlock). */
export function unmuteAmbient(): void {
  if (!wanted || ducked) return
  ensurePlayer()
  if (!audio) return
  applyAudible()
  const start = audio.play()
  if (start) void start.then(() => syncToggles()).catch(() => syncToggles())
  else syncToggles()
}

function pause(): void {
  audio?.pause()
}

function bindAudio(el: HTMLAudioElement): void {
  audio = el
  audio.loop = true
  audio.preload = 'auto'
  audio.volume = VOLUME
  audio.removeAttribute('autoplay')
  audio.setAttribute('playsinline', '')
  audio.setAttribute('webkit-playsinline', '')
  audio.setAttribute('aria-hidden', 'true')

  audio.addEventListener('playing', () => {
    if (wanted && audio && !audio.muted) syncToggles()
  })
}

function ensurePlayer(): void {
  if (audio) return

  const existing = document.querySelector<HTMLAudioElement>('#intro-audio')
  if (existing) {
    bindAudio(existing)
  } else {
    const created = new Audio(SONG_SRC)
    created.id = 'intro-audio'
    created.className = 'ambient-audio'
    document.body.appendChild(created)
    bindAudio(created)
  }
}

function isMusicToggleEvent(event: Event): boolean {
  const target = event.target
  return (
    target instanceof Element &&
    Boolean(target.closest('[data-music-toggle], [data-mixtape-mini], [data-deck-play], [data-deck-stop], [data-deck-prev], [data-deck-next], [data-track]'))
  )
}

function bindUnlock(): void {
  if (unlockBound) return
  unlockBound = true

  const unlock = (event: Event) => {
    if (isMusicToggleEvent(event)) return
    unmuteAmbient()
  }

  document.addEventListener('pointerdown', unlock, true)
  document.addEventListener('touchstart', unlock, { capture: true, passive: true })
  document.addEventListener('keydown', unlock, true)
}

export function renderMusicToggle(): string {
  return `
    <button type="button" class="music-toggle is-on" data-music-toggle aria-pressed="true" aria-label="Turn music off">
      ${icons.on}
      ${icons.off}
    </button>
  `
}

export function duckAmbient(): void {
  ducked = true
  pause()
  syncToggles()
}

export function unduckAmbient(): void {
  if (!ducked) return
  ducked = false
  if (wanted) void playAmbient()
  syncToggles()
}

export function initAmbient(): void {
  wanted = !readMuted()
  ensurePlayer()

  if (!wanted) {
    pause()
    if (audio) audio.muted = true
  } else if (audio) {
    // Drop any muted autoplay so we can start with sound.
    if (audio.muted || (isRunning() && audio.muted)) {
      audio.pause()
      audio.muted = false
    }
    applyAudible()
  }

  syncToggles()
  bindUnlock()

  // Mixtape owns audio when a session is mid-play — don't fight it on load.
  if (isMixtapeSessionPlaying()) {
    ducked = true
    pause()
    if (audio) audio.muted = true
  } else if (wanted && !ducked) {
    void playAmbient()

    const retry = window.setInterval(() => {
      if (!wanted || ducked || isAudible() || isMixtapeSessionPlaying()) {
        window.clearInterval(retry)
        syncToggles()
        return
      }
      void playAmbient()
    }, 350)
    window.setTimeout(() => {
      window.clearInterval(retry)
      syncToggles()
    }, 12000)
  }

  document.querySelectorAll<HTMLButtonElement>('[data-music-toggle]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (wanted) {
        wanted = false
        writeMuted(true)
        pause()
        if (audio) audio.muted = true
      } else {
        wanted = true
        writeMuted(false)
        pauseMixtapePlayback()
        ducked = false
        if (audio) audio.muted = false
        unmuteAmbient()
      }
      syncToggles()
    })
  })
}
