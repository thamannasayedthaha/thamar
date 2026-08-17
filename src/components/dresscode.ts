export type DressCodeTheme = 'haldi' | 'mehendi' | 'sangeet' | 'reception'

type FigureKind = 'woman' | 'man' | 'tux'

type FigurePalette = {
  top: string
  bottom: string
  accent: string
}

type DressCodeSpec = {
  kicker: string
  lede: string
  ariaLabel: string
  background: string
  figures: Array<{ x: number; kind: FigureKind; palette: FigurePalette }>
  extras: string
}

const specs: Record<DressCodeTheme, DressCodeSpec> = {
  haldi: {
    kicker: 'Haldi attire',
    lede: 'Yellows, ivories, and a little gold. Come ready to be coloured — white trainers are a brave choice.',
    ariaLabel: 'Illustrated lineup of men and women dancing in yellow and off-white clothes',
    background: '#fffbef',
    figures: [
      { x: 20, kind: 'woman', palette: { top: '#fff8e8', bottom: '#f6d24a', accent: '#fff4d6' } },
      { x: 155, kind: 'man', palette: { top: '#fbf6ea', bottom: '#efe6d2', accent: '#f4d35e' } },
      { x: 285, kind: 'woman', palette: { top: '#f0c43a', bottom: '#fbf6ea', accent: '#f4d35e' } },
      { x: 415, kind: 'man', palette: { top: '#f0c43a', bottom: '#f7e7b0', accent: '#fff8dc' } },
      { x: 545, kind: 'woman', palette: { top: '#fff8e8', bottom: '#e8b423', accent: '#fff4d6' } },
      { x: 655, kind: 'man', palette: { top: '#fbf6ea', bottom: '#efe6d2', accent: '#f4d35e' } },
    ],
    extras: `
      <g fill="#f0c43a" opacity="0.85">
        <circle cx="118" cy="42" r="9"/>
        <circle cx="118" cy="42" r="4" fill="#8a4b06"/>
        <circle cx="372" cy="28" r="8"/>
        <circle cx="372" cy="28" r="3.5" fill="#8a4b06"/>
        <circle cx="628" cy="36" r="9"/>
        <circle cx="628" cy="36" r="4" fill="#8a4b06"/>
      </g>
    `,
  },
  mehendi: {
    kicker: 'Mehendi attire',
    lede: 'The brightest thing you own. If it would startle a sheep on Tegg’s Nose, it belongs here.',
    ariaLabel: 'Illustrated lineup of guests in bright festive clothes for Mehendi',
    background: '#fdf3f6',
    figures: [
      { x: 20, kind: 'woman', palette: { top: '#fff0f4', bottom: '#e85d8c', accent: '#f4b4c8' } },
      { x: 155, kind: 'man', palette: { top: '#2a9d6e', bottom: '#d4e8d0', accent: '#f4d35e' } },
      { x: 285, kind: 'woman', palette: { top: '#fff5e8', bottom: '#f08a3a', accent: '#ffd4a8' } },
      { x: 415, kind: 'man', palette: { top: '#c94b7c', bottom: '#f5d0dc', accent: '#ffe8f0' } },
      { x: 545, kind: 'woman', palette: { top: '#e8fffb', bottom: '#2bb8a8', accent: '#a8e8dc' } },
      { x: 655, kind: 'man', palette: { top: '#e8b423', bottom: '#f7e7b0', accent: '#fff8dc' } },
    ],
    extras: `
      <g fill="#2a9d6e" opacity="0.8">
        <ellipse cx="118" cy="38" rx="7" ry="12" transform="rotate(-25 118 38)"/>
        <ellipse cx="128" cy="42" rx="6" ry="11" transform="rotate(20 128 42)"/>
        <ellipse cx="372" cy="26" rx="7" ry="12" transform="rotate(-18 372 26)"/>
        <ellipse cx="382" cy="32" rx="6" ry="10" transform="rotate(28 382 32)"/>
        <ellipse cx="628" cy="34" rx="7" ry="12" transform="rotate(-22 628 34)"/>
        <ellipse cx="638" cy="40" rx="6" ry="11" transform="rotate(18 638 40)"/>
      </g>
    `,
  },
  sangeet: {
    kicker: 'Sangeet attire',
    lede: 'Dress to impress! No hiking boots required for this one — though comfortable dancing shoes are encouraged.',
    ariaLabel: 'Illustrated lineup of guests in sequinned and glamorous clothes for Sangeet',
    background: '#fbf7ff',
    figures: [
      { x: 20, kind: 'woman', palette: { top: '#f8f0ff', bottom: '#9b7ec8', accent: '#d4b8f0' } },
      { x: 155, kind: 'man', palette: { top: '#3d2a5c', bottom: '#2a1a40', accent: '#e8d4a0' } },
      { x: 285, kind: 'woman', palette: { top: '#c9b0e8', bottom: '#e8e0f0', accent: '#ffffff' } },
      { x: 415, kind: 'man', palette: { top: '#6b3d8a', bottom: '#4a2860', accent: '#f0d4ff' } },
      { x: 545, kind: 'woman', palette: { top: '#fff8e8', bottom: '#d4af60', accent: '#f0e0b0' } },
      { x: 655, kind: 'tux', palette: { top: '#2a1c40', bottom: '#1a1028', accent: '#c8a45c' } },
    ],
    extras: `
      <g fill="#c8a45c" opacity="0.9">
        <path d="M118 30 l2.2 6.8 h7.2 l-5.8 4.2 2.2 6.8-5.8-4.2-5.8 4.2 2.2-6.8-5.8-4.2 h7.2z"/>
        <path d="M372 20 l1.8 5.4 h5.6 l-4.6 3.4 1.8 5.4-4.6-3.4-4.6 3.4 1.8-5.4-4.6-3.4 h5.6z"/>
        <path d="M628 28 l2.2 6.8 h7.2 l-5.8 4.2 2.2 6.8-5.8-4.2-5.8 4.2 2.2-6.8-5.8-4.2 h7.2z"/>
        <circle cx="200" cy="48" r="2.2"/>
        <circle cx="490" cy="22" r="1.8"/>
        <circle cx="540" cy="16" r="2"/>
      </g>
    `,
  },
  reception: {
    kicker: 'Reception attire',
    lede: 'Dress to impress! No hiking boots required for this one — though comfortable dancing shoes are encouraged.',
    ariaLabel: 'Illustrated lineup of guests in black-tie evening wear for the reception',
    background: '#f8f6f1',
    figures: [
      { x: 20, kind: 'woman', palette: { top: '#f8f4ea', bottom: '#1a1a1a', accent: '#c8a45c' } },
      { x: 155, kind: 'tux', palette: { top: '#1c1c1c', bottom: '#111111', accent: '#c8a45c' } },
      { x: 285, kind: 'woman', palette: { top: '#1a1a1a', bottom: '#f5efe4', accent: '#e8d4a0' } },
      { x: 415, kind: 'tux', palette: { top: '#1a2744', bottom: '#121a2e', accent: '#c8a45c' } },
      { x: 545, kind: 'woman', palette: { top: '#fff8f0', bottom: '#e8d5b0', accent: '#c8a45c' } },
      { x: 655, kind: 'tux', palette: { top: '#1c1c1c', bottom: '#111111', accent: '#f7f4ee' } },
    ],
    extras: `
      <g fill="#c8a45c" opacity="0.75">
        <rect x="112" y="28" width="10" height="10" transform="rotate(45 117 33)"/>
        <rect x="366" y="18" width="8" height="8" transform="rotate(45 370 22)"/>
        <rect x="622" y="26" width="10" height="10" transform="rotate(45 627 31)"/>
      </g>
    `,
  },
}

