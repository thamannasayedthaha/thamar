import type { WeddingConfig } from '../types'
import { renderCountdown } from './countdown'

export function renderHero(config: WeddingConfig): string {
  const { partnerOne, partnerTwo } = config.couple

  return `
    <header class="hero" id="home">
      <div class="hero__photo" aria-hidden="true">
        <img class="hero__image" src="${config.heroImage}" alt="" />
      </div>
      <div class="hero__content">
        <p class="hero__eyebrow label-caps">${config.tagline}</p>
        <h1 class="hero__names">
          ${partnerOne}
          <span class="hero__ampersand">&amp;</span>
          ${partnerTwo}
        </h1>
      </div>
      ${renderCountdown(config.quote)}
    </header>
  `
}
