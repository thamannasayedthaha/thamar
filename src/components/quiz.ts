import type { QuizQuestion, WeddingConfig } from '../types'

const VOTES_KEY = 'thamar-quiz-votes'
const MINE_KEY = 'thamar-quiz-mine'

type VoteBook = Record<string, Record<string, number>>
type MineBook = Record<string, string>

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore blocked storage */
  }
}

function renderQuestion(question: QuizQuestion): string {
  const options = question.options
    .map(
      (option) => `
        <button type="button" class="quiz__option" data-quiz-option="${option.id}">
          <span class="quiz__option-label">${option.label}</span>
          <span class="quiz__option-tally" data-quiz-tally="${option.id}" hidden></span>
        </button>
      `,
    )
    .join('')

  return `
    <article class="quiz__question" data-quiz-question="${question.id}">
      <h3 class="quiz__prompt">${question.prompt}</h3>
      <div class="quiz__options">${options}</div>
      <p class="quiz__note" data-quiz-note hidden>${question.coupleNote}</p>
    </article>
  `
}

export function renderQuiz(config: WeddingConfig): string {
  return `
    <section class="section quiz" id="quiz" aria-labelledby="quiz-heading">
      <h2 id="quiz-heading" class="section__title">${config.quiz.title}</h2>
      <p class="section__lede">${config.quiz.lede}</p>
      <div class="quiz__list" data-quiz>
        ${config.quiz.questions.map(renderQuestion).join('')}
      </div>
    </section>
  `
}

function paintQuestion(article: HTMLElement, question: QuizQuestion, votes: VoteBook, mine: MineBook) {
  const chosen = mine[question.id]
  const tallies = votes[question.id] ?? {}
  const total = question.options.reduce((sum, option) => sum + (tallies[option.id] ?? 0), 0)

  article.classList.toggle('quiz__question--answered', Boolean(chosen))

  const note = article.querySelector<HTMLElement>('[data-quiz-note]')
  if (note) note.hidden = !chosen

  for (const button of article.querySelectorAll<HTMLButtonElement>('[data-quiz-option]')) {
    const id = button.dataset.quizOption ?? ''
    const count = tallies[id] ?? 0
    const tally = button.querySelector<HTMLElement>('[data-quiz-tally]')
    button.classList.toggle('quiz__option--picked', chosen === id)
    button.disabled = Boolean(chosen)

    if (tally) {
      tally.hidden = !chosen
      const percent = total === 0 ? 0 : Math.round((count / total) * 100)
      tally.textContent = `${percent}%`
    }
  }
}

export function initQuiz(config: WeddingConfig): void {
  const root = document.querySelector<HTMLElement>('[data-quiz]')
  if (!root) return

  const votes = readJson<VoteBook>(VOTES_KEY, {})
  const mine = readJson<MineBook>(MINE_KEY, {})

  for (const question of config.quiz.questions) {
    const article = root.querySelector<HTMLElement>(`[data-quiz-question="${question.id}"]`)
    if (!article) continue

    paintQuestion(article, question, votes, mine)

    article.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-quiz-option]')
      if (!target || mine[question.id]) return

      const optionId = target.dataset.quizOption
      if (!optionId) return

      votes[question.id] = votes[question.id] ?? {}
      votes[question.id][optionId] = (votes[question.id][optionId] ?? 0) + 1
      mine[question.id] = optionId
      writeJson(VOTES_KEY, votes)
      writeJson(MINE_KEY, mine)
      paintQuestion(article, question, votes, mine)
    })
  }
}