function figure(x: number, kind: FigureKind, palette: FigurePalette): string {
  const skins = ['#e2b48a', '#c48a58', '#d7a06e', '#e8c09a', '#b97a4e']
  const hair = ['#2c1a12', '#3d2418', '#1a100c', '#4a2c1c', '#2a1810']
  const i = Math.abs(Math.round(x / 90)) % 5
  const skin = skins[i]
  const hairColor = hair[i]
  const { top, bottom, accent } = palette

  if (kind === 'tux') {
    return `
      <g transform="translate(${x} 18) rotate(-6 40 90)">
        <ellipse cx="40" cy="168" rx="22" ry="7" fill="#8c9c82" opacity="0.18"/>
        <circle cx="46" cy="28" r="16" fill="${skin}"/>
        <path d="M34 22c4-10 20-12 26-2 1 2-2 4-5 3-6-2-13-1-18 2-2 1-4-1-3-3z" fill="${hairColor}"/>
        <path d="M38 48l4 52 10 0 4-52z" fill="#f7f4ee"/>
        <path d="M24 48c-2 8-2 28 4 52h12l-4-52z" fill="${top}"/>
        <path d="M58 48c2 8 2 28-4 52H42l4-52z" fill="${top}"/>
        <path d="M22 52c-10 18-8 34 2 40" fill="none" stroke="${top}" stroke-width="10" stroke-linecap="round"/>
        <path d="M62 50c12 8 18 26 8 42" fill="none" stroke="${top}" stroke-width="10" stroke-linecap="round"/>
        <path d="M38 54l8 5 8-5-8 9z" fill="${accent}"/>
        <rect x="28" y="102" width="12" height="46" rx="5" fill="${bottom}"/>
        <rect x="44" y="100" width="12" height="50" rx="5" fill="${bottom}"/>
        <ellipse cx="34" cy="150" rx="8" ry="4" fill="#1a1a1a"/>
        <ellipse cx="50" cy="152" rx="8" ry="4" fill="#1a1a1a"/>
      </g>
    `
  }

  if (kind === 'man') {
    return `
      <g transform="translate(${x} 18) rotate(-8 40 90)">
        <ellipse cx="40" cy="168" rx="22" ry="7" fill="#8c9c82" opacity="0.18"/>
        <circle cx="46" cy="28" r="16" fill="${skin}"/>
        <path d="M34 22c4-10 20-12 26-2 1 2-2 4-5 3-6-2-13-1-18 2-2 1-4-1-3-3z" fill="${hairColor}"/>
        <rect x="24" y="46" width="36" height="58" rx="10" fill="${top}"/>
        <path d="M22 52c-10 18-8 34 2 40" fill="none" stroke="${top}" stroke-width="10" stroke-linecap="round"/>
        <path d="M62 50c12 8 18 26 8 42" fill="none" stroke="${top}" stroke-width="10" stroke-linecap="round"/>
        <path d="M18 58c18 8 42 6 58-8" fill="none" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>
        <rect x="28" y="102" width="12" height="46" rx="5" fill="${bottom}"/>
        <rect x="44" y="100" width="12" height="50" rx="5" fill="${bottom}"/>
        <ellipse cx="34" cy="150" rx="8" ry="4" fill="#6a5b59"/>
        <ellipse cx="50" cy="152" rx="8" ry="4" fill="#6a5b59"/>
      </g>
    `
  }

  return `
    <g transform="translate(${x} 10) rotate(7 44 90)">
      <ellipse cx="42" cy="176" rx="24" ry="7" fill="#8c9c82" opacity="0.18"/>
      <circle cx="44" cy="30" r="16" fill="${skin}"/>
      <path d="M28 28c2-14 22-18 32-6 2 3-1 5-5 4-8-3-16 0-22 6-2 2-6 0-5-4z" fill="${hairColor}"/>
      <path d="M44 46c-16 4-22 18-20 36 8-4 24-6 40 2 4-18-4-34-20-38z" fill="${top}"/>
      <path d="M16 58c-8 16-4 34 10 38" fill="none" stroke="${top}" stroke-width="9" stroke-linecap="round"/>
      <path d="M70 54c14 10 16 30 2 42" fill="none" stroke="${top}" stroke-width="9" stroke-linecap="round"/>
      <path d="M24 80c-4 28 8 70 22 78 16-6 28-48 22-78-14-8-30-8-44 0z" fill="${bottom}"/>
      <path d="M12 72c22 18 50 14 70-10" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="58" cy="38" r="3" fill="#e8b423"/>
    </g>
  `
}

export function hasDressCodeArt(theme: string): theme is DressCodeTheme {
  return theme in specs
}

export function renderEventDressCode(theme: DressCodeTheme): string {
  const spec = specs[theme]
  const lineup = spec.figures.map((item) => figure(item.x, item.kind, item.palette)).join('')

  return `
    <div class="dresscode dresscode--${theme}" data-dresscode hidden>
      <p class="dresscode__kicker label-caps">${spec.kicker}</p>
      <p class="dresscode__lede">${spec.lede}</p>
      <svg class="dresscode__art" viewBox="0 0 760 210" role="img" aria-label="${spec.ariaLabel}">
        <rect x="0" y="0" width="760" height="210" fill="${spec.background}"/>
        ${lineup}
        ${spec.extras}
      </svg>
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
