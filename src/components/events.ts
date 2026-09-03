import type { WeddingConfig, WeddingEvent } from '../types'
import { hasDressCodeArt, renderEventDressCode } from './dresscode'
import { renderEventMarker } from './markers'

function renderDetail(label: string, value: string): string {
  if (!value.trim()) return ''
  return `
    <div class="event__detail">
      <dt>${label}</dt>
      <dd>${value}</dd>
    </div>
  `
}

function eventMapUrl(event: WeddingEvent): string | undefined {
  if (event.id === 'meeting' || event.id === 'engagement' || event.id === 'nikah') return undefined
  if (event.mapUrl) return event.mapUrl
  const query = [event.venue, event.address].filter((part) => part.trim()).join(', ')
  if (!query) return undefined
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function renderEvent(event: WeddingEvent): string {
  const dressButton = hasDressCodeArt(event.theme)
    ? `<button class="event__dress-btn" type="button" data-dresscode-toggle aria-expanded="false" aria-controls="${event.id}-dresscode">
          Show me the dress code
        </button>`
    : ''

  const mapHref = eventMapUrl(event)
  const mapButton = mapHref
    ? `<a class="event__map-btn" href="${mapHref}" target="_blank" rel="noopener noreferrer">
          Show me the location
        </a>`
    : ''

  const actions =
    dressButton || mapButton ? `<div class="event__actions">${dressButton}${mapButton}</div>` : ''

  return `
    <article class="event event--${event.theme}" id="event-${event.id}">
      <span class="event__marker event__marker--${event.theme}" aria-hidden="true">${renderEventMarker(event.theme)}</span>
      <div class="event__card">
        <span class="event__date label-caps">${event.date}</span>
        <h3 class="event__title">${event.title}</h3>
        <p class="event__description">${event.description}</p>
        <dl class="event__details">
          ${renderDetail('Time', event.time)}
          ${renderDetail('Venue', event.venue)}
          ${renderDetail('Address', event.address)}
          ${renderDetail('Attire', event.dressCode ?? '')}
        </dl>
        ${event.dressNote ? `<p class="event__dress-note">${event.dressNote}</p>` : ''}
        ${actions}
      </div>
    </article>
  `
}

export function renderEvents(config: WeddingConfig): string {
  return `
    <section class="section" id="events" aria-labelledby="events-heading">
      <h2 id="events-heading" class="section__title">Our Journey Begins</h2>
      <p class="section__lede">
        Join us as we celebrate love, family, and tradition across these beautiful events.
      </p>
      <div class="timeline">
        <svg class="timeline__path" viewBox="0 0 100 1200" preserveAspectRatio="none" aria-hidden="true">
          <path d="M50 0 C 80 100, 20 200, 50 300 C 80 400, 20 500, 50 600 C 80 700, 20 800, 50 900 C 80 1000, 20 1100, 50 1200" />
        </svg>
        ${config.events
          .map((event) => {
            const card = renderEvent(event)
            return hasDressCodeArt(event.theme)
              ? `${card}<div class="event-dresscode" id="${event.id}-dresscode">${renderEventDressCode(event.theme)}</div>`
              : card
          })
          .join('')}
      </div>
    </section>
  `
}

/** Align the vine path from the first marker to the reception marker. */
export function initTimelinePath(): () => void {
  const timeline = document.querySelector<HTMLElement>('.timeline')
  const path = document.querySelector<SVGElement>('.timeline__path')
  const firstMarker = document.querySelector<HTMLElement>('.event .event__marker')
  const lastMarker =
    document.querySelector<HTMLElement>('#event-reception .event__marker') ??
    [...document.querySelectorAll<HTMLElement>('.event .event__marker')].at(-1)

  if (!timeline || !path || !firstMarker || !lastMarker) return () => {}

  const align = () => {
    const timelineRect = timeline.getBoundingClientRect()
    const firstRect = firstMarker.getBoundingClientRect()
    const lastRect = lastMarker.getBoundingClientRect()
    const startY = firstRect.top + firstRect.height / 2 - timelineRect.top
    const endY = lastRect.top + lastRect.height / 2 - timelineRect.top

    path.style.top = `${startY}px`
    path.style.height = `${Math.max(0, endY - startY)}px`
    path.style.bottom = 'auto'
  }

  align()
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(align)
    observer.observe(timeline)
  }
  return align
}
