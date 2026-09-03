import type { SocialComment, SocialPost, SocialStory, WeddingConfig, WeddingEvent } from '../types'

const LIKES_KEY = 'thamar-feed-likes-v2'
const COMMENTS_KEY = 'thamar-feed-comments-v2'
const GUEST_NAME_KEY = 'thamar-feed-guest-name'

const SHARE_LINES = [
  'Sent to 47 family WhatsApp groups simultaneously.',
  'Carrier pigeon dispatched. ETA: whenever it feels like it.',
  'Shared with Samar\'s barber. He had opinions.',
  'Forwarded to Thamanna\'s mum. You\'re very welcome.',
  'Posted to the cousin group chat. No take-backs.',
  'Beamed to the moon. NASA has questions.',
  'Slid into the neighbours\' DMs by accident. They liked it.',
  'Uploaded to the Cloud — the actual clouds. It\'s raining confetti.',
  'Fax machine at Hyatt Regency is printing it now.',
  'Your comment has been forwarded to the biryani committee.',
]

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
    year: 'numeric',
  })
}

const icons = {
  reply: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1.8 12.5 9 20V14.2c5.2-.3 9.2 1.6 12 5.8-1.1-6.4-5.5-10.9-12-11.8V1.8z" /></svg>`,
  repost: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h11l-2.5-2.5L17 3l5 5-5 5-1.5-1.5L18 9H7V7zm10 10H6l2.5 2.5L11 21l-5-5 5-5 1.5 1.5L6 15h11v2z" /></svg>`,
  heart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.1 20.3s-7.6-4.7-9.4-8.6C1.4 9 3.1 6 6.2 6c1.8 0 3.1 1 3.9 2.2C10.9 7 12.2 6 14 6c3.1 0 4.8 3 3.5 5.7-1.8 3.9-9.4 8.6-9.4 8.6z" /></svg>`,
  bookmark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>`,
  search: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.2 4.2" /></svg>`,
  more: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></svg>`,
  verified: `<svg class="feed__verified" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4l2.3 1.7 2.8-.3 1.1 2.6 2.4 1.5-.6 2.8.9 2.7-2.2 1.8-.8 2.7-2.9.2L12 21.6l-2.4-1.5-2.9-.2-.8-2.7-2.2-1.8.9-2.7-.6-2.8L6.4 5l1.1-2.6 2.8.3z" /><path class="feed__verified-tick" d="M8.6 12.4l2.3 2.2 4.5-4.8" /></svg>`,
}

function displayNameForHandle(handle: string, config: WeddingConfig): string {
  const clean = handle.replace(/^@/, '')
  if (clean === config.couple.instagram.samar) return config.couple.partnerTwo
  if (clean === config.couple.instagram.thamanna) return config.couple.partnerOne
  return config.couple.partnerOne
}

function renderComment(comment: SocialComment, guest = false): string {
  return `
    <li class="feed__comment${guest ? ' feed__comment--guest' : ''}">
      <span class="feed__comment-handle">${comment.handle.replace(/^@/, '')}</span>
      <span class="feed__comment-body">${comment.body}</span>
    </li>
  `
}

function renderCommentsBlock(post: SocialPost): string {
  const comments = post.comments ?? []
  const toggle =
    comments.length > 0
      ? `
        <button
          class="feed__comments-toggle"
          type="button"
          data-comments-toggle
          aria-expanded="${comments.length <= 2 ? 'true' : 'false'}"
        >
          ${comments.length <= 2 ? 'Hide replies' : `Show ${comments.length} replies`}
        </button>
      `
      : ''

  return `
    ${toggle}
    <ul class="feed__comments" data-comments ${comments.length > 2 ? 'hidden' : ''}>
      ${comments.map((comment) => renderComment(comment)).join('')}
    </ul>
  `
}

function renderCommentForm(post: SocialPost): string {
  const id = postKey(post)

  return `
    <form class="feed__comment-form" data-comment-form data-post-id="${id}">
      <input
        class="feed__comment-input"
        type="text"
        name="comment"
        maxlength="280"
        placeholder="Post your reply…"
        autocomplete="off"
        aria-label="Add a comment"
        data-comment-input
      />
      <button class="feed__comment-post label-caps" type="submit" data-comment-submit disabled>
        Post
      </button>
    </form>
  `
}

