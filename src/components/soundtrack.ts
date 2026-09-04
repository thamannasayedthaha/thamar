import type { SoundtrackTrack, WeddingConfig } from '../types'

const icons = {
  play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13L19 12z"/></svg>`,
  prev: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2.2v14H6zM18 5 9 12l9 7z"/></svg>`,
  rew: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.2 12 19.5 6.2v11.6L12.2 12zM4.5 12 11.8 6.2v11.6L4.5 12z"/></svg>`,
  ff: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.8 12 4.5 6.2v11.6L11.8 12zm7.7 0-7.3-5.8v11.6L19.5 12z"/></svg>`,
  next: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 5H18v14h-2.2zM6 5l9 7-9 7z"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="0.6"/></svg>`,
}

function pad(n: number): string {
  return String(n + 1).padStart(2, '0')
}

function renderControl(
  name: 'prev' | 'rew' | 'stop' | 'ff' | 'next',
  label: string,
  icon: string,
  interactive: boolean,
): string {
  if (interactive) {
    return `<button class="explore-deck__key" type="button" data-deck-${name} aria-label="${label}">${icon}</button>`
  }
  return `<span class="explore-deck__key" aria-hidden="true">${icon}</span>`
}

function renderBoombox(first: SoundtrackTrack | undefined, interactive: boolean): string {
  const vol = interactive
    ? `
          <label class="explore-deck__vol">
            <span class="label-caps">Vol</span>
            <input type="range" min="0" max="1" step="0.01" value="0.8" data-deck-vol />
          </label>
        `
    : `
          <span class="explore-deck__vol" aria-hidden="true">
            <span class="label-caps">Vol</span>
            <input type="range" min="0" max="1" step="0.01" value="0.8" tabindex="-1" />
          </span>
        `

  return `
    <div class="explore-deck__boombox">
      <div class="explore-deck__handle" aria-hidden="true"></div>
      <div class="explore-deck__face">
        <div class="explore-deck__speaker" aria-hidden="true"><span></span></div>
        <div class="explore-deck__well">
          <div class="explore-deck__cassette" data-cassette>
            <span class="explore-deck__reel explore-deck__reel--l" aria-hidden="true"></span>
            <span class="explore-deck__ribbon" aria-hidden="true"></span>
            <span class="explore-deck__reel explore-deck__reel--r" aria-hidden="true"></span>
          </div>
        </div>
        <div class="explore-deck__speaker" aria-hidden="true"><span></span></div>
      </div>
      <p class="explore-deck__lcd" data-deck-lcd>
        <span data-lcd-index>01</span>
        <span data-lcd-title>${first?.title ?? 'No tape'}</span>
        <span data-lcd-time>0:00</span>
      </p>
      <div class="explore-deck__controls">
        ${renderControl('prev', 'Previous track', icons.prev, interactive)}
        ${renderControl('rew', 'Back 10 seconds', icons.rew, interactive)}
        ${
          interactive
            ? `<button class="explore-deck__key explore-deck__key--play" type="button" data-deck-play aria-pressed="false" aria-label="Play">${icons.play}</button>`
            : `<span class="explore-deck__key explore-deck__key--play" aria-hidden="true">${icons.play}</span>`
        }
        ${renderControl('stop', 'Stop', icons.stop, interactive)}
        ${renderControl('ff', 'Forward 10 seconds', icons.ff, interactive)}
        ${renderControl('next', 'Next track', icons.next, interactive)}
        ${vol}
      </div>
    </div>
  `
}

function renderTrackList(tracks: SoundtrackTrack[]): string {
  return tracks
    .map(
      (track, index) => `
        <li>
          <button class="explore-deck__track${index === 0 ? ' is-current' : ''}" type="button" data-track="${index}">
            <span class="explore-deck__num">${pad(index)}</span>
            <span class="explore-deck__track-body">
              <span class="explore-deck__track-title">${track.title}</span>
              <span class="explore-deck__track-moment">${track.moment}</span>
            </span>
          </button>
        </li>
      `,
    )
    .join('')
}

/** Decorative boombox on explore — links to the full soundtrack page. */
export function renderSoundtrackPreview(config: WeddingConfig): string {
  const { title, tracks } = config.soundtrack
  const first = tracks[0]

  return `
    <a class="explore-deck explore-deck--preview" href="soundtrack.html" aria-label="${title} — open the mixtape">
      ${renderBoombox(first, false)}
      <span class="explore-deck__open label-caps">Open the mixtape</span>
    </a>
  `
}

/** Full soundtrack page with player and track listing. */
export function renderSoundtrackPage(config: WeddingConfig): string {
  const { title, lede, tracks } = config.soundtrack

  return `
    <section class="section soundtrack-page" id="soundtrack" aria-label="${title}">
      <article class="explore-deck explore-deck--page" aria-label="${title}">
        ${renderBoombox(tracks[0], true)}
        <div class="explore-deck__card">
          <p class="explore-deck__kicker label-caps">Side A</p>
          <h3 class="explore-deck__title">${title}</h3>
          <p class="explore-deck__lede">${lede}</p>
          <ol class="explore-deck__list">${renderTrackList(tracks)}</ol>
        </div>
      </article>
    </section>
  `
}
