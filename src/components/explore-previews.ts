import { renderGuideScene } from './guide'
import { renderSoundtrackPreview } from './soundtrack'
import type { WeddingConfig } from '../types'

type ExploreItem = {
  href: string
  label: string
  hint: string
  icon?: string
  /** Replaces the icon with a wide preview panel. */
  preview?: string
  variant?: 'quiz' | 'live' | 'guide'
  /** Extra markup appended inside the card body. */
  extra?: string
}

function miniPin(x: number, y: number, active = false): string {
  return `
    <g transform="translate(${x} ${y})">
      <g class="explore-map__pin ${active ? 'explore-map__pin--active' : ''}">
        <ellipse class="explore-map__pin-shadow" cx="0" cy="2" rx="7" ry="2.4"/>
        <path class="explore-map__pin-drop" d="M0 0 C-11 -12, -11 -26, 0 -28 C11 -26, 11 -12, 0 0Z"/>
        <circle class="explore-map__pin-face" cx="0" cy="-16" r="5.2"/>
      </g>
    </g>
  `
}

function trailPreview(config: WeddingConfig): string {
  return `
    <div class="explore-card__map" aria-hidden="true">
      <div class="explore-gmaps__search">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.2 4.2"/></svg>
        <span>Macclesfield to Thrissur · ${config.trail.stops.length} stops</span>
        <svg class="explore-gmaps__dir" viewBox="0 0 24 24"><path d="M12 3 4 21l8-4 8 4z"/></svg>
      </div>
      <div class="explore-gmaps__zoom">
        <span>+</span>
        <span>−</span>
      </div>
      <svg class="explore-map" viewBox="0 0 640 240" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="explore-map-roads" width="42" height="42" patternUnits="userSpaceOnUse">
            <path d="M0 21 H42 M21 0 V42" fill="none" stroke="#fff" stroke-width="1.4"/>
            <path d="M0 0 L42 42" fill="none" stroke="#f3f0e8" stroke-width="0.8"/>
          </pattern>
        </defs>

        <rect width="640" height="240" fill="#a9cce0"/>
        <g class="explore-map__scene">
          <path class="explore-map__land" d="M92 28 C118 18, 148 34, 154 62 C166 92, 158 118, 138 140 C158 164, 176 188, 162 210 C150 226, 118 232, 92 224 C70 226, 52 210, 58 188 C78 176, 92 164, 96 146 C70 128, 52 104, 58 80 C52 58, 70 36, 92 28Z"/>
          <path class="explore-map__ireland" d="M28 118 C52 98, 78 108, 80 138 C76 168, 48 180, 28 164 C12 148, 10 132, 28 118Z"/>
          <path class="explore-map__land" d="M470 22 C530 8, 590 22, 612 52 C636 84, 640 126, 618 164 C598 198, 560 220, 524 224 C492 218, 476 190, 464 160 C444 140, 428 112, 440 86 C428 62, 448 34, 470 22Z"/>

          <ellipse class="explore-map__park" cx="118" cy="96" rx="22" ry="14"/>
          <ellipse class="explore-map__park" cx="136" cy="118" rx="14" ry="9"/>
          <ellipse class="explore-map__park" cx="540" cy="86" rx="28" ry="16"/>
          <ellipse class="explore-map__park" cx="572" cy="140" rx="18" ry="12"/>

          <g>
            <path class="explore-map__streets" d="M92 28 C118 18, 148 34, 154 62 C166 92, 158 118, 138 140 C158 164, 176 188, 162 210 C150 226, 118 232, 92 224 C70 226, 52 210, 58 188 C78 176, 92 164, 96 146 C70 128, 52 104, 58 80 C52 58, 70 36, 92 28Z"/>
            <path class="explore-map__streets" d="M470 22 C530 8, 590 22, 612 52 C636 84, 640 126, 618 164 C598 198, 560 220, 524 224 C492 218, 476 190, 464 160 C444 140, 428 112, 440 86 C428 62, 448 34, 470 22Z"/>
          </g>

          <path class="explore-map__highway" d="M108 70 C118 90, 124 110, 128 108 C122 140, 116 158, 108 176"/>
          <path class="explore-map__highway" d="M500 70 C530 90, 548 120, 560 150 C548 176, 530 198, 510 210"/>

          <path id="explore-map-route" class="explore-map__route-casing" d="M128 108 C118 140, 110 160, 108 176 C 220 40, 360 90, 520 118"/>
          <path class="explore-map__route" d="M128 108 C118 140, 110 160, 108 176 C 220 40, 360 90, 520 118"/>

          <g class="explore-map__plane">
            <g>
              <path d="M0 0 l20 4 -5 3z"/>
              <path d="M8 2 l-2 -7 5 7 M10 5 l-1 6 5 -5"/>
              <animateMotion dur="14s" repeatCount="indefinite" rotate="auto" calcMode="linear">
                <mpath href="#explore-map-route"/>
              </animateMotion>
            </g>
          </g>

          ${miniPin(128, 108, true)}
          ${miniPin(108, 176)}
          ${miniPin(248, 128)}
          ${miniPin(520, 118)}
        </g>

        <g class="explore-map__labels">
          <text x="118" y="58">England</text>
          <text x="540" y="48">India</text>
          <text class="explore-map__city" x="136" y="102">Macclesfield</text>
          <text class="explore-map__city" x="520" y="136">Thrissur</text>
        </g>
      </svg>
      <span class="explore-gmaps__logo">Google</span>
    </div>
  `
}

