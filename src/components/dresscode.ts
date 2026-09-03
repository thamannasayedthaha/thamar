export type DressCodeTheme = 'haldi' | 'mehendi' | 'sangeet' | 'reception'

type DressCodeSpec = {
  kicker: string
  lede: string
  ariaLabel: string
  image: string
}

const specs: Record<DressCodeTheme, DressCodeSpec> = {
  haldi: {
    kicker: 'Phoolon Ki Holi attire',
    lede: 'Shades of green. Come ready to be coloured — white trainers are a brave choice.',
    ariaLabel: 'Watercolor lineup of guests in shades of green Haldi clothes',
    image: '/images/watercolor/dresscode-haldi.jpg?v=2',
  },
  mehendi: {
    kicker: 'Rang Ishq Da attire',
    lede: 'The brightest thing you own. If it would startle a sheep on Tegg’s Nose, it belongs here.',
    ariaLabel: 'Watercolor lineup of guests in bright festive Mehendi clothes',
    image: '/images/watercolor/dresscode-mehendi.jpg',
  },
  sangeet: {
    kicker: 'Bass & Bollywood attire',
    lede: 'Channel your favourite Bollywood character — the more iconic the better. Dancing shoes mandatory.',
    ariaLabel: 'Watercolor lineup of guests in iconic Bollywood outfits — YJHD lehenga and sherwani, DDLJ yellow sari and leather jacket, Kal Ho Naa Ho white shirt',
    image: '/images/watercolor/dresscode-sangeet.jpg?v=2',
  },
  reception: {
    kicker: 'Wedding Reception attire',
    lede: 'Dress to impress. Come polished — and stay as long as the music does.',
    ariaLabel: 'Watercolor lineup of guests in formal reception evening wear',
    image: '/images/watercolor/dresscode-reception.jpg',
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

export function initDressCode(onToggle?: () => void): void {
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
