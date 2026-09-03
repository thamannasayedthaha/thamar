import type { GalleryCategory, GalleryImage, WeddingConfig } from '../types'

export const GALLERY_PREVIEW_COUNT = 4

export type GalleryGroup = {
  key: GalleryCategory
  label: string
  images: GalleryImage[]
}

export const GALLERY_CATEGORIES: GalleryCategory[] = ['engagement', 'nikah', 'years']

export function isGalleryCategory(value: string): value is GalleryCategory {
  return GALLERY_CATEGORIES.includes(value as GalleryCategory)
}

export function inferCategory(image: GalleryImage): GalleryCategory {
  if (image.category) return image.category

  const src = image.src.toLowerCase()

  if (src.includes('nikah') || src.includes('2025-09-25')) return 'nikah'
  if (src.includes('years') || src.includes('through-the-years')) return 'years'
  if (src.includes('engagement') || src.includes('2025-09-23')) return 'engagement'

  return 'engagement'
}

export function getGalleryGroups(config: WeddingConfig): GalleryGroup[] {
  const engagement = config.gallery.filter((img) => inferCategory(img) === 'engagement')
  const nikah = config.gallery.filter((img) => inferCategory(img) === 'nikah')
  const years = config.gallery.filter((img) => inferCategory(img) === 'years')

  return [
    { key: 'engagement' as const, label: 'Engagement', images: engagement },
    { key: 'nikah' as const, label: 'Nikah', images: nikah },
    { key: 'years' as const, label: 'Us through the years', images: years },
  ].filter((group) => group.key === 'years' || group.images.length > 0)
}

export function renderImage(image: GalleryImage): string {
  const caption = image.caption
    ? `<figcaption class="gallery__caption">${image.caption}</figcaption>`
    : ''

  return `
    <figure class="gallery__item">
      <div class="gallery__frame">
        <img class="gallery__image" src="${image.src}" alt="${image.alt}" loading="lazy" />
      </div>
      ${caption}
    </figure>
  `
}

function renderYearsStop(image: GalleryImage, index: number): string {
  const era = image.era
    ? `<span class="years-timeline__era label-caps">${image.era}</span>`
    : ''
  const title = image.caption
    ? `<figcaption class="years-timeline__title">${image.caption}</figcaption>`
    : ''

  return `
    <article class="years-timeline__stop ${index % 2 === 0 ? 'years-timeline__stop--left' : 'years-timeline__stop--right'}">
      ${era}
      <span class="years-timeline__dot" aria-hidden="true"></span>
      <figure class="years-timeline__card">
        <div class="years-timeline__frame">
          <img class="years-timeline__image" src="${image.src}" alt="${image.alt}" loading="lazy" />
        </div>
        ${title}
      </figure>
    </article>
  `
}

function renderYearsTimeline(images: GalleryImage[], limit?: number): string {
  if (images.length === 0) return renderEmpty('us through the years')
  const shown = typeof limit === 'number' ? images.slice(0, limit) : images
  return `
    <div class="years-timeline" role="list">
      ${shown.map((image, index) => renderYearsStop(image, index)).join('')}
    </div>
  `
}

function renderEmpty(label: string): string {
  return `<p class="gallery__empty">Photographs from ${label.toLowerCase()} — we will add them here as we gather them.</p>`
}

function renderGrid(images: GalleryImage[], hero: boolean): string {
  if (images.length === 0) return renderEmpty('us through the years')
  const cls = hero ? 'gallery__grid gallery__grid--hero' : 'gallery__grid'
  return `<div class="${cls}">${images.map(renderImage).join('')}</div>`
}

function renderGroupContent(group: GalleryGroup, preview: boolean): string {
  if (group.key === 'years') {
    return renderYearsTimeline(group.images, preview ? GALLERY_PREVIEW_COUNT : undefined)
  }
  const images = preview ? group.images.slice(0, GALLERY_PREVIEW_COUNT) : group.images
  return renderGrid(images, preview)
}

function renderTabs(groups: GalleryGroup[], active: GalleryCategory): string {
  if (groups.length < 2) return ''

  return `
    <div class="gallery__tabs" role="tablist" aria-label="Gallery albums">
      ${groups
        .map(
          (group) => `
            <button
              type="button"
              class="gallery__tab label-caps ${group.key === active ? 'gallery__tab--active' : ''}"
              data-gallery-tab="${group.key}"
              role="tab"
              aria-selected="${group.key === active}"
            >
              ${group.label}
            </button>
          `,
        )
        .join('')}
    </div>
  `
}

export function renderGallery(config: WeddingConfig): string {
  const groups = getGalleryGroups(config)
  if (groups.length === 0) return ''

  const defaultTab = groups[0].key

  const panels = groups
    .map((group) => {
      const hasMore = group.images.length > GALLERY_PREVIEW_COUNT

      const more = hasMore
        ? `<a class="gallery__see-more label-caps" href="gallery.html#${group.key}">See more ${group.label}</a>`
        : ''

      return `
        <div
          class="gallery__panel"
          data-gallery-panel="${group.key}"
          ${group.key === defaultTab ? '' : 'hidden'}
          role="tabpanel"
        >
          ${renderGroupContent(group, true)}
          ${more}
        </div>
      `
    })
    .join('')

  return `
    <section class="section" id="gallery" aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" class="section__title">Keepsake Gallery</h2>
      <p class="section__lede">A few moments from our story, kept like pressed flowers.</p>
      ${renderTabs(groups, defaultTab)}
      <div class="gallery__panels">${panels}</div>
    </section>
  `
}

export function renderAlbum(config: WeddingConfig, active: GalleryCategory): string {
  const groups = getGalleryGroups(config)
  if (groups.length === 0) return ''

  const current = groups.some((group) => group.key === active) ? active : groups[0].key

  const panels = groups
    .map(
      (group) => `
        <div
          class="gallery__panel"
          data-gallery-panel="${group.key}"
          ${group.key === current ? '' : 'hidden'}
          role="tabpanel"
        >
          ${renderGroupContent(group, false)}
        </div>
      `,
    )
    .join('')

  return `
    <section class="section album" id="album" aria-labelledby="album-heading">
      <p class="album__back">
        <a class="label-caps" href="index.html#gallery">Back to the invitation</a>
      </p>
      <h1 id="album-heading" class="section__title">Keepsake Gallery</h1>
      <p class="section__lede">Every frame we wanted to keep.</p>
      ${renderTabs(groups, current)}
      <div class="gallery__panels">${panels}</div>
    </section>
  `
}

export function initGalleryTabs(root: ParentNode = document, onChange?: (key: GalleryCategory) => void): void {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-gallery-tab]'))
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-gallery-panel]'))
  if (tabs.length === 0) return

  const activate = (key: string) => {
    for (const tab of tabs) {
      const isActive = tab.dataset.galleryTab === key
      tab.classList.toggle('gallery__tab--active', isActive)
      tab.setAttribute('aria-selected', String(isActive))
    }

    for (const panel of panels) {
      panel.hidden = panel.dataset.galleryPanel !== key
    }

    if (isGalleryCategory(key)) onChange?.(key)
  }

  const defaultKey =
    tabs.find((tab) => tab.classList.contains('gallery__tab--active'))?.dataset.galleryTab ??
    tabs[0].dataset.galleryTab
  if (defaultKey) activate(defaultKey)

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      const key = tab.dataset.galleryTab
      if (!key) return
      activate(key)
    })
  }
}

export function initGallery(): void {
  const section = document.querySelector('#gallery')
  if (section) initGalleryTabs(section)
}
