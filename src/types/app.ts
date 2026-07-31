export type ThemeMode = 'light' | 'dark'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type FlashcardMastery = 'mastered' | 'not mastered'

export type QuestionType =
  | 'single-choice'
  | 'multiple-choice'
  | 'true-false'
  | 'ordering'
  | 'matching'
  | 'scenario'

export interface Choice {
  id: string
  label: string
}

export interface Question {
  id: string
  topic: string
  subtopic: string
  difficulty: Difficulty
  type: QuestionType
  prompt: string
  choices?: Choice[]
  correctAnswer: string | string[]
  explanation: string
  reviewLessonId: string
  version: '8.1.45'
  sourceType: 'course-based' | 'generated-practice'
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  learningObjectives: string[]
  explanation: string
  terminology: string[]
  example: string
  whyItMatters: string
  commonMistakes: string[]
  examReminders: string[]
  knowledgeCheck: string[]
  practiceActivity: string
}

export interface Flashcard {
  id: string
  topic: string
  term: string
  answer: string
  difficulty: Difficulty
  example?: string
  mastered: boolean
}

export interface StudyModule {
  id: string
  title: string
  summary: string
  lessonCount: number
}

export interface StudyProgress {
  completedLessonIds: string[]
  masteredFlashcardIds: string[]
  flashcardReviews: Record<string, { mastered: boolean; dueAt: string | null; intervalDays: number }>
  quizAttempts: Array<{ topic: string; score: number; total: number; completedAt: string }>
  mockExamAttempts: Array<{ score: number; total: number; completedAt: string }>
  labCompletion: Record<string, boolean>
  labNotes: Record<string, string>
  confidence: number
  lastStudyAt: string | null
  studyDates: string[]
}

export interface UserSettings {
  theme: ThemeMode
  defaultQuizLength: 25 | 50 | 75 | 100
  timerEnabled: boolean
  questionDifficulty: Difficulty | 'mixed'
}

export interface AppState {
  progress: StudyProgress
  settings: UserSettings
}
