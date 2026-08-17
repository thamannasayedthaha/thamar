import type { WeddingConfig } from '../types'

export function renderStory(config: WeddingConfig): string {
  const [first = '', ...rest] = config.story.paragraphs
  const drop = first.slice(0, 1)
  const remainder = first.slice(1)

  const more = rest.map((paragraph) => `<p>${paragraph}</p>`).join('')

  return `
    <section class="story" id="story" aria-labelledby="story-heading">
      <div class="story__frame">
        <img src="${config.story.image}" alt="${config.story.imageAlt}" />
        <span class="story__seal" aria-hidden="true">${config.couple.monogram}</span>
      </div>
      <div class="story__copy">
        <h2 id="story-heading" class="story__title">${config.story.title}</h2>
        <p><span class="story__drop" aria-hidden="true">${drop}</span>${remainder}</p>
        ${more}
      </div>
    </section>
  `
}
