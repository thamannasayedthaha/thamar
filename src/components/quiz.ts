import type { QuizQuestion, WeddingConfig } from '../types'

const ANSWERS_KEY = 'thamar-quiz-answers-v2'

const LETTERS = ['A', 'B', 'C', 'D', 'E']

type AnswerBook = Record<string, string>

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

function countCorrect(questions: QuizQuestion[], answers: AnswerBook): number {
  return questions.reduce((sum, question) => {
    return sum + (answers[question.id] === question.answerId ? 1 : 0)
  }, 0)
}

function resultCopy(correct: number, total: number): { title: string; blurb: string } {
  const ratio = total === 0 ? 0 : correct / total

  if (correct === total) {
    return {
      title: 'You were on the ridge with us',
      blurb: 'Full marks. Save a seat at the tea room — you clearly already know the way.',
    }
  }
  if (ratio >= 0.75) {
    return {
      title: 'Almost family',
      blurb: 'A couple of misses, but the story still lands. We would hike with you again.',
    }
  }
  if (ratio >= 0.5) {
    return {
      title: 'Solid acquaintance',
      blurb: 'You know enough to order the next round. The rest is classified wedding intel.',
    }
  }
  if (ratio >= 0.25) {
    return {
      title: 'Warming up',
      blurb: 'A few lucky guesses, a few beautiful wrong turns. Come find us and claim a rematch over tea.',
    }
  }
  return {
    title: 'Beautiful stranger',
    blurb: 'Wrong answers still count as guest energy. Stick around — the real stories are better than the quiz.',
  }
}

const LIGHT_BULB = `
  <svg class="quiz-show__bulb" viewBox="0 0 28 34" aria-hidden="true" focusable="false">
    <line class="quiz-show__bulb-stem" x1="14" y1="0" x2="14" y2="5"/>
    <circle class="quiz-show__bulb-glass" cx="14" cy="14" r="9.2"/>
    <ellipse class="quiz-show__bulb-shine" cx="10.5" cy="10.5" rx="2.4" ry="3.2"/>
    <rect class="quiz-show__bulb-collar" x="10.2" y="22.4" width="7.6" height="2.2" rx="0.6"/>
    <path class="quiz-show__bulb-base" d="M11 24.6h6v2.2c0 1.4-1.3 2.5-3 2.5s-3-1.1-3-2.5z"/>
  </svg>
`

