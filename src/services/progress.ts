import type { AppState, Difficulty, Flashcard, Question, StudyModule } from '../types/app'
import { studyGuideMetaByLessonId } from '../data/studyGuide'

export interface ProgressSummary {
  completionPercentage: number
  lessonsCompleted: number
  flashcardsMastered: number
  quizAverage: number
  mockAverage: number
  labsCompleted: number
  topicsNeedingReview: string[]
  readinessLabel: 'Beginning' | 'Developing' | 'Nearly Ready' | 'Practice-Test Ready'
}

export interface TopicAccuracy {
  topic: string
  correct: number
  total: number
}

export interface WeakAreaRecommendation {
  lessonIds: string[]
  flashcardIds: string[]
  labIds: string[]
  quizTopic: string
}

export const buildTopicAccuracy = (attempts: Array<{ topic: string; score: number; total: number }>) => {
  const grouped = new Map<string, TopicAccuracy>()

  for (const attempt of attempts) {
    const existing = grouped.get(attempt.topic) ?? { topic: attempt.topic, correct: 0, total: 0 }
    existing.correct += attempt.score
    existing.total += attempt.total
    grouped.set(attempt.topic, existing)
  }

  return Array.from(grouped.values())
}

export const calculateAverage = (values: number[]) => {
  if (!values.length) {
    return 0
  }

  return Math.round((values.reduce((total, value) => total + value, 0) / values.length) * 10) / 10
}

export const calculateStudyStreak = (studyDates: string[]) => {
  const uniqueDates = Array.from(new Set(studyDates)).sort().reverse()
  if (!uniqueDates.length) {
    return 0
  }

  let streak = 0
  let current = new Date()

  for (const date of uniqueDates) {
    const day = current.toISOString().slice(0, 10)
    if (date !== day) {
      break
    }

    streak += 1
    current.setDate(current.getDate() - 1)
  }

  return Math.max(1, streak)
}

export const calculateProgressSummary = (
  modules: StudyModule[],
  flashcards: Flashcard[],
  state: AppState,
): ProgressSummary => {
  const lessonsCompleted = state.progress.completedLessonIds.length
  const flashcardsMastered = state.progress.masteredFlashcardIds.length
  const quizAverage = calculateAverage(
    state.progress.quizAttempts.map((attempt) => (attempt.score / attempt.total) * 100),
  )
  const mockAverage = calculateAverage(
    state.progress.mockExamAttempts.map((attempt) => (attempt.score / attempt.total) * 100),
  )
  const labsCompleted = Object.values(state.progress.labCompletion).filter(Boolean).length
  const totalLessons = modules.reduce((sum, module) => sum + module.lessonCount, 0)
  const totalFlashcards = flashcards.length || 1
  const totalWork = totalLessons + totalFlashcards
  const doneWork = lessonsCompleted + flashcardsMastered
  const completionPercentage = Math.min(100, Math.round((doneWork / totalWork) * 100))
  const readinessScore = completionPercentage * 0.35 + quizAverage * 0.25 + mockAverage * 0.25 + labsCompleted * 3
  const topicAccuracy = buildTopicAccuracy(state.progress.quizAttempts)
  const topicsNeedingReview = identifyWeakTopics(topicAccuracy).map((entry) => entry.topic)

  const readinessLabel =
    readinessScore < 25
      ? 'Beginning'
      : readinessScore < 50
        ? 'Developing'
        : readinessScore < 75
          ? 'Nearly Ready'
          : 'Practice-Test Ready'

  return {
    completionPercentage,
    lessonsCompleted,
    flashcardsMastered,
    quizAverage,
    mockAverage,
    labsCompleted,
    topicsNeedingReview,
    readinessLabel,
  }
}

export const isFlashcardDue = (dueAt: string | null) => {
  if (!dueAt) {
    return true
  }

  return new Date(dueAt).getTime() <= Date.now()
}

