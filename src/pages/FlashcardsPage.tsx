import { useMemo, useState } from 'react'
import { flashcards as baseFlashcards } from '../data/flashcards'
import { isFlashcardDue, nextFlashcardReview } from '../services/progress'
import { useStudyState } from '../state/study-state'

type FlashcardFilter = 'all' | 'mastered' | 'not mastered' | 'due'

export function FlashcardsPage() {
  const { state, toggleFlashcardMastery } = useStudyState()
  const [topicFilter, setTopicFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [masteryFilter, setMasteryFilter] = useState<FlashcardFilter>('all')
  const [activeCardId, setActiveCardId] = useState(baseFlashcards[0]?.id ?? '')

  const cards = useMemo(() => {
    return baseFlashcards.map((card) => {
      const review = state.progress.flashcardReviews[card.id]
      return {
        ...card,
        mastered: review?.mastered ?? card.mastered,
        dueAt: review?.dueAt ?? null,
        intervalDays: review?.intervalDays ?? 0,
      }
    })
  }, [state.progress.flashcardReviews])

  const topics = Array.from(new Set(cards.map((card) => card.topic)))

  const filteredCards = cards.filter((card) => {
    const matchesTopic = topicFilter === 'all' || card.topic === topicFilter
    const matchesDifficulty = difficultyFilter === 'all' || card.difficulty === difficultyFilter
    const due = isFlashcardDue(card.dueAt ?? null)
    const matchesMastery =
      masteryFilter === 'all' ||
      (masteryFilter === 'mastered' && card.mastered) ||
      (masteryFilter === 'not mastered' && !card.mastered) ||
      (masteryFilter === 'due' && due)

    return matchesTopic && matchesDifficulty && matchesMastery
  })

  const activeCard = filteredCards.find((card) => card.id === activeCardId) ?? filteredCards[0]

  return (
    <div className="page-stack">
      <section className="section-card">
        <h2>Flashcards</h2>
        <p>Review terms, mark cards mastered, and use the due filter to follow a simple spaced repetition loop stored in local storage.</p>
      </section>

      <section className="section-card settings-grid">
        <label>
          Topic
          <select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}>
            <option value="all">All</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </label>
        <label>
          Difficulty
          <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label>
          Mastery
          <select value={masteryFilter} onChange={(event) => setMasteryFilter(event.target.value as FlashcardFilter)}>
            <option value="all">All</option>
            <option value="mastered">Mastered</option>
            <option value="not mastered">Not mastered</option>
            <option value="due">Due for review</option>
          </select>
        </label>
      </section>

      <section className="flashcard-grid">
        <aside className="section-card flashcard-list">
          {filteredCards.length ? filteredCards.map((card) => (
            <button
              key={card.id}
              type="button"
              className={card.id === activeCard?.id ? 'lesson-pill active' : 'lesson-pill'}
              onClick={() => setActiveCardId(card.id)}
            >
              <span>{card.term}</span>
              <small>{card.topic}</small>
            </button>
          )) : <p>No cards match the current filters.</p>}
        </aside>

        <article className="section-card">
          {activeCard ? (
            <>
              <p className="eyebrow">{activeCard.topic}</p>
              <h3>{activeCard.term}</h3>
              <p><strong>Answer:</strong> {activeCard.answer}</p>
              {activeCard.example ? <p><strong>Example:</strong> {activeCard.example}</p> : null}
              <p>Difficulty: {activeCard.difficulty}</p>
              <p>Status: {activeCard.mastered ? 'Mastered' : 'Not mastered'}</p>
              <p>Due for review: {isFlashcardDue(activeCard.dueAt) ? 'Yes' : 'Not yet'}</p>
              <div className="hero-actions">
                <button type="button" onClick={() => toggleFlashcardMastery(activeCard.id, true)}>Mark mastered</button>
                <button type="button" className="secondary" onClick={() => toggleFlashcardMastery(activeCard.id, false)}>Mark not mastered</button>
              </div>
              <p>Next review interval: {nextFlashcardReview(state.progress.flashcardReviews[activeCard.id]?.intervalDays ?? 0)} day(s)</p>
            </>
          ) : <p>Select a flashcard to review.</p>}
        </article>
      </section>
    </div>
  )
}
