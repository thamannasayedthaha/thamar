import './style.css'
import { wedding } from './config'
import { renderHero } from './components/hero'
import { startCountdown } from './components/countdown'
import { renderEvents, initTimelinePath } from './components/events'
import { initGallery, renderGallery } from './components/gallery'
import { renderRsvp, initRsvp } from './components/rsvp'
import { renderPhotoDrop, initPhotoDrop } from './components/photodrop'
import { renderStory } from './components/story'
import { initDressCode } from './components/dresscode'
import { initSite, renderPage } from './site'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app root')
}

app.innerHTML = renderPage(
  wedding,
  'home',
  `
    ${renderHero(wedding)}
    ${renderStory(wedding)}
    ${renderEvents(wedding)}
    ${renderGallery(wedding)}
    ${renderPhotoDrop(wedding)}
    ${renderRsvp(wedding)}
  `,
)

startCountdown(wedding.receptionDate)
const realignTimeline = initTimelinePath()
initRsvp(wedding)
initGallery()
initPhotoDrop(wedding)
initDressCode(realignTimeline)
initSite('home')
