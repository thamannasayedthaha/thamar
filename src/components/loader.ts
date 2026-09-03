import { attachAmbientCue } from '../ambient'

const OPENED_KEY = 'thamar-opened'

/** First landing holds for four full envelope cycles, whether or not the page is ready sooner. */
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

export function initLoader(): void {
  const root = document.getElementById('site-loader')
  if (!root) return

  if (alreadyOpened()) {
    hideLoader(root)
    return
  }

  const stopMessages = cycleMessages(root)
  const releaseCue = attachAmbientCue(root)

  const dismiss = () => {
    if (root.classList.contains('is-done')) return
    markOpened()
    stopMessages()
    releaseCue()
    root.classList.add('is-done')
    document.documentElement.classList.remove('is-loading')
    window.setTimeout(() => root.remove(), 800)
  }

  void whenReady().then(dismiss)
}
