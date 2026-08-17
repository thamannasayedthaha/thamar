import type { SocialPost, SocialStory, WeddingConfig } from '../types'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime()
  const diff = now - then

  if (Number.isNaN(then)) return ''
  if (diff < 0) return 'Coming live'

  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`

  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

function renderStory(story: SocialStory): string {
  const portrait = story.image
    ? `<img src="${story.image}" alt="" />`
    : `<span class="feed__story-fallback" aria-hidden="true">${story.icon ?? '·'}</span>`

  const liveLabel = story.status === 'live' ? `<span class="feed__story-live">Live</span>` : ''
  const status =
    story.status === 'live' ? 'live now' : story.status === 'coming' ? 'coming live' : 'replay'

  return `
    <li class="feed__story feed__story--${story.status}" aria-label="${story.label}, ${status}">
      <div class="feed__story-ring">${portrait}</div>
      <span class="feed__story-label">${story.label}</span>
      ${liveLabel}
    </li>
  `
}

function renderPost(post: SocialPost, monogram: string): string {
  const media = post.image
    ? `<div class="feed__media">
         <img src="${post.image}" alt="${post.imageAlt ?? ''}" loading="lazy" />
         ${post.live ? `<span class="feed__live-badge label-caps">Live</span>` : ''}
       </div>`
    : ''

  const likes = post.likes ?? 0

  return `
    <article class="feed__post${post.live ? ' feed__post--live' : ''}">
      <header class="feed__post-head">
        <span class="feed__avatar" aria-hidden="true">${monogram}</span>
        <div class="feed__byline">
          <p class="feed__author">${post.author}</p>
          <p class="feed__meta">
            <span>${post.handle}</span>
            <span aria-hidden="true">·</span>
            <time datetime="${post.date}" data-feed-time="${post.date}">${formatRelativeTime(post.date)}</time>
          </p>
        </div>
        ${post.live ? `<span class="feed__live-pill"><span class="feed__live-dot" aria-hidden="true"></span>Live</span>` : ''}
      </header>
      ${media}
      <div class="feed__post-body">
        <div class="feed__actions">
          <button
            type="button"
            class="feed__like"
            data-like
            data-likes="${likes}"
            aria-pressed="false"
            aria-label="Like this post"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.1 20.3s-7.6-4.7-9.4-8.6C1.4 9 3.1 6 6.2 6c1.8 0 3.1 1 3.9 2.2C10.9 7 12.2 6 14 6c3.1 0 4.8 3 3.5 5.7-1.8 3.9-9.4 8.6-9.4 8.6z" />
            </svg>
            <span data-like-count>${likes}</span>
          </button>
        </div>
        <p class="feed__caption">${post.body}</p>
      </div>
    </article>
  `
}

function nextComingStory(stories: SocialStory[]): SocialStory | undefined {
  return stories.find((story) => story.status === 'coming')
}

export function renderUpdates(config: WeddingConfig): string {
  const posts = [...config.feed.posts].sort((a, b) => b.date.localeCompare(a.date))
  const coming = nextComingStory(config.feed.stories)
  const comingEvent = coming
    ? config.events.find((event) => event.id === coming.id)
    : undefined

  const teaser = coming
    ? `
      <aside class="feed__coming">
        <p class="feed__coming-kicker label-caps">Coming live</p>
        <h3 class="feed__coming-title">${coming.label}${comingEvent?.date ? ` · ${comingEvent.date}` : ''}</h3>
        <p class="feed__coming-body">This story opens on the day — photographs, notes, and the odd clip as it unfolds.</p>
      </aside>
    `
    : ''

  return `
    <section class="section feed${!prefersReducedMotion() ? ' feed--staged' : ''}" id="live" aria-labelledby="live-heading">
      <p class="feed__eyebrow label-caps">
        <span class="feed__live-dot" aria-hidden="true"></span>
        Live
      </p>
      <h2 id="live-heading" class="section__title">From the feed</h2>
      <p class="section__lede">Moments as they happen — and a few still waiting in the wings.</p>

      <div class="feed__stage">
        <div class="feed__composer" aria-hidden="true">
          <span class="feed__avatar">${config.couple.monogram}</span>
          <p>Next up: ${coming?.label ?? 'the celebrations'} goes live</p>
          <span class="feed__composer-badge label-caps">Soon</span>
        </div>

        <ul class="feed__stories" aria-label="Stories">
          ${config.feed.stories.map(renderStory).join('')}
        </ul>

        <div class="feed__stream">
          ${posts.map((post) => renderPost(post, config.couple.monogram)).join('')}
          ${teaser}
        </div>
      </div>
    </section>
  `
}

export function initFeed(): void {
  const section = document.querySelector<HTMLElement>('#live')
  if (!section) return

  const posts = [...section.querySelectorAll<HTMLElement>('.feed__post')]

  const reveal = () => {
    posts.forEach((post, index) => {
      window.setTimeout(() => post.classList.add('is-on-air'), prefersReducedMotion() ? 0 : index * 380)
    })
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      reveal()
      observer.disconnect()
    },
    { threshold: 0.05 },
  )

  observer.observe(section)

  section.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-like]')
    if (!button) return

    const pressed = button.getAttribute('aria-pressed') === 'true'
    const base = Number(button.dataset.likes ?? '0')
    const next = pressed ? base : base + 1

    button.setAttribute('aria-pressed', pressed ? 'false' : 'true')
    const count = button.querySelector('[data-like-count]')
    if (count) count.textContent = String(next)
  })

  const tick = () => {
    const now = Date.now()
    section.querySelectorAll<HTMLTimeElement>('[data-feed-time]').forEach((time) => {
      const iso = time.dataset.feedTime
      if (!iso) return
      time.textContent = formatRelativeTime(iso, now)
    })
  }

  tick()
  window.setInterval(tick, 60_000)
}
