import type { QuizQuestion, WeddingConfig } from '../types'

const VOTES_KEY = 'thamar-quiz-votes'
const MINE_KEY = 'thamar-quiz-mine'

const LETTERS = ['A', 'B', 'C', 'D', 'E']

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

function renderQuestion(question: QuizQuestion, index: number, total: number): string {
  const round = String(index + 1).padStart(2, '0')

  const options = question.options
    .map(
      (option, optionIndex) => `
        <button type="button" class="quiz__option" data-quiz-option="${option.id}">
          <span class="quiz__key" aria-hidden="true">${LETTERS[optionIndex] ?? '?'}</span>
          <span class="quiz__option-body">
            <span class="quiz__option-label">${option.label}</span>
            <span class="quiz__option-bar" data-quiz-bar="${option.id}" aria-hidden="true"><span></span></span>
          </span>
          <span class="quiz__option-tally" data-quiz-tally="${option.id}" hidden></span>
        </button>
      `,
    )
    .join('')

  return `
    <article class="quiz__round" data-quiz-question="${question.id}" data-quiz-index="${index}">
      <header class="quiz__round-head">
        <span class="quiz__round-num label-caps">Round ${round}</span>
        <span class="quiz__round-of">${index + 1} / ${total}</span>
      </header>
      <h3 class="quiz__prompt">${question.prompt}</h3>
      <div class="quiz__options" role="group" aria-label="${question.prompt}">${options}</div>
      <div class="quiz__reveal" data-quiz-note hidden>
        <span class="quiz__reveal-kicker label-caps">From the couple</span>
        <p class="quiz__note">${question.coupleNote}</p>
      </div>
    </article>
  `
}

export function renderQuiz(config: WeddingConfig): string {
  const total = config.quiz.questions.length
  const pips = config.quiz.questions
    .map((_, index) => `<span class="quiz-show__pip" data-quiz-pip="${index}"></span>`)
    .join('')

  return `
    <section class="section quiz quiz-show" id="quiz" aria-labelledby="quiz-heading">
      <div class="quiz-show__stage">
        <div class="quiz-show__marquee" aria-hidden="true">
          <span class="quiz-show__lights"></span>
        </div>

        <header class="quiz-show__header">
          <p class="quiz-show__kicker label-caps">You're on the mic</p>
          <h2 id="quiz-heading" class="quiz-show__title">${config.quiz.title}</h2>
          <p class="quiz-show__lede">${config.quiz.lede}</p>
        </header>

        <div class="quiz-show__hud" aria-live="polite">
          <div class="quiz-show__score">
            <span class="quiz-show__score-label label-caps">Answered</span>
            <span class="quiz-show__score-value" data-quiz-score>0</span>
            <span class="quiz-show__score-total">/ ${total}</span>
          </div>
          <div class="quiz-show__progress" data-quiz-progress aria-hidden="true">${pips}</div>
        </div>

        <div class="quiz__list" data-quiz>
          ${config.quiz.questions.map((question, index) => renderQuestion(question, index, total)).join('')}
        </div>
      </div>
    </section>
  `
}

function paintHud(root: HTMLElement, mine: MineBook) {
  const answered = Object.keys(mine).length
  const score = root.querySelector<HTMLElement>('[data-quiz-score]')
  if (score) score.textContent = String(answered)

  root.querySelectorAll<HTMLElement>('[data-quiz-pip]').forEach((pip) => {
    const index = Number(pip.dataset.quizPip)
    const question = root.querySelector<HTMLElement>(`[data-quiz-index="${index}"]`)
    const id = question?.dataset.quizQuestion
    pip.classList.toggle('is-done', Boolean(id && mine[id]))
  })
}

function paintQuestion(article: HTMLElement, question: QuizQuestion, votes: VoteBook, mine: MineBook) {
  const chosen = mine[question.id]
  const tallies = votes[question.id] ?? {}
  const total = question.options.reduce((sum, option) => sum + (tallies[option.id] ?? 0), 0)

  article.classList.toggle('quiz__round--answered', Boolean(chosen))

  const note = article.querySelector<HTMLElement>('[data-quiz-note]')
  if (note) note.hidden = !chosen

  for (const button of article.querySelectorAll<HTMLButtonElement>('[data-quiz-option]')) {
    const id = button.dataset.quizOption ?? ''
    const count = tallies[id] ?? 0
    const tally = button.querySelector<HTMLElement>('[data-quiz-tally]')
    const bar = button.querySelector<HTMLElement>(`[data-quiz-bar="${id}"] span`)
    const percent = total === 0 ? 0 : Math.round((count / total) * 100)

    button.classList.toggle('quiz__option--picked', chosen === id)
    button.disabled = Boolean(chosen)

    if (tally) {
      tally.hidden = !chosen
      tally.textContent = `${percent}%`
    }

    if (bar) bar.style.width = chosen ? `${percent}%` : '0%'
  }
}

export function initQuiz(config: WeddingConfig): void {
  const root = document.querySelector<HTMLElement>('[data-quiz]')
  if (!root) return

  const votes = readJson<VoteBook>(VOTES_KEY, {})
  const mine = readJson<MineBook>(MINE_KEY, {})
  const section = root.closest<HTMLElement>('.quiz-show')

  paintHud(section ?? root, mine)

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
      paintHud(section ?? root, mine)
    })
  }
}
