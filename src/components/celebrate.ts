export type CelebrateTheme = 'haldi' | 'mehendi' | 'sangeet' | 'reception'

const DURATION: Record<CelebrateTheme, number> = {
  haldi: 3400,
  mehendi: 3800,
  sangeet: 4200,
  reception: 3000,
}

const SPLAT_PATHS = [
  'M102 16c26 6 40 30 58 40 24 14 50 6 54 34 4 26-20 38-16 62 4 24-24 44-50 40-18-2-28 24-50 22-26-2-38-26-60-22-28 4-52-16-50-44 2-20 24-28 22-52-2-28 16-44 44-46 16-2 24-36 48-34z',
  'M88 10c22-4 40 18 62 16 24-2 40 22 36 44-4 18 22 28 16 48-8 24-34 18-44 40-10 22-40 24-56 8-14-14-38-4-54-18-18-16-40-12-42-36-2-22 20-30 18-52-2-20 18-42 40-40 14 2 22-18 40-10z',
  'M70 28c18-16 48-18 64 2 14 18 42 10 54 28 14 20 8 48-10 62-12 10-6 36-24 42-22 8-40-12-62-8-20 4-42 18-56 2-16-18-8-44 2-62 8-14-8-36 8-50 12-10 12-28 24-16z',
]

const HALDI_COLORS = ['#f4d35e', '#e8b423', '#f08a3a', '#ff6b4a', '#e85d8c', '#f6d24a', '#ffd93d', '#c94b7c', '#2bb8a8', '#ff8fab']

let overlay: HTMLElement | null = null
let hideTimer = 0

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function clearCelebrate(): void {
  window.clearTimeout(hideTimer)
  overlay?.remove()
  overlay = null
}

function mount(theme: CelebrateTheme, html: string): void {
  clearCelebrate()

  const root = document.createElement('div')
  root.className = `celebrate celebrate--${theme}`
  root.dataset.celebrate = theme
  root.setAttribute('aria-hidden', 'true')
  root.innerHTML = html
  document.body.appendChild(root)
  overlay = root

  hideTimer = window.setTimeout(clearCelebrate, DURATION[theme])
}

function splat(index: number): string {
  const size = rand(120, 280)
  const color = pick(HALDI_COLORS)
  const blend = Math.random() > 0.45 ? 'multiply' : 'overlay'

  return `
    <svg class="celebrate__splat" viewBox="0 0 200 200" style="
      --x: ${rand(2, 88)}%;
      --y: ${rand(0, 82)}%;
      --s: ${size}px;
      --r: ${rand(-40, 40)}deg;
      --d: ${rand(0, 0.45)}s;
      --blend: ${blend};
      color: ${color};
    ">
      <path d="${SPLAT_PATHS[index % SPLAT_PATHS.length]}" fill="currentColor"/>
    </svg>
  `
}

function droplet(): string {
  return `<span class="celebrate__drop" style="
    --x: ${rand(0, 100)}%;
    --y: ${rand(0, 100)}%;
    --s: ${rand(8, 22)}px;
    --d: ${rand(0.05, 0.6)}s;
    background: ${pick(HALDI_COLORS)};
  "></span>`
}

function renderHaldi(): string {
  const splats = Array.from({ length: 18 }, (_, i) => splat(i)).join('')
  const drops = Array.from({ length: 28 }, droplet).join('')

  return `<div class="celebrate__wash"></div>${splats}${drops}`
}

function paisley(cx: number, cy: number, scale: number, rotate: number): string {
  return `
    <g transform="translate(${cx} ${cy}) rotate(${rotate}) scale(${scale})">
      <path d="M0 40c0-36 32-64 62-36 8 8 4 26-8 26-18 0-24 20-24 38 0 28 24 46 6 46-32 0-36-36-36-74z" />
      <path d="M8 38c4-18 22-30 36-16 4 4 2 14-4 14-10 0-14 12-14 22 0 16 12 26 2 26-16 0-20-22-20-46z" />
      <circle cx="18" cy="20" r="3.5" fill="currentColor" stroke="none"/>
      <circle cx="28" cy="48" r="2" fill="currentColor" stroke="none"/>
    </g>
  `
}