function renderMedia(post: SocialPost): string {
  if (!post.image) return ''

  const frames = [post.image, ...(post.gallery ?? [])]
  const alt = post.imageAlt ?? ''

  const slides = frames
    .map(
      (src, index) =>
        `<div class="feed__frame"><img src="${src}" alt="${index === 0 ? alt : ''}" loading="lazy" draggable="false" /></div>`,
    )
    .join('')

  const dots =
    frames.length > 1
      ? `<div class="feed__dots" data-dots aria-hidden="true">${frames
          .map(
            (_, index) =>
              `<button type="button" class="feed__dot${index === 0 ? ' is-current' : ''}" data-dot="${index}" aria-label="Photo ${index + 1} of ${frames.length}"></button>`,
          )
          .join('')}</div>`
      : ''

  const counter =
    frames.length > 1
      ? `<span class="feed__frame-count" data-frame-count aria-hidden="true">1/${frames.length}</span>`
      : ''

  return `
    <div class="feed__media">
      <div
        class="feed__frames"
        data-frames
        tabindex="0"
        role="region"
        aria-label="Post photos. Swipe to browse, double-tap to like."
      >${slides}</div>
      ${counter}
      ${dots}
      <span class="feed__burst" data-burst aria-hidden="true">${icons.heart}</span>
    </div>
  `
}

function renderLikeCount(likes: number): string {
  return `<span class="feed__action-count" data-like-count data-base="${likes}"${likes === 0 ? ' hidden' : ''}>${likes || ''}</span>`
}

function renderPost(post: SocialPost, config: WeddingConfig): string {
  const handle = post.handle.replace(/^@/, '')
  const name = displayNameForHandle(handle, config)
  const monogram = config.couple.monogram
  const time = formatRelativeTime(post.date)
  const likes = post.likes ?? 0
  const replies = post.comments?.length ?? 0

  return `
    <article class="feed__post${post.live ? ' feed__post--live' : ''}" data-post-id="${postKey(post)}">
      <span class="feed__avatar" aria-hidden="true">${monogram}</span>
      <div class="feed__tweet">
        <div class="feed__meta">
          <div class="feed__meta-names">
            <span class="feed__name">${name}</span>
            ${icons.verified}
            <span class="feed__handle">@${handle}</span>
            <span class="feed__meta-dot" aria-hidden="true">·</span>
            <time class="feed__timestamp" datetime="${post.date}" data-feed-time="${post.date}">${time}</time>
          </div>
          <button class="feed__more" type="button" aria-label="More options">${icons.more}</button>
        </div>
        <p class="feed__text">${post.body}</p>
        ${post.location ? `<p class="feed__place">${post.location}</p>` : ''}
        ${renderMedia(post)}
        <div class="feed__actions">
          <button
            type="button"
            class="feed__action feed__action--reply"
            data-comments-focus
            aria-label="Reply"
          >
            ${icons.reply}
            ${replies > 0 ? `<span class="feed__action-count">${replies}</span>` : ''}
          </button>
          <button type="button" class="feed__action feed__action--share feed__share" data-share aria-label="Repost">
            ${icons.repost}
          </button>
          <button
            type="button"
            class="feed__action feed__action--like feed__like"
            data-like
            aria-pressed="false"
            aria-label="Like"
          >
            ${icons.heart}
            ${renderLikeCount(likes)}
          </button>
          <button
            type="button"
            class="feed__action feed__action--save feed__save"
            data-save
            aria-pressed="false"
            aria-label="Bookmark"
          >
            ${icons.bookmark}
          </button>
        </div>
        ${renderCommentsBlock(post)}
        ${renderCommentForm(post)}
      </div>
    </article>
  `
}

function nextComingStory(stories: SocialStory[]): SocialStory | undefined {
  return stories.find((story) => story.status === 'coming')
}

