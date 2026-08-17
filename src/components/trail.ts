import type { TrailStop, WeddingConfig } from '../types'

const STOP_POINTS: Record<string, { x: number; y: number }> = {
  macclesfield: { x: 186, y: 186 },
  dorset: { x: 172, y: 286 },
  'pepper-house': { x: 572, y: 342 },
  hyatt: { x: 598, y: 312 },
  home: { x: 392, y: 118 },
}

function renderPin(id: string, index: number, x: number, y: number): string {
  return `
    <g class="trail__pin" data-trail-pin="${id}">
      <ellipse class="trail__pin-shadow" cx="${x}" cy="${y + 3}" rx="9" ry="3.5"/>
      <path class="trail__pin-drop" d="M${x} ${y + 2} C${x - 13} ${y - 12}, ${x - 12} ${y - 32}, ${x} ${y - 36} C${x + 12} ${y - 32}, ${x + 13} ${y - 12}, ${x} ${y + 2}Z"/>
      <circle class="trail__pin-face" cx="${x}" cy="${y - 20}" r="11"/>
      <text x="${x}" y="${y - 15}" text-anchor="middle">${index + 1}</text>
    </g>
  `
}

function renderTrailArt(pins: string): string {
  return `
    <svg class="trail__art" viewBox="0 0 820 420" role="img" aria-label="Illustrated map from Macclesfield and Dorset to Kochi and Thrissur">
      <defs>
        <linearGradient id="trail-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--trail-water-hi)"/>
          <stop offset="100%" stop-color="var(--trail-water)"/>
        </linearGradient>
        <linearGradient id="trail-land" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stop-color="var(--trail-land-hi)"/>
          <stop offset="100%" stop-color="var(--trail-land)"/>
        </linearGradient>
        <pattern id="trail-waves" width="48" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 11 Q12 5 24 11 T48 11" fill="none" stroke="var(--trail-wave)" stroke-width="1"/>
        </pattern>
        <filter id="trail-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="rgba(40,55,40,0.18)"/>
        </filter>
      </defs>

      <rect class="trail-map__water" width="820" height="420" fill="url(#trail-water)"/>
      <rect width="820" height="420" fill="url(#trail-waves)" opacity="0.35"/>

      <g class="trail-map__grid" fill="none">
        <path d="M0 70 H820 M0 140 H820 M0 210 H820 M0 280 H820 M0 350 H820"/>
        <path d="M80 0 V420 M180 0 V420 M280 0 V420 M380 0 V420 M480 0 V420 M580 0 V420 M680 0 V420 M760 0 V420"/>
      </g>

      <g class="trail-map__continent" filter="url(#trail-soft)">
        <path class="trail-map__land" fill="url(#trail-land)" d="M248 248 C268 236, 292 242, 318 258 C348 278, 372 302, 392 338 C368 352, 332 368, 298 372 C268 348, 252 312, 248 248Z"/>
        <path class="trail-map__coast" d="M248 248 C268 236, 292 242, 318 258 C348 278, 372 302, 392 338"/>
      </g>

      <g class="trail-map__uk" filter="url(#trail-soft)">
        <path class="trail-map__land" fill="url(#trail-land)" d="M176 40 C190 32, 206 44, 210 66 C218 92, 212 114, 200 132 C212 154, 222 176, 218 200 C230 222, 240 246, 230 268 C224 286, 200 300, 176 302 C158 304, 144 292, 136 278 C118 286, 104 272, 110 256 C122 244, 136 236, 142 218 C124 204, 112 184, 116 162 C110 142, 124 126, 140 116 C148 94, 160 64, 170 48 C172 44, 174 42, 176 40Z"/>
        <path class="trail-map__land-deep" d="M168 86 C180 78, 192 92, 188 108 C176 118, 162 112, 168 86Z"/>
        <path class="trail-map__ireland" d="M78 146 C100 124, 126 136, 128 168 C124 200, 96 214, 76 196 C60 178, 58 160, 78 146Z"/>
        <path class="trail-map__coast" d="M176 40 C190 32, 206 44, 210 66 C218 92, 212 114, 200 132 C212 154, 222 176, 218 200 C230 222, 240 246, 230 268 C224 286, 200 300, 176 302 C158 304, 144 292, 136 278 C118 286, 104 272, 110 256 C122 244, 136 236, 142 218 C124 204, 112 184, 116 162 C110 142, 124 126, 140 116 C148 94, 160 64, 170 48 C172 44, 174 42, 176 40Z"/>
        <g class="trail-map__hills">
          <ellipse cx="178" cy="168" rx="16" ry="8"/>
          <ellipse cx="194" cy="160" rx="12" ry="7"/>
          <ellipse cx="166" cy="176" rx="10" ry="6"/>
        </g>
        <g class="trail-map__trees">
          <path d="M198 176 l6 -14 6 14z"/><rect x="202.5" y="176" width="3" height="6"/>
          <path d="M208 182 l5 -11 5 11z"/><rect x="211.5" y="182" width="2.5" height="5"/>
          <path d="M188 154 l5 -10 5 10z"/><rect x="191.5" y="154" width="2.5" height="5"/>
        </g>
        <g class="trail-map__waves" fill="none">
          <path d="M148 308 Q158 302 168 308 T188 308"/>
          <path d="M156 316 Q166 310 176 316 T196 316"/>
        </g>
      </g>

      <g class="trail-map__india" filter="url(#trail-soft)">
        <path class="trail-map__land" fill="url(#trail-land)" d="M568 52 C610 36, 662 44, 698 72 C730 96, 752 136, 756 178 C762 222, 752 266, 728 304 C704 344, 664 372, 622 378 C590 372, 572 348, 562 320 C544 296, 524 266, 518 228 C502 206, 494 182, 510 162 C498 136, 518 100, 542 76 C552 64, 560 56, 568 52Z"/>
        <path class="trail-map__land-deep" d="M620 86 C648 78, 678 96, 682 124 C652 138, 622 128, 620 86Z"/>
        <path class="trail-map__sri" d="M638 392 C650 384, 662 392, 660 406 C648 414, 632 406, 638 392Z"/>
        <path class="trail-map__coast" d="M568 52 C610 36, 662 44, 698 72 C730 96, 752 136, 756 178 C762 222, 752 266, 728 304 C704 344, 664 372, 622 378 C590 372, 572 348, 562 320 C544 296, 524 266, 518 228 C502 206, 494 182, 510 162 C498 136, 518 100, 542 76 C552 64, 560 56, 568 52Z"/>
        <g class="trail-map__palms">
          <path d="M560 348 C548 338, 546 330, 556 336 C548 326, 558 324, 560 334 C570 324, 576 330, 566 338 C576 336, 576 346, 560 348"/>
          <rect x="558.5" y="348" width="3" height="10" rx="1"/>
          <path d="M548 356 C538 348, 538 340, 546 346 C540 338, 550 336, 552 346 C560 338, 564 344, 554 350 C564 350, 562 358, 548 356"/>
          <rect x="546.5" y="356" width="2.5" height="8" rx="1"/>
        </g>
        <g class="trail-map__venue">
          <rect x="588" y="292" width="22" height="14" rx="1.5"/>
          <path d="M584 292 l15 -10 15 10z"/>
          <rect x="596" y="298" width="5" height="8"/>
        </g>
      </g>

      <g class="trail-map__island" filter="url(#trail-soft)">
        <ellipse class="trail-map__land" cx="392" cy="128" rx="34" ry="18"/>
        <ellipse class="trail-map__land-deep" cx="392" cy="126" rx="18" ry="9"/>
        <path class="trail-map__fog" d="M368 108 C376 98, 388 100, 394 108 C402 98, 414 100, 418 110 C408 114, 398 112, 392 116 C384 112, 374 112, 368 108Z"/>
        <g class="trail-map__mystery-house">
          <rect x="384" y="118" width="16" height="12" rx="1"/>
          <path d="M381 118 l11 -8 11 8z"/>
        </g>
      </g>

      <g class="trail-map__boat">
        <path d="M300 248 l28 0 -6 8 -16 0z"/>
        <path d="M318 248 l0 -18 14 18z"/>
      </g>

      <path class="trail-map__route" d="M186 186 C178 236, 174 264, 172 286 Q 360 72, 572 342 L598 312" fill="none"/>
      <g class="trail-map__plane" transform="translate(358 168) rotate(-18)">
        <path d="M0 0 l22 4 -6 3z"/>
        <path d="M8 2 l-2 -8 6 8 M10 5 l-1 7 5 -6"/>
      </g>

      <g class="trail-map__labels">
        <text class="trail-map__title" x="410" y="28" text-anchor="middle">A map of two homes</text>
        <text x="176" y="34" text-anchor="middle">England</text>
        <text x="86" y="228" text-anchor="middle">Ireland</text>
        <text x="188" y="216" text-anchor="middle">Peak District</text>
        <text x="210" y="318" text-anchor="middle">Dorset coast</text>
        <text x="360" y="88" text-anchor="middle">The sea between</text>
        <text x="650" y="48" text-anchor="middle">India</text>
        <text x="548" y="378" text-anchor="middle">Kerala</text>
        <text x="392" y="156" text-anchor="middle">Here? Nope.</text>
        <text class="trail-map__scale" x="410" y="408" text-anchor="middle">Not to scale — love never is</text>
      </g>

      <g class="trail-map__compass" transform="translate(56 54)">
        <circle r="26" class="trail-map__compass-ring"/>
        <circle r="18" class="trail-map__compass-inner"/>
        <path class="trail-map__compass-n" d="M0 -20 L5 0 L0 4 L-5 0 Z"/>
        <path class="trail-map__compass-s" d="M0 20 L5 0 L0 -4 L-5 0 Z"/>
        <path class="trail-map__compass-e" d="M20 0 L0 4 L-4 0 L0 -4 Z"/>
        <path class="trail-map__compass-w" d="M-20 0 L0 4 L4 0 L0 -4 Z"/>
        <text x="0" y="-30" text-anchor="middle">N</text>
      </g>

      <rect class="trail-map__frame" x="10" y="10" width="800" height="400" rx="18"/>
      ${pins}
    </svg>
  `
}

