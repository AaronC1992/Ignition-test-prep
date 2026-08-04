import { lessons } from '../data/curriculum'
import { labs } from '../data/labs'
import { flashcards } from '../data/flashcards'
import { troubleshootingScenarios } from '../data/troubleshooting'
import { useStudyState } from '../state/study-state'
import { buildWeakAreaRecommendation } from '../services/progress'
import { studyGuideMetaByLessonId } from '../data/studyGuide'

export function ProgressPage() {
  const { summary, state, weakTopics } = useStudyState()

  const lessonTargets = weakTopics
    .map((topic) => lessons.find((lesson) => lesson.title === topic.topic))
    .filter(Boolean)
  const recommendation = buildWeakAreaRecommendation({ topics: weakTopics, lessons, flashcards, labs })
  const recommendedFlashcards = flashcards.filter((card) => recommendation.flashcardIds.includes(card.id)).slice(0, 6)
  const recommendedLabs = labs.filter((lab) => recommendation.labIds.includes(lab.id))
  const recommendedScenarioIds = Array.from(new Set(recommendation.lessonIds.flatMap((lessonId) => studyGuideMetaByLessonId[lessonId]?.relatedScenarioIds ?? [])))
  const recommendedScenarios = troubleshootingScenarios.filter((scenario) => recommendedScenarioIds.includes(scenario.id)).slice(0, 5)

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

        <h3>Labs to repeat</h3>
        <ul>
          {recommendedLabs.length ? recommendedLabs.map((lab) => <li key={lab.id}>{lab.title}</li>) : <li>No lab repeat assigned</li>}
        </ul>

        <h3>Flashcards to revisit</h3>
        <ul>
          {recommendedFlashcards.length ? recommendedFlashcards.map((card) => <li key={card.id}>{card.term}</li>) : <li>No flashcard targets yet</li>}
        </ul>

        <h3>Troubleshooting drills to review</h3>
        <ul>
          {recommendedScenarios.length ? recommendedScenarios.map((scenario) => <li key={scenario.id}>{scenario.title}</li>) : <li>No troubleshooting drills assigned yet</li>}
        </ul>
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
