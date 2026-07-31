import { lessons } from '../data/curriculum'
import { labs } from '../data/labs'
import { flashcards } from '../data/flashcards'
import { useStudyState } from '../state/study-state'
import { buildWeakAreaRecommendation } from '../services/progress'

export function ProgressPage() {
  const { summary, state, weakTopics } = useStudyState()

  const lessonTargets = weakTopics
    .map((topic) => lessons.find((lesson) => lesson.title === topic.topic))
    .filter(Boolean)
  const recommendation = buildWeakAreaRecommendation({ topics: weakTopics, lessons, flashcards, labs })

  return (
    <div className="page-stack">
      <section className="section-card">
        <h2>Progress and Weak Areas</h2>
        <p>Review recommendations are based on completed lessons, quiz results, and saved practice history.</p>
      </section>

      <section className="metrics-grid">
        <Metric label="Overall completion" value={`${summary.completionPercentage}%`} />
        <Metric label="Lessons completed" value={`${summary.lessonsCompleted}`} />
        <Metric label="Quiz average" value={`${summary.quizAverage}%`} />
        <Metric label="Mock exam average" value={`${summary.mockAverage}%`} />
        <Metric label="Hands on labs completed" value={`${summary.labsCompleted}`} />
        <Metric label="Topics to review" value={`${weakTopics.length}`} />
      </section>

      <section className="section-card">
        <h3>Accuracy by topic</h3>
        <div className="progress-bars">
          {weakTopics.length ? weakTopics.map((topic) => {
            const percentage = Math.round((topic.correct / topic.total) * 100)
            return (
              <div key={topic.topic} className="progress-row">
                <span>{topic.topic}</span>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${percentage}%` }} />
                </div>
                <small>{percentage}%</small>
              </div>
            )
          }) : <p>No weak topics yet.</p>}
        </div>
      </section>

      <section className="section-card">
        <h3>Weak area study plan</h3>
        <ul>
          {lessonTargets.length ? lessonTargets.map((lesson) => (
            <li key={lesson?.id}>{lesson?.title}</li>
          )) : <li>No weak area lessons yet</li>}
        </ul>
        <p>Suggested next step: repeat the lesson, then take a short module quiz again.</p>
        <p>Recommended short quiz topic: {recommendation.quizTopic}</p>
        <p>Repeat lab: {recommendation.labIds.length ? recommendation.labIds.join(', ') : 'No lab repeat assigned'}</p>
        <p>Flashcards to revisit: {recommendation.flashcardIds.length ? recommendation.flashcardIds.slice(0, 5).join(', ') : 'No flashcard targets yet'}</p>
      </section>

      <section className="section-card">
        <h3>Recent history</h3>
        <ul>
          {state.progress.quizAttempts.slice().reverse().map((attempt: { topic: string; score: number; total: number; completedAt: string }) => (
            <li key={`${attempt.topic}-${attempt.completedAt}`}>{attempt.topic} {attempt.score}/{attempt.total}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}