function renderComingPost(
  coming: SocialStory,
  comingEvent: WeddingEvent | undefined,
  config: WeddingConfig,
  handle: string,
): string {
  const cleanHandle = handle.replace(/^@/, '')
  const name = config.couple.partnerOne
  const dateLabel = comingEvent?.date ?? ''
  const caption = coming.caption ?? `${coming.label} — posting from the day.`

  return `
    <article class="feed__post feed__post--soon feed__post--text" aria-label="${coming.label} — coming soon">
      <span class="feed__avatar" aria-hidden="true">${config.couple.monogram}</span>
      <div class="feed__tweet">
        <div class="feed__meta">
          <div class="feed__meta-names">
            <span class="feed__name">${name}</span>
            ${icons.verified}
            <span class="feed__handle">@${cleanHandle}</span>
            <span class="feed__meta-dot" aria-hidden="true">·</span>
            <time class="feed__timestamp" datetime="2026-08-20">20 Aug</time>
          </div>
        </div>
        <p class="feed__text">${caption}</p>
        ${dateLabel ? `<p class="feed__soon-note">${coming.label} · ${dateLabel}</p>` : ''}
      </div>
    </article>
  `
}

function sortFeedPosts(posts: SocialPost[]): SocialPost[] {
  const rank = (post: SocialPost): number => {
    if (post.live) return 0
    if (post.pinned) return 1
    return 2
  }

  return [...posts].sort((a, b) => {
    const byRank = rank(a) - rank(b)
    if (byRank !== 0) return byRank
    return b.date.localeCompare(a.date)
  })
}

export function renderUpdates(config: WeddingConfig): string {
  const posts = sortFeedPosts(config.feed.posts)
  const coming = nextComingStory(config.feed.stories)
  const comingEvent = coming ? config.events.find((event) => event.id === coming.id) : undefined

  const feedHandle = `@${config.couple.instagram.thamanna}`
  const teaser = coming
    ? renderComingPost(coming, comingEvent, config, feedHandle)
    : ''

  return `
    <section class="section feed feed--twitter${!prefersReducedMotion() ? ' feed--staged' : ''}" id="live" aria-label="Timeline">
      <div class="feed__stage">
        <div class="feed__app">
          <header class="feed__topbar">
            <span class="feed__topbar-mark" aria-hidden="true">${config.couple.monogram}</span>
            <h3 class="feed__topbar-title">Home</h3>
            <span class="feed__topbar-icons" aria-hidden="true">${icons.search}</span>
          </header>

          <div class="feed__stream">
            ${teaser}
            ${posts.map((post) => renderPost(post, config)).join('')}
          </div>
          <p class="feed__share-toast" data-share-toast role="status" aria-live="polite" hidden></p>
        </div>
      </div>
    </section>
  `
}

function postKey(post: SocialPost): string {
  return post.date
}

function readLikes(): string[] {
  try {
    const raw = localStorage.getItem(LIKES_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

function writeLikes(ids: string[]): void {
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify(ids))
  } catch {
    /* ignore blocked storage */
  }
}

function readGuestComments(): Record<string, SocialComment[]> {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : {}
    if (!parsed || typeof parsed !== 'object') return {}
    return Object.fromEntries(
      Object.entries(parsed).flatMap(([key, value]) => {
        if (!Array.isArray(value)) return []
        const comments = value.filter(
          (item): item is SocialComment =>
            !!item &&
            typeof item === 'object' &&
            typeof (item as SocialComment).handle === 'string' &&
            typeof (item as SocialComment).body === 'string',
        )
        return comments.length ? [[key, comments]] : []
      }),
    )
  } catch {
    return {}
  }
}

function writeGuestComments(comments: Record<string, SocialComment[]>): void {
  try {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
  } catch {
    /* ignore blocked storage */
  }
}

function readGuestName(): string | null {
  try {
    const saved = localStorage.getItem(GUEST_NAME_KEY)?.trim()
    return saved ? saved.replace(/^@/, '') : null
  } catch {
    return null
  }
}

function guestHandle(): string {
  const saved = readGuestName()
  if (saved) return saved

  const suggested = `guest${Math.floor(Math.random() * 900 + 100)}`
  const entered = window.prompt('Pick a username for the feed:', suggested)?.trim()
  const handle = (entered || suggested).replace(/^@/, '').slice(0, 24)
  try {
    localStorage.setItem(GUEST_NAME_KEY, handle)
  } catch {
    /* ignore blocked storage */
  }
  return handle
}

