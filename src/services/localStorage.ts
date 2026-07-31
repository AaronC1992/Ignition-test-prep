import type { AppState } from '../types/app'

export const appStorageKey = 'ignition-core-exam-prep-state'

export const defaultAppState = (): AppState => ({
  progress: {
    completedLessonIds: [],
    masteredFlashcardIds: [],
    flashcardReviews: {},
    quizAttempts: [],
    mockExamAttempts: [],
    labCompletion: {},
    labNotes: {},
    confidence: 3,
    lastStudyAt: null,
    studyDates: [],
  },
  settings: {
    theme: 'dark',
    defaultQuizLength: 25,
    timerEnabled: false,
    questionDifficulty: 'mixed',
  },
})

export const loadAppState = (storage: Pick<Storage, 'getItem'> = window.localStorage) => {
  const raw = storage.getItem(appStorageKey)
  if (!raw) {
    return defaultAppState()
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppState>
    const base = defaultAppState()

    return {
      ...base,
      ...parsed,
      progress: {
        ...base.progress,
        ...(parsed.progress ?? {}),
      },
      settings: {
        ...base.settings,
        ...(parsed.settings ?? {}),
      },
    }
  } catch {
    return defaultAppState()
  }
}

export const saveAppState = (
  state: AppState,
  storage: Pick<Storage, 'setItem'> = window.localStorage,
) => {
  storage.setItem(appStorageKey, JSON.stringify(state))
}

export const exportAppState = (state: AppState) => JSON.stringify(state, null, 2)

export const importAppState = (input: string): AppState => {
  const parsed = JSON.parse(input) as Partial<AppState>
  const base = defaultAppState()

  return {
    ...base,
    ...parsed,
    progress: {
      ...base.progress,
      ...(parsed.progress ?? {}),
    },
    settings: {
      ...base.settings,
      ...(parsed.settings ?? {}),
    },
  }
}
