import { playAmbient, unmuteAmbient } from '../ambient'

const OPENED_KEY = 'thamar-opened'

/** Auto-open if the guest never taps. */
const AUTO_OPEN_MS = 7000
const MESSAGE_MS = 950
const SWAP_MS = 350

const MESSAGES = [
  'Unsealing your invitation…',
  'Pressing the wax seal…',
  'Cueing Simply the Best…',
  'Folding in the good news…',
  'Setting a place for you…',
  'Tying the ribbon…',
  'Warming up the sangeet stage…',
  'Tap to open anytime…',
  'Almost yours…',
]

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

function ensureOpenStyles(): void {
  if (document.getElementById('loader-open-style')) return
  const style = document.createElement('style')
  style.id = 'loader-open-style'
  style.textContent = `
    .loader.is-openable { cursor: pointer; }
    .loader__open {
      appearance: none; border: 0; background: transparent; cursor: pointer;
      margin: 0; padding: 0.15rem 0.4rem; min-height: 1.5em;
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 0.68rem; font-weight: 600; letter-spacing: 0.16em; text-indent: 0.16em;
      text-transform: uppercase; color: #a08256;
      transition: opacity 0.4s ease, color 0.25s ease;
      animation: loader-fade 1s ease 1.1s backwards;
    }
    .loader__open:hover,
    .loader__open:focus-visible { color: #6a5b59; outline: none; }
    .loader.is-done .loader__open { opacity: 0; }
    html[data-theme='dark'] .loader__open { color: #c8a45c; }
    html[data-theme='dark'] .loader__open:hover,
    html[data-theme='dark'] .loader__open:focus-visible { color: #e8d48a; }
  `
  document.head.appendChild(style)
}

function ensureOpenCue(root: HTMLElement): HTMLButtonElement {
  ensureOpenStyles()
  const existing = root.querySelector<HTMLButtonElement>('.loader__open')
  if (existing) return existing

  const cue = document.createElement('button')
  cue.type = 'button'
  cue.className = 'loader__open'
  cue.textContent = 'Tap to open'
  cue.setAttribute('aria-label', 'Open the invitation')
  root.appendChild(cue)
  return cue
}

export function initLoader(): void {
  const root = document.getElementById('site-loader')
  if (!root) return

  if (alreadyOpened()) {
    hideLoader(root)
    void playAmbient()
    return
  }

  const stopMessages = cycleMessages(root)
  ensureOpenCue(root)
  void playAmbient()

  root.classList.add('is-openable')
  root.setAttribute(
    'aria-label',
    'Opening the invitation — tap to enter, or wait a few seconds',
  )

  let opened = false
  let autoTimer = 0

  const dismiss = (fromGesture: boolean) => {
    if (opened || root.classList.contains('is-done')) return
    opened = true
    markOpened()
    stopMessages()
    window.clearTimeout(autoTimer)
    root.removeEventListener('click', onGesture)

    if (fromGesture) unmuteAmbient()
    else void playAmbient()

    root.classList.add('is-done')
    document.documentElement.classList.remove('is-loading')
    window.setTimeout(() => root.remove(), 800)
  }

  const onGesture = () => dismiss(true)

  root.addEventListener('click', onGesture)

  autoTimer = window.setTimeout(() => dismiss(false), AUTO_OPEN_MS)
}
