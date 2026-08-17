export function renderCountdown(quote: string): string {
  const unit = (attr: string, label: string) => `
    <div class="countdown__unit">
      <span class="countdown__value" ${attr}>00</span>
      <span class="countdown__unit-label">${label}</span>
    </div>
  `

  return `
    <section class="countdown" id="countdown" aria-labelledby="countdown-label">
      <p class="hero__quote">${quote}</p>
      <p class="countdown__label label-caps" id="countdown-label">Until the reception</p>
      <div class="countdown__grid" role="timer" aria-live="polite">
        ${unit('data-days', 'Days')}
        ${unit('data-hours', 'Hours')}
        ${unit('data-minutes', 'Mins')}
        ${unit('data-seconds', 'Secs')}
      </div>
      <p class="countdown__done is-hidden" data-countdown-done>The day is finally here.</p>
    </section>
  `
}

export function startCountdown(targetIso: string): () => void {
  const target = new Date(targetIso).getTime()
  const daysEl = document.querySelector<HTMLElement>('[data-days]')
  const hoursEl = document.querySelector<HTMLElement>('[data-hours]')
  const minutesEl = document.querySelector<HTMLElement>('[data-minutes]')
  const secondsEl = document.querySelector<HTMLElement>('[data-seconds]')
  const doneEl = document.querySelector<HTMLElement>('[data-countdown-done]')
  const gridEl = document.querySelector<HTMLElement>('.countdown__grid')

  const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0')

  const tick = () => {
    const diff = target - Date.now()

    if (diff <= 0) {
      doneEl?.classList.remove('is-hidden')
      gridEl?.classList.add('is-hidden')
      return
    }

    const days = Math.floor(diff / 86_400_000)
    const hours = Math.floor((diff % 86_400_000) / 3_600_000)
    const minutes = Math.floor((diff % 3_600_000) / 60_000)
    const seconds = Math.floor((diff % 60_000) / 1000)

    if (daysEl) daysEl.textContent = pad(days)
    if (hoursEl) hoursEl.textContent = pad(hours)
    if (minutesEl) minutesEl.textContent = pad(minutes)
    if (secondsEl) secondsEl.textContent = pad(seconds)
  }

  tick()
  const id = window.setInterval(tick, 1000)
  return () => window.clearInterval(id)
}