function stopLink(stop: TrailStop): string {
  if (!stop.mapUrl) return ''
  return `<a class="trail__map-link label-caps" href="${stop.mapUrl}" target="_blank" rel="noopener noreferrer">Open in maps</a>`
}

function renderStopCard(stop: TrailStop, index: number, active: boolean): string {
  return `
    <article class="trail__card ${active ? 'trail__card--active' : ''}" data-trail-card="${stop.id}" ${active ? '' : 'hidden'}>
      <p class="trail__card-kicker label-caps">Pin ${index + 1} · ${stop.kicker}</p>
      <h3 class="trail__card-title">${stop.title}</h3>
      <p class="trail__card-body">${stop.description}</p>
      ${stopLink(stop)}
    </article>
  `
}

export function renderTrail(config: WeddingConfig): string {
  const { title, lede, stops } = config.trail
  const first = stops[0]?.id ?? ''

  const pins = stops
    .map((stop, index) => {
      const point = STOP_POINTS[stop.id] ?? { x: 120 + index * 180, y: 220 }
      return renderPin(stop.id, index, point.x, point.y)
    })
    .join('')

  const tabs = stops
    .map(
      (stop, index) => `
        <button
          type="button"
          class="trail__tab ${stop.id === first ? 'trail__tab--active' : ''}"
          data-trail-tab="${stop.id}"
          aria-pressed="${stop.id === first}"
        >
          <span class="trail__tab-num">${index + 1}</span>
          <span>${stop.title}</span>
        </button>
      `,
    )
    .join('')

  const cards = stops.map((stop, index) => renderStopCard(stop, index, stop.id === first)).join('')

  return `
    <section class="section trail" id="trail" aria-labelledby="trail-heading">
      <h2 id="trail-heading" class="section__title">${title}</h2>
      <p class="section__lede">${lede}</p>

      <div class="trail__map" data-trail>
        ${renderTrailArt(pins)}
        <div class="trail__tabs">${tabs}</div>
        <div class="trail__cards">${cards}</div>
      </div>
    </section>
  `
}

export function initTrail(): void {
  const root = document.querySelector<HTMLElement>('[data-trail]')
  if (!root) return

  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-trail-tab]'))
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-trail-card]'))
  const pins = Array.from(root.querySelectorAll<SVGGElement>('[data-trail-pin]'))

  const activate = (id: string) => {
    for (const tab of tabs) {
      const on = tab.dataset.trailTab === id
      tab.classList.toggle('trail__tab--active', on)
      tab.setAttribute('aria-pressed', String(on))
    }
    for (const card of cards) {
      card.hidden = card.dataset.trailCard !== id
      card.classList.toggle('trail__card--active', card.dataset.trailCard === id)
    }
    for (const pin of pins) {
      pin.classList.toggle('trail__pin--active', pin.dataset.trailPin === id)
    }
  }

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      const id = tab.dataset.trailTab
      if (id) activate(id)
    })
  }

  for (const pin of pins) {
    pin.style.cursor = 'pointer'
    pin.addEventListener('click', () => {
      const id = pin.dataset.trailPin
      if (id) activate(id)
    })
  }

  const first = tabs[0]?.dataset.trailTab
  if (first) activate(first)
}
