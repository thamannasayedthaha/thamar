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

export function applyTheme(theme: Theme, persist = true): void {
  const root = document.documentElement
  if (root.dataset.theme !== theme) {
    root.dataset.theme = theme
  }

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Preference still applies for this visit.
    }
  }

  syncToggle(theme)
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
      applyTheme(next)
    })
  })
}
