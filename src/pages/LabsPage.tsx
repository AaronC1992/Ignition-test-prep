import { useState } from 'react'
import { labs } from '../data/labs'
import { useStudyState } from '../state/study-state'

export function LabsPage() {
  const { state, setLabCompletion, setLabNote, resetLab } = useStudyState()
  const [activeLabId, setActiveLabId] = useState(labs[0]?.id ?? '')
  const activeLab = labs.find((lab) => lab.id === activeLabId) ?? labs[0]

  if (!activeLab) {
    return null
  }

  const completed = state.progress.labCompletion[activeLab.id] ?? false
  const note = state.progress.labNotes[activeLab.id] ?? ''

  return (
    <div className="page-stack">
      <section className="section-card">
        <h2>Hands On Lab Simulator</h2>
        <p>The app cannot inspect a real Ignition Gateway, so every lab must be confirmed manually by the learner.</p>
      </section>

      <section className="section-card settings-grid">
        <label>
          Lab theme
          <select value={activeLabId} onChange={(event) => setActiveLabId(event.target.value)}>
            {labs.map((lab) => <option key={lab.id} value={lab.id}>{lab.title}</option>)}
          </select>
        </label>
      </section>

      <article className="section-card">
        <h3>{activeLab.title}</h3>
        <p>{activeLab.summary}</p>
        <p>{activeLab.instructions}</p>

        <section>
          <h4>Preparation and assumptions</h4>
          <ul>
            {activeLab.preparation.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section>
          <h4>Tasks</h4>
          <ol>
            {activeLab.steps.map((step) => (
              <li key={step.id}>
                <strong>{step.instruction}</strong>
                <p>{step.hint}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h4>Required deliverables</h4>
          <ul>
            {activeLab.deliverables.map((deliverable) => <li key={deliverable}>{deliverable}</li>)}
          </ul>
        </section>

        <section>
          <h4>Common failure points</h4>
          <ul>
            {activeLab.failurePoints.map((failure) => <li key={failure}>{failure}</li>)}
          </ul>
        </section>

        <section>
          <h4>Self check checklist</h4>
          <ul>
            {activeLab.rubric.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section>
          <h4>Official references used</h4>
          <ul>
            {activeLab.resources.map((resource) => (
              <li key={resource.url}>
                <a href={resource.url} target="_blank" rel="noreferrer">{resource.label}</a>
              </li>
            ))}
          </ul>
        </section>

        <label>
          Notes
          <textarea value={note} onChange={(event) => setLabNote(activeLab.id, event.target.value)} rows={4} />
        </label>

        <div className="hero-actions">
          <button type="button" onClick={() => setLabCompletion(activeLab.id, !completed)}>
            {completed ? 'Mark incomplete' : 'Mark completed'}
          </button>
          <button type="button" className="secondary" onClick={() => resetLab(activeLab.id)}>
            Reset button
          </button>
        </div>

        <p>Completed status: {completed ? 'Completed' : 'Not completed'}</p>
      </article>
    </div>
  )
}
