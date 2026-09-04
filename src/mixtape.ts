import { duckAmbient, unduckAmbient } from './ambient'
import type { SoundtrackTrack } from './types'
import { loadYouTubeApi, type YtPlayer } from './youtube'

const STORAGE_KEY = 'thamar-mixtape'

const icons = {
  play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13L19 12z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>`,
  prev: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2.2v14H6zM18 5 9 12l9 7z"/></svg>`,
  next: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 5H18v14h-2.2zM6 5l9 7-9 7z"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="0.6"/></svg>`,
  close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 6.2 17.8 17.8M17.8 6.2 6.2 17.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
}

type PersistedMixtape = {
  index: number
  time: number
  playing: boolean
  volume: number
  /** True from first play until stop — drives mini-player visibility across pages. */
  active: boolean
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

function readPersisted(): PersistedMixtape | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as PersistedMixtape
    if (
      typeof data.index !== 'number' ||
      typeof data.time !== 'number' ||
      typeof data.playing !== 'boolean' ||
      typeof data.volume !== 'number' ||
      typeof data.active !== 'boolean'
    ) {
      return null
    }
    return data
  } catch {
    return null
  }
}

function writePersisted(state: PersistedMixtape): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota / private mode */
  }
}

function clearPersisted(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

/** True when a mixtape session wants to keep playing across pages. */
export function isMixtapeSessionPlaying(): boolean {
  const saved = readPersisted()
  return Boolean(saved?.active && saved.playing)
}

let pauseForAmbient: (() => void) | null = null

/** Pause the mixtape so ambient intro can take over (keeps the mini session). */
export function pauseMixtapePlayback(): void {
  pauseForAmbient?.()
}

/** Fixed mini player + shared YouTube host (all pages). */
export function renderMixtapeChrome(firstTitle: string): string {
  return `
    <div class="mixtape-dock" data-mixtape-dock hidden>
      <button class="mixtape-dock__close" type="button" data-mixtape-close aria-label="Close player">${icons.close}</button>
      <aside class="mixtape-mini" data-mixtape-mini aria-label="Mixtape player — open soundtrack" role="complementary">
        <p class="mixtape-mini__open label-caps">Mixtape</p>
        <div class="mixtape-mini__body">
          <span class="mixtape-mini__reel" aria-hidden="true"></span>
          <div class="mixtape-mini__meta">
            <span class="mixtape-mini__index" data-mixtape-index>01</span>
            <span class="mixtape-mini__title" data-mixtape-title>${firstTitle}</span>
            <span class="mixtape-mini__time" data-mixtape-time>0:00</span>
          </div>
          <div class="mixtape-mini__controls" data-mixtape-controls>
            <button class="mixtape-mini__key" type="button" data-mixtape-prev aria-label="Previous track">${icons.prev}</button>
            <button class="mixtape-mini__key mixtape-mini__key--play" type="button" data-mixtape-play aria-pressed="false" aria-label="Play">${icons.play}</button>
            <button class="mixtape-mini__key" type="button" data-mixtape-next aria-label="Next track">${icons.next}</button>
            <button class="mixtape-mini__key" type="button" data-mixtape-stop aria-label="Stop">${icons.stop}</button>
          </div>
        </div>
      </aside>
    </div>
    <div class="mixtape-yt" aria-hidden="true">
      <div id="mixtape-yt-player"></div>
    </div>
  `
}

export type MixtapePage = 'soundtrack' | 'other'

export function initMixtape(tracks: SoundtrackTrack[], page: MixtapePage): void {
  if (!tracks.length) return

  const deck = document.querySelector<HTMLElement>('.explore-deck--page')
  const dock = document.querySelector<HTMLElement>('[data-mixtape-dock]')
  const mini = document.querySelector<HTMLElement>('[data-mixtape-mini]')
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-mixtape-close]')
  const saved = readPersisted()
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)')
  let armed = false

  let index = Math.min(Math.max(saved?.index ?? 0, 0), tracks.length - 1)
  let volume = saved?.volume ?? 0.8
  let active = saved?.active ?? false
  let resumeAt = saved?.time ?? 0
  let wantPlay = Boolean(saved?.playing && saved.active)
  let player: YtPlayer | null = null
  let ready = false
  let timer: number | undefined
  let playing = false

  const deckPlay = deck?.querySelector<HTMLButtonElement>('[data-deck-play]')
  const deckVol = deck?.querySelector<HTMLInputElement>('[data-deck-vol]')
  const miniPlay = mini?.querySelector<HTMLButtonElement>('[data-mixtape-play]')

  if (deckVol) deckVol.value = String(volume)

  const persist = () => {
    const time = player && ready ? player.getCurrentTime() : resumeAt
    if (!active) {
      clearPersisted()
      return
    }
    writePersisted({
      index,
      time: Number.isFinite(time) ? time : 0,
      playing: wantPlay || playing,
      volume,
      active,
    })
  }

  const setMiniVisible = (visible: boolean) => {
    if (!dock) return
    if (page === 'soundtrack') {
      dock.hidden = true
      return
    }
    dock.hidden = !visible
    if (!visible) {
      armed = false
      dock.classList.remove('is-armed')
    }
  }

  const setArmed = (next: boolean) => {
    armed = next
    dock?.classList.toggle('is-armed', next)
  }

  const paintPlaying = (isPlaying: boolean) => {
    playing = isPlaying
    deck?.classList.toggle('is-playing', isPlaying)
    mini?.classList.toggle('is-playing', isPlaying)

    for (const btn of [deckPlay, miniPlay]) {
      if (!btn) continue
      btn.setAttribute('aria-pressed', String(isPlaying))
      btn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play')
      btn.innerHTML = isPlaying ? icons.pause : icons.play
    }
  }

  const paintTrack = () => {
    const track = tracks[index]
    if (!track) return

    deck?.querySelectorAll<HTMLElement>('[data-lcd-title]').forEach((el) => {
      el.textContent = track.title
    })
    deck?.querySelectorAll<HTMLElement>('[data-lcd-index]').forEach((el) => {
      el.textContent = pad(index)
    })
    deck?.querySelectorAll<HTMLButtonElement>('[data-track]').forEach((button) => {
      button.classList.toggle('is-current', Number(button.dataset.track) === index)
    })

    mini?.querySelectorAll<HTMLElement>('[data-mixtape-title]').forEach((el) => {
      el.textContent = track.title
    })
    mini?.querySelectorAll<HTMLElement>('[data-mixtape-index]').forEach((el) => {
      el.textContent = pad(index)
    })
  }

  const paintTime = (seconds: number) => {
    const label = formatTime(seconds)
    deck?.querySelectorAll<HTMLElement>('[data-lcd-time]').forEach((el) => {
      el.textContent = label
    })
    mini?.querySelectorAll<HTMLElement>('[data-mixtape-time]').forEach((el) => {
      el.textContent = label
    })
  }

  const applyVolume = () => {
    if (deckVol) volume = Number(deckVol.value)
    if (!player || !ready) return
    player.setVolume(Math.round(volume * 100))
  }

  const stopTimer = () => {
    if (timer) window.clearInterval(timer)
    timer = undefined
  }

  const startTimer = () => {
    stopTimer()
    timer = window.setInterval(() => {
      if (!player || !ready) return
      const t = player.getCurrentTime()
      resumeAt = t
      paintTime(t)
      persist()
    }, 250)
  }

  const load = (autoplay: boolean, seekTo?: number) => {
    const track = tracks[index]
    if (!track || !player || !ready) return
    paintTrack()
    wantPlay = autoplay
    if (autoplay) {
      active = true
      setMiniVisible(true)
      player.loadVideoById(track.youtubeId)
    } else {
      player.cueVideoById(track.youtubeId)
    }
    applyVolume()
    if (typeof seekTo === 'number' && seekTo > 0) {
      // Seek after cue/load — YouTube often ignores seek before data is ready.
      window.setTimeout(() => {
        player?.seekTo(seekTo, true)
        paintTime(seekTo)
        if (autoplay) player?.playVideo()
      }, 350)
    }
    persist()
  }

  const next = () => {
    index = (index + 1) % tracks.length
    resumeAt = 0
    load(true)
  }

  const prev = () => {
    index = (index - 1 + tracks.length) % tracks.length
    resumeAt = 0
    load(true)
  }

  const SEEK_STEP = 10

  const seekBy = (delta: number) => {
    if (!player || !ready) return
    const current = player.getCurrentTime()
    if (!Number.isFinite(current)) return
    let duration = Number.POSITIVE_INFINITY
    try {
      const d = player.getDuration()
      if (Number.isFinite(d) && d > 0) duration = d
    } catch {
      /* duration unavailable until metadata loads */
    }
    const target = Math.min(Math.max(0, current + delta), Math.max(0, duration - 0.25))
    player.seekTo(target, true)
    resumeAt = target
    paintTime(target)
    persist()
  }

  const togglePlay = () => {
    if (!player || !ready) {
      deck?.querySelectorAll<HTMLElement>('[data-lcd-title]').forEach((el) => {
        el.textContent = 'Warming up…'
      })
      mini?.querySelectorAll<HTMLElement>('[data-mixtape-title]').forEach((el) => {
        el.textContent = 'Warming up…'
      })
      return
    }

    const state = player.getPlayerState()
    if (state === window.YT?.PlayerState.PLAYING || state === window.YT?.PlayerState.BUFFERING) {
      wantPlay = false
      player.pauseVideo()
      paintPlaying(false)
      stopTimer()
      unduckAmbient()
      persist()
    } else {
      active = true
      wantPlay = true
      setMiniVisible(true)
      if (state === window.YT?.PlayerState.CUED || state === window.YT?.PlayerState.ENDED) {
        load(true, resumeAt > 1 ? resumeAt : undefined)
      } else {
        player.playVideo()
      }
      persist()
    }
  }

  const stop = () => {
    // Clear intent first so residual YouTube events cannot revive the dock.
    wantPlay = false
    active = false
    resumeAt = 0
    paintPlaying(false)
    stopTimer()
    setMiniVisible(false)
    clearPersisted()
    paintTime(0)

    if (player && ready) {
      try {
        player.pauseVideo()
        const track = tracks[index] ?? tracks[0]
        if (track) player.cueVideoById(track.youtubeId)
      } catch {
        /* player may already be torn down */
      }
    }

    unduckAmbient()
  }

  const pauseOnly = () => {
    wantPlay = false
    if (player && ready) {
      const state = player.getPlayerState()
      if (state === window.YT?.PlayerState.PLAYING || state === window.YT?.PlayerState.BUFFERING) {
        player.pauseVideo()
      }
    }
    paintPlaying(false)
    stopTimer()
    persist()
  }

  pauseForAmbient = pauseOnly

  deckPlay?.addEventListener('click', togglePlay)
  miniPlay?.addEventListener('click', (event) => {
    event.stopPropagation()
    togglePlay()
  })

  deck?.querySelector('[data-deck-stop]')?.addEventListener('click', stop)
  mini?.querySelector('[data-mixtape-stop]')?.addEventListener('click', (event) => {
    event.stopPropagation()
    stop()
  })
  closeBtn?.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    stop()
  })

  deck?.querySelector('[data-deck-prev]')?.addEventListener('click', prev)
  deck?.querySelector('[data-deck-next]')?.addEventListener('click', next)
  deck?.querySelector('[data-deck-rew]')?.addEventListener('click', () => seekBy(-SEEK_STEP))
  deck?.querySelector('[data-deck-ff]')?.addEventListener('click', () => seekBy(SEEK_STEP))
  mini?.querySelector('[data-mixtape-prev]')?.addEventListener('click', (event) => {
    event.stopPropagation()
    prev()
  })
  mini?.querySelector('[data-mixtape-next]')?.addEventListener('click', (event) => {
    event.stopPropagation()
    next()
  })

  mini?.addEventListener('click', (event) => {
    // Icon swaps on play/pause detach the original target, so check the full path.
    const path = event.composedPath()
    const hitControl = path.some(
      (node) =>
        node instanceof Element &&
        Boolean(node.closest('[data-mixtape-controls], .mixtape-mini__key')),
    )
    if (hitControl) return

    // Touch: first tap reveals the outside close; second tap opens soundtrack.
    if (!canHover.matches && !armed) {
      setArmed(true)
      return
    }
    window.location.href = 'soundtrack.html'
  })

  document.addEventListener('pointerdown', (event) => {
    if (!dock || dock.hidden || !armed) return
    const target = event.target
    if (target instanceof Node && dock.contains(target)) return
    setArmed(false)
  })

  deck?.querySelectorAll<HTMLButtonElement>('[data-track]').forEach((button) => {
    button.addEventListener('click', () => {
      index = Number(button.dataset.track)
      resumeAt = 0
      load(true)
    })
  })

  deckVol?.addEventListener('input', () => {
    applyVolume()
    persist()
  })

  window.addEventListener('pagehide', persist)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persist()
  })

  paintTrack()
  paintTime(resumeAt)
  paintPlaying(false)
  setMiniVisible(page !== 'soundtrack' && active)

  void loadYouTubeApi()
    .then((YT) => {
      const host = document.getElementById('mixtape-yt-player')
      if (!host) return

      player = new YT.Player('mixtape-yt-player', {
        height: '1',
        width: '1',
        videoId: tracks[index]?.youtubeId,
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
            paintTrack()
            if (wantPlay) {
              load(true, resumeAt > 0.5 ? resumeAt : undefined)
            } else if (active && resumeAt > 0.5) {
              player?.cueVideoById(tracks[index]!.youtubeId)
              window.setTimeout(() => {
                player?.seekTo(resumeAt, true)
                paintTime(resumeAt)
              }, 350)
            } else {
              player?.cueVideoById(tracks[index]!.youtubeId)
            }
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              // Close / ambient takeover: kill leftover playback, don't reopen the dock.
              if (!wantPlay || !active) {
                event.target.pauseVideo()
                return
              }
              paintPlaying(true)
              startTimer()
              duckAmbient()
              setMiniVisible(true)
              persist()
            } else if (event.data === YT.PlayerState.PAUSED) {
              paintPlaying(false)
              stopTimer()
              if (active) unduckAmbient()
              persist()
            } else if (event.data === YT.PlayerState.ENDED) {
              paintPlaying(false)
              stopTimer()
              paintTime(0)
              resumeAt = 0
              // Don't auto-advance after an intentional close/stop.
              if (!wantPlay || !active) return
              next()
            } else if (event.data === YT.PlayerState.CUED && wantPlay && active) {
              event.target.playVideo()
            }
          },
          onError: () => {
            paintPlaying(false)
            stopTimer()
            unduckAmbient()
            deck?.querySelectorAll<HTMLElement>('[data-lcd-title]').forEach((el) => {
              el.textContent = 'Tape snagged'
            })
            mini?.querySelectorAll<HTMLElement>('[data-mixtape-title]').forEach((el) => {
              el.textContent = 'Tape snagged'
            })
            persist()
          },
        },
      })
    })
    .catch(() => {
      deck?.querySelectorAll<HTMLElement>('[data-lcd-title]').forEach((el) => {
        el.textContent = 'Insert cassette'
      })
      mini?.querySelectorAll<HTMLElement>('[data-mixtape-title]').forEach((el) => {
        el.textContent = 'Insert cassette'
      })
    })
}
