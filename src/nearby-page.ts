import './style.css'
import { wedding } from './config'
import { initGuide, renderGuide } from './components/guide'
import { initSite, renderPage } from './site'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app root')
}

app.innerHTML = renderPage(wedding, 'nearby', renderGuide(wedding))
initSite('nearby')
initGuide(wedding)
