import './style.css'
import { wedding } from './config'
import { initQuiz, renderQuiz } from './components/quiz'
import { initSite, renderPage } from './site'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app root')
}

app.innerHTML = renderPage(wedding, 'quiz', renderQuiz(wedding))
initQuiz(wedding)
initSite()
