import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { lessons, quizQuestions } from '../data/curriculum'
import { scoreQuestionAnswer, shuffleQuestionChoices } from '../services/progress'
import { useStudyState } from '../state/study-state'
import type { Question } from '../types/app'

type AnswerState = Record<string, string | string[]>
type QuizMode = 'study' | 'quick' | 'review'

const getModuleOptions = () => lessons.map((lesson) => ({ id: lesson.id, title: lesson.title }))

export function QuizzesPage() {
  const { state, recordQuizAttempt } = useStudyState()
  const [searchParams, setSearchParams] = useSearchParams()
  const moduleOptions = getModuleOptions()
  const [activeLessonId, setActiveLessonId] = useState(moduleOptions[0]?.id ?? '')
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<QuizMode>('study')
  const [answers, setAnswers] = useState<AnswerState>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ score: number; total: number; missedLessons: string[]; missedQuestionIds: string[] } | null>(null)

  const questions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const moduleQuestions = quizQuestions.filter((question) => question.reviewLessonId === activeLessonId)
    const reviewQueue = mode === 'review'
      ? moduleQuestions.filter((question) => state.progress.recentMissedQuestionIds.includes(question.id))
      : moduleQuestions
    const modeQuestions = mode === 'quick' ? reviewQueue.slice(0, 3) : reviewQueue.length ? reviewQueue : moduleQuestions
    return modeQuestions.filter((question) => {
      if (!normalizedQuery) {
        return true
      }

      return `${question.prompt} ${question.topic} ${question.subtopic}`.toLowerCase().includes(normalizedQuery)
    }).map((question) => ({
      ...question,
      choices: question.choices ? shuffleQuestionChoices(question.choices) : undefined,
    }))
  }, [activeLessonId, mode, query, state.progress.recentMissedQuestionIds])

  useEffect(() => {
    const lessonId = searchParams.get('lesson')
    const nextMode = searchParams.get('mode')
    const searchQuery = searchParams.get('q')

    if (lessonId && lessons.some((lesson) => lesson.id === lessonId)) {
      setActiveLessonId(lessonId)
    }
    if (nextMode === 'study' || nextMode === 'quick' || nextMode === 'review') {
      setMode(nextMode)
    }
    if (searchQuery !== null) {
      setQuery(searchQuery)
    }
  }, [searchParams])

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams)
    if (activeLessonId) {
      nextParams.set('lesson', activeLessonId)
    }
    nextParams.set('mode', mode)
    if (query) {
      nextParams.set('q', query)
    } else {
      nextParams.delete('q')
    }
    setSearchParams(nextParams, { replace: true })
  }, [activeLessonId, mode, query])

  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId)

  const updateAnswer = (question: Question, value: string) => {
    if (question.type === 'multiple-choice') {
      const current = Array.isArray(answers[question.id]) ? (answers[question.id] as string[]) : []
      const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
      setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: next }))
      return
    }

    setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: value }))
  }

  const submitQuiz = () => {
    let score = 0
    const missedLessons: string[] = []
    const missedQuestionIds: string[] = []

    for (const question of questions) {
      const answer = answers[question.id]
      const isCorrect = scoreQuestionAnswer(question, Array.isArray(answer) ? answer : answer ?? '')
      if (isCorrect) {
        score += 1
      } else {
        missedQuestionIds.push(question.id)
      }

      if (!missedLessons.includes(question.reviewLessonId)) {
        missedLessons.push(question.reviewLessonId)
      }
    }

    const attempt = {
      topic: activeLesson?.title ?? 'Quiz',
      score,
      total: questions.length,
      completedAt: new Date().toISOString(),
      mode,
      missedQuestionIds,
    }
    recordQuizAttempt(attempt)
    setSubmitted(true)
    setResult({ score, total: questions.length, missedLessons, missedQuestionIds })
  }

  const clearQuiz = () => {
    setAnswers({})
    setSubmitted(false)
    setResult(null)
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <h2>Knowledge Quizzes</h2>
        <p>Choose a module, answer the questions, and review the explanation after you submit.</p>
        <div className="settings-grid">
          <label>
            Search questions
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a topic or prompt" />
          </label>
          <label>
            Practice mode
            <select value={mode} onChange={(event) => setMode(event.target.value as QuizMode)}>
              <option value="study">Study</option>
              <option value="quick">Quick check</option>
              <option value="review">Review misses</option>
            </select>
          </label>
        </div>
        <label>
          Module
          <select value={activeLessonId} onChange={(event) => { setActiveLessonId(event.target.value); clearQuiz() }}>
            {moduleOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="section-card">
        <h3>{activeLesson?.title}</h3>
        <p>{activeLesson?.explanation ?? 'Select a module to start.'}</p>
        <div className="hero-actions">
          <button type="button" className="secondary" onClick={() => setMode('review')}>Review misses</button>
          <button type="button" className="secondary" onClick={() => setMode('quick')}>Quick check</button>
          <button type="button" className="secondary" onClick={() => clearQuiz()}>Reset answers</button>
        </div>
      </section>

      <div className="quiz-stack">
        {questions.map((question, index) => (
          <article className="section-card" key={question.id}>
            <p className="eyebrow">Question {index + 1}</p>
            <h3>{question.prompt}</h3>
            <p>Difficulty {question.difficulty}</p>

            {question.type === 'multiple-choice' ? (
              <div className="answer-grid">
                {question.choices?.map((choice) => (
                  <label key={choice.id} className="answer-option">
                    <input
                      type="checkbox"
                      checked={Array.isArray(answers[question.id]) && (answers[question.id] as string[]).includes(choice.id)}
                      onChange={() => updateAnswer(question, choice.id)}
                    />
                    {choice.label}
                  </label>
                ))}
              </div>
            ) : (
              <div className="answer-grid">
                {question.choices?.map((choice) => (
                  <label key={choice.id} className="answer-option">
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === choice.id}
                      onChange={() => updateAnswer(question, choice.id)}
                    />
                    {choice.label}
                  </label>
                ))}
              </div>
            )}

            {submitted ? (
              <section className="quiz-review">
                <strong>
                  {scoreQuestionAnswer(question, Array.isArray(answers[question.id]) ? (answers[question.id] as string[]) : answers[question.id] ?? '')
                    ? 'Correct'
                    : 'Needs review'}
                </strong>
                <p>{question.explanation}</p>
                <p>Review lesson {question.reviewLessonId}</p>
              </section>
            ) : null}
          </article>
        ))}
      </div>

      <section className="section-card">
        <button type="button" onClick={submitQuiz} disabled={!questions.length}>
          Submit quiz
        </button>
        <button type="button" className="secondary" onClick={clearQuiz}>
          Clear answers
        </button>
      </section>

      {result ? (
        <section className="section-card">
          <h3>Score report</h3>
          <p>
            You scored {result.score} out of {result.total}.
          </p>
          <p>Missed lessons to review: {result.missedLessons.length ? result.missedLessons.join(', ') : 'None'}</p>
          <p>Missed questions: {result.missedQuestionIds.length ? result.missedQuestionIds.length : 'None'}</p>
          <p>The review mode keeps your missed questions ready for the next pass.</p>
        </section>
      ) : null}

      <section className="section-card">
        <h3>Quiz history</h3>
        <ul>
          {state.progress.quizAttempts.slice().reverse().map((attempt) => (
            <li key={`${attempt.topic}-${attempt.completedAt}`}>
              {attempt.topic} {attempt.score}/{attempt.total}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
