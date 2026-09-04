import type { EventTheme } from '../types'

const MARKERS: Record<EventTheme, { light: string; dark: string; label: string; labelDark: string }> = {
  meeting: {
    light: '/images/markers/marker-meeting.png',
    dark: '/images/markers/marker-meeting-dark.png',
    label: 'Watercolour hills',
    labelDark: 'Celestial hills under the moon',
  },
  engagement: {
    light: '/images/markers/marker-engagement.png',
    dark: '/images/markers/marker-engagement-dark.png',
    label: 'Watercolour rings',
    labelDark: 'Celestial rings and stars',
  },
  nikah: {
    light: '/images/markers/marker-nikah.png',
    dark: '/images/markers/marker-nikah-dark.png',
    label: 'Watercolour mosque',
    labelDark: 'Celestial mosque and crescent',
  },
  haldi: {
    light: '/images/markers/marker-haldi.png',
    dark: '/images/markers/marker-haldi-dark.png',
    label: 'Watercolour outline flower',
    labelDark: 'Celestial outline flower',
  },
  mehendi: {
    light: '/images/markers/marker-mehendi.png',
    dark: '/images/markers/marker-mehendi-dark.png',
    label: 'Watercolour henna motif',
    labelDark: 'Celestial henna motif',
  },
  sangeet: {
    light: '/images/markers/marker-sangeet.png',
    dark: '/images/markers/marker-sangeet-dark.png',
    label: 'Watercolour music notes',
    labelDark: 'Celestial music notes',
  },
  reception: {
    light: '/images/markers/marker-reception.png',
    dark: '/images/markers/marker-reception-dark.png',
    label: 'Watercolour star',
    labelDark: 'Celestial starburst',
  },
}

function isDarkTheme(): boolean {
  return document.documentElement.dataset.theme === 'dark'
}

export function getMarkerSrc(theme: EventTheme): string {
  const marker = MARKERS[theme]
  return isDarkTheme() ? marker.dark : marker.light
}

export function renderEventMarker(theme: EventTheme): string {
  const marker = MARKERS[theme]
  const src = isDarkTheme() ? marker.dark : marker.light
  return `<img class="event__marker-art" src="${src}" data-src-light="${marker.light}" data-src-dark="${marker.dark}" alt="" width="384" height="384" decoding="async" />`
}
