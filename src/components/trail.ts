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
      <ellipse class="trail__pin-shadow" cx="${x}" cy="${y + 3}" rx="9" ry="3.2"/>
      <path class="trail__pin-drop" d="M${x} ${y + 2} C${x - 11} ${y - 12}, ${x - 11} ${y - 28}, ${x} ${y - 32} C${x + 11} ${y - 28}, ${x + 11} ${y - 12}, ${x} ${y + 2}Z"/>
      <circle class="trail__pin-face" cx="${x}" cy="${y - 18}" r="9"/>
      <text x="${x}" y="${y - 14}" text-anchor="middle">${index + 1}</text>
    </g>
  `
}

function renderTrailArt(pins: string): string {
  return `
    <svg class="trail__art" viewBox="0 0 820 420" role="img" aria-label="Map from Macclesfield and Dorset to Kochi and Thrissur">
      <defs>
        <pattern id="trail-map-roads" width="42" height="42" patternUnits="userSpaceOnUse">
          <path d="M0 21 H42 M21 0 V42" fill="none" stroke="#fff" stroke-width="1.4"/>
          <path d="M0 0 L42 42" fill="none" stroke="#f3f0e8" stroke-width="0.8"/>
        </pattern>
      </defs>

      <rect class="trail-map__water" width="820" height="420" fill="#a9cce0"/>

      <g class="trail-map__scene">
        <path class="trail-map__land" d="M176 40 C190 32, 206 44, 210 66 C218 92, 212 114, 200 132 C212 154, 222 176, 218 200 C230 222, 240 246, 230 268 C224 286, 200 300, 176 302 C158 304, 144 292, 136 278 C118 286, 104 272, 110 256 C122 244, 136 236, 142 218 C124 204, 112 184, 116 162 C110 142, 124 126, 140 116 C148 94, 160 64, 170 48 C172 44, 174 42, 176 40Z"/>
        <path class="trail-map__ireland" d="M78 146 C100 124, 126 136, 128 168 C124 200, 96 214, 76 196 C60 178, 58 160, 78 146Z"/>
        <path class="trail-map__land" d="M568 52 C610 36, 662 44, 698 72 C730 96, 752 136, 756 178 C762 222, 752 266, 728 304 C704 344, 664 372, 622 378 C590 372, 572 348, 562 320 C544 296, 524 266, 518 228 C502 206, 494 182, 510 162 C498 136, 518 100, 542 76 C552 64, 560 56, 568 52Z"/>
        <ellipse class="trail-map__land" cx="392" cy="128" rx="34" ry="18"/>

        <ellipse class="trail-map__park" cx="178" cy="168" rx="16" ry="8"/>
        <ellipse class="trail-map__park" cx="194" cy="160" rx="12" ry="7"/>
        <ellipse class="trail-map__park" cx="620" cy="118" rx="28" ry="16"/>
        <ellipse class="trail-map__park" cx="548" cy="320" rx="18" ry="12"/>

        <path class="trail-map__streets" d="M176 40 C190 32, 206 44, 210 66 C218 92, 212 114, 200 132 C212 154, 222 176, 218 200 C230 222, 240 246, 230 268 C224 286, 200 300, 176 302 C158 304, 144 292, 136 278 C118 286, 104 272, 110 256 C122 244, 136 236, 142 218 C124 204, 112 184, 116 162 C110 142, 124 126, 140 116 C148 94, 160 64, 170 48 C172 44, 174 42, 176 40Z"/>
        <path class="trail-map__streets" d="M78 146 C100 124, 126 136, 128 168 C124 200, 96 214, 76 196 C60 178, 58 160, 78 146Z"/>
        <path class="trail-map__streets" d="M568 52 C610 36, 662 44, 698 72 C730 96, 752 136, 756 178 C762 222, 752 266, 728 304 C704 344, 664 372, 622 378 C590 372, 572 348, 562 320 C544 296, 524 266, 518 228 C502 206, 494 182, 510 162 C498 136, 518 100, 542 76 C552 64, 560 56, 568 52Z"/>

        <path class="trail-map__highway" d="M186 186 C178 236, 174 264, 172 286"/>
        <path class="trail-map__highway" d="M572 342 C590 328, 598 318, 598 312"/>

        <path id="trail-map-route" class="trail-map__route-casing" d="M186 186 C178 236, 174 264, 172 286 Q 360 72, 572 342 L598 312"/>
        <path class="trail-map__route" d="M186 186 C178 236, 174 264, 172 286 Q 360 72, 572 342 L598 312"/>

        <g class="trail-map__plane">
          <g>
            <path d="M0 0 l20 4 -5 3z"/>
            <path d="M8 2 l-2 -7 5 7 M10 5 l-1 6 5 -5"/>
            <animateMotion dur="16s" repeatCount="indefinite" rotate="auto" calcMode="linear">
              <mpath href="#trail-map-route"/>
            </animateMotion>
          </g>
        </g>

        <g class="trail-map__labels">
          <text x="176" y="34" text-anchor="middle">England</text>
          <text x="650" y="48" text-anchor="middle">India</text>
          <text class="trail-map__city" x="188" y="216" text-anchor="middle">Macclesfield</text>
          <text class="trail-map__city" x="210" y="318" text-anchor="middle">Dorset</text>
          <text class="trail-map__city" x="548" y="378" text-anchor="middle">Kochi</text>
          <text class="trail-map__city" x="598" y="298" text-anchor="middle">Thrissur</text>
        </g>

        ${pins}
      </g>
    </svg>
  `
}

function stopLink(stop: TrailStop): string {
  if (!stop.mapUrl) return ''
  return `<a class="trail__map-link label-caps" href="${stop.mapUrl}" target="_blank" rel="noopener noreferrer">Open in maps</a>`
}

function renderStopCard(stop: TrailStop, index: number, active: boolean): string {
  const photo = stop.image
    ? `<figure class="trail__photo trail__photo--${stop.id}">
        <img src="${stop.image}" alt="${stop.imageAlt ?? stop.title}" />
      </figure>`
    : ''

  return `
    <article class="trail__card ${stop.image ? 'trail__card--photo' : ''} ${active ? 'trail__card--active' : ''}" data-trail-card="${stop.id}" ${active ? '' : 'hidden'}>
      ${photo}
      <div class="trail__card-copy">
        <p class="trail__card-kicker label-caps">Pin ${index + 1} · ${stop.kicker}</p>
        <h3 class="trail__card-title">${stop.title}</h3>
        <p class="trail__card-body">${stop.description}</p>
        ${stopLink(stop)}
      </div>
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
        <div class="trail__map-view">
          <div class="explore-gmaps__search">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.2 4.2"/></svg>
            <span>Macclesfield to Thrissur · ${stops.length} stops</span>
            <svg class="explore-gmaps__dir" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 21l8-4 8 4z"/></svg>
          </div>
          <div class="explore-gmaps__zoom" data-trail-zoom>
            <span role="button" tabindex="0" aria-label="Zoom in" data-trail-zoom-in>+</span>
            <span role="button" tabindex="0" aria-label="Zoom out" data-trail-zoom-out>−</span>
          </div>
          ${renderTrailArt(pins)}
          <span class="explore-gmaps__logo">Google</span>
        </div>
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

  // Zoom: scale the SVG (pins + route scale together), keep UI chrome fixed.
  const art = root.querySelector<SVGElement>('.trail__art')
  const zoomRoot = root.querySelector<HTMLElement>('[data-trail-zoom]')
  const zoomIn = zoomRoot?.querySelector<HTMLElement>('[data-trail-zoom-in]')
  const zoomOut = zoomRoot?.querySelector<HTMLElement>('[data-trail-zoom-out]')
  if (art && zoomIn && zoomOut) {
    let scale = 1
    const min = 0.85
    const max = 2.35
    const step = 1.18

    art.style.transformOrigin = '50% 50%'

    const apply = (next: number) => {
      scale = Math.max(min, Math.min(max, next))
      art.style.transform = `scale(${scale})`
    }

    const bump = (delta: number) => apply(scale * delta)

    const onActivate = (el: HTMLElement | null, fn: () => void) => {
      if (!el) return
      el.addEventListener('click', (event) => {
        event.preventDefault()
        fn()
      })
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          fn()
        }
      })
    }

    onActivate(zoomIn, () => bump(step))
    onActivate(zoomOut, () => bump(1 / step))
  }
}
