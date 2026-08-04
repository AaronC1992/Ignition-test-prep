import { troubleshootingScenarios } from '../data/troubleshooting'
import { useState } from 'react'

export function TroubleshootingPage() {
  const [activeId, setActiveId] = useState(troubleshootingScenarios[0]?.id ?? '')
  const [showResolution, setShowResolution] = useState(false)
  const activeScenario = troubleshootingScenarios.find((scenario) => scenario.id === activeId) ?? troubleshootingScenarios[0]

  if (!activeScenario) {
    return null
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <h2>Troubleshooting Scenarios</h2>
        <p>Each scenario asks you to identify the likely cause, the best diagnostic step, and the correct fix.</p>
        <p>Total scenarios: {troubleshootingScenarios.length}</p>
      </section>

      <section className="lesson-layout">
        <aside className="section-card lesson-list">
          {troubleshootingScenarios.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className={scenario.id === activeScenario.id ? 'lesson-pill active' : 'lesson-pill'}
              onClick={() => {
                setActiveId(scenario.id)
                setShowResolution(false)
              }}
            >
              {scenario.title}
            </button>
          ))}
        </aside>

        <article className="section-card">
          <p className="eyebrow">Scenario question</p>
          <p>{activeScenario.title}</p>
          <h3>{activeScenario.prompt}</h3>
          <div className="hero-actions">
            <button type="button" onClick={() => setShowResolution((value) => !value)}>
              {showResolution ? 'Hide solution' : 'Show solution'}
            </button>
          </div>

          {showResolution ? (
            <>
              <section>
                <h4>Most likely cause</h4>
                <p>{activeScenario.mostLikelyCause}</p>
              </section>

              <section>
                <h4>Best diagnostic step</h4>
                <p>{activeScenario.bestDiagnosticStep}</p>
              </section>

              <section>
                <h4>Correct fix</h4>
                <p>{activeScenario.correctFix}</p>
              </section>
            </>
          ) : (
            <p>Try to answer first, then reveal the solution and compare your reasoning.</p>
          )}
        </article>
      </section>
    </div>
  )
}