function applyLike(button: HTMLButtonElement, liked: boolean): void {
  const post = button.closest('.feed__post') as HTMLElement | null
  const current = button.getAttribute('aria-pressed') === 'true'
  if (current === liked) return

  button.setAttribute('aria-pressed', String(liked))
  button.classList.toggle('is-liked', liked)

  const count = post?.querySelector<HTMLElement>('[data-like-count]')
  if (count) {
    const base = Number(count.dataset.base ?? count.textContent?.trim() ?? '0')
    if (!count.dataset.base) count.dataset.base = String(base)

    const userCounted = count.dataset.userCounted === 'true'
    if (liked && !userCounted) {
      count.hidden = false
      count.textContent = String(base + 1)
      count.dataset.userCounted = 'true'
    } else if (!liked && userCounted) {
      count.textContent = String(base)
      if (base === 0) count.hidden = true
      delete count.dataset.userCounted
    }
  }
}

function bloomLike(post: HTMLElement): void {
  const like = post.querySelector<HTMLButtonElement>('[data-like]')
  const burst = post.querySelector<HTMLElement>('[data-burst]')
  if (!like) return

  if (like.getAttribute('aria-pressed') !== 'true') {
    applyLike(like, true)
    saveLike(post.dataset.postId ?? '', true)
  }

  if (!burst || prefersReducedMotion()) return
  burst.classList.remove('is-bursting')
  void burst.offsetWidth
  burst.classList.add('is-bursting')
}

function saveLike(postId: string, liked: boolean): void {
  if (!postId) return
  const ids = new Set(readLikes())
  if (liked) ids.add(postId)
  else ids.delete(postId)
  writeLikes([...ids])
}

function updateCommentsToggle(post: HTMLElement): void {
  const list = post.querySelector<HTMLElement>('[data-comments]')
  const toggle = post.querySelector<HTMLButtonElement>('[data-comments-toggle]')
  if (!list) return

  const count = list.children.length
  if (!toggle) {
    if (count > 0) list.hidden = false
    return
  }

  if (count === 0) {
    toggle.hidden = true
    list.hidden = true
    return
  }

  toggle.hidden = false
  const open = toggle.getAttribute('aria-expanded') === 'true'
  toggle.textContent = open
    ? 'Hide replies'
    : `Show ${count} repl${count === 1 ? 'y' : 'ies'}`
  list.hidden = !open && count > 2
}

