import { useMemo, useState } from 'react'
import { lessons } from '../data/curriculum'
import { useStudyState } from '../state/study-state'

export function StudyLessonsPage() {
  const { state, setLessonCompleted } = useStudyState()
  const [activeLessonId, setActiveLessonId] = useState(lessons[0]?.id ?? '')

  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0],
    [activeLessonId],
  )

  if (!activeLesson) {
    return null
  }

  const isCompleted = state.progress.completedLessonIds.includes(activeLesson.id)

  return (
    <div className="lesson-layout">
      <aside className="section-card lesson-list">
        <h2>Study Lessons</h2>
        <p>Each lesson is a short study unit with a completion checkbox and a five question knowledge check.</p>
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            type="button"
            className={lesson.id === activeLesson.id ? 'lesson-pill active' : 'lesson-pill'}
            onClick={() => setActiveLessonId(lesson.id)}
          >
            <span>{lesson.title}</span>
            <small>{state.progress.completedLessonIds.includes(lesson.id) ? 'Completed' : 'Not complete'}</small>
          </button>
        ))}
      </aside>

      <article className="section-card lesson-detail">
        <p className="eyebrow">Lesson</p>
        <h2>{activeLesson.title}</h2>
        <label className="lesson-check">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(event) => setLessonCompleted(activeLesson.id, event.target.checked)}
          />
          Mark this lesson complete
        </label>

        <section>
          <h3>Learning objectives</h3>
          <ul>
            {activeLesson.learningObjectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Plain language explanation</h3>
          <p>{activeLesson.explanation}</p>
        </section>

        <section>
          <h3>Important terminology</h3>
          <ul className="pill-list">
            {activeLesson.terminology.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Step by step example</h3>
          <p>{activeLesson.example}</p>
        </section>

        <section>
          <h3>Why this matters</h3>
          <p>{activeLesson.whyItMatters}</p>
        </section>

        <section>
          <h3>Common mistakes</h3>
          <ul>
            {activeLesson.commonMistakes.map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Exam style reminders</h3>
          <ul>
            {activeLesson.examReminders.map((reminder) => (
              <li key={reminder}>{reminder}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Five question knowledge check</h3>
          <ol>
            {activeLesson.knowledgeCheck.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ol>
        </section>

        <section>
          <h3>Hands on practice activity</h3>
          <p>{activeLesson.practiceActivity}</p>
        </section>
      </article>
    </div>
  )
}
