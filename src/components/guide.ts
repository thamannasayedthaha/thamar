import type { GuidePlace, WeddingConfig } from '../types'

function renderPlace(place: GuidePlace): string {
  const link = place.mapUrl
    ? `<a class="guide__link label-caps" href="${place.mapUrl}" target="_blank" rel="noopener noreferrer">Directions</a>`
    : ''

  const glyph = place.kind === 'hike' ? '△' : '☕'

  return `
    <article class="guide__place guide__place--${place.kind}">
      <span class="guide__kind label-caps">${glyph} ${place.kind === 'hike' ? 'Hike' : 'Coffee'}</span>
      <h3 class="guide__title">${place.title}</h3>
      <p class="guide__note">${place.note}</p>
      ${link}
    </article>
  `
}

export function renderGuide(config: WeddingConfig): string {
  return `
    <section class="section guide" id="guide" aria-labelledby="guide-heading">
      <h2 id="guide-heading" class="section__title">${config.guide.title}</h2>
      <p class="section__lede">${config.guide.lede}</p>
      <div class="guide__grid">
        ${config.guide.places.map(renderPlace).join('')}
      </div>
    </section>
  `
}
