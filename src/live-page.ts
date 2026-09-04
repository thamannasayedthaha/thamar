import './style.css'
import { wedding } from './config'
import { initFeed, renderUpdates } from './components/updates'
import { initSite, renderPage } from './site'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app root')
}

app.innerHTML = renderPage(wedding, 'live', renderUpdates(wedding))
initFeed()
initSite('live')
