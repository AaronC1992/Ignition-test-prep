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

type DomainReadiness = {
  topic: string
  correct: number
  total: number
  percent: number
  risk: 'High risk' | 'Medium risk' | 'Low risk'
}

const lengths = [25, 50, 75, 100] as const
const secondsPerQuestion = 72

const toAnswerArray = (answer: string | string[] | undefined) =>
  Array.isArray(answer) ? answer : answer ? [answer] : []

const getChoiceStatus = (question: Question, choiceId: string) => {
  if (Array.isArray(question.correctAnswer)) {
    return question.correctAnswer.includes(choiceId)
  }

  return question.correctAnswer === choiceId
}

const getRiskLevel = (percent: number): DomainReadiness['risk'] => {
  if (percent < 65) {
    return 'High risk'
  }
  if (percent < 80) {
    return 'Medium risk'
  }
  return 'Low risk'
}

export function MockExamPage() {
  const { state, recordMockExamAttempt } = useStudyState()
  const [length, setLength] = useState<typeof lengths[number]>(state.settings.defaultQuizLength)
  const [difficulty, setDifficulty] = useState(state.settings.questionDifficulty)
  const [started, setStarted] = useState(false)
  const [examQuestions, setExamQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<AnswerState>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [timeLeft, setTimeLeft] = useState(length * secondsPerQuestion)

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

  useEffect(() => {
    if (!started || submitted) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [started, submitted])

  useEffect(() => {
    if (started && !submitted && timeLeft === 0) {
      submitExam()
    }
  }, [started, submitted, timeLeft])

  useEffect(() => {
    setTimeLeft(length * secondsPerQuestion)
  }, [length])

  const domainReadiness = useMemo<DomainReadiness[]>(() => {
    const breakdown = new Map<string, { correct: number; total: number }>()
    for (const question of examQuestions) {
      const current = breakdown.get(question.topic) ?? { correct: 0, total: 0 }
      const isCorrect = result?.answers[question.id] ?? false
      current.total += 1
      current.correct += isCorrect ? 1 : 0
      breakdown.set(question.topic, current)
    }
    return Array.from(breakdown.entries())
      .map(([topic, value]) => {
        const percent = value.total ? Math.round((value.correct / value.total) * 100) : 0
        return {
          topic,
          correct: value.correct,
          total: value.total,
          percent,
          risk: getRiskLevel(percent),
        }
      })
      .sort((a, b) => a.percent - b.percent)
  }, [examQuestions, result])

  const overallPercent = result ? Math.round((result.score / result.total) * 100) : 0
  const overallRisk = getRiskLevel(overallPercent)

  const activeQuestion = examQuestions[currentIndex]
  const activeAnswer = activeQuestion ? answers[activeQuestion.id] : undefined
  const canLockAnswer = Array.isArray(activeAnswer) ? activeAnswer.length > 0 : Boolean(activeAnswer)

  const startExam = () => {
    const filtered = filterByDifficulty(quizQuestions, difficulty)
    const questions = buildMockExam(filtered, length).map((question) => ({
      ...question,
      choices: question.choices ? shuffleQuestionChoices(question.choices) : undefined,
    }))

    setExamQuestions(questions)
    setAnswers({})
    setCurrentIndex(0)
    setSubmitted(false)
    setResult(null)
    setStarted(true)
    setTimeLeft(length * secondsPerQuestion)
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

  const lockAndContinue = () => {
    if (!activeQuestion || !canLockAnswer) {
      return
    }

    if (currentIndex >= examQuestions.length - 1) {
      submitExam()
      return
    }

    setCurrentIndex((current) => current + 1)
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
        <p className="simulator-note">Simulator timing is {secondsPerQuestion} seconds per question with one pass only.</p>
      </section>

      <section className="section-card">
        <h2>Full Exam Simulator</h2>
        <p>This mode is timed, gives one pass only, and shows your score report when finished.</p>
        <button type="button" onClick={startExam}>Start simulator</button>
        {started ? <p>{submitted ? 'Exam submitted' : `Question ${currentIndex + 1} of ${examQuestions.length}`}</p> : null}
        {started && !submitted ? <p>Time left {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p> : null}
      </section>

      {started && activeQuestion ? (
        <article className="section-card">
          <p className="eyebrow">One pass simulator</p>
          <h3>{activeQuestion.prompt}</h3>

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
            <button type="button" onClick={lockAndContinue} disabled={!canLockAnswer}>
              {currentIndex === examQuestions.length - 1 ? 'Lock answer and finish exam' : 'Lock answer and continue'}
            </button>
          </div>
        </article>
      ) : null}

      {result ? (
        <section className="section-card">
          <h3>Score report</h3>
          <p>{result.score} out of {result.total} correct</p>
          <p className={`risk-pill ${overallRisk === 'High risk' ? 'risk-high' : overallRisk === 'Medium risk' ? 'risk-medium' : 'risk-low'}`}>
            Overall readiness: {overallPercent}% • {overallRisk}
          </p>

          <h3>Domain readiness scoring</h3>
          <ul>
            {domainReadiness.map((domain) => (
              <li key={domain.topic}>
                <strong>{domain.topic}</strong> {domain.correct}/{domain.total} ({domain.percent}%)
                {' '}
                <span className={`risk-pill ${domain.risk === 'High risk' ? 'risk-high' : domain.risk === 'Medium risk' ? 'risk-medium' : 'risk-low'}`}>
                  {domain.risk}
                </span>
              </li>
            ))}
          </ul>

          <h3>Distractor analysis for missed questions</h3>
          <div className="quiz-stack">
            {result.missedQuestions.map((question) => (
              <article className="section-card" key={question.id}>
                <h4>{question.prompt}</h4>
                <p>Needs review</p>
                <ul className="distractor-list">
                  {(question.choices ?? []).map((choice) => {
                    const isCorrectChoice = getChoiceStatus(question, choice.id)
                    const isSelectedChoice = toAnswerArray(answers[question.id]).includes(choice.id)

                    let rationale = `Incorrect option. ${question.explanation}`
                    if (isCorrectChoice) {
                      rationale = `Correct option. ${question.explanation}`
                    } else if (isSelectedChoice) {
                      rationale = `Selected but incorrect. ${question.explanation}`
                    }

                    return (
                      <li key={choice.id}>
                        <strong>{choice.id}.</strong> {choice.label}
                        {' '}
                        <span>{isCorrectChoice ? 'Right' : 'Wrong'}</span>
                        {' '}
                        <div>{rationale}</div>
                      </li>
                    )
                  })}
                </ul>
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
