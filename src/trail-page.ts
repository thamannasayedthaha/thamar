import './style.css'
import { wedding } from './config'
import { initTrail, renderTrail } from './components/trail'
import { initSite, renderPage } from './site'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app root')
}

app.innerHTML = renderPage(wedding, 'trail', renderTrail(wedding))
initTrail()
initSite()
