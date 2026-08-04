import type { Flashcard } from '../types/app'
import { glossaryEntries } from './glossary'

const buildFlashcardPrompt = (topic: string, term: string) =>
  `In the ${topic} topic, what does ${term} mean in Ignition, and how would you explain it to another learner?`

export const flashcards: Flashcard[] = glossaryEntries.map((entry, index) => ({
  id: `fc-${index + 1}`,
  topic: entry.topic,
  lessonId: entry.lessonId,
  prompt: buildFlashcardPrompt(entry.topic, entry.term),
  term: entry.term,
  answer: entry.definition,
  difficulty: entry.difficulty,
  example: entry.example,
  mastered: false,
}))
