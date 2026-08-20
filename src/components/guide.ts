import type { GuidePlace, WeddingConfig } from '../types'

const STAMPS_KEY = 'thamar-guide-stamps'

const FLAG_COLOURS = ['#d97a5a', '#e6c15c', '#7fa86b', '#5b8bb0', '#b07fb0']

function readStamps(): string[] {
  try {
    const raw = localStorage.getItem(STAMPS_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

function writeStamps(ids: string[]): void {
  try {
    localStorage.setItem(STAMPS_KEY, JSON.stringify(ids))
  } catch {
    /* ignore blocked storage */
  }
}

/** Points along a quadratic curve, used to hang prayer flags and fairy lights. */
function curvePoint(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
): [number, number] {
  const inv = 1 - t
  return [
    inv * inv * p0[0] + 2 * inv * t * p1[0] + t * t * p2[0],
    inv * inv * p0[1] + 2 * inv * t * p1[1] + t * t * p2[1],
  ]
}

function prayerFlags(): string {
  const p0: [number, number] = [4, 46]
  const p1: [number, number] = [160, 16]
  const p2: [number, number] = [316, 52]
  let flags = ''

  for (let i = 0; i < 13; i += 1) {
    const [x, y] = curvePoint((i + 0.5) / 13, p0, p1, p2)
    flags += `<path class="gs-flag" style="--gs-delay:${(i * 0.12).toFixed(2)}s" fill="${
      FLAG_COLOURS[i % FLAG_COLOURS.length]
    }" d="M${(x - 6).toFixed(1)} ${y.toFixed(1)} h12 l-6 13z"/>`
  }

  return `<path class="gs-line" d="M4 46 Q160 16 316 52"/>${flags}`
}

function fairyLights(): string {
  const p0: [number, number] = [18, 40]
  const p1: [number, number] = [160, 66]
  const p2: [number, number] = [302, 38]
  let bulbs = ''

  for (let i = 0; i < 9; i += 1) {
    const [x, y] = curvePoint((i + 0.5) / 9, p0, p1, p2)
    bulbs += `<circle class="gs-bulb" style="--gs-delay:${(i * 0.35).toFixed(2)}s" cx="${x.toFixed(
      1,
    )}" cy="${(y + 6).toFixed(1)}" r="3.2"/>`
  }

  return `<path class="gs-line" d="M18 40 Q160 66 302 38"/>${bulbs}`
}

/** A flight of steps climbing from one point to another. */
function steps(from: [number, number], to: [number, number], count: number): string {
  const dx = (to[0] - from[0]) / count
  const dy = (to[1] - from[1]) / count
  let path = `M${from[0]} ${from[1]}`
  for (let i = 0; i < count; i += 1) {
    path += ` v${dy.toFixed(2)} h${dx.toFixed(2)}`
  }
  return `<path class="gs-steps" d="${path}"/>`
}

const SCENES: Record<string, string> = {
  namdroling: `
    <rect class="gs-sky" width="320" height="170"/>
    <circle class="gs-sun" cx="272" cy="36" r="15"/>
    <path class="gs-ridge" d="M0 104 C42 74, 84 72, 118 94 C148 112, 176 82, 214 80 C252 78, 288 100, 320 90 L320 170 L0 170Z"/>
    <path class="gs-ground" d="M0 126 C72 116, 142 130, 212 124 C258 120, 292 128, 320 124 L320 170 L0 170Z"/>
    <g class="gs-temple">
      <rect class="gs-wall" x="114" y="90" width="74" height="36" rx="2"/>
      <path class="gs-band" d="M114 90 h74 v7 h-74z"/>
      <rect class="gs-wall" x="132" y="56" width="38" height="16" rx="1"/>
      <path class="gs-gold" d="M100 92 C116 82, 128 72, 151 65 C174 72, 186 82, 202 92 C176 85, 126 85, 100 92Z"/>
      <path class="gs-gold" d="M120 65 C130 57, 140 50, 151 43 C162 50, 172 57, 182 65 C167 60, 135 60, 120 65Z"/>
      <path class="gs-gold" d="M151 43 l3.5 -6 -3.5 -9 -3.5 9z"/>
      <rect class="gs-door" x="143" y="104" width="16" height="22" rx="8"/>
      <rect class="gs-window" x="122" y="102" width="11" height="11" rx="1"/>
      <rect class="gs-window" x="169" y="102" width="11" height="11" rx="1"/>
    </g>
    ${prayerFlags()}
    <g class="gs-cup" transform="translate(46 116) scale(0.86)">
      <path class="gs-steam" d="M8 -4 C1 -13, 15 -18, 8 -28"/>
      <path class="gs-steam" style="--gs-delay:0.9s" d="M22 -6 C15 -15, 29 -20, 22 -30"/>
      <ellipse class="gs-shadow" cx="14" cy="34" rx="27" ry="4.5"/>
      <path class="gs-vessel" d="M-8 0 h44 l-6 28 a7 7 0 0 1 -7 6 h-18 a7 7 0 0 1 -7 -6 z"/>
      <path class="gs-outline" d="M35 6 a10 10 0 0 1 -1 17"/>
    </g>
  `,
  adda: `
    <rect class="gs-sky" width="320" height="170"/>
    <rect class="gs-wall" x="16" y="24" width="288" height="106" rx="5"/>
    <rect class="gs-window" x="42" y="46" width="52" height="38" rx="3"/>
    <rect class="gs-window" x="226" y="46" width="52" height="38" rx="3"/>
    <rect class="gs-band" x="122" y="38" width="76" height="30" rx="3"/>
    <path class="gs-sign-text" d="M134 50 h52 M134 58 h34"/>
    <path class="gs-awning" d="M12 86 h296 l-10 26 h-276z"/>
    <path class="gs-awning-stripe" d="M34 86 h24 l-10 26 h-24z M80 86 h24 l-10 26 h-24z M125 86 h24 l-10 26 h-24z M171 86 h24 l-10 26 h-24z M217 86 h24 l-10 26 h-24z M262 86 h24 l-10 26 h-24z"/>
    ${fairyLights()}
    <path class="gs-ground" d="M0 132 h320 v38 h-320z"/>
    <g class="gs-table">
      <ellipse class="gs-shadow" cx="160" cy="152" rx="46" ry="6"/>
      <rect class="gs-outline-fill" x="157" y="126" width="6" height="24" rx="2"/>
      <ellipse class="gs-tabletop" cx="160" cy="124" rx="40" ry="9"/>
      <path class="gs-vessel" d="M142 112 h15 l-2 11 h-11z"/>
      <path class="gs-vessel" d="M166 112 h15 l-2 11 h-11z"/>
      <path class="gs-steam" d="M149 108 C143 100, 155 96, 149 88"/>
      <path class="gs-steam" style="--gs-delay:1.1s" d="M173 108 C167 100, 179 96, 173 88"/>
    </g>
    <g class="gs-stool">
      <rect class="gs-outline-fill" x="76" y="126" width="5" height="20" rx="2"/>
      <rect class="gs-outline-fill" x="94" y="126" width="5" height="20" rx="2"/>
      <ellipse class="gs-tabletop" cx="88" cy="124" rx="18" ry="5"/>
      <rect class="gs-outline-fill" x="222" y="126" width="5" height="20" rx="2"/>
      <rect class="gs-outline-fill" x="240" y="126" width="5" height="20" rx="2"/>
      <ellipse class="gs-tabletop" cx="234" cy="124" rx="18" ry="5"/>
    </g>
    <g class="gs-board" transform="translate(38 120)">
      <path class="gs-outline" d="M0 30 L7 0 M20 30 L13 0"/>
      <rect class="gs-slate" x="-2" y="-2" width="18" height="24" rx="2" transform="rotate(-3)"/>
      <path class="gs-sign-text" d="M2 4 h11 M2 9 h8 M2 14 h11"/>
    </g>
    <g class="gs-plant" transform="translate(288 108)">
      <path class="gs-stem" d="M0 0 C-2 -12, -8 -20, -13 -25 M0 0 C0 -14, 0 -22, 0 -30 M0 0 C2 -12, 8 -19, 13 -24"/>
      <path class="gs-leaf" d="M-13 -25 C-20 -32, -16 -40, -8 -38 C-6 -31, -9 -26, -13 -25Z"/>
      <path class="gs-leaf" d="M0 -30 C-6 -38, -2 -46, 4 -43 C5 -36, 3 -31, 0 -30Z"/>
      <path class="gs-leaf" d="M13 -24 C19 -32, 16 -40, 9 -37 C7 -30, 10 -25, 13 -24Z"/>
      <path class="gs-pot" d="M-13 0 h26 l-4 24 h-18z"/>
    </g>
  `,
  kial: `
    <rect class="gs-sky" width="320" height="170"/>
    <circle class="gs-sun" cx="46" cy="30" r="14"/>
    <g class="gs-plane-track">
      <path class="gs-contrail" d="M10 30 h84"/>
      <g class="gs-plane" transform="translate(96 30) scale(0.72)">
        <path d="M0 0 l30 5 -8 4z"/>
        <path d="M11 3 l-3 -11 8 11 M13 6 l-1 10 7 -8z"/>
      </g>
    </g>
    <path class="gs-ridge" d="M0 106 C56 92, 116 100, 178 94 C238 88, 284 100, 320 94 L320 170 L0 170Z"/>
    <path class="gs-ground" d="M0 116 C70 108, 150 118, 226 112 C270 108, 296 116, 320 112 L320 170 L0 170Z"/>
    <g class="gs-forecourt">
      <path class="gs-apron" d="M146 124 h168 v14 h-168z"/>
      <rect class="gs-wall" x="238" y="80" width="60" height="44" rx="3"/>
      <rect class="gs-window" x="246" y="90" width="22" height="20" rx="2"/>
      <rect class="gs-door" x="276" y="96" width="15" height="28" rx="2"/>
      <rect class="gs-post" x="164" y="62" width="8" height="62" rx="2"/>
      <rect class="gs-post" x="302" y="62" width="8" height="62" rx="2"/>
      <rect class="gs-canopy" x="152" y="48" width="164" height="15" rx="4"/>
      <rect class="gs-pump" x="190" y="76" width="32" height="48" rx="4"/>
      <rect class="gs-pump-screen" x="196" y="82" width="20" height="14" rx="2"/>
      <path class="gs-hose" d="M222 94 C236 96, 238 110, 231 120"/>
      <rect class="gs-post" x="262" y="40" width="6" height="10"/>
      <rect class="gs-shell" x="244" y="14" width="42" height="26" rx="6"/>
      <path class="gs-shell-mark" d="M265 20 C272 20, 276 26, 275 34 h-20 c-1 -8 3 -14 10 -14z"/>
    </g>
    <path class="gs-road" d="M0 138 h320 v32 h-320z"/>
    <path class="gs-road-line" d="M8 154 h30 M62 154 h30 M116 154 h30 M170 154 h30 M224 154 h30 M278 154 h30"/>
    <g class="gs-car">
      <path class="gs-vessel" d="M42 142 l9 -11 h24 l11 11z"/>
      <rect class="gs-vessel" x="34" y="140" width="62" height="12" rx="5"/>
      <circle class="gs-outline-fill" cx="50" cy="153" r="5"/>
      <circle class="gs-outline-fill" cx="84" cy="153" r="5"/>
    </g>
  `,
  basadibetta: `
    <rect class="gs-sky" width="320" height="170"/>
    <circle class="gs-sun" cx="66" cy="38" r="16"/>
    <path class="gs-bird" d="M104 42 q7 -7 14 0 q7 -7 14 0"/>
    <path class="gs-bird" style="--gs-delay:1.4s" d="M136 26 q5 -5 10 0 q5 -5 10 0"/>
    <path class="gs-ridge" d="M0 116 C36 88, 74 84, 108 104 C140 122, 170 96, 206 94 C246 92, 286 112, 320 100 L320 170 L0 170Z"/>
    <path class="gs-hill" d="M20 156 C56 128, 92 92, 152 60 C210 92, 250 130, 292 156Z"/>
    ${steps([104, 152], [152, 68], 15)}
    <g class="gs-summit">
      <path class="gs-roof" d="M138 62 L152 44 L166 62Z"/>
      <rect class="gs-wall" x="142" y="62" width="20" height="16" rx="1.5"/>
      <path class="gs-gold" d="M152 42 v-12"/>
      <path class="gs-pennant" d="M152 30 l14 5 -14 5z"/>
    </g>
    <g class="gs-walker" transform="translate(106 148)">
      <circle r="3.4" cy="-16"/>
      <path d="M0 -13 v9 M0 -10 l-5 5 M0 -10 l5 4 M0 -4 l-4 6 M0 -4 l4 6"/>
    </g>
    <path class="gs-ground" d="M0 154 C80 148, 150 158, 230 152 C270 149, 300 156, 320 152 L320 170 L0 170Z"/>
  `,
}

function scene(place: GuidePlace, label: string): string {
  const art = SCENES[place.id] ?? SCENES.adda
  return `<svg class="guide__scene guide__scene--${place.id}" viewBox="0 0 320 170" role="img" aria-label="${label}">${art}</svg>`
}

export function renderGuideScene(
  place: GuidePlace,
  label?: string,
  slice = false,
): string {
  const art = SCENES[place.id] ?? SCENES.adda
  const aria = label ?? `An illustration of ${place.title}`
  const fit = slice ? 'xMidYMid slice' : 'xMidYMid meet'
  return `<svg class="guide__scene guide__scene--${place.id}" viewBox="0 0 320 170" preserveAspectRatio="${fit}" role="img" aria-label="${aria}">${art}</svg>`
}

function kindLabel(place: GuidePlace): string {
  return place.kind === 'hike' ? '△ Hike' : '☕ Coffee'
}

function renderPlace(place: GuidePlace, index: number): string {
  const directions = place.mapUrl
    ? `<a class="guide__link label-caps" href="${place.mapUrl}" target="_blank" rel="noopener noreferrer">Directions</a>`
    : ''

  return `
    <article class="guide__card guide__card--${place.kind}" data-guide-card="${place.id}">
      <div class="guide__card-inner">
        <div class="guide__face guide__face--front">
          <div class="guide__art">
            ${scene(place, `An illustration of ${place.title}`)}
            <span class="guide__kind label-caps">${kindLabel(place)}</span>
            <span class="guide__stamp" aria-hidden="true">
              <span class="guide__stamp-head">Stamped</span>
              <span class="guide__stamp-text">${place.stamp}</span>
            </span>
          </div>
          <div class="guide__body">
            <p class="guide__kicker label-caps">${String(index + 1).padStart(2, '0')} · ${place.kicker}</p>
            <h3 class="guide__title">${place.title}</h3>
            <p class="guide__note">${place.note}</p>
          </div>
          <button class="guide__turn label-caps" type="button" data-guide-open>If you go →</button>
        </div>

        <div class="guide__face guide__face--back">
          <p class="guide__kicker label-caps">If you go</p>
          <h3 class="guide__title">${place.title}</h3>
          <p class="guide__tip">${place.tip}</p>
          <p class="guide__travel label-caps">${place.travel}</p>
          <div class="guide__actions">
            <button class="guide__stamp-btn label-caps" type="button" data-guide-stamp>Stamp my pass</button>
            ${directions}
          </div>
          <button class="guide__turn guide__turn--back label-caps" type="button" data-guide-close>← Back</button>
        </div>
      </div>
    </article>
  `
}

export function renderGuide(config: WeddingConfig): string {
  const { title, lede, completeNote, places } = config.guide

  const slots = places
    .map(
      (place) => `
        <span class="guide__slot" data-guide-slot="${place.id}" title="${place.title}">
          <span aria-hidden="true">${place.kind === 'hike' ? '△' : '☕'}</span>
        </span>
      `,
    )
    .join('')

  return `
    <section class="section guide" id="guide" aria-labelledby="guide-heading" data-guide>
      <h2 id="guide-heading" class="section__title">${title}</h2>
      <p class="section__lede">${lede}</p>

      <div class="guide__pass">
        <div class="guide__pass-id">
          <span class="guide__crest">${config.couple.monogram}</span>
          <div>
            <p class="guide__pass-label label-caps">Guest field pass</p>
            <p class="guide__pass-name">Admit one, plus whoever you talk into it</p>
          </div>
        </div>
        <div class="guide__pass-meter">
          <div class="guide__slots">${slots}</div>
          <p class="guide__count" data-guide-count role="status">0 of ${places.length} stamped</p>
        </div>
      </div>

      <p class="guide__complete" data-guide-complete hidden>${completeNote}</p>

      <div class="guide__grid">
        ${places.map(renderPlace).join('')}
      </div>

      <button class="guide__reset label-caps" type="button" data-guide-reset hidden>Clear my stamps</button>
    </section>
  `
}

export function initGuide(config: WeddingConfig): void {
  const root = document.querySelector<HTMLElement>('[data-guide]')
  if (!root) return

  const total = config.guide.places.length
  const count = root.querySelector<HTMLElement>('[data-guide-count]')
  const complete = root.querySelector<HTMLElement>('[data-guide-complete]')
  const reset = root.querySelector<HTMLButtonElement>('[data-guide-reset]')
  let stamped = readStamps()

  const paint = (justStamped?: string) => {
    for (const card of root.querySelectorAll<HTMLElement>('[data-guide-card]')) {
      const id = card.dataset.guideCard ?? ''
      const has = stamped.includes(id)
      card.classList.toggle('is-stamped', has)

      const button = card.querySelector<HTMLButtonElement>('[data-guide-stamp]')
      if (button) {
        button.disabled = has
        button.textContent = has ? 'Stamped' : 'Stamp my pass'
      }

      if (id === justStamped) {
        card.classList.remove('is-inking')
        void card.offsetWidth
        card.classList.add('is-inking')
      }
    }

    for (const slot of root.querySelectorAll<HTMLElement>('[data-guide-slot]')) {
      slot.classList.toggle('is-filled', stamped.includes(slot.dataset.guideSlot ?? ''))
    }

    if (count) count.textContent = `${stamped.length} of ${total} stamped`
    if (complete) complete.hidden = stamped.length < total
    if (reset) reset.hidden = stamped.length === 0
  }

  const flip = (card: HTMLElement, open: boolean) => {
    card.classList.toggle('is-flipped', open)
    const focus = card.querySelector<HTMLElement>(
      open ? '[data-guide-stamp]' : '[data-guide-open]',
    )
    focus?.focus({ preventScroll: true })
  }

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    const card = target.closest<HTMLElement>('[data-guide-card]')

    if (target.closest('[data-guide-reset]')) {
      stamped = []
      writeStamps(stamped)
      paint()
      return
    }

    if (!card) return

    if (target.closest('[data-guide-open]')) {
      flip(card, true)
      return
    }

    if (target.closest('[data-guide-close]')) {
      flip(card, false)
      return
    }

    if (target.closest('[data-guide-stamp]')) {
      const id = card.dataset.guideCard
      if (!id || stamped.includes(id)) return
      stamped = [...stamped, id]
      writeStamps(stamped)
      paint(id)
    }
  })

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    const card = (event.target as HTMLElement).closest<HTMLElement>('.guide__card.is-flipped')
    if (card) flip(card, false)
  })

  paint()
}
