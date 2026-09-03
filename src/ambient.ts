const MUTED_KEY = 'thamar-music-off'
const VOLUME = 0.7
const SONG_SRC = '/audio/simply-the-best.mp3'

const icons = {
  on: `<svg class="music-toggle__icon music-toggle__icon--on" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 18.2a2.7 2.7 0 1 1-2.4-2.68V7.15l10-2.1v9.48a2.7 2.7 0 1 1-2.4-2.68V7.55L10 8.95z"/></svg>`,
  off: `<svg class="music-toggle__icon music-toggle__icon--off" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 18.2a2.7 2.7 0 1 1-2.4-2.68V7.15l10-2.1v9.48a2.7 2.7 0 1 1-2.4-2.68V7.55L10 8.95z"/><path d="M4.2 5.1 19.8 18.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
}

let audio: HTMLAudioElement | null = null
let playing = false
let wanted = true
let ducked = false

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

function hideCues(): void {
  document.querySelectorAll<HTMLElement>('.loader__song').forEach((cue) => {
    cue.hidden = true
  })
}

function showCues(): void {
  document.querySelectorAll<HTMLElement>('.loader__song').forEach((cue) => {
    cue.hidden = false
  })
}

function syncToggles(): void {
  const on = wanted
  document.querySelectorAll<HTMLButtonElement>('[data-music-toggle]').forEach((button) => {
    button.classList.toggle('is-on', on)
    button.setAttribute('aria-pressed', String(on))
    button.setAttribute('aria-label', on ? 'Turn music off' : 'Turn music on')
  })
}

function tryPlay(): void {
  if (!audio || !wanted || ducked) return
  audio.muted = false
  audio.volume = VOLUME
  const start = audio.play()
  if (start) {
    void start
      .then(() => {
        playing = true
        hideCues()
        syncToggles()
      })
      .catch(() => {
        playing = false
        if (wanted && !ducked) showCues()
      })
  }
}

function pause(): void {
  audio?.pause()
  playing = false
}

function ensurePlayer(): void {
  if (audio) return

  audio = new Audio(SONG_SRC)
  audio.className = 'ambient-audio'
  audio.loop = true
  audio.preload = 'auto'
  audio.setAttribute('playsinline', '')
  audio.setAttribute('aria-hidden', 'true')
  audio.volume = VOLUME
  document.body.appendChild(audio)

  audio.addEventListener('playing', () => {
    playing = true
    hideCues()
    syncToggles()
  })
  audio.addEventListener('pause', () => {
    playing = false
  })
  audio.addEventListener('error', () => {
    playing = false
    if (wanted && !ducked) showCues()
  })

  if (wanted && !ducked) tryPlay()
}

export function renderMusicToggle(): string {
  return `
    <button type="button" class="music-toggle is-on" data-music-toggle aria-pressed="true" aria-label="Turn music off">
      ${icons.on}
      ${icons.off}
    </button>
  `
}

export function attachAmbientCue(root: HTMLElement): () => void {
  const cue = document.createElement('button')
  cue.type = 'button'
  cue.className = 'loader__song'
  cue.hidden = true
  cue.setAttribute('aria-label', 'Play Simply the Best by Billianne')
  cue.innerHTML = '<span aria-hidden="true">♪</span> Simply the Best — Billianne'
  root.appendChild(cue)

  const onGesture = () => {
    if (!wanted || ducked) return
    tryPlay()
    if (playing) cue.hidden = true
  }

  cue.addEventListener('click', (event) => {
    event.stopPropagation()
    onGesture()
  })
  root.addEventListener('pointerdown', onGesture)

  const timer = window.setTimeout(() => {
    if (!playing && wanted && !ducked) cue.hidden = false
  }, 900)

  return () => {
    window.clearTimeout(timer)
    root.removeEventListener('pointerdown', onGesture)
    cue.remove()
  }
}

export function duckAmbient(): void {
  ducked = true
  pause()
  syncToggles()
}

export function unduckAmbient(): void {
  if (!ducked) return
  ducked = false
  if (wanted) tryPlay()
  syncToggles()
}

export function initAmbient(): void {
  wanted = !readMuted()
  ensurePlayer()
  syncToggles()

  const unlock = () => {
    if (wanted) tryPlay()
  }
  document.addEventListener('pointerdown', unlock)
  document.addEventListener('keydown', unlock)

  document.querySelectorAll<HTMLButtonElement>('[data-music-toggle]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation()
      if (wanted) {
        wanted = false
        writeMuted(true)
        pause()
      } else {
        wanted = true
        writeMuted(false)
        ducked = false
        tryPlay()
      }
      syncToggles()
    })
  })
}