function guidePreview(config: WeddingConfig): string {
  const places = config.guide.places
  const previewPlaces = places.slice(0, 3)
  const monogram = config.couple.monogram

  const slots = places
    .map(
      (place, index) => `
        <span class="explore-guide__slot explore-guide__slot--${index + 1}" aria-hidden="true">
          ${place.kind === 'hike' ? '△' : '☕'}
        </span>
      `,
    )
    .join('')

  const cards = previewPlaces
    .map((place, index) => {
      const n = index + 1
      const kindLabel = place.kind === 'hike' ? '△ Hike' : '☕ Coffee'
      const back =
        n === 1
          ? `
            <div class="explore-guide__face explore-guide__face--back">
              <p class="explore-guide__kicker label-caps">${config.guide.title}</p>
              <p class="explore-guide__tip">${config.guide.lede}</p>
              <span class="explore-guide__stamp label-caps">${places.length} places · flip a card</span>
            </div>
          `
          : `
            <div class="explore-guide__face explore-guide__face--back">
              <p class="explore-guide__kicker label-caps">If you go</p>
              <h4 class="explore-guide__title">${place.title}</h4>
              <p class="explore-guide__tip">${place.tip}</p>
              <span class="explore-guide__stamp label-caps">${place.stamp}</span>
            </div>
          `

      return `
        <article class="explore-guide__card explore-guide__card--${n} explore-guide__card--${place.kind}">
          <div class="explore-guide__card-inner">
            <div class="explore-guide__face explore-guide__face--front">
              <div class="explore-guide__art">
                ${renderGuideScene(place, undefined, true)}
                <span class="explore-guide__kind label-caps">${kindLabel}</span>
              </div>
              <div class="explore-guide__body">
                <p class="explore-guide__kicker label-caps">${String(n).padStart(2, '0')} · ${place.kicker}</p>
                <h4 class="explore-guide__title">${place.title}</h4>
              </div>
            </div>
            ${back}
          </div>
        </article>
      `
    })
    .join('')

  return `
    <div class="explore-guide" aria-hidden="true">
      <div class="explore-guide__pass">
        <span class="explore-guide__crest">${monogram}</span>
        <div class="explore-guide__pass-meta">
          <span class="explore-guide__pass-label label-caps">Field pass</span>
          <div class="explore-guide__slots">${slots}</div>
        </div>
      </div>
      <div class="explore-guide__deck">${cards}</div>
    </div>
  `
}

function quizPreview(config: WeddingConfig): string {
  const preview = config.quiz.questions.slice(0, 2)
  const total = config.quiz.questions.length
  const intro = `
    <span class="explore-quiz-sheet explore-quiz-sheet--1">
      <span class="explore-quiz-sheet__q">${config.quiz.title}</span>
      <span class="explore-quiz-sheet__lede">${config.quiz.lede}</span>
      <span class="explore-card__pips" aria-hidden="true">
        <span class="explore-card__pip">A</span>
        <span class="explore-card__pip">B</span>
        <span class="explore-card__pip">C</span>
      </span>
      <span class="label-caps">${total} questions · FAN THE DECK</span>
    </span>
  `
  const sheets = preview
    .map((question, index) => {
      const n = String(index + 2).padStart(2, '0')
      return `
        <span class="explore-quiz-sheet explore-quiz-sheet--${index + 2}">
          <span class="explore-quiz-sheet__num label-caps">${n} / ${total}</span>
          <span class="explore-quiz-sheet__q">${question.prompt}</span>
          <span class="explore-quiz-sheet__opts" aria-hidden="true">
            ${question.options.map((option) => `<span>${option.label}</span>`).join('')}
          </span>
        </span>
      `
    })
    .join('')

  return `<div class="explore-quiz-deck" aria-hidden="true">${intro}${sheets}</div>`
}

