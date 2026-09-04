import { initAmbient, renderMusicToggle } from './ambient'
import { wedding } from './config'
import { renderAmbientOverlay } from './components/petals'
import { initLoader } from './components/loader'
import { renderWcCorners, renderWcDivider } from './components/watercolor'
import { initMixtape, renderMixtapeChrome } from './mixtape'
import { initThemeToggle, renderThemeToggle } from './theme'
import type { WeddingConfig } from './types'

export type SitePage = 'home' | 'explore' | 'trail' | 'nearby' | 'quiz' | 'live' | 'gallery' | 'soundtrack'

type NavItem = {
  href: string
  label: string
  page?: SitePage
  /** Pages that should mark this nav item as current */
  pages?: SitePage[]
}

function homePrefix(page: SitePage): string {
  return page === 'home' ? '' : 'index.html'
}

export function siteNav(page: SitePage): NavItem[] {
  const home = homePrefix(page)
  return [
    { href: `${home}#events`, label: 'Events' },
    { href: `${home}#rsvp`, label: 'RSVP' },
    {
      href: 'explore.html',
      label: 'Explore',
      page: 'explore',
      pages: ['explore', 'trail', 'nearby', 'quiz', 'live', 'soundtrack'],
    },
  ]
}

function renderLinkList(items: NavItem[], current: SitePage): string {
  return items
    .map((item) => {
      const active = item.pages?.includes(current) || item.page === current
      const currentAttr = active ? ' aria-current="page"' : ''
      return `<li><a class="label-caps" href="${item.href}"${currentAttr}>${item.label}</a></li>`
    })
    .join('')
}

export function renderPage(config: WeddingConfig, page: SitePage, main: string): string {
  const navItems = siteNav(page)
  const footerItems =
    page === 'home'
      ? [
          { href: '#story', label: 'Our Story' },
          { href: '#events', label: 'Events' },
          { href: '#gallery', label: 'Gallery' },
          { href: '#photos', label: 'Share the Love' },
          { href: '#rsvp', label: 'RSVP' },
          {
            href: 'explore.html',
            label: 'Explore',
            page: 'explore' as const,
            pages: ['explore', 'trail', 'nearby', 'quiz', 'live', 'soundtrack'] as SitePage[],
          },
        ]
      : [
          ...navItems,
          { href: 'trail.html', label: 'Trail', page: 'trail' as const },
          { href: 'nearby.html', label: 'Nearby', page: 'nearby' as const },
          { href: 'quiz.html', label: 'Quiz', page: 'quiz' as const },
          { href: 'live.html', label: 'Live', page: 'live' as const },
        ]

  const homeHref = page === 'home' ? '#home' : 'index.html#home'
  const photosHref = page === 'home' ? '#photos' : 'index.html#photos'
  const { partnerOne, partnerTwo, monogram } = config.couple

  return `
    ${renderAmbientOverlay()}
    <nav class="nav" aria-label="Primary">
      <a class="nav__monogram" href="${homeHref}">${monogram}</a>
      <ul class="nav__links" id="site-nav-links">${renderLinkList(navItems, page)}</ul>
      <div class="nav__end">
        ${renderThemeToggle()}
        ${renderMusicToggle()}
        <a class="nav__cta nav__cta--share label-caps" href="${photosHref}">Share the Love</a>
        <button class="nav__cta nav__menu-btn label-caps" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav-links">
          Menu
        </button>
      </div>
    </nav>
    <main>${main}</main>
    <div class="share-dock">
      ${renderMusicToggle()}
      <a class="share-fab" href="${photosHref}" aria-label="Share the Love">
        <svg class="share-fab__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M9.15 3.5 7.6 5.75H4.75A1.75 1.75 0 0 0 3 7.5v10.25c0 .97.78 1.75 1.75 1.75h14.5A1.75 1.75 0 0 0 21 17.75V7.5c0-.97-.78-1.75-1.75-1.75H16.4L14.85 3.5H9.15ZM12 16.85a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Zm0-2.35a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5ZM17.85 8.85a.95.95 0 1 0 0-1.9.95.95 0 0 0 0 1.9Z"
          />
        </svg>
      </a>
    </div>
    ${renderMixtapeChrome(config.soundtrack.tracks[0]?.title ?? 'Mixtape')}
    <footer class="footer">
      ${renderWcDivider()}
      ${renderWcCorners({ bottom: 'botanical', bottomSide: 'bl' })}
      <div class="footer__monogram">${monogram}</div>
      <ul class="footer__links">${renderLinkList(footerItems, page)}</ul>
      <p>${partnerOne} &amp; ${partnerTwo} — handcrafted with love</p>
    </footer>
  `
}

function initNavMenu(): void {
  const nav = document.querySelector<HTMLElement>('.nav')
  const button = document.querySelector<HTMLButtonElement>('[data-nav-toggle]')
  if (!nav || !button) return

  const setOpen = (open: boolean) => {
    if (nav.classList.contains('is-open') === open) return
    nav.classList.toggle('is-open', open)
    button.setAttribute('aria-expanded', String(open))
    button.textContent = open ? 'Close' : 'Menu'
  }

  button.addEventListener('click', (event) => {
    event.stopPropagation()
    setOpen(!nav.classList.contains('is-open'))
  })

  nav.querySelectorAll<HTMLAnchorElement>('.nav__links a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false))
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false)
  })

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target as Node)) setOpen(false)
  })

  window.matchMedia('(min-width: 900px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false)
  })
}

export function initSite(page: SitePage = 'home'): void {
  initThemeToggle()
  initNavMenu()
  initAmbient()
  initLoader()
  initMixtape(wedding.soundtrack.tracks, page === 'soundtrack' ? 'soundtrack' : 'other')
}
