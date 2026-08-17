const STORAGE_KEY = 'thamar-theme'

export type Theme = 'light' | 'dark'

export function getTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Private mode can block storage; fall through to the system setting.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

type ThemeOrigin = { x: number; y: number }

type ViewTransition = {
  finished: Promise<void>
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => ViewTransition
}

function originFromButton(button: HTMLElement): ThemeOrigin {
  const rect = button.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

function revealSheet(origin: ThemeOrigin): HTMLStyleElement {
  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  )

  const sheet = document.createElement('style')
  sheet.dataset.themeReveal = ''
  sheet.textContent = `
    ::view-transition-group(root) {
      animation: none;
    }
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation: none;
      mix-blend-mode: normal;
    }
    ::view-transition-old(root) {
      z-index: 1;
    }
    ::view-transition-new(root) {
      z-index: 2;
      animation: theme-reveal 0.55s ease both;
      transform-origin: ${origin.x}px ${origin.y}px;
    }
    @keyframes theme-reveal {
      from {
        opacity: 0;
        clip-path: circle(0px at ${origin.x}px ${origin.y}px);
      }
      to {
        opacity: 1;
        clip-path: circle(${Math.ceil(radius)}px at ${origin.x}px ${origin.y}px);
      }
    }
  `
  return sheet
}

export function applyTheme(theme: Theme, persist = true, origin?: ThemeOrigin): void {
  const root = document.documentElement
  const apply = () => {
    root.dataset.theme = theme

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme)
      } catch {
        // Preference still applies for this visit.
      }
    }

    syncToggle(theme)
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const doc = document as ViewTransitionDocument

  if (!origin || reducedMotion || typeof doc.startViewTransition !== 'function') {
    apply()
    return
  }

  document.querySelector('[data-theme-reveal]')?.remove()
  const sheet = revealSheet(origin)
  document.head.appendChild(sheet)

  const transition = doc.startViewTransition(apply)
  void transition.finished.finally(() => sheet.remove())
}

function syncToggle(theme: Theme): void {
  const dark = theme === 'dark'
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(dark))
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode')
  })
}

export function renderThemeToggle(): string {
  return `
    <button type="button" class="theme-toggle" data-theme-toggle aria-pressed="false" aria-label="Switch to dark mode">
      <svg class="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.2 2.1A9.8 9.8 0 1 0 21.9 12a8.2 8.2 0 0 1-6.7-9.9z"/>
      </svg>
      <svg class="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2"/>
        <path d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6"/>
      </svg>
    </button>
  `
}

export function initThemeToggle(): void {
  applyTheme(getTheme(), false)

  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
      applyTheme(next, true, originFromButton(button))
    })
  })

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch {
      return
    }

    applyTheme(event.matches ? 'dark' : 'light', false)
  })
}