function mandala(): string {
  const petals = Array.from({ length: 12 }, (_, i) => {
    const a = i * 30
    return `<ellipse cx="200" cy="92" rx="16" ry="42" transform="rotate(${a} 200 200)"/>`
  }).join('')

  const outer = Array.from({ length: 8 }, (_, i) => paisley(200, 200, 0.85, i * 45 - 90)).join('')
  const dots = Array.from({ length: 24 }, (_, i) => {
    const a = (i * Math.PI * 2) / 24
    const r = i % 2 === 0 ? 158 : 118
    return `<circle cx="${200 + Math.cos(a) * r}" cy="${200 + Math.sin(a) * r}" r="${i % 2 === 0 ? 3.2 : 2}" fill="currentColor" stroke="none"/>`
  }).join('')

  return `
    <svg class="celebrate__mandala" viewBox="0 0 400 400">
      <g fill="none" stroke="currentColor" stroke-linecap="round">
        <circle cx="200" cy="200" r="22"/>
        <circle cx="200" cy="200" r="48"/>
        <circle cx="200" cy="200" r="86"/>
        <circle cx="200" cy="200" r="132"/>
        <circle cx="200" cy="200" r="178"/>
        ${petals}
        ${outer}
        ${dots}
        <path d="M200 178c-18 8-28 28-8 40 12 8 28-2 28-16 0-14-8-22-20-24z"/>
      </g>
    </svg>
  `
}

function vine(corner: string): string {
  return `
    <svg class="celebrate__vine celebrate__vine--${corner}" viewBox="0 0 220 220">
      <g fill="none" stroke="currentColor" stroke-linecap="round">
        <path d="M12 12c40 8 48 48 88 56 28 6 40-24 72-16 20 6 32 28 40 48"/>
        <path d="M40 20c8 28 36 32 44 60"/>
        <path d="M108 72c12-22 40-18 52-40"/>
        ${paisley(70, 58, 0.55, 20)}
        ${paisley(150, 96, 0.42, -30)}
        <circle cx="28" cy="24" r="3" fill="currentColor" stroke="none"/>
        <circle cx="96" cy="64" r="2.4" fill="currentColor" stroke="none"/>
        <circle cx="176" cy="92" r="2" fill="currentColor" stroke="none"/>
      </g>
    </svg>
  `
}

function dhol(side: 'left' | 'right'): string {
  return `
    <svg class="celebrate__dhol celebrate__dhol--${side}" viewBox="0 0 200 160">
      <ellipse cx="36" cy="80" rx="30" ry="62" fill="#f3e6c8" stroke="#5c3317" stroke-width="3"/>
      <rect x="36" y="18" width="128" height="124" fill="#9a2424"/>
      <rect x="36" y="48" width="128" height="12" fill="#c8a45c"/>
      <rect x="36" y="100" width="128" height="12" fill="#c8a45c"/>
      <rect x="36" y="72" width="128" height="8" fill="#2a6b45"/>
      <g stroke="#f3e6c8" stroke-width="2.2" fill="none">
        <path d="M50 20l12 120M74 20l12 120M98 20l12 120M122 20l12 120M146 20l12 120"/>
      </g>
      <ellipse cx="164" cy="80" rx="24" ry="62" fill="#efe0c0" stroke="#5c3317" stroke-width="3"/>
      <ellipse cx="36" cy="80" rx="16" ry="36" fill="none" stroke="#c8a45c" stroke-width="2"/>
      <g class="celebrate__stick">
        <rect x="8" y="18" width="7" height="64" rx="3" fill="#5c3317" transform="rotate(-28 12 50)"/>
      </g>
      <g class="celebrate__stick celebrate__stick--alt">
        <rect x="168" y="22" width="6" height="58" rx="3" fill="#5c3317" transform="rotate(32 171 51)"/>
      </g>
    </svg>
    <span class="celebrate__beat celebrate__beat--${side}"></span>
  `
}

