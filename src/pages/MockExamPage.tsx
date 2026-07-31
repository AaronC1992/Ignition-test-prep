import { useEffect, useMemo, useState } from 'react'
import { quizQuestions } from '../data/curriculum'
import { buildMockExam, filterByDifficulty, scoreQuestionAnswer, shuffleQuestionChoices } from '../services/progress'
import { useStudyState } from '../state/study-state'
import type { Question } from '../types/app'

type AnswerState = Record<string, string | string[]>

type ExamResult = {
  score: number
  total: number
  answers: Record<string, boolean>
  missedQuestions: Question[]
}

const lengths = [25, 50, 75, 100] as const

export function MockExamPage() {
  const { state, recordMockExamAttempt } = useStudyState()
  const [length, setLength] = useState<typeof lengths[number]>(state.settings.defaultQuizLength)
  const [difficulty, setDifficulty] = useState(state.settings.questionDifficulty)
  const [timerOn, setTimerOn] = useState(state.settings.timerEnabled)
  const [timerMinutes, setTimerMinutes] = useState(30)
  const [started, setStarted] = useState(false)
  const [examQuestions, setExamQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<AnswerState>({})
  const [flagged, setFlagged] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60)

  useEffect(() => {
    if (!started || !timerOn || submitted) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [started, timerOn, submitted])

  useEffect(() => {
    if (timerOn) {
      setTimeLeft(timerMinutes * 60)
    }
  }, [timerMinutes, timerOn])

  const topicBreakdown = useMemo(() => {
    const breakdown = new Map<string, { correct: number; total: number }>()
    for (const question of examQuestions) {
      const current = breakdown.get(question.topic) ?? { correct: 0, total: 0 }
      const isCorrect = result?.answers[question.id] ?? false
      current.total += 1
      current.correct += isCorrect ? 1 : 0
      breakdown.set(question.topic, current)
    }
    return Array.from(breakdown.entries())
  }, [examQuestions, result])

  const activeQuestion = examQuestions[currentIndex]

  const startExam = () => {
    const filtered = filterByDifficulty(quizQuestions, difficulty)
    const questions = buildMockExam(filtered, length).map((question) => ({
      ...question,
      choices: question.choices ? shuffleQuestionChoices(question.choices) : undefined,
    }))

    setExamQuestions(questions)
    setAnswers({})
    setFlagged([])
    setCurrentIndex(0)
    setSubmitted(false)
    setResult(null)
    setStarted(true)
    setTimeLeft(timerMinutes * 60)
  }

  const saveAnswer = (question: Question, value: string) => {
    if (question.type === 'multiple-choice') {
      const current = Array.isArray(answers[question.id]) ? (answers[question.id] as string[]) : []
      const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
      setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: next }))
      return
    }

    setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: value }))
  }

  const toggleFlag = (questionId: string) => {
    setFlagged((current) => (current.includes(questionId) ? current.filter((item) => item !== questionId) : [...current, questionId]))
  }

  const submitExam = () => {
    const answerResults: Record<string, boolean> = {}
    const missedQuestions: Question[] = []
    let score = 0

    for (const question of examQuestions) {
      const answer = answers[question.id]
      const isCorrect = scoreQuestionAnswer(question, Array.isArray(answer) ? answer : answer ?? '')
      answerResults[question.id] = isCorrect
      if (isCorrect) {
        score += 1
      } else {
        missedQuestions.push(question)
      }
    }

    const completedAt = new Date().toISOString()
    const attempt = { score, total: examQuestions.length, completedAt }
    recordMockExamAttempt(attempt)
    setResult({ score, total: examQuestions.length, answers: answerResults, missedQuestions })
    setSubmitted(true)
  }

  const createStudyPlan = () => {
    if (!result) {
      return []
    }

    return Array.from(new Set(result.missedQuestions.map((question) => question.reviewLessonId)))
  }

  return (
    <div className="page-stack">
      <section className="section-card settings-grid">
        <label>
          Exam length
          <select value={length} onChange={(event) => setLength(Number(event.target.value) as typeof lengths[number])}>
            {lengths.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label>
          Difficulty
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as typeof difficulty)}>
            <option value="mixed">Mixed</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label>
          Timer
          <select value={timerOn ? 'on' : 'off'} onChange={(event) => setTimerOn(event.target.value === 'on')}>
            <option value="off">Off</option>
            <option value="on">On</option>
          </select>
        </label>
        <label>
          Timer minutes
          <input type="number" min={5} value={timerMinutes} onChange={(event) => setTimerMinutes(Number(event.target.value))} />
        </label>
      </section>

      <section className="section-card">
        <h2>Mock Written Exam</h2>
        <p>This is an unofficial practice exam. It does not claim any official certification score or time rule.</p>
        <button type="button" onClick={startExam}>Start exam</button>
        {started ? <p>{submitted ? 'Exam submitted' : `Question ${currentIndex + 1} of ${examQuestions.length}`}</p> : null}
        {timerOn && started && !submitted ? <p>Time left {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p> : null}
      </section>

      {started && activeQuestion ? (
        <article className="section-card">
          <p className="eyebrow">Flagged {flagged.includes(activeQuestion.id) ? 'Yes' : 'No'}</p>
          <h3>{activeQuestion.prompt}</h3>
          <button type="button" className="secondary" onClick={() => toggleFlag(activeQuestion.id)}>
            {flagged.includes(activeQuestion.id) ? 'Unflag for review' : 'Flag for review'}
          </button>

          <div className="answer-grid">
            {activeQuestion.choices?.map((choice) => (
              <label key={choice.id} className="answer-option">
                <input
                  type={activeQuestion.type === 'multiple-choice' ? 'checkbox' : 'radio'}
                  name={activeQuestion.id}
                  checked={Array.isArray(answers[activeQuestion.id]) ? (answers[activeQuestion.id] as string[]).includes(choice.id) : answers[activeQuestion.id] === choice.id}
                  onChange={() => saveAnswer(activeQuestion, choice.id)}
                />
                {choice.label}
              </label>
            ))}
          </div>

          <div className="hero-actions">
            <button type="button" className="secondary" onClick={() => setCurrentIndex((current) => Math.max(0, current - 1))}>Previous</button>
            <button type="button" className="secondary" onClick={() => setCurrentIndex((current) => Math.min(examQuestions.length - 1, current + 1))}>Next</button>
            <button type="button" onClick={submitExam}>Submit exam</button>
          </div>
        </article>
      ) : null}

      {result ? (
        <section className="section-card">
          <h3>Score report</h3>
          <p>{result.score} out of {result.total} correct</p>
          <p>Topic breakdown</p>
          <ul>
            {topicBreakdown.map(([topic, breakdown]) => (
              <li key={topic}>{topic} {breakdown.correct}/{breakdown.total}</li>
            ))}
          </ul>

          <h3>Review every answer</h3>
          <div className="quiz-stack">
            {examQuestions.map((question) => (
              <article className="section-card" key={question.id}>
                <h4>{question.prompt}</h4>
                <p>{result.answers[question.id] ? 'Correct' : 'Needs review'}</p>
                <p>{question.explanation}</p>
              </article>
            ))}
          </div>

          <h3>Study plan from missed questions</h3>
          <ul>
            {createStudyPlan().map((lessonId) => <li key={lessonId}>{lessonId}</li>)}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
