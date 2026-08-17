import type { EventTheme } from '../types'

const MARKERS: Record<EventTheme, string> = {
  meeting: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#eef2e6"/>
      <path d="M6 46c8-10 16-16 26-16s18 6 26 16" fill="#cfd8c6"/>
      <path d="M18 38l8-14 8 10 7-8 9 16H18z" fill="#8c9c82"/>
      <circle cx="23" cy="28" r="5.5" fill="#d7a06e"/>
      <circle cx="41" cy="27" r="5.5" fill="#e2b48a"/>
      <path d="M17 42c1-7 5-11 11-11h1c5 0 8 4 9 11" fill="#54634c"/>
      <path d="M32 42c1-7 5-12 12-12 6 0 9 5 10 12" fill="#f3dedc"/>
    </svg>
  `,
  nikah: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#f7f4ea"/>
      <path d="M12 46V30l20-16 20 16v16H12z" fill="#8c9c82"/>
      <path d="M18 46V32h28v14" fill="#d7e8cb"/>
      <rect x="28" y="36" width="8" height="10" rx="1" fill="#54634c"/>
      <circle cx="32" cy="18" r="4" fill="#c8a45c"/>
      <path d="M42 20c6 0 10 5 10 10 0-8-5-14-12-14-2 0-4 1-5 2 2-1 4-0.5 7 2z" fill="#fbf9f4"/>
    </svg>
  `,
  haldi: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#fff6d4"/>
      <g transform="translate(32 28)">
        <g fill="#f0c43a">
          <ellipse cx="0" cy="-14" rx="4" ry="10"/>
          <ellipse cx="0" cy="-14" rx="4" ry="10" transform="rotate(45)"/>
          <ellipse cx="0" cy="-14" rx="4" ry="10" transform="rotate(90)"/>
          <ellipse cx="0" cy="-14" rx="4" ry="10" transform="rotate(135)"/>
          <ellipse cx="0" cy="-14" rx="4" ry="10" transform="rotate(180)"/>
          <ellipse cx="0" cy="-14" rx="4" ry="10" transform="rotate(225)"/>
          <ellipse cx="0" cy="-14" rx="4" ry="10" transform="rotate(270)"/>
          <ellipse cx="0" cy="-14" rx="4" ry="10" transform="rotate(315)"/>
        </g>
        <circle r="7" fill="#8a4b06"/>
        <circle r="3.5" fill="#f6d24a"/>
      </g>
      <ellipse cx="32" cy="50" rx="14" ry="5" fill="#e8c65c"/>
      <ellipse cx="32" cy="49" rx="10" ry="3" fill="#fff8dc"/>
    </svg>
  `,
  mehendi: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#fdeef3"/>
      <path d="M26 50c-8-2-12-12-8-22 3-8 12-14 18-12 4 1 6 5 5 10-8-1-14 4-16 12 4-6 12-8 18-4 4 3 5 9 2 14-5 8-14 10-19 2z" fill="#e8c4a0"/>
      <path d="M30 18c2-6 8-9 12-6 1 4-2 8-6 9" fill="#e8c4a0"/>
      <path d="M36 22c4-2 9-1 10 3 0 3-3 6-7 6" fill="#e8c4a0"/>
      <path d="M28 28c6 8 14 10 20 4" fill="none" stroke="#c2185b" stroke-width="1.4"/>
      <circle cx="34" cy="36" r="2" fill="#c2185b"/>
      <circle cx="40" cy="32" r="1.4" fill="#ff6f00"/>
      <path d="M22 40c4 6 12 8 18 3" fill="none" stroke="#00bfa5" stroke-width="1.2"/>
    </svg>
  `,
  sangeet: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#f4e9ff"/>
      <rect x="28" y="14" width="7" height="26" rx="3" fill="#241040"/>
      <circle cx="24" cy="40" r="10" fill="#7b2d8f"/>
      <circle cx="24" cy="40" r="5" fill="#f4cf6b"/>
      <path d="M35 16c10 2 16 10 16 20" fill="none" stroke="#c9a227" stroke-width="2.4"/>
      <path d="M35 22c6 2 10 7 10 14" fill="none" stroke="#f4cf6b" stroke-width="2"/>
      <circle cx="48" cy="18" r="3" fill="#f4cf6b"/>
      <circle cx="52" cy="28" r="2" fill="#fff"/>
    </svg>
  `,
  reception: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#161410"/>
      <path d="M32 8l3 9 9-1-6 7 6 8-9-2-3 9-3-9-9 2 6-8-6-7 9 1z" fill="#d9b978"/>
      <path d="M22 34c0 8 4 14 10 14s10-6 10-14H22z" fill="#f4efe6"/>
      <path d="M24 34c1 7 4 12 8 12s7-5 8-12H24z" fill="#c8a45c" opacity="0.35"/>
      <rect x="30" y="48" width="4" height="8" fill="#d9b978"/>
      <rect x="26" y="55" width="12" height="3" rx="1" fill="#d9b978"/>
    </svg>
  `,
}

export function renderEventMarker(theme: EventTheme): string {
  return MARKERS[theme]
}
