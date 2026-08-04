import { useMemo, useState } from 'react'
import { lessons } from '../data/curriculum'
import { labs } from '../data/labs'
import { troubleshootingScenarios } from '../data/troubleshooting'
import { coreResources, examDayChecklist, studyGuideMetaByLessonId, studyLoop } from '../data/studyGuide'

export function StudyGuidePage() {
  const [activeLessonId, setActiveLessonId] = useState(lessons[0]?.id ?? '')
  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0],
    [activeLessonId],
  )

  if (!activeLesson) {
    return null
  }

  const guide = studyGuideMetaByLessonId[activeLesson.id]
  const relatedLabs = labs.filter((lab) => guide?.relatedLabIds.includes(lab.id))
  const relatedScenarios = troubleshootingScenarios.filter((scenario) => guide?.relatedScenarioIds.includes(scenario.id))

  return (
    <div className="page-stack">
      <section className="section-card">
        <h2>Exam Study Guide</h2>
        <p>This page turns the app content into a focused prep plan for the Ignition Core exam. Use it to decide what to study next, which traps to avoid, and which official references matter most.</p>
      </section>

      <section className="metrics-grid">
        <Metric label="Lessons" value={String(lessons.length)} />
        <Metric label="Flashcards" value="147" />
        <Metric label="Labs" value={String(labs.length)} />
      </section>

      <section className="section-card">
        <h3>Best use of the app</h3>
        <ol>
          {studyLoop.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>

      <section className="section-card">
        <h3>Official resources to keep open</h3>
        <ul>
          {coreResources.map((resource) => (
            <li key={resource.url}>
              <a href={resource.url} target="_blank" rel="noreferrer">{resource.label}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-card">
        <h3>Exam day checklist</h3>
        <ul>
          {examDayChecklist.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="lesson-layout">
        <aside className="section-card lesson-list">
          <h3>Topics</h3>
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              className={lesson.id === activeLesson.id ? 'lesson-pill active' : 'lesson-pill'}
              onClick={() => setActiveLessonId(lesson.id)}
            >
              <span>{lesson.title}</span>
              <small>{lesson.learningObjectives.length} focus areas</small>
            </button>
          ))}
        </aside>

        <article className="section-card lesson-detail">
          <p className="eyebrow">Topic focus</p>
          <h2>{activeLesson.title}</h2>
          <p>{activeLesson.explanation}</p>

          <section>
            <h3>What to be able to do</h3>
            <ul>
              {activeLesson.learningObjectives.map((objective) => <li key={objective}>{objective}</li>)}
            </ul>
          </section>

          <section>
            <h3>Why this topic matters on the exam</h3>
            <p>{activeLesson.whyItMatters}</p>
            <p>{guide?.handsOnPriority}</p>
          </section>

          <section>
            <h3>Exam reminders</h3>
            <ul>
              {activeLesson.examReminders.map((reminder) => <li key={reminder}>{reminder}</li>)}
            </ul>
          </section>

          <section>
            <h3>Common traps</h3>
            <ul>
              {activeLesson.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}
              {guide?.watchFor.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section>
            <h3>Quick self check</h3>
            <ol>
              {activeLesson.knowledgeCheck.map((prompt) => <li key={prompt}>{prompt}</li>)}
            </ol>
          </section>

          <section>
            <h3>Related hands on labs</h3>
            <ul>
              {relatedLabs.length ? relatedLabs.map((lab) => <li key={lab.id}>{lab.title}</li>) : <li>No direct lab mapped</li>}
            </ul>
          </section>

          <section>
            <h3>Related troubleshooting drills</h3>
            <ul>
              {relatedScenarios.length ? relatedScenarios.map((scenario) => <li key={scenario.id}>{scenario.title}</li>) : <li>No direct troubleshooting drill mapped</li>}
            </ul>
          </section>

          <section>
            <h3>Topic references</h3>
            <ul>
              {guide?.references.map((resource) => (
                <li key={resource.url}>
                  <a href={resource.url} target="_blank" rel="noreferrer">{resource.label}</a>
                </li>
              ))}
            </ul>
          </section>
        </article>
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