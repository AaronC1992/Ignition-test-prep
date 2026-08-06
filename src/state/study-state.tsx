import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { lessons, quizQuestions } from '../data/curriculum'
import { flashcards } from '../data/flashcards'
import { modules } from '../data/modules'
import {
  defaultAppState,
  exportAppState,
  importAppState,
  loadAppState,
  saveAppState,
} from '../services/localStorage'
import { buildAdaptiveStudyPlan, buildTopicAccuracy, calculateProgressSummary, identifyWeakTopics } from '../services/progress'
import { applyTheme } from '../services/theme'
import type { AppState, Lesson, Question, QuizMode, UserSettings } from '../types/app'

type QuizAttempt = { topic: string; score: number; total: number; completedAt: string; mode: QuizMode; missedQuestionIds: string[] }

type StudyStateContextValue = {
  state: AppState
  summary: ReturnType<typeof calculateProgressSummary>
  lessons: Lesson[]
  questions: Question[]
  exportState: () => string
  importState: (payload: string) => void
  resetState: () => void
  completeLesson: (lessonId: string) => void
  setLessonCompleted: (lessonId: string, completed: boolean) => void
  recordQuizAttempt: (attempt: QuizAttempt) => void
  recordMockExamAttempt: (attempt: { score: number; total: number; completedAt: string }) => void
  updateSettings: (settings: Partial<UserSettings>) => void
  toggleFlashcardMastery: (flashcardId: string, mastered: boolean) => void
  toggleLessonBookmark: (lessonId: string, bookmarked: boolean) => void
  setLessonNote: (lessonId: string, note: string) => void
  setLabCompletion: (labId: string, completed: boolean) => void
  setLabNote: (labId: string, note: string) => void
  resetLab: (labId: string) => void
  weakTopics: Array<{ topic: string; correct: number; total: number }>
  studyPlan: ReturnType<typeof buildAdaptiveStudyPlan>
}

const studyDay = (value: string) => value.slice(0, 10)

const bumpStudyCount = (progress: AppState['progress'], timestamp: string) => {
  const day = studyDay(timestamp)
  if (progress.dailyStudy.date === day) {
    return { date: day, count: progress.dailyStudy.count + 1 }
  }

  return { date: day, count: 1 }
}

const StudyStateContext = createContext<StudyStateContextValue | null>(null)

