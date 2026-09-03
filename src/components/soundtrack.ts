import type { SoundtrackTrack, WeddingConfig } from '../types'
import { loadYouTubeApi, type YtPlayer } from '../youtube'

const icons = {
  play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13L19 12z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>`,
  prev: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2.2v14H6zM18 5 9 12l9 7z"/></svg>`,
  next: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 5H18v14h-2.2zM6 5l9 7-9 7z"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="0.6"/></svg>`,
}

function pad(n: number): string {
  return String(n + 1).padStart(2, '0')
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function renderControl(
  name: 'prev' | 'stop' | 'next',
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
        ${
          interactive
            ? `<button class="explore-deck__key explore-deck__key--play" type="button" data-deck-play aria-pressed="false" aria-label="Play">${icons.play}</button>`
            : `<span class="explore-deck__key explore-deck__key--play" aria-hidden="true">${icons.play}</span>`
        }
        ${renderControl('stop', 'Stop', icons.stop, interactive)}
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
    <section class="section soundtrack-page" id="soundtrack" aria-labelledby="soundtrack-heading">
      <h2 id="soundtrack-heading" class="section__title">${title}</h2>
      <p class="section__lede">${lede}</p>
      <article class="explore-deck explore-deck--page" aria-label="${title}">
        ${renderBoombox(tracks[0], true)}
        <div class="explore-deck__card">
          <p class="explore-deck__kicker label-caps">Side A</p>
          <h3 class="explore-deck__title">${title}</h3>
          <p class="explore-deck__lede">${lede}</p>
          <ol class="explore-deck__list">${renderTrackList(tracks)}</ol>
        </div>
        <div class="explore-deck__yt" aria-hidden="true">
          <div id="explore-deck-yt-player"></div>
        </div>
      </article>
    </section>
  `
}

export function initSoundtrack(tracks: SoundtrackTrack[]): void {
  const root = document.querySelector<HTMLElement>('.explore-deck--page')
  const playBtn = root?.querySelector<HTMLButtonElement>('[data-deck-play]')
  const lcdTitle = root?.querySelector<HTMLElement>('[data-lcd-title]')
  const lcdIndex = root?.querySelector<HTMLElement>('[data-lcd-index]')
  const lcdTime = root?.querySelector<HTMLElement>('[data-lcd-time]')
  const vol = root?.querySelector<HTMLInputElement>('[data-deck-vol]')
  if (!root || !playBtn || !tracks.length) return

  let index = 0
  let player: YtPlayer | null = null
  let ready = false
  let timer: number | undefined
  let wantPlay = false

  const setPlaying = (playing: boolean) => {
    root.classList.toggle('is-playing', playing)
    playBtn.setAttribute('aria-pressed', String(playing))
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play')
    playBtn.innerHTML = playing ? icons.pause : icons.play
  }

  const paint = () => {
    const track = tracks[index]
    if (!track) return
    if (lcdTitle) lcdTitle.textContent = track.title
    if (lcdIndex) lcdIndex.textContent = pad(index)
    root.querySelectorAll<HTMLButtonElement>('[data-track]').forEach((button) => {
      button.classList.toggle('is-current', Number(button.dataset.track) === index)
    })
  }

  const applyVolume = () => {
    if (!player) return
    player.setVolume(Math.round(Number(vol?.value ?? 0.8) * 100))
  }

  const stopTimer = () => {
    if (timer) window.clearInterval(timer)
    timer = undefined
  }

  const startTimer = () => {
    stopTimer()
    timer = window.setInterval(() => {
      if (!player || !lcdTime) return
      lcdTime.textContent = formatTime(player.getCurrentTime())
    }, 250)
  }

  const load = (autoplay: boolean) => {
    const track = tracks[index]
    if (!track || !player || !ready) return
    paint()
    wantPlay = autoplay
    if (autoplay) player.loadVideoById(track.youtubeId)
    else player.cueVideoById(track.youtubeId)
    applyVolume()
  }

  const next = () => {
    index = (index + 1) % tracks.length
    load(true)
  }

  const prev = () => {
    index = (index - 1 + tracks.length) % tracks.length
    load(true)
  }

  playBtn.addEventListener('click', () => {
    if (!player || !ready) {
      if (lcdTitle) lcdTitle.textContent = 'Warming up…'
      return
    }
    const state = player.getPlayerState()
    if (state === window.YT?.PlayerState.PLAYING || state === window.YT?.PlayerState.BUFFERING) {
      player.pauseVideo()
      setPlaying(false)
      stopTimer()
    } else {
      wantPlay = true
      if (state === window.YT?.PlayerState.CUED || state === window.YT?.PlayerState.ENDED) {
        load(true)
      } else {
        player.playVideo()
      }
    }
  })

  root.querySelector('[data-deck-stop]')?.addEventListener('click', () => {
    if (!player) return
    wantPlay = false
    player.stopVideo()
    player.seekTo(0, true)
    setPlaying(false)
    stopTimer()
    if (lcdTime) lcdTime.textContent = '0:00'
  })

  root.querySelector('[data-deck-prev]')?.addEventListener('click', prev)
  root.querySelector('[data-deck-next]')?.addEventListener('click', next)

  root.querySelectorAll<HTMLButtonElement>('[data-track]').forEach((button) => {
    button.addEventListener('click', () => {
      index = Number(button.dataset.track)
      load(true)
    })
  })

  vol?.addEventListener('input', applyVolume)

  paint()

  void loadYouTubeApi()
    .then((YT) => {
      player = new YT.Player('explore-deck-yt-player', {
        height: '1',
        width: '1',
        videoId: tracks[0]?.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            ready = true
            applyVolume()
            paint()
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              setPlaying(true)
              startTimer()
            } else if (event.data === YT.PlayerState.PAUSED) {
              setPlaying(false)
              stopTimer()
            } else if (event.data === YT.PlayerState.ENDED) {
              setPlaying(false)
              stopTimer()
              if (lcdTime) lcdTime.textContent = '0:00'
              next()
            } else if (event.data === YT.PlayerState.CUED && wantPlay) {
              event.target.playVideo()
            }
          },
          onError: () => {
            setPlaying(false)
            stopTimer()
            if (lcdTitle) lcdTitle.textContent = 'Tape snagged'
          },
        },
      })
    })
    .catch(() => {
      if (lcdTitle) lcdTitle.textContent = 'Insert cassette'
    })
}
