type WcCorner = 'blush' | 'botanical'
type WcSide = 'tl' | 'tr' | 'bl' | 'br'

const WC = {
  blush: {
    light: '/images/watercolor/wc-corner-blush.png',
    dark: '/images/watercolor/wc-corner-blush-dark.png',
  },
  botanical: {
    light: '/images/watercolor/wc-corner-botanical.png',
    dark: '/images/watercolor/wc-corner-botanical-dark.png',
  },
  divider: {
    light: '/images/watercolor/wc-divider-spray.png',
    dark: '/images/watercolor/wc-divider-spray-dark.png',
  },
  wash: {
    light: '/images/watercolor/wc-wash-sage.png',
    dark: '/images/watercolor/wc-wash-sage-dark.png',
  },
} as const

function isDarkTheme(): boolean {
  return document.documentElement.dataset.theme === 'dark'
}

function themePairAttrs(light: string, dark: string): string {
  const src = isDarkTheme() ? dark : light
  return `src="${src}" data-src-light="${light}" data-src-dark="${dark}"`
}

function cornerImg(kind: WcCorner, side: WcSide): string {
  const { light, dark } = WC[kind]
  return `<img class="wc wc--corner wc--corner-${side}" ${themePairAttrs(light, dark)} alt="" width="768" height="768" decoding="async" aria-hidden="true" />`
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
  const { light, dark } = WC.wash
  return `<img class="${cls}" ${themePairAttrs(light, dark)} alt="" width="768" height="743" decoding="async" aria-hidden="true" />`
}

export function renderWcDivider(extraClass = ''): string {
  const cls = ['wc', 'wc--divider', extraClass].filter(Boolean).join(' ')
  const { light, dark } = WC.divider
  return `<img class="${cls}" ${themePairAttrs(light, dark)} alt="" width="900" height="224" decoding="async" aria-hidden="true" />`
}