function appendComment(post: HTMLElement, comment: SocialComment, guest = true): void {
  let list = post.querySelector<HTMLElement>('[data-comments]')
  if (!list) {
    list = document.createElement('ul')
    list.className = 'feed__comments'
    list.dataset.comments = ''
    post.querySelector('.feed__comment-form')?.before(list)
  }

  list.insertAdjacentHTML('beforeend', renderComment(comment, guest))
  list.hidden = false

  const toggle = post.querySelector<HTMLButtonElement>('[data-comments-toggle]')
  if (list.children.length > 2) {
    if (!toggle) {
      list.insertAdjacentHTML(
        'beforebegin',
        `<button class="feed__comments-toggle" type="button" data-comments-toggle aria-expanded="true">Hide replies</button>`,
      )
    } else {
      toggle.hidden = false
      toggle.setAttribute('aria-expanded', 'true')
    }
  } else if (toggle) {
    toggle.hidden = false
    toggle.setAttribute('aria-expanded', 'true')
  }

  updateCommentsToggle(post)
  list.lastElementChild?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

function showShareToast(section: HTMLElement, message: string): void {
  const toast = section.querySelector<HTMLElement>('[data-share-toast]')
  if (!toast) return

  toast.textContent = message
  toast.hidden = false
  toast.classList.remove('is-visible')
  void toast.offsetWidth
  toast.classList.add('is-visible')

  window.clearTimeout(Number(toast.dataset.timer ?? '0'))
  const timer = window.setTimeout(() => {
    toast.classList.remove('is-visible')
    window.setTimeout(() => {
      toast.hidden = true
    }, 280)
  }, 2600)
  toast.dataset.timer = String(timer)
}

function launchSharePlane(button: HTMLButtonElement): void {
  if (prefersReducedMotion()) return

  const post = button.closest('.feed__post')
  if (!post) return

  const plane = document.createElement('span')
  plane.className = 'feed__share-plane'
  plane.setAttribute('aria-hidden', 'true')
  plane.textContent = '✈️'
  post.appendChild(plane)

  const origin = button.getBoundingClientRect()
  const host = post.getBoundingClientRect()
  plane.style.left = `${origin.left - host.left + origin.width * 0.2}px`
  plane.style.top = `${origin.top - host.top}px`

  window.setTimeout(() => plane.remove(), 1100)
}

function toggleLike(button: HTMLButtonElement, force?: boolean): void {
  const pressed = button.getAttribute('aria-pressed') === 'true'
  const next = force ?? !pressed
  applyLike(button, next)
  saveLike((button.closest('.feed__post') as HTMLElement | null)?.dataset.postId ?? '', next)

  if (next) {
    const burst = button.closest('.feed__post')?.querySelector<HTMLElement>('[data-burst]')
    if (burst && !prefersReducedMotion()) {
      burst.classList.remove('is-bursting')
      void burst.offsetWidth
      burst.classList.add('is-bursting')
    }
  }
}

/** Instagram-style double-tap-to-like on the photo carousel. */
function initDoubleTap(section: HTMLElement): void {
  section.querySelectorAll<HTMLElement>('[data-frames]').forEach((track) => {
    const post = track.closest('.feed__post') as HTMLElement | null
    if (!post) return

    let lastTap = 0
    let lastX = 0
    let lastY = 0

    track.addEventListener('click', (event) => {
      if (track.dataset.dragged === 'true') return

      const pointer = event as MouseEvent
      const now = Date.now()
      const near =
        Math.abs(pointer.clientX - lastX) < 14 && Math.abs(pointer.clientY - lastY) < 14

      if (near && now - lastTap < 380) {
        bloomLike(post)
        lastTap = 0
        return
      }

      lastX = pointer.clientX
      lastY = pointer.clientY
      lastTap = now
    })
  })
}

function snapCarousel(track: HTMLElement, behavior: ScrollBehavior = 'smooth'): void {
  const width = track.clientWidth
  if (!width) return
  const index = Math.round(track.scrollLeft / width)
  track.scrollTo({ left: index * width, behavior })
}

function initCarousels(section: HTMLElement): void {
  section.querySelectorAll<HTMLElement>('[data-frames]').forEach((track) => {
    const media = track.closest('.feed__media')
    const dots = [...(media?.querySelectorAll<HTMLButtonElement>('[data-dot]') ?? [])]
    const counter = media?.querySelector<HTMLElement>('[data-frame-count]')
    const slideCount = track.querySelectorAll('.feed__frame').length
    if (slideCount < 2) return

    const sync = () => {
      const index = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1))
      const current = Math.min(Math.max(index, 0), slideCount - 1)
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-current', i === current)
        dot.setAttribute('aria-current', i === current ? 'true' : 'false')
      })
      if (counter) counter.textContent = `${current + 1}/${slideCount}`
    }

    track.addEventListener('scroll', () => window.requestAnimationFrame(sync), { passive: true })

    dots.forEach((dot) => {
      dot.addEventListener('click', (event) => {
        event.stopPropagation()
        const index = Number(dot.dataset.dot ?? '0')
        track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' })
      })
    })

    track.addEventListener('keydown', (event) => {
      const width = track.clientWidth
      const index = Math.round(track.scrollLeft / Math.max(width, 1))
      if (event.key === 'ArrowRight' && index < slideCount - 1) {
        event.preventDefault()
        track.scrollTo({ left: (index + 1) * width, behavior: 'smooth' })
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault()
        track.scrollTo({ left: (index - 1) * width, behavior: 'smooth' })
      }
    })

    let pointerStartX = 0
    let scrollStart = 0
    let dragged = false

    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      pointerStartX = event.clientX
      scrollStart = track.scrollLeft
      dragged = false
      track.classList.add('is-dragging')
      track.setPointerCapture(event.pointerId)
    })

    track.addEventListener('pointermove', (event) => {
      if (!track.hasPointerCapture(event.pointerId)) return
      const delta = event.clientX - pointerStartX
      if (Math.abs(delta) > 6) dragged = true
      track.scrollLeft = scrollStart - delta
    })

    const endDrag = (event: PointerEvent) => {
      if (!track.hasPointerCapture(event.pointerId)) return
      track.releasePointerCapture(event.pointerId)
      track.classList.remove('is-dragging')
      snapCarousel(track, dragged ? 'smooth' : 'auto')
      if (dragged) {
        track.dataset.dragged = 'true'
        window.setTimeout(() => {
          delete track.dataset.dragged
        }, 320)
      }
      window.requestAnimationFrame(sync)
    }

    track.addEventListener('pointerup', endDrag)
    track.addEventListener('pointercancel', endDrag)

    sync()
  })
}

