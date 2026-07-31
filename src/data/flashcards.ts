import type { Flashcard } from '../types/app'
import { glossaryEntries } from './glossary'

export const flashcards: Flashcard[] = glossaryEntries.map((entry, index) => ({
  id: `fc-${index + 1}`,
  topic: entry.topic,
  term: entry.term,
  answer: entry.definition,
  difficulty: entry.difficulty,
  example: entry.example,
  mastered: false,
}))
