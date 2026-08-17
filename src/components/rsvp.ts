import type { WeddingConfig } from '../types'
import { celebrate, isCelebrateTheme } from './celebrate'

const LOCAL_RSVP_KEY = 'thamar-rsvps'

function renderEventChoice(title: string, date: string, theme: string): string {
  return `
    <label class="rsvp__choice rsvp__choice--${theme}" data-rsvp-theme="${theme}">
      <input type="checkbox" name="events" value="${title}" />
      <span>
        <strong>${title}</strong>
        <small>${date}</small>
      </span>
    </label>
  `
}

function readPayload(form: HTMLFormElement) {
  const data = new FormData(form)

  return {
    name: String(data.get('name') ?? ''),
    contact: String(data.get('contact') ?? ''),
    guests: String(data.get('guests') ?? ''),
    attending: String(data.get('attending') ?? ''),
    song: String(data.get('song') ?? ''),
    message: String(data.get('message') ?? ''),
    events: data.getAll('events').map(String),
    submittedAt: new Date().toISOString(),
  }
}

function saveLocalRsvp(form: HTMLFormElement) {
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_RSVP_KEY) ?? '[]') as unknown[]
    existing.push(readPayload(form))
    localStorage.setItem(LOCAL_RSVP_KEY, JSON.stringify(existing))
  } catch {
    // Still treat the reply as received if storage is blocked.
  }
}

export function renderRsvp(config: WeddingConfig): string {
  const choices = config.events
    .filter((event) => event.theme !== 'nikah' && event.theme !== 'meeting')
    .map((event) => renderEventChoice(event.title, event.date, event.theme))
    .join('')

  return `
    <section class="section" id="rsvp" aria-labelledby="rsvp-heading">
      <h2 id="rsvp-heading" class="section__title">RSVP</h2>
      <p class="section__lede">
        ${config.rsvp.note} Kindly respond by ${config.rsvp.deadline}.
      </p>

      <form class="rsvp__form" data-rsvp-form novalidate>
        <div class="rsvp__field">
          <label for="rsvp-name">Who</label>
          <input id="rsvp-name" name="name" type="text" required autocomplete="name"
            placeholder="Your full name(s)" />
        </div>

        <div class="rsvp__field">
          <label for="rsvp-contact">Email or phone</label>
          <input id="rsvp-contact" name="contact" type="text" required autocomplete="email"
            placeholder="For updates" />
        </div>

        <div class="rsvp__field">
          <label for="rsvp-guests">Number of guests</label>
          <input id="rsvp-guests" name="guests" type="number" min="1" max="10" value="1" />
        </div>

        <fieldset class="rsvp__field">
          <legend>Which celebrations?</legend>
          <div class="rsvp__choices">${choices}</div>
        </fieldset>

        <div class="rsvp__field">
          <label for="rsvp-song">Song that will get you on the dance floor</label>
          <input id="rsvp-song" name="song" type="text"
            placeholder="Title and artist — we will take this as a promise" />
        </div>

        <div class="rsvp__field">
          <label for="rsvp-message">Message to the couple</label>
          <textarea id="rsvp-message" name="message" rows="3"
            placeholder="Leave a little note for our digital guestbook…"></textarea>
        </div>

        <fieldset class="rsvp__field">
          <legend>Will you be joining us?</legend>
          <div class="rsvp__seals">
            <label class="rsvp__seal rsvp__seal--yes">
              <input type="radio" name="attending" value="yes" checked />
              <span class="rsvp__stamp" aria-hidden="true">♥</span>
              <strong>Count us in</strong>
              <small>We’ll be there</small>
            </label>
            <label class="rsvp__seal rsvp__seal--no">
              <input type="radio" name="attending" value="no" />
              <span class="rsvp__stamp" aria-hidden="true">♡</span>
              <strong>From afar</strong>
              <small>Celebrating with you in spirit</small>
            </label>
          </div>
        </fieldset>

        <div class="rsvp__actions">
          <button class="rsvp__submit" type="submit">Send Reply</button>
          <p class="rsvp__status" role="status" data-rsvp-status></p>
        </div>
      </form>
    </section>
  `
}

export function initRsvp(config: WeddingConfig): void {
  const form = document.querySelector<HTMLFormElement>('[data-rsvp-form]')
  const status = document.querySelector<HTMLElement>('[data-rsvp-status]')
  if (!form || !status) return

  const setStatus = (message: string, state: 'ok' | 'error' | '') => {
    status.textContent = message
    status.dataset.state = state
  }

  form.addEventListener('submit', async (submitEvent) => {
    submitEvent.preventDefault()

    if (!form.reportValidity()) return

    const button = form.querySelector<HTMLButtonElement>('.rsvp__submit')
    if (button) button.disabled = true
    setStatus('Sending…', '')

    try {
      const { endpoint } = config.rsvp

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        })

        if (!response.ok) throw new Error(String(response.status))
      } else {
        saveLocalRsvp(form)
      }

      form.reset()
      setStatus('Thank you — your RSVP has been received.', 'ok')
    } catch {
      setStatus('Something went wrong. Please try again or message us directly.', 'error')
    } finally {
      if (button) button.disabled = false
    }
  })

  const eventChoiceInputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="events"]'))
  eventChoiceInputs.forEach((input) => {
    const theme = input.closest<HTMLElement>('.rsvp__choice')?.dataset.rsvpTheme

    input.addEventListener('change', () => {
      if (!input.checked || !isCelebrateTheme(theme)) return
      celebrate(theme)
    })
  })
}
