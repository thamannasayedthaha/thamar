import './style.css'
import { wedding } from './config'
import { initGalleryTabs, isGalleryCategory, renderAlbum } from './components/gallery'
import { initSite, renderPage } from './site'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app root')
}

const requested = window.location.hash.replace('#', '')
const active = isGalleryCategory(requested) ? requested : 'engagement'

app.innerHTML = renderPage(wedding, 'gallery', renderAlbum(wedding, active))

initGalleryTabs(document, (key) => {
  history.replaceState(null, '', `#${key}`)
})
initSite()

window.addEventListener('hashchange', () => {
  const key = window.location.hash.replace('#', '')
  const tab = document.querySelector<HTMLButtonElement>(`[data-gallery-tab="${key}"]`)
  tab?.click()
})