function renderQuestion(question: QuizQuestion, index: number, total: number): string {
  const round = String(index + 1).padStart(2, '0')

  const options = question.options
    .map(
      (option, optionIndex) => `
        <button type="button" class="quiz__option" data-quiz-option="${option.id}">
          <span class="quiz__key" aria-hidden="true">${LETTERS[optionIndex] ?? '?'}</span>
          <span class="quiz__option-body">
            <span class="quiz__option-label">${option.label}</span>
          </span>
          <span class="quiz__option-mark" data-quiz-mark="${option.id}" hidden aria-hidden="true"></span>
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
        <span class="quiz__reveal-kicker label-caps" data-quiz-result>From the couple</span>
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
  const lights = config.quiz.questions
    .map((_, index) => `<span class="quiz-show__light" data-quiz-light="${index}">${LIGHT_BULB}</span>`)
    .join('')

  return `
    <section class="section quiz quiz-show" id="quiz" aria-labelledby="quiz-heading">
      <div class="quiz-show__stage">
        <div class="quiz-show__marquee">
          <span
            class="quiz-show__lights"
            data-quiz-lights
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin="0"
            aria-valuemax="${total}"
            aria-valuenow="0"
          >${lights}</span>
        </div>

        <header class="quiz-show__header">
          <p class="quiz-show__kicker label-caps">Pop quiz time</p>
          <h2 id="quiz-heading" class="quiz-show__title">${config.quiz.title}</h2>
          <p class="quiz-show__lede">${config.quiz.lede}</p>
        </header>

        <div class="quiz-show__hud" aria-live="polite">
          <div class="quiz-show__score">
            <span class="quiz-show__score-label label-caps">Score</span>
            <span class="quiz-show__score-value" data-quiz-score>0</span>
            <span class="quiz-show__score-total">/ ${total}</span>
          </div>
          <div class="quiz-show__progress" data-quiz-progress aria-hidden="true">${pips}</div>
        </div>

        <div class="quiz__list" data-quiz>
          ${config.quiz.questions.map((question, index) => renderQuestion(question, index, total)).join('')}
        </div>

        <aside class="quiz-show__finale" data-quiz-finale hidden>
          <p class="quiz-show__finale-kicker label-caps">Your result</p>
          <p class="quiz-show__finale-score">
            <span data-quiz-finale-score>0</span>
            <span class="quiz-show__finale-of">/ ${total}</span>
          </p>
          <h3 class="quiz-show__finale-title" data-quiz-finale-title></h3>
          <p class="quiz-show__finale-blurb" data-quiz-finale-blurb></p>
          <button type="button" class="quiz-show__finale-retry" data-quiz-retry>
            Take it again
          </button>
        </aside>
      </div>
    </section>
  `
}

function paintHud(root: HTMLElement, questions: QuizQuestion[], answers: AnswerBook) {
  const total = questions.length
  const answered = Object.keys(answers).length
  const correct = countCorrect(questions, answers)
  const score = root.querySelector<HTMLElement>('[data-quiz-score]')
  if (score) score.textContent = String(correct)

  const lights = root.querySelector<HTMLElement>('[data-quiz-lights]')
  if (lights) {
    lights.setAttribute('aria-valuenow', String(answered))
    lights.classList.toggle('is-complete', total > 0 && answered >= total)
  }

  questions.forEach((question, index) => {
    const chosen = answers[question.id]
    const isCorrect = chosen === question.answerId
    const light = root.querySelector<HTMLElement>(`[data-quiz-light="${index}"]`)
    const pip = root.querySelector<HTMLElement>(`[data-quiz-pip="${index}"]`)

    if (light) {
      light.classList.toggle('is-on', Boolean(chosen))
      light.classList.remove('is-miss')
    }

    if (pip) {
      pip.classList.toggle('is-done', Boolean(chosen) && isCorrect)
      pip.classList.toggle('is-miss', Boolean(chosen) && !isCorrect)
    }
  })

  paintFinale(root, questions, answers)
}

function paintFinale(root: HTMLElement, questions: QuizQuestion[], answers: AnswerBook) {
  const finale = root.querySelector<HTMLElement>('[data-quiz-finale]')
  if (!finale) return

  const total = questions.length
  const complete = total > 0 && Object.keys(answers).length >= total
  finale.hidden = !complete
  if (!complete) return

  const correct = countCorrect(questions, answers)
  const copy = resultCopy(correct, total)
  const score = finale.querySelector<HTMLElement>('[data-quiz-finale-score]')
  const title = finale.querySelector<HTMLElement>('[data-quiz-finale-title]')
  const blurb = finale.querySelector<HTMLElement>('[data-quiz-finale-blurb]')

  if (score) score.textContent = String(correct)
  if (title) title.textContent = copy.title
  if (blurb) blurb.textContent = copy.blurb
}

function paintQuestion(article: HTMLElement, question: QuizQuestion, answers: AnswerBook) {
  const chosen = answers[question.id]
  const isCorrect = chosen === question.answerId

  article.classList.toggle('quiz__round--answered', Boolean(chosen))
  article.classList.toggle('quiz__round--correct', Boolean(chosen) && isCorrect)
  article.classList.toggle('quiz__round--wrong', Boolean(chosen) && !isCorrect)

  const note = article.querySelector<HTMLElement>('[data-quiz-note]')
  const result = article.querySelector<HTMLElement>('[data-quiz-result]')
  if (note) note.hidden = !chosen
  if (result && chosen) {
    result.textContent = isCorrect ? 'Correct' : 'Not quite'
  }

  for (const button of article.querySelectorAll<HTMLButtonElement>('[data-quiz-option]')) {
    const id = button.dataset.quizOption ?? ''
    const mark = button.querySelector<HTMLElement>('[data-quiz-mark]')
    const isAnswer = id === question.answerId
    const isPicked = chosen === id

    button.classList.toggle('quiz__option--picked', isPicked)
    button.classList.toggle('quiz__option--correct', Boolean(chosen) && isAnswer)
    button.classList.toggle('quiz__option--wrong', Boolean(chosen) && isPicked && !isAnswer)
    button.disabled = Boolean(chosen)

    if (mark) {
      const show = Boolean(chosen) && (isAnswer || isPicked)
      mark.hidden = !show
      mark.textContent = isAnswer ? '✓' : isPicked ? '✕' : ''
    }
  }
}

export function initQuiz(config: WeddingConfig): void {
  const root = document.querySelector<HTMLElement>('[data-quiz]')
  if (!root) return

  const answers = readJson<AnswerBook>(ANSWERS_KEY, {})
  const section = root.closest<HTMLElement>('.quiz-show')
  const hud = section ?? root
  const questions = config.quiz.questions

  const refresh = () => {
    paintHud(hud, questions, answers)
    for (const question of questions) {
      const article = root.querySelector<HTMLElement>(`[data-quiz-question="${question.id}"]`)
      if (article) paintQuestion(article, question, answers)
    }
  }

  refresh()

  for (const question of questions) {
    const article = root.querySelector<HTMLElement>(`[data-quiz-question="${question.id}"]`)
    if (!article) continue

    article.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-quiz-option]')
      if (!target || answers[question.id]) return

      const optionId = target.dataset.quizOption
      if (!optionId) return

      answers[question.id] = optionId
      writeJson(ANSWERS_KEY, answers)
      paintQuestion(article, question, answers)
      paintHud(hud, questions, answers)

      if (Object.keys(answers).length >= questions.length) {
        hud.querySelector<HTMLElement>('[data-quiz-finale]')?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    })
  }

  hud.querySelector('[data-quiz-retry]')?.addEventListener('click', () => {
    for (const key of Object.keys(answers)) delete answers[key]
    writeJson(ANSWERS_KEY, answers)
    refresh()
    hud.querySelector<HTMLElement>('[data-quiz]')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}
