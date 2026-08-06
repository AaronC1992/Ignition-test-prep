import { useNavigate } from 'react-router-dom'
import { modules } from '../data/modules'
import { labs } from '../data/labs'
import { calculateStudyStreak } from '../services/progress'
import { useStudyState } from '../state/study-state'

export function DashboardPage() {
  const { state, summary, studyPlan } = useStudyState()
  const navigate = useNavigate()
  const studyStreak = calculateStudyStreak(state.progress.studyDates)
  const nextLesson = modules.find((module) => !state.progress.completedLessonIds.includes(module.id)) ?? modules[0]!

  const openPlanItem = (path: string, search?: string) => {
    navigate(`${path}${search ?? ''}`)
  }

  return (
    <div className="page-stack">
      <section className="hero-grid">
        <div className="hero-card">
          <p className="eyebrow">Dashboard</p>
          <h2>Study for Ignition Core 8.1.45</h2>
          <p>
            Track lessons, practice questions, hands on labs, and review areas in a single local study workspace.
          </p>
          <div className="hero-actions">
            <button type="button" className="secondary" onClick={() => navigate('/study-guide')}>
              Open Study Guide
            </button>
            <button type="button" onClick={() => navigate('/lessons')}>
              Continue Studying
            </button>
            <button type="button" className="secondary" onClick={() => navigate('/quizzes')}>
              Start Mock Exam
            </button>
          </div>
        </div>
        <div className="hero-card accent">
          <p className="eyebrow">Readiness estimate</p>
          <h3>{summary.readinessLabel}</h3>
          <p>App estimate only, not an official certification prediction.</p>
          <p>Target version: 8.1.45</p>
        </div>
      </section>

      <section className="metrics-grid">
        <Metric label="Overall completion" value={`${summary.completionPercentage}%`} />
        <Metric label="Current study streak" value={`${studyStreak} days`} />
        <Metric label="Lessons completed" value={summary.lessonsCompleted.toString()} />
        <Metric label="Quiz average" value={`${summary.quizAverage}%`} />
        <Metric label="Mock test average" value={`${summary.mockAverage}%`} />
        <Metric label="Hands on labs completed" value={summary.labsCompleted.toString()} />
      </section>

      <section className="section-card">
        <h2>Today at a glance</h2>
        <p>You have made {state.progress.dailyStudy.count} study actions toward a goal of {state.settings.dailyStudyGoal}.</p>
        <p>Bookmarked lessons: {state.progress.lessonBookmarks.length}</p>
      </section>

      <section className="section-card">
        <h2>Topics needing review</h2>
        <p>These are estimated from quiz results and lesson progress inside the app.</p>
        <ul className="pill-list">
          {summary.topicsNeedingReview.length ? summary.topicsNeedingReview.map((topic) => <li key={topic}>{topic}</li>) : <li>No review flags yet</li>}
        </ul>
      </section>

      <section className="section-card">
        <h2>Adaptive study plan</h2>
        <ul>
          {studyPlan.length ? studyPlan.map((item) => (
            <li key={item.title}>
              <button type="button" className="plan-link" onClick={() => openPlanItem(item.route.path, item.route.search)}>
                <strong>{item.title}</strong>
                <p>{item.reason}</p>
                <span>{item.action}</span>
              </button>
            </li>
          )) : <li>No plan yet</li>}
        </ul>
      </section>

      <section className="section-card">
        <h2>Hands on labs completed</h2>
        <p>{Object.values(state.progress.labCompletion).filter(Boolean).length} of {labs.length}</p>
      </section>

      <section className="section-card">
        <h2>Continue next</h2>
        <p>{nextLesson.title}</p>
        <p>{nextLesson.summary}</p>
        <button type="button" onClick={() => navigate('/lessons')}>
          Open next lesson
        </button>
      </section>

      <section className="section-card">
        <h2>Quick practice</h2>
        <div className="hero-actions">
          <button type="button" onClick={() => navigate('/quizzes')}>Study quiz</button>
          <button type="button" className="secondary" onClick={() => navigate('/mock-exam')}>Timed exam</button>
          <button type="button" className="secondary" onClick={() => navigate('/flashcards')}>Review cards</button>
        </div>
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
