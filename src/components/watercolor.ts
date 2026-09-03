type WcCorner = 'blush' | 'botanical'
type WcSide = 'tl' | 'tr' | 'bl' | 'br'

const WC = {
  blush: '/images/watercolor/wc-corner-blush.png',
  botanical: '/images/watercolor/wc-corner-botanical.png',
  divider: '/images/watercolor/wc-divider-spray.png',
  wash: '/images/watercolor/wc-wash-sage.png',
} as const

function cornerImg(kind: WcCorner, side: WcSide): string {
  return `<img class="wc wc--corner wc--corner-${side}" src="${WC[kind]}" alt="" width="768" height="768" decoding="async" aria-hidden="true" />`
}

/** Soft botanical corners for a section frame. Assets are painted for bottom-left; sides flip via CSS. */
export function renderWcCorners(options: {
  top?: WcCorner
  bottom?: WcCorner
  topSide?: WcSide
  bottomSide?: WcSide
}): string {
  const parts: string[] = []
  if (options.top) parts.push(cornerImg(options.top, options.topSide ?? 'tl'))
  if (options.bottom) parts.push(cornerImg(options.bottom, options.bottomSide ?? 'br'))
  return parts.join('')
}

export function renderWcWash(extraClass = ''): string {
  const cls = ['wc', 'wc--wash', extraClass].filter(Boolean).join(' ')
  return `<img class="${cls}" src="${WC.wash}" alt="" width="768" height="743" decoding="async" aria-hidden="true" />`
}

export function renderWcDivider(extraClass = ''): string {
  const cls = ['wc', 'wc--divider', extraClass].filter(Boolean).join(' ')
  return `<img class="${cls}" src="${WC.divider}" alt="" width="900" height="224" decoding="async" aria-hidden="true" />`
}