const twIcons = {
  heart: `<svg viewBox="0 0 24 24"><path d="M12.1 20.3s-7.6-4.7-9.4-8.6C1.4 9 3.1 6 6.2 6c1.8 0 3.1 1 3.9 2.2C10.9 7 12.2 6 14 6c3.1 0 4.8 3 3.5 5.7-1.8 3.9-9.4 8.6-9.4 8.6z"/></svg>`,
  reply: `<svg viewBox="0 0 24 24"><path d="M1.8 12.5 9 20V14.2c5.2-.3 9.2 1.6 12 5.8-1.1-6.4-5.5-10.9-12-11.8V1.8z"/></svg>`,
  repost: `<svg viewBox="0 0 24 24"><path d="M4.5 8.5h9.2V5.2L18.8 10 13.7 14.8V11.5H6.2v5.8H4.5zM19.5 15.5h-9.2v3.3L5.2 14l5.1-4.8v3.3h7.5V6.7h1.7z"/></svg>`,
  bookmark: `<svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  views: `<svg viewBox="0 0 24 24"><path d="M4 18V10h3v8H4zm6.5 0V6h3v12h-3zM17 18v-5h3v5h-3z"/></svg>`,
  more: `<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>`,
  home: `<svg viewBox="0 0 24 24"><path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>`,
  search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.2 4.2"/></svg>`,
  people: `<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.5" cy="8.5" r="2.4"/><path d="M15 19c.4-2.2 1.8-3.6 3.8-3.6 1.7 0 3 1 3.7 3.6"/></svg>`,
  bell: `<svg viewBox="0 0 24 24"><path d="M6 9.5a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13.5 6 9.5z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>`,
  mail: `<svg viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m5 7.5 7 5.5 7-5.5"/></svg>`,
  sparkle: `<svg viewBox="0 0 24 24"><path d="M12 2.5 13.4 9 20 10.5 13.4 12 12 18.5 10.6 12 4 10.5 10.6 9Z"/></svg>`,
  logo: `<svg viewBox="0 0 24 24"><path d="M14.2 10.4 22 2h-2.4l-6.6 7.3L7.8 2H2l8.2 11.4L2 22h2.4l7.2-8 5.7 8H22z"/></svg>`,
  compose: `<svg viewBox="0 0 24 24"><path d="M4 16.8 16.6 4.2a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L7.2 20H4z"/><path d="M12.5 6.5 17.5 11.5"/></svg>`,
  verified: `<svg class="explore-tw__badge" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11"/><path d="M7.2 12.2 10.4 15.4 16.8 8.8"/></svg>`,
}

function previewName(handle: string, config: WeddingConfig): string {
  const clean = handle.replace(/^@/, '')
  if (clean === config.couple.instagram.samar) return config.couple.partnerTwo
  if (clean === config.couple.instagram.thamanna) return config.couple.partnerOne
  return config.couple.partnerOne
}

function previewAvatar(src: string | undefined, fallback: string): string {
  return src
    ? `<span class="explore-ig__avatar"><img src="${src}" alt="" /></span>`
    : `<span class="explore-ig__avatar">${fallback}</span>`
}