export const nextFlashcardReview = (attempts: number) => {
  const intervals = [0, 1, 3, 7, 14]
  return intervals[Math.min(attempts, intervals.length - 1)]
}

const normalizeRecommendationText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

const scoreLessonMatch = (topic: string, lessonTitle: string) => {
  const topicTokens = new Set(normalizeRecommendationText(topic))
  const titleTokens = normalizeRecommendationText(lessonTitle)
  const exactMatch = titleTokens.join(' ') === normalizeRecommendationText(topic).join(' ')
  if (exactMatch) {
    return 100
  }

  const tokenOverlap = titleTokens.filter((token) => topicTokens.has(token)).length
  const titleContainsTopic = titleTokens.join(' ').includes(normalizeRecommendationText(topic).join(' '))
  const topicContainsTitle = normalizeRecommendationText(topic).join(' ').includes(titleTokens.join(' '))

  if (titleContainsTopic || topicContainsTitle) {
    return 80 + tokenOverlap
  }

  return tokenOverlap * 10
}

export const buildWeakAreaRecommendation = ({
  topics,
  lessons,
  flashcards,
  labs,
}: {
  topics: TopicAccuracy[]
  lessons: Array<{ id: string; title: string }>
  flashcards: Flashcard[]
  labs: Array<{ id: string; title: string }>
}): WeakAreaRecommendation => {
  const weakestTopic = [...topics].sort((a, b) => (a.correct / a.total) - (b.correct / b.total))[0]
  const quizTopic = weakestTopic?.topic ?? 'Ignition Architecture'
  const matchedLessons = lessons
    .map((lesson) => ({ lesson, score: scoreLessonMatch(quizTopic, lesson.title) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  const lessonIds = matchedLessons.slice(0, 3).map(({ lesson }) => lesson.id)
  const flashcardIds = flashcards
    .filter((card) => {
      const cardTopicTokens = normalizeRecommendationText(card.topic)
      const topicTokens = normalizeRecommendationText(quizTopic)
      const topicOverlap = cardTopicTokens.filter((token) => topicTokens.includes(token)).length
      const lessonMatch = lessonIds.includes(card.lessonId)
      return lessonMatch || topicOverlap > 0 || card.topic === quizTopic
    })
    .map((card) => card.id)
  const labIds = Array.from(new Set(lessonIds.flatMap((lessonId) => studyGuideMetaByLessonId[lessonId]?.relatedLabIds ?? []))).filter((labId) =>
    labs.some((lab) => lab.id === labId),
  )

  return { lessonIds, flashcardIds, labIds, quizTopic }
}

export const identifyWeakTopics = (accuracy: TopicAccuracy[], threshold = 75) =>
  accuracy.filter((entry) => entry.total > 0 && (entry.correct / entry.total) * 100 < threshold)

export const scoreQuestionAnswer = (question: Question, answer: string | string[]) => {
  if (Array.isArray(question.correctAnswer)) {
    if (Array.isArray(answer)) {
      const expected = [...question.correctAnswer].sort().join('|')
      const received = [...answer].sort().join('|')
      return expected === received
    }

    return question.correctAnswer.length === 1 && question.correctAnswer[0] === answer
  }

  if (Array.isArray(answer)) {
    return answer.length === 1 && answer[0] === question.correctAnswer
  }

  return question.correctAnswer === answer
}

export const buildMockExam = (questions: Question[], desiredLength: number) => {
  const pool = [...questions].sort(() => Math.random() - 0.5)
  return pool.slice(0, Math.min(desiredLength, pool.length))
}

export const shuffleQuestionChoices = <T,>(values: T[]) => [...values].sort(() => Math.random() - 0.5)

export const filterByDifficulty = (questions: Question[], difficulty?: Difficulty | 'mixed') =>
  difficulty && difficulty !== 'mixed'
    ? questions.filter((question) => question.difficulty === difficulty)
    : questions