export function StudyStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadAppState())

  useEffect(() => {
    saveAppState(state)
  }, [state])

  useEffect(() => {
    applyTheme(state.settings.theme)
  }, [state.settings.theme])

  const topicAccuracy = useMemo(() => buildTopicAccuracy(state.progress.quizAttempts), [state.progress.quizAttempts])
  const weakTopics = useMemo(() => identifyWeakTopics(topicAccuracy), [topicAccuracy])
  const summary = useMemo(() => calculateProgressSummary(modules, flashcards, state), [state])
  const studyPlan = useMemo(() => buildAdaptiveStudyPlan({ state, lessons, flashcards }), [state])

  const value = useMemo<StudyStateContextValue>(() => ({
    state,
    summary,
    lessons,
    questions: quizQuestions,
    exportState: () => exportAppState(state),
    importState: (payload: string) => {
      setState(importAppState(payload))
    },
    resetState: () => setState(defaultAppState()),
    completeLesson: (lessonId: string) => {
      setState((current) => {
        if (current.progress.completedLessonIds.includes(lessonId)) {
          return current
        }

        const today = new Date().toISOString()

        return {
          ...current,
          progress: {
            ...current.progress,
            completedLessonIds: [...current.progress.completedLessonIds, lessonId],
            dailyStudy: bumpStudyCount(current.progress, today),
            lastStudyAt: today,
            studyDates: Array.from(new Set([...current.progress.studyDates, studyDay(today)])),
          },
        }
      })
    },
    setLessonCompleted: (lessonId: string, completed: boolean) => {
      const today = new Date().toISOString()

      setState((current) => ({
        ...current,
        progress: {
          ...current.progress,
          completedLessonIds: completed
            ? Array.from(new Set([...current.progress.completedLessonIds, lessonId]))
            : current.progress.completedLessonIds.filter((entry) => entry !== lessonId),
          dailyStudy: completed ? bumpStudyCount(current.progress, today) : current.progress.dailyStudy,
          lastStudyAt: today,
          studyDates: completed
            ? Array.from(new Set([...current.progress.studyDates, studyDay(today)]))
            : current.progress.studyDates,
        },
      }))
    },
    recordQuizAttempt: (attempt: QuizAttempt) => {
      const completedAt = attempt.completedAt
      setState((current) => ({
        ...current,
        progress: {
          ...current.progress,
          quizAttempts: [...current.progress.quizAttempts, attempt],
          recentMissedQuestionIds: attempt.missedQuestionIds,
          dailyStudy: bumpStudyCount(current.progress, completedAt),
          lastStudyAt: completedAt,
          studyDates: Array.from(new Set([...current.progress.studyDates, studyDay(completedAt)])),
        },
      }))
    },
    recordMockExamAttempt: (attempt) => {
      const completedAt = attempt.completedAt
      setState((current) => ({
        ...current,
        progress: {
          ...current.progress,
          mockExamAttempts: [...current.progress.mockExamAttempts, attempt],
          dailyStudy: bumpStudyCount(current.progress, completedAt),
          lastStudyAt: completedAt,
          studyDates: Array.from(new Set([...current.progress.studyDates, studyDay(completedAt)])),
        },
      }))
    },
    updateSettings: (settings: Partial<UserSettings>) => {
      setState((current) => ({
        ...current,
        settings: {
          ...current.settings,
          ...settings,
        },
      }))
    },
    toggleFlashcardMastery: (flashcardId: string, mastered: boolean) => {
      const completedAt = new Date().toISOString()
      setState((current) => {
        const existing = current.progress.flashcardReviews[flashcardId] ?? { mastered: false, dueAt: null, intervalDays: 0 }
        const nextInterval = mastered ? Math.min(existing.intervalDays + 1, 14) : 0
        const dueAt = mastered ? new Date(Date.now() + nextInterval * 86400000).toISOString() : completedAt

        return {
          ...current,
          progress: {
            ...current.progress,
            masteredFlashcardIds: mastered
              ? Array.from(new Set([...current.progress.masteredFlashcardIds, flashcardId]))
              : current.progress.masteredFlashcardIds.filter((entry) => entry !== flashcardId),
            flashcardReviews: {
              ...current.progress.flashcardReviews,
              [flashcardId]: { mastered, dueAt, intervalDays: nextInterval },
            },
            dailyStudy: bumpStudyCount(current.progress, completedAt),
            lastStudyAt: completedAt,
            studyDates: Array.from(new Set([...current.progress.studyDates, studyDay(completedAt)])),
          },
        }
      })
    },
    toggleLessonBookmark: (lessonId: string, bookmarked: boolean) => {
      const completedAt = new Date().toISOString()
      setState((current) => ({
        ...current,
        progress: {
          ...current.progress,
          lessonBookmarks: bookmarked
            ? Array.from(new Set([...current.progress.lessonBookmarks, lessonId]))
            : current.progress.lessonBookmarks.filter((entry) => entry !== lessonId),
          dailyStudy: bumpStudyCount(current.progress, completedAt),
          lastStudyAt: completedAt,
          studyDates: Array.from(new Set([...current.progress.studyDates, studyDay(completedAt)])),
        },
      }))
    },
    setLessonNote: (lessonId: string, note: string) => {
      const completedAt = new Date().toISOString()
      setState((current) => ({
        ...current,
        progress: {
          ...current.progress,
          lessonNotes: {
            ...current.progress.lessonNotes,
            [lessonId]: note,
          },
          dailyStudy: bumpStudyCount(current.progress, completedAt),
          lastStudyAt: completedAt,
          studyDates: Array.from(new Set([...current.progress.studyDates, studyDay(completedAt)])),
        },
      }))
    },
    setLabCompletion: (labId: string, completed: boolean) => {
      const completedAt = new Date().toISOString()
      setState((current) => ({
        ...current,
        progress: {
          ...current.progress,
          labCompletion: {
            ...current.progress.labCompletion,
            [labId]: completed,
          },
          dailyStudy: bumpStudyCount(current.progress, completedAt),
          lastStudyAt: completedAt,
          studyDates: Array.from(new Set([...current.progress.studyDates, studyDay(completedAt)])),
        },
      }))
    },
    setLabNote: (labId: string, note: string) => {
      const completedAt = new Date().toISOString()
      setState((current) => ({
        ...current,
        progress: {
          ...current.progress,
          labNotes: {
            ...current.progress.labNotes,
            [labId]: note,
          },
          dailyStudy: bumpStudyCount(current.progress, completedAt),
          lastStudyAt: completedAt,
          studyDates: Array.from(new Set([...current.progress.studyDates, studyDay(completedAt)])),
        },
      }))
    },
    resetLab: (labId: string) => {
      const completedAt = new Date().toISOString()
      setState((current) => {
        const nextCompletion = { ...current.progress.labCompletion }
        delete nextCompletion[labId]
        const nextNotes = { ...current.progress.labNotes }
        delete nextNotes[labId]

        return {
          ...current,
          progress: {
            ...current.progress,
            labCompletion: nextCompletion,
            labNotes: nextNotes,
            dailyStudy: bumpStudyCount(current.progress, completedAt),
            lastStudyAt: completedAt,
            studyDates: Array.from(new Set([...current.progress.studyDates, studyDay(completedAt)])),
          },
        }
      })
    },
    weakTopics,
    studyPlan,
  }), [state, summary, weakTopics, studyPlan])

  return <StudyStateContext.Provider value={value}>{children}</StudyStateContext.Provider>
}

export function useStudyState() {
  const context = useContext(StudyStateContext)
  if (!context) {
    throw new Error('useStudyState must be used inside StudyStateProvider')
  }

  return context
}