function initCommentForms(section: HTMLElement): void {
  section.querySelectorAll<HTMLFormElement>('[data-comment-form]').forEach((form) => {
    const input = form.querySelector<HTMLInputElement>('[data-comment-input]')
    const submit = form.querySelector<HTMLButtonElement>('[data-comment-submit]')
    if (!input || !submit) return

    const sync = () => {
      submit.disabled = input.value.trim().length === 0
    }

    input.addEventListener('input', sync)

    form.addEventListener('submit', (event) => {
      event.preventDefault()
      const post = form.closest('.feed__post') as HTMLElement | null
      const postId = form.dataset.postId ?? post?.dataset.postId
      const body = input.value.trim()
      if (!post || !postId || !body) return

      const handle = guestHandle()
      const comment: SocialComment = { handle: `@${handle}`, body }
      appendComment(post, comment, true)

      const stored = readGuestComments()
      stored[postId] = [...(stored[postId] ?? []), comment]
      writeGuestComments(stored)

      input.value = ''
      sync()
    })
  })
}

function initSavedState(section: HTMLElement): void {
  for (const postId of readLikes()) {
    const post = section.querySelector<HTMLElement>(`[data-post-id="${postId}"]`)
    const like = post?.querySelector<HTMLButtonElement>('[data-like]')
    if (like && post) applyLike(like, true)
  }

  const stored = readGuestComments()
  for (const [postId, comments] of Object.entries(stored)) {
    const post = section.querySelector<HTMLElement>(`[data-post-id="${postId}"]`)
    if (!post) continue
    for (const comment of comments) appendComment(post, comment, true)
  }

  section.querySelectorAll<HTMLElement>('.feed__post').forEach(updateCommentsToggle)
}

export function initFeed(): void {
  const section = document.querySelector<HTMLElement>('#live')
  if (!section) return

  const posts = [...section.querySelectorAll<HTMLElement>('.feed__post')]

  const reveal = () => {
    posts.forEach((post, index) => {
      window.setTimeout(
        () => post.classList.add('is-on-air'),
        prefersReducedMotion() ? 0 : index * 380,
      )
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
    const target = event.target as HTMLElement

    const like = target.closest<HTMLButtonElement>('[data-like]')
    if (like) {
      toggleLike(like)
      return
    }

    const save = target.closest<HTMLButtonElement>('[data-save]')
    if (save) {
      save.setAttribute('aria-pressed', save.getAttribute('aria-pressed') === 'true' ? 'false' : 'true')
      return
    }

    const share = target.closest<HTMLButtonElement>('[data-share]')
    if (share) {
      const line = SHARE_LINES[Math.floor(Math.random() * SHARE_LINES.length)] ?? SHARE_LINES[0]
      showShareToast(section, line)
      launchSharePlane(share)
      share.classList.add('is-shared')
      window.setTimeout(() => share.classList.remove('is-shared'), 700)
      return
    }

    const toggle = target.closest<HTMLButtonElement>('[data-comments-toggle]')
    if (toggle) {
      const post = toggle.closest('.feed__post') as HTMLElement | null
      const list = post?.querySelector<HTMLElement>('[data-comments]')
      if (!post || !list) return
      const open = toggle.getAttribute('aria-expanded') === 'true'
      toggle.setAttribute('aria-expanded', String(!open))
      list.hidden = open
      updateCommentsToggle(post)
      return
    }

    const focus = target.closest<HTMLButtonElement>('[data-comments-focus]')
    if (focus) {
      const post = focus.closest('.feed__post') as HTMLElement | null
      const toggle = post?.querySelector<HTMLButtonElement>('[data-comments-toggle]')
      const list = post?.querySelector<HTMLElement>('[data-comments]')
      if (toggle && list?.hidden) {
        toggle.setAttribute('aria-expanded', 'true')
        list.hidden = false
        updateCommentsToggle(post!)
      }
      post?.querySelector<HTMLInputElement>('[data-comment-input]')?.focus()
    }
  })

  initSavedState(section)
  initCommentForms(section)
  initDoubleTap(section)
  initCarousels(section)

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
