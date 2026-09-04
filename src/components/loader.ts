import { playAmbient, unmuteAmbient } from '../ambient'

const OPENED_KEY = 'thamar-opened'

/** Hold long enough for a couple envelope cycles, even if the page is ready sooner. */
const MIN_VISIBLE_MS = 10000
const MAX_WAIT_MS = 10600
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
  'Counting down to 04 · 10 · 2026…',
  'Almost yours…',
]

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

function ensureOpenStyles(): void {
  if (document.getElementById('loader-open-style')) return
  const style = document.createElement('style')
  style.id = 'loader-open-style'
  style.textContent = `
    .loader__open {
      position: absolute;
      z-index: 8;
      left: 50%;
      bottom: max(2.85rem, env(safe-area-inset-bottom, 0px) + 2.4rem);
      transform: translateX(-50%);
      appearance: none;
      border: 1px solid rgba(200, 164, 92, 0.42);
      border-radius: 0.28rem;
      background: rgba(251, 249, 244, 0.88);
      box-shadow: 0 10px 24px -14px rgba(106, 91, 89, 0.45);
      cursor: pointer;
      margin: 0;
      padding: 0.72rem 1.35rem;
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-indent: 0.16em;
      text-transform: uppercase;
      color: #6a5b59;
      transition: opacity 0.4s ease, color 0.25s ease, background 0.25s ease, border-color 0.25s ease;
      animation: loader-fade 1s ease 1.1s backwards;
    }
    .loader__open:hover,
    .loader__open:focus-visible {
      color: #1b1c19;
      border-color: rgba(200, 164, 92, 0.7);
      background: rgba(255, 252, 247, 0.96);
      outline: none;
    }
    .loader.is-done .loader__open { opacity: 0; pointer-events: none; }
    html[data-theme='dark'] .loader__open {
      color: #e8d48a;
      border-color: rgba(232, 212, 138, 0.34);
      background: rgba(12, 18, 36, 0.78);
      box-shadow: 0 10px 24px -12px rgba(0, 0, 0, 0.65);
    }
    html[data-theme='dark'] .loader__open:hover,
    html[data-theme='dark'] .loader__open:focus-visible {
      color: #f4e7b0;
      border-color: rgba(232, 212, 138, 0.55);
      background: rgba(18, 26, 48, 0.92);
    }
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
  const cue = ensureOpenCue(root)
  void playAmbient()

  root.setAttribute('aria-label', 'Opening the invitation — tap to open early, or wait until ready')

  let opened = false

  const dismiss = (fromGesture: boolean) => {
    if (opened || root.classList.contains('is-done')) return
    opened = true
    markOpened()
    stopMessages()
    cue.removeEventListener('click', onGesture)

    if (fromGesture) unmuteAmbient()
    else void playAmbient()

    root.classList.add('is-done')
    document.documentElement.classList.remove('is-loading')
    window.setTimeout(() => root.remove(), 800)
  }

  const onGesture = () => dismiss(true)
  cue.addEventListener('click', onGesture)

  void whenReady().then(async () => {
    stopMessages()
    await playAmbient()
    dismiss(false)
  })
}