function renderMehendi(): string {
  return `
    <div class="celebrate__wash"></div>
    <div class="celebrate__jaali"></div>
    ${mandala()}
    ${vine('tl')}${vine('tr')}${vine('bl')}${vine('br')}
    ${dhol('left')}${dhol('right')}
  `
}

function dancer(kind: 'woman' | 'man', x: number, variant: number): string {
  const skins = ['#e2b48a', '#c48a58', '#d7a06e', '#e8c09a']
  const hair = ['#2c1a12', '#1a100c', '#4a2c1c']
  const skin = skins[variant % skins.length]
  const hairColor = hair[variant % hair.length]
  const tops = ['#9b7ec8', '#d4af60', '#c9b0e8', '#6b3d8a', '#fff8e8']
  const bottoms = ['#3d2a5c', '#9b7ec8', '#d4af60', '#2a1a40', '#e8d4a0']
  const top = tops[variant % tops.length]
  const bottom = bottoms[variant % bottoms.length]
  const delay = variant * 0.12
  const move = variant % 2 === 0 ? 'twirl' : 'bounce'

  const figure =
    kind === 'man'
      ? `
        <ellipse cx="44" cy="182" rx="20" ry="6" fill="#8c9c82" opacity="0.2"/>
        <circle cx="48" cy="28" r="16" fill="${skin}"/>
        <path d="M34 22c4-10 22-12 28-2 1 2-2 4-5 3-6-2-14-1-20 2-2 1-4-1-3-3z" fill="${hairColor}"/>
        <path d="M18 58c-8 16 2 38 16 32" fill="none" stroke="${top}" stroke-width="10" stroke-linecap="round"/>
        <path d="M70 52c16 4 22 30 6 40" fill="none" stroke="${top}" stroke-width="10" stroke-linecap="round"/>
        <rect x="26" y="48" width="36" height="54" rx="10" fill="${top}"/>
        <rect x="30" y="102" width="11" height="48" rx="5" fill="${bottom}"/>
        <rect x="46" y="100" width="11" height="52" rx="5" fill="${bottom}"/>
        <ellipse cx="36" cy="152" rx="8" ry="4" fill="#1a1a1a"/>
        <ellipse cx="52" cy="154" rx="8" ry="4" fill="#1a1a1a"/>
      `
      : `
        <ellipse cx="50" cy="192" rx="22" ry="6" fill="#8c9c82" opacity="0.2"/>
        <circle cx="50" cy="30" r="16" fill="${skin}"/>
        <path d="M34 28c2-14 24-18 34-6 2 3-1 5-5 4-8-3-16 0-22 6-2 2-6 0-5-4z" fill="${hairColor}"/>
        <path d="M18 62c-12 18-2 40 16 36" fill="none" stroke="${top}" stroke-width="9" stroke-linecap="round"/>
        <path d="M82 58c14 12 16 34 0 44" fill="none" stroke="${top}" stroke-width="9" stroke-linecap="round"/>
        <path d="M50 48c-16 4-22 18-20 36 8-4 24-6 40 2 4-18-4-34-20-38z" fill="${top}"/>
        <path d="M24 86c-8 36 10 78 26 86 18-8 34-52 26-86-16-10-36-10-52 0z" fill="${bottom}"/>
        <circle cx="64" cy="38" r="3" fill="#c8a45c"/>
      `

  const box = kind === 'man' ? '0 0 90 190' : '0 0 100 200'

  return `
    <div class="celebrate__dancer-wrap" style="--x:${x}%; --d:${delay}s;">
      <svg class="celebrate__dancer celebrate__dancer--${move}" viewBox="${box}">
        ${figure}
      </svg>
    </div>
  `
}

