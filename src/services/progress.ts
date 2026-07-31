import type { AppState, Difficulty, Flashcard, Question, StudyModule } from '../types/app'

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
  const topicKey = quizTopic.toLowerCase().split(' ')[0] ?? quizTopic.toLowerCase()
  const lessonIds = lessons
    .filter((lesson) => quizTopic.toLowerCase().includes((lesson.title.toLowerCase().split(':')[0] ?? lesson.title.toLowerCase()).toLowerCase()))
    .map((lesson) => lesson.id)
  const flashcardIds = flashcards
    .filter((card) => card.topic.toLowerCase().includes(topicKey))
    .map((card) => card.id)
  const labIds = labs.map((lab) => lab.id).slice(0, 1)

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
