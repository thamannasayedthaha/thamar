import './style.css'
import { wedding } from './config'
import { initSoundtrack, renderSoundtrackPage } from './components/soundtrack'
import { initSite, renderPage } from './site'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app root')
}

app.innerHTML = renderPage(wedding, 'soundtrack', renderSoundtrackPage(wedding))
initSoundtrack(wedding.soundtrack.tracks)
initSite()
