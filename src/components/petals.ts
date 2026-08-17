const PETAL_COUNT = 32
const STAR_COUNT = 40

const STAR_SVG = `
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path
      fill="currentColor"
      d="M8 0.5l1.6 4.9h5.2l-4.2 3.1 1.6 4.9L8 10.3l-4.2 3.1 1.6-4.9-4.2-3.1h5.2L8 0.5z"
    />
  </svg>
`

/**
 * A sakura petal: notched crown, pointed tip, and a faint central vein.
 */
const PETAL_SVG = `
  <svg viewBox="0 0 32 40" aria-hidden="true">
    <path
      fill="currentColor"
      d="M16 38C6.5 28.2 2.2 18.4 4.2 11.2C5.2 7.4 8.2 5.2 11.4 6.1C13.4 6.7 14.7 8.8 16 12.4C17.3 8.8 18.6 6.7 20.6 6.1C23.8 5.2 26.8 7.4 27.8 11.2C29.8 18.4 25.5 28.2 16 38Z"
    />
    <path
      fill="none"
      stroke="#6a5b59"
      stroke-width="0.7"
      stroke-linecap="round"
      opacity="0.28"
      d="M16 13.2C16 20 16 27.5 16 35.2"
    />
    <path
      fill="none"
      stroke="#6a5b59"
      stroke-width="0.45"
      stroke-linecap="round"
      opacity="0.18"
      d="M16 16.5C13.4 22.2 11.6 27 10.4 31.2M16 16.5C18.6 22.2 20.4 27 21.6 31.2"
    />
  </svg>
`

export function renderPetals(): string {
  const petals = Array.from({ length: PETAL_COUNT }, (_, index) => {
    const left = ((index * 47 + 11) % 98).toFixed(1)
    const delay = ((index * 0.37) % 22).toFixed(2)
    const duration = (10 + (index % 11) * 1.35).toFixed(1)
    const size = 10 + (index % 9) * 2
    const drift = ((index % 5) - 2) * 1.15 || 0.6
    const spin = 10 + (index % 8) * 2.4
    const opacity = (0.22 + (index % 7) * 0.05).toFixed(2)

    return `
      <span
        class="petal"
        style="
          --petal-left: ${left}%;
          --petal-delay: -${delay}s;
          --petal-duration: ${duration}s;
          --petal-size: ${size}px;
          --petal-drift: ${drift};
          --petal-spin: ${spin}s;
          --petal-opacity: ${opacity};
        "
      >${PETAL_SVG}</span>
    `
  }).join('')

  return `<div class="petals" aria-hidden="true">${petals}</div>`
}

export function renderStars(): string {
  const stars = Array.from({ length: STAR_COUNT }, (_, index) => {
    const left = ((index * 53 + 7) % 98).toFixed(1)
    const delay = ((index * 0.41) % 18).toFixed(2)
    const duration = (7 + (index % 9) * 1.1).toFixed(1)
    const size = 4 + (index % 6) * 1.5
    const drift = ((index % 5) - 2) * 0.45 || 0.3
    const twinkle = 2.4 + (index % 7) * 0.55
    const opacity = (0.35 + (index % 8) * 0.07).toFixed(2)
    const shooting = index % 6 === 0 ? ' star--shooting' : ''

    return `
      <span
        class="star${shooting}"
        style="
          --star-left: ${left}%;
          --star-delay: -${delay}s;
          --star-duration: ${duration}s;
          --star-size: ${size}px;
          --star-drift: ${drift};
          --star-twinkle: ${twinkle}s;
          --star-opacity: ${opacity};
        "
      >${STAR_SVG}</span>
    `
  }).join('')

  return `<div class="stars" aria-hidden="true">${stars}</div>`
}

/** Light-mode petals + dark-mode falling stars (visibility toggled in CSS). */
export function renderAmbientOverlay(): string {
  return `${renderPetals()}${renderStars()}`
}
