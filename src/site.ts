import { renderAmbientOverlay } from './components/petals'
import { initThemeToggle, renderThemeToggle } from './theme'
import type { WeddingConfig } from './types'

export type SitePage = 'home' | 'trail' | 'nearby' | 'quiz' | 'live' | 'gallery'

type NavItem = {
  href?: string
  label: string
  page?: SitePage
  children?: NavItem[]
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
      label: 'Explore',
      children: [
        { href: 'trail.html', label: 'Trail', page: 'trail' },
        { href: 'nearby.html', label: 'Nearby', page: 'nearby' },
        { href: 'quiz.html', label: 'Quiz', page: 'quiz' },
        { href: 'live.html', label: 'Live', page: 'live' },
      ],
    },
  ]
}

function flattenNav(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => (item.children ? item.children : [item]))
}

function renderChildLink(item: NavItem, current: SitePage): string {
  const active = item.page === current
  const currentAttr = active ? ' aria-current="page"' : ''
  return `<li><a class="label-caps" href="${item.href ?? '#'}"${currentAttr}>${item.label}</a></li>`
}

function renderLinkList(items: NavItem[], current: SitePage): string {
  return items
    .map((item) => {
      if (item.children) {
        const inSection = item.children.some((child) => child.page === current)
        return `
          <li class="nav__item nav__item--menu${inSection ? ' is-current' : ''}" data-nav-more-item>
            <button
              class="label-caps nav__more"
              type="button"
              data-nav-more
              aria-expanded="false"
              aria-controls="nav-explore"
              aria-haspopup="true"
            >
              ${item.label}
              <span class="nav__caret" aria-hidden="true"></span>
            </button>
            <ul class="nav__sub" id="nav-explore" data-nav-sub hidden>
              ${item.children.map((child) => renderChildLink(child, current)).join('')}
            </ul>
          </li>
        `
      }

      return renderChildLink(item, current)
    })
    .join('')
}

export function renderPage(config: WeddingConfig, page: SitePage, main: string): string {
  const navItems = siteNav(page)
  const footerItems =
    page === 'home'
      ? [
          ...flattenNav(navItems),
          { href: '#story', label: 'Our Story' },
          { href: '#gallery', label: 'Gallery' },
          { href: '#photos', label: 'Photos' },
        ]
      : flattenNav(navItems)

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
        <a class="nav__cta nav__cta--share label-caps" href="${photosHref}">Share the Love</a>
        <button class="nav__cta nav__menu-btn label-caps" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav-links">
          Menu
        </button>
      </div>
    </nav>
    <main>${main}</main>
    <a class="share-fab label-caps" href="${photosHref}">Share the Love</a>
    <footer class="footer">
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

  const moreItem = nav.querySelector<HTMLElement>('[data-nav-more-item]')
  const moreBtn = nav.querySelector<HTMLButtonElement>('[data-nav-more]')
  const sub = nav.querySelector<HTMLElement>('[data-nav-sub]')

  const setSub = (open: boolean) => {
    if (!moreItem || !moreBtn || !sub) return
    if (moreItem.classList.contains('is-open') === open) return
    moreItem.classList.toggle('is-open', open)
    moreBtn.setAttribute('aria-expanded', String(open))
    sub.hidden = !open
  }

  const setOpen = (open: boolean) => {
    if (nav.classList.contains('is-open') === open) {
      if (!open) setSub(false)
      return
    }
    nav.classList.toggle('is-open', open)
    button.setAttribute('aria-expanded', String(open))
    button.textContent = open ? 'Close' : 'Menu'
    if (!open) setSub(false)
  }

  button.addEventListener('click', () => {
    setOpen(!nav.classList.contains('is-open'))
  })

  moreBtn?.addEventListener('click', (event) => {
    event.stopPropagation()
    setSub(!moreItem?.classList.contains('is-open'))
  })

  nav.querySelectorAll<HTMLAnchorElement>('.nav__links a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false))
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (moreItem?.classList.contains('is-open')) {
      setSub(false)
      moreBtn?.focus()
      return
    }
    setOpen(false)
  })

  document.addEventListener('click', (event) => {
    const target = event.target as Node
    if (moreItem && !moreItem.contains(target)) setSub(false)
    if (!nav.contains(target)) setOpen(false)
  })

  window.matchMedia('(min-width: 900px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false)
  })
}

export function initSite(): void {
  initThemeToggle()
  initNavMenu()
}
