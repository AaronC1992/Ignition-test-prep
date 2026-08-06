import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { flashcards as baseFlashcards } from '../data/flashcards'
import { isFlashcardDue, nextFlashcardReview } from '../services/progress'
import { useStudyState } from '../state/study-state'

type FlashcardFilter = 'all' | 'mastered' | 'not mastered' | 'due'

export function FlashcardsPage() {
  const { state, toggleFlashcardMastery } = useStudyState()
  const [searchParams, setSearchParams] = useSearchParams()
  const [topicFilter, setTopicFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [masteryFilter, setMasteryFilter] = useState<FlashcardFilter>('all')
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

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
  const dueCount = cards.filter((card) => isFlashcardDue(card.dueAt ?? null)).length
  const masteredCount = cards.filter((card) => card.mastered).length

  useEffect(() => {
    const topic = searchParams.get('topic')
    const mastery = searchParams.get('mastery')
    if (topic) {
      setTopicFilter(topic)
    }
    if (mastery === 'all' || mastery === 'mastered' || mastery === 'not mastered' || mastery === 'due') {
      setMasteryFilter(mastery)
    }
  }, [searchParams])

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams)
    if (topicFilter !== 'all') {
      nextParams.set('topic', topicFilter)
    } else {
      nextParams.delete('topic')
    }
    if (masteryFilter !== 'all') {
      nextParams.set('mastery', masteryFilter)
    } else {
      nextParams.delete('mastery')
    }
    setSearchParams(nextParams, { replace: true })
  }, [topicFilter, masteryFilter])

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
  }).sort((left, right) => Number(isFlashcardDue(right.dueAt ?? null)) - Number(isFlashcardDue(left.dueAt ?? null)))

  useEffect(() => {
    setActiveCardIndex(0)
    setIsFlipped(false)
  }, [topicFilter, difficultyFilter, masteryFilter])

  useEffect(() => {
    if (activeCardIndex > Math.max(filteredCards.length - 1, 0)) {
      setActiveCardIndex(0)
      setIsFlipped(false)
    }
  }, [activeCardIndex, filteredCards.length])

  const activeCard = filteredCards[activeCardIndex]

  const goToPrevious = () => {
    if (!filteredCards.length) {
      return
    }

    setActiveCardIndex((current) => (current - 1 + filteredCards.length) % filteredCards.length)
    setIsFlipped(false)
  }

  const goToNext = () => {
    if (!filteredCards.length) {
      return
    }

    setActiveCardIndex((current) => (current + 1) % filteredCards.length)
    setIsFlipped(false)
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <h2>Flashcards</h2>
        <p>Review terms, mark cards mastered, and use the due filter to follow a simple spaced repetition loop stored in local storage.</p>
        <p>Due now: {dueCount} of {cards.length}. Mastered: {masteredCount}.</p>
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

      <section className="section-card flashcard-stage">
        {activeCard ? (
          <>
            <div className="flashcard-topbar">
              <p className="eyebrow">{activeCard.topic}</p>
              <p>Card {activeCardIndex + 1} of {filteredCards.length}</p>
            </div>

            <button
              type="button"
              className={isFlipped ? 'flashcard-flip is-flipped' : 'flashcard-flip'}
              onClick={() => setIsFlipped((value) => !value)}
              aria-pressed={isFlipped}
              aria-label="Flip flash card"
            >
              <span className="flashcard-face flashcard-front">
                <small>Question</small>
                <h3>{activeCard.prompt}</h3>
                <p><strong>Key term:</strong> {activeCard.term}</p>
                <p>Click to reveal answer</p>
              </span>

              <span className="flashcard-face flashcard-back">
                <small>Answer</small>
                <h3>{activeCard.term}</h3>
                <p>{activeCard.answer}</p>
                {activeCard.example ? <p><strong>Example:</strong> {activeCard.example}</p> : null}
              </span>
            </button>

            <div className="flashcard-nav">
              <button type="button" className="secondary" onClick={goToPrevious}>Previous card</button>
              <button type="button" onClick={goToNext}>Next card</button>
            </div>

            <div className="flashcard-meta">
              <p>Difficulty: {activeCard.difficulty}</p>
              <p>Status: {activeCard.mastered ? 'Mastered' : 'Not mastered'}</p>
              <p>Due for review: {isFlashcardDue(activeCard.dueAt) ? 'Yes' : 'Not yet'}</p>
              <p>Next review interval: {nextFlashcardReview(state.progress.flashcardReviews[activeCard.id]?.intervalDays ?? 0)} day(s)</p>
            </div>

            <div className="hero-actions">
              <button type="button" onClick={() => toggleFlashcardMastery(activeCard.id, true)}>Mark mastered</button>
              <button type="button" className="secondary" onClick={() => toggleFlashcardMastery(activeCard.id, false)}>Mark not mastered</button>
            </div>
          </>
        ) : <p>No cards match the current filters.</p>}
      </section>
    </div>
  )
}