function livePreview(config: WeddingConfig): string {
  const post = config.feed.posts.find((item) => item.live) ?? config.feed.posts.find((item) => item.image) ?? config.feed.posts[0]
  const photo = post?.image ?? '/images/gallery/2025-09-25(3).jpg'
  const monogram = config.couple.monogram
  const postHandle = (post?.handle ?? `@${config.couple.instagram.samar}`).replace(/^@/, '')
  const comingHandle = config.couple.instagram.thamanna
  const comingText = 'Moments as they happen — and a few still waiting in the wings.'
  const thamannaFace = config.feed.stories.find((story) => story.id === 'engagement')?.image
  const samarFace = post?.image ?? config.feed.stories.find((story) => story.id === 'nikah')?.image

  return `
    <div class="explore-ig" aria-hidden="true">
      <div class="explore-ig__phone">
        <span class="explore-ig__btn explore-ig__btn--silent"></span>
        <span class="explore-ig__btn explore-ig__btn--vol"></span>
        <span class="explore-ig__btn explore-ig__btn--power"></span>
        <div class="explore-ig__screen">
          <span class="explore-ig__island"></span>
          <div class="explore-tw__status">
            <span>9:41</span>
            <span class="explore-tw__status-end">■■■ ▮</span>
          </div>
          <div class="explore-ig__bar">
            ${previewAvatar(thamannaFace, monogram)}
            <span class="explore-ig__wordmark">${twIcons.logo}</span>
            <span class="explore-ig__bar-icons">${twIcons.sparkle}</span>
          </div>
          <div class="explore-tw__tabs">
            <span class="is-on">For you</span>
            <span>Following</span>
          </div>
          <div class="explore-tw">
            <div class="explore-tw__post">
              ${previewAvatar(thamannaFace, monogram)}
              <div class="explore-tw__body">
                <p class="explore-tw__meta">
                  <strong>${config.couple.partnerOne}</strong>
                  ${twIcons.verified}
                  <span>@${comingHandle}</span>
                  <span>·</span>
                  <span>20 Aug</span>
                  ${twIcons.more}
                </p>
                <p class="explore-tw__text">${comingText}</p>
                <div class="explore-tw__actions">
                  <span>${twIcons.reply}2</span>
                  <span>${twIcons.repost}1</span>
                  <span>${twIcons.heart}18</span>
                  <span>${twIcons.views}214</span>
                  <span>${twIcons.bookmark}</span>
                </div>
              </div>
            </div>
            <div class="explore-tw__post">
              ${previewAvatar(samarFace, monogram)}
              <div class="explore-tw__body">
                <p class="explore-tw__meta">
                  <strong>${previewName(postHandle, config)}</strong>
                  ${twIcons.verified}
                  <span>@${postHandle}</span>
                  <span>·</span>
                  <span>31 May</span>
                  ${twIcons.more}
                </p>
                <p class="explore-tw__text">${post?.body ?? ''}</p>
                <div class="explore-tw__photo"><img src="${photo}" alt="" /></div>
                <div class="explore-tw__actions">
                  <span>${twIcons.reply}${post?.comments?.length ?? 2}</span>
                  <span>${twIcons.repost}6</span>
                  <span>${twIcons.heart}${post?.likes ?? 48}</span>
                  <span>${twIcons.views}1.1K</span>
                  <span>${twIcons.bookmark}</span>
                </div>
              </div>
            </div>
          </div>
          <span class="explore-tw__fab">${twIcons.compose}</span>
          <div class="explore-ig__dock">
            <span class="explore-ig__tab explore-ig__tab--on">${twIcons.home}</span>
            <span class="explore-ig__tab">${twIcons.search}</span>
            <span class="explore-ig__tab">${twIcons.people}</span>
            <span class="explore-ig__tab">${twIcons.bell}</span>
            <span class="explore-ig__tab">${twIcons.mail}</span>
          </div>
        </div>
        <span class="explore-ig__home"></span>
      </div>
    </div>
  `
}

function exploreItems(config: WeddingConfig): ExploreItem[] {
  return [
    {
      href: 'trail.html',
      label: config.trail.title,
      hint: config.trail.lede,
      preview: trailPreview(config),
      extra: `
        <span class="label-caps">Pack your walking shoes &middot; walk the trail</span>
      `,
    },
    {
      href: 'nearby.html',
      label: config.guide.title,
      hint: config.guide.lede,
      preview: guidePreview(config),
      variant: 'guide',
    },
    {
      href: 'quiz.html',
      label: config.quiz.title,
      hint: config.quiz.lede,
      preview: quizPreview(config),
      variant: 'quiz',
    },
    {
      href: 'live.html',
      label: 'Live Feed',
      hint: 'Moments as they happen — and a few still waiting in the wings.',
      preview: livePreview(config),
      variant: 'live',
    },
  ]
}

function renderExploreCard(item: ExploreItem): string {
  const kind = item.variant
    ? `explore-card--${item.variant}`
    : item.preview
      ? 'explore-card--map'
      : ''

  return `
    <a class="explore-card ${kind}" href="${item.href}">
      ${item.preview ?? `<span class="explore-card__icon">${item.icon ?? ''}</span>`}
      ${
        item.variant === 'guide' || item.variant === 'quiz' || item.variant === 'live'
          ? ''
          : `
      <div class="explore-card__body">
        <h3 class="explore-card__title">${item.label}</h3>
        <p class="explore-card__hint">${item.hint}</p>
        ${item.extra ?? ''}
      </div>
          `
      }
    </a>
  `
}

export function renderExplorePage(config: WeddingConfig): string {
  const items = exploreItems(config)
  const cards: string[] = []

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]
    const next = items[index + 1]

    if (item.variant === 'guide' && next?.variant === 'quiz') {
      cards.push(
        `<div class="explore-duo">${renderExploreCard(item)}${renderExploreCard(next)}</div>`,
      )
      index += 1
      continue
    }

    if (item.variant === 'live') {
      cards.push(
        `<div class="explore-pair">${renderExploreCard(item)}${renderSoundtrackPreview(config)}</div>`,
      )
      continue
    }

    cards.push(renderExploreCard(item))
  }

  return `
    <section class="section explore-page" id="explore" aria-labelledby="explore-heading">
      <h2 id="explore-heading" class="section__title">Explore</h2>
      <p class="section__lede">Windows into the celebration — tap any one to step inside.</p>
      <div class="explore-page__grid">
        ${cards.join('')}
      </div>
    </section>
  `
}