function note(i: number): string {
  const glyphs = ['♪', '♫', '✦', '✧']
  return `<span class="celebrate__note" style="
    --x: ${rand(8, 92)}%;
    --d: ${i * 0.18}s;
    --drift: ${rand(-40, 40)}px;
  ">${glyphs[i % glyphs.length]}</span>`
}

function renderSangeet(): string {
  const people = [
    dancer('woman', 4, 0),
    dancer('man', 18, 1),
    dancer('woman', 32, 2),
    dancer('man', 48, 3),
    dancer('woman', 62, 4),
    dancer('man', 76, 5),
    dancer('woman', 88, 6),
  ].join('')

  const notes = Array.from({ length: 14 }, (_, i) => note(i)).join('')
  const sparkles = Array.from(
    { length: 22 },
    () =>
      `<span class="celebrate__sparkle" style="--x:${rand(4, 96)}%; --y:${rand(8, 70)}%; --d:${rand(0, 1.2)}s;"></span>`,
  ).join('')

  return `<div class="celebrate__wash"></div>${people}${notes}${sparkles}`
}

function camera(i: number): string {
  const slots = [
    { x: 3, y: 8, r: -16 },
    { x: 78, y: 6, r: 14 },
    { x: 12, y: 38, r: 8 },
    { x: 84, y: 32, r: -10 },
    { x: 4, y: 68, r: 18 },
    { x: 72, y: 62, r: -14 },
    { x: 38, y: 4, r: 6 },
    { x: 52, y: 72, r: -8 },
    { x: 22, y: 78, r: 12 },
    { x: 88, y: 78, r: -20 },
  ]
  const slot = slots[i % slots.length]

  return `
    <svg class="celebrate__camera" viewBox="0 0 88 70" style="--x:${slot.x}%; --y:${slot.y}%; --r:${slot.r}deg; --d:${i * 0.08}s;">
      <rect x="10" y="22" width="68" height="40" rx="7" fill="#161616"/>
      <rect x="16" y="28" width="10" height="8" rx="1" fill="#c8a45c"/>
      <circle cx="48" cy="42" r="16" fill="#2a2a2a" stroke="#c8a45c" stroke-width="2"/>
      <circle cx="48" cy="42" r="9" fill="#111"/>
      <circle cx="48" cy="42" r="3.5" fill="#9ec4e8"/>
      <rect x="36" y="8" width="20" height="14" rx="3" class="celebrate__flashbulb" fill="#f7f4ee"/>
      <path d="M18 22l8-8h12l6 8" fill="#2a2a2a"/>
    </svg>
  `
}

function flash(i: number): string {
  return `<span class="celebrate__burst" style="
    --x: ${rand(5, 95)}%;
    --y: ${rand(5, 95)}%;
    --d: ${0.05 + i * 0.16}s;
    --s: ${rand(42, 78)}vmax;
  "></span>`
}

function renderReception(): string {
  const cameras = Array.from({ length: 10 }, (_, i) => camera(i)).join('')
  const bursts = Array.from({ length: 12 }, (_, i) => flash(i)).join('')

  return `<div class="celebrate__wash"></div>${cameras}${bursts}`
}

function renderReduced(): string {
  return `<div class="celebrate__wash celebrate__wash--brief"></div>`
}

export function celebrate(theme: CelebrateTheme): void {
  if (prefersReducedMotion()) {
    mount(theme, renderReduced())
    return
  }

  const html =
    theme === 'haldi'
      ? renderHaldi()
      : theme === 'mehendi'
        ? renderMehendi()
        : theme === 'sangeet'
          ? renderSangeet()
          : renderReception()

  mount(theme, html)
}

export function isCelebrateTheme(value: string | undefined): value is CelebrateTheme {
  return value === 'haldi' || value === 'mehendi' || value === 'sangeet' || value === 'reception'
}
