export type DressCodeTheme = 'haldi' | 'mehendi' | 'sangeet' | 'reception'

type DressCodeSpec = {
  kicker: string
  lede: string
  ariaLabel: string
  image: string
  imageDark: string
}

const specs: Record<DressCodeTheme, DressCodeSpec> = {
  haldi: {
    kicker: 'Haldi attire',
    lede: 'Shades of green. Come ready to be coloured — white trainers are a brave choice.',
    ariaLabel: 'Watercolor lineup of guests in shades of green Haldi clothes',
    image: '/images/watercolor/dresscode-haldi.jpg?v=2',
    imageDark: '/images/watercolor/dresscode-haldi-dark.jpg',
  },
  mehendi: {
    kicker: 'Mehendi attire',
    lede: 'The brightest thing you own. If it would startle a sheep on Tegg’s Nose, it belongs here.',
    ariaLabel: 'Watercolor lineup of guests in bright festive Mehendi clothes',
    image: '/images/watercolor/dresscode-mehendi.jpg',
    imageDark: '/images/watercolor/dresscode-mehendi-dark.jpg',
  },
  sangeet: {
    kicker: 'Sangeet attire',
    lede: 'Channel your favourite Bollywood character — the more iconic the better. Dancing shoes mandatory.',
    ariaLabel: 'Watercolor lineup of guests in iconic Bollywood outfits — YJHD lehenga and sherwani, DDLJ yellow sari and leather jacket, Kal Ho Naa Ho white shirt',
    image: '/images/watercolor/dresscode-sangeet.jpg?v=2',
    imageDark: '/images/watercolor/dresscode-sangeet-dark.jpg',
  },
  reception: {
    kicker: 'Reception attire',
    lede: 'Dress to impress. Come polished — and stay as long as the music does.',
    ariaLabel: 'Watercolor lineup of guests in formal reception evening wear',
    image: '/images/watercolor/dresscode-reception.jpg',
    imageDark: '/images/watercolor/dresscode-reception-dark.jpg',
  },
}

export function hasDressCodeArt(theme: string): theme is DressCodeTheme {
  return theme in specs
}

export function renderEventDressCode(theme: DressCodeTheme): string {
  const spec = specs[theme]

  return `
    <div class="dresscode dresscode--${theme}" data-dresscode hidden>
      <figure class="dresscode__figure">
        <img
          class="dresscode__art"
          src="${spec.image}"
          data-src-light="${spec.image}"
          data-src-dark="${spec.imageDark}"
          alt="${spec.ariaLabel}"
          width="1400"
          height="788"
          loading="lazy"
          decoding="async"
        />
      </figure>
      <p class="dresscode__note">${spec.lede}</p>
    </div>
  `
}

function syncDressCodeImages(): void {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  document.querySelectorAll<HTMLImageElement>('.dresscode__art[data-src-light]').forEach((img) => {
    const src = isDark ? img.dataset.srcDark : img.dataset.srcLight
    if (src && img.src !== src) img.src = src
  })
}

export function initDressCode(onToggle?: () => void): void {
  syncDressCodeImages()
  const observer = new MutationObserver(syncDressCodeImages)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-dresscode-toggle]')

  buttons.forEach((button) => {
    const panelId = button.getAttribute('aria-controls')
    const panel = panelId
      ? document.querySelector<HTMLElement>(`#${panelId} [data-dresscode]`)
      : null
    if (!panel) return

    button.addEventListener('click', () => {
      const open = panel.hasAttribute('hidden')
      panel.toggleAttribute('hidden', !open)
      button.setAttribute('aria-expanded', String(open))
      button.textContent = open ? 'Hide the dress code' : 'Show me the dress code'
      onToggle?.()
    })
  })
}
