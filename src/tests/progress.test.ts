import { describe, expect, it } from 'vitest'
import { defaultAppState } from '../services/localStorage'
import {
  buildMockExam,
  calculateAverage,
  calculateProgressSummary,
  identifyWeakTopics,
  scoreQuestionAnswer,
  shuffleQuestionChoices,
} from '../services/progress'
import { modules } from '../data/modules'
import type { Flashcard, Question } from '../types/app'

const flashcards: Flashcard[] = [
  { id: '1', topic: 'A', term: 'A', answer: 'A', difficulty: 'beginner', mastered: false },
]

describe('progress helpers', () => {
  it('calculates an average', () => {
    expect(calculateAverage([50, 100])).toBe(75)
  })

  it('calculates progress summary', () => {
    const state = defaultAppState()
    state.progress.completedLessonIds = ['lesson-1']
    state.progress.masteredFlashcardIds = ['1']
    const summary = calculateProgressSummary(modules, flashcards, state)
    expect(summary.completionPercentage).toBeGreaterThan(0)
  })

  it('identifies weak topics below threshold', () => {
    expect(identifyWeakTopics([{ topic: 'Tags', correct: 2, total: 4 }], 75)).toHaveLength(1)
  })

  it('scores string answers', () => {
    const question = {
      id: 'q1',
      topic: 'Tags',
      subtopic: 'Basics',
      difficulty: 'beginner',
      type: 'single-choice',
      prompt: 'What is a tag?',
      correctAnswer: 'a',
      explanation: 'x',
      reviewLessonId: 'lesson-1',
      version: '8.1.45',
      sourceType: 'generated-practice',
    } satisfies Question

    expect(scoreQuestionAnswer(question, 'a')).toBe(true)
  })

  it('scores multiple answers order independently', () => {
    const question = {
      id: 'q2',
      topic: 'Tags',
      subtopic: 'Basics',
      difficulty: 'intermediate',
      type: 'multiple-choice',
      prompt: 'Choose two',
      correctAnswer: ['a', 'b'],
      explanation: 'x',
      reviewLessonId: 'lesson-1',
      version: '8.1.45',
      sourceType: 'generated-practice',
    } satisfies Question

    expect(scoreQuestionAnswer(question, ['b', 'a'])).toBe(true)
  })

  it('builds a mock exam at the requested length', () => {
    const questions = [
      {
        id: '1',
        topic: 'Tags',
        subtopic: 'Basics',
        difficulty: 'beginner',
        type: 'single-choice',
        prompt: 'Question 1',
        correctAnswer: 'a',
        explanation: 'x',
        reviewLessonId: 'lesson-1',
        version: '8.1.45',
        sourceType: 'generated-practice',
      },
      {
        id: '2',
        topic: 'Vision',
        subtopic: 'Windows',
        difficulty: 'intermediate',
        type: 'single-choice',
        prompt: 'Question 2',
        correctAnswer: 'b',
        explanation: 'x',
        reviewLessonId: 'lesson-2',
        version: '8.1.45',
        sourceType: 'generated-practice',
      },
    ] satisfies Question[]

    expect(buildMockExam(questions, 1)).toHaveLength(1)
  })

  it('shuffles choices without changing count', () => {
    expect(shuffleQuestionChoices(['a', 'b', 'c'])).toHaveLength(3)
  })
})
