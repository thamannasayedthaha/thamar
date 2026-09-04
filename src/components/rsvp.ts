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

function saveLocalRsvp(payload: ReturnType<typeof readPayload>) {
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_RSVP_KEY) ?? '[]') as unknown[]
    existing.push(payload)
    localStorage.setItem(LOCAL_RSVP_KEY, JSON.stringify(existing))
  } catch {
    // Still treat the reply as received if storage is blocked.
  }
}

/** Google Apps Script web apps accept text/plain JSON to avoid a CORS preflight. */
function isGoogleAppsScriptEndpoint(endpoint: string): boolean {
  return /script\.google\.com/i.test(endpoint)
}

async function submitRsvp(endpoint: string, form: HTMLFormElement): Promise<void> {
  const payload = readPayload(form)

  if (isGoogleAppsScriptEndpoint(endpoint)) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error(String(response.status))

    const result = (await response.json().catch(() => null)) as { ok?: boolean } | null
    if (result && result.ok === false) throw new Error('sheet-reject')
    return
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new FormData(form),
  })

  if (!response.ok) throw new Error(String(response.status))
}

function waxSeal(kind: 'yes' | 'afar', symbol: string): string {
  const gid = `rsvp-wax-${kind}`
  const stops =
    kind === 'yes'
      ? `<stop class="rsvp__stamp-stop rsvp__stamp-stop--hi" offset="0%" stop-color="#bbccb0"/><stop class="rsvp__stamp-stop rsvp__stamp-stop--mid" offset="55%" stop-color="#657a5c"/><stop class="rsvp__stamp-stop rsvp__stamp-stop--lo" offset="100%" stop-color="#3f4d3a"/>`
      : `<stop class="rsvp__stamp-stop rsvp__stamp-stop--hi" offset="0%" stop-color="#c4a4a2"/><stop class="rsvp__stamp-stop rsvp__stamp-stop--mid" offset="55%" stop-color="#8f7875"/><stop class="rsvp__stamp-stop rsvp__stamp-stop--lo" offset="100%" stop-color="#5a4c4a"/>`

  return `
    <span class="rsvp__stamp" aria-hidden="true">
      <svg class="rsvp__stamp-svg" viewBox="0 0 72 72" fill="none">
        <defs>
          <radialGradient id="${gid}" cx="32%" cy="28%" r="72%">
            ${stops}
          </radialGradient>
        </defs>
        <path class="rsvp__stamp-wax" fill="url(#${gid})" d="M36 8Q42.94 5.58 48.15 10.77Q55.45 11.61 57.89 18.54Q64.11 22.46 63.3 29.77Q67.2 36 63.3 42.23Q64.11 49.54 57.89 53.46Q55.45 60.39 48.15 61.23Q42.94 66.42 36 64Q29.06 66.42 23.85 61.23Q16.55 60.39 14.11 53.46Q7.89 49.54 8.7 42.23Q4.8 36 8.7 29.77Q7.89 22.46 14.11 18.54Q16.55 11.61 23.85 10.77Q29.06 5.58 36 8Z"/>
        <ellipse class="rsvp__stamp-shine" cx="28" cy="24" rx="12" ry="8" transform="rotate(-28 28 24)"/>
        <circle class="rsvp__stamp-ring" cx="36" cy="36" r="22.5"/>
        ${symbol}
      </svg>
    </span>
  `
}

export function renderRsvp(config: WeddingConfig): string {
  const choices = config.events
    .filter((event) => event.theme !== 'nikah' && event.theme !== 'meeting' && event.theme !== 'engagement')
    .map((event) => renderEventChoice(event.title, event.date, event.theme))
    .join('')
  const monogram = config.couple.monogram
  const yesStamp = waxSeal(
    'yes',
    `<text class="rsvp__stamp-mark" x="36" y="40.5" text-anchor="middle">${monogram}</text>`,
  )
  const afarStamp = waxSeal(
    'afar',
    `
    <path class="rsvp__stamp-mark-path" d="M24.5 38.5c0-8.2 6.2-13.2 11.5-13.2 1.4 0 2.7.3 3.9.9-3.8 1.6-6.5 5.6-6.5 10.5 0 6.2 4.4 11.2 10.2 12.4-1.4.7-3 1.1-4.7 1.1-7.4 0-14.4-5.2-14.4-11.7Z"/>
    <circle class="rsvp__stamp-mark-path" cx="44" cy="27.5" r="1.6"/>
    <circle class="rsvp__stamp-mark-path" cx="49.2" cy="32.2" r="1.1"/>
  `,
  )

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
              ${yesStamp}
              <strong>Count us in</strong>
              <small>We’ll be there</small>
            </label>
            <label class="rsvp__seal rsvp__seal--no">
              <input type="radio" name="attending" value="no" />
              ${afarStamp}
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
      const payload = readPayload(form)

      if (endpoint) {
        await submitRsvp(endpoint, form)
      } else {
        saveLocalRsvp(payload)
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
