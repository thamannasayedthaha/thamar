import type { EventTheme } from '../types'

const MARKERS: Record<EventTheme, { src: string; label: string }> = {
  meeting: {
    src: '/images/markers/marker-meeting.png',
    label: 'Watercolour hills',
  },
  engagement: {
    src: '/images/markers/marker-engagement.png',
    label: 'Watercolour rings',
  },
  nikah: {
    src: '/images/markers/marker-nikah.png',
    label: 'Watercolour mosque',
  },
  haldi: {
    src: '/images/markers/marker-haldi.png',
    label: 'Watercolour marigold',
  },
  mehendi: {
    src: '/images/markers/marker-mehendi.png',
    label: 'Watercolour henna motif',
  },
  sangeet: {
    src: '/images/markers/marker-sangeet.png',
    label: 'Watercolour music notes',
  },
  reception: {
    src: '/images/markers/marker-reception.png',
    label: 'Watercolour star',
  },
}

export function getMarkerSrc(theme: EventTheme): string {
  return MARKERS[theme].src
}

export function renderEventMarker(theme: EventTheme): string {
  const marker = MARKERS[theme]
  return `<img class="event__marker-art" src="${marker.src}" alt="" width="384" height="384" decoding="async" />`
}
