import { useRef } from 'react'
import { useStudyState } from '../state/study-state'

export function SettingsPage() {
  const { state, exportState, importState, resetState, updateSettings } = useStudyState()
  const fileRef = useRef<HTMLInputElement>(null)

  const loadImport = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      return
    }

    const text = await file.text()
    importState(text)
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <h2>Settings</h2>
        <p>Target Ignition version 8.1.45. App version 0.1.0.</p>
      </section>

      <section className="section-card settings-grid">
        <label>
          Theme
          <select value={state.settings.theme} onChange={(event) => updateSettings({ theme: event.target.value as 'light' | 'dark' })}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>

        <label>
          Default quiz length
          <select
            value={state.settings.defaultQuizLength}
            onChange={(event) => updateSettings({ defaultQuizLength: Number(event.target.value) as 25 | 50 | 75 | 100 })}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={75}>75</option>
            <option value={100}>100</option>
          </select>
        </label>

        <label>
          Timer
          <select value={state.settings.timerEnabled ? 'on' : 'off'} onChange={(event) => updateSettings({ timerEnabled: event.target.value === 'on' })}>
            <option value="off">Off</option>
            <option value="on">On</option>
          </select>
        </label>

        <label>
          Question difficulty
          <select
            value={state.settings.questionDifficulty}
            onChange={(event) => updateSettings({ questionDifficulty: event.target.value as 'beginner' | 'intermediate' | 'advanced' | 'mixed' })}
          >
            <option value="mixed">Mixed</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
      </section>

      <section className="section-card">
        <button type="button" onClick={() => navigator.clipboard?.writeText(exportState())}>
          Export progress to JSON
        </button>
        <label className="import-field">
          Import progress from JSON
          <input ref={fileRef} type="file" accept="application/json" />
          <button type="button" className="secondary" onClick={loadImport}>
            Import file
          </button>
        </label>
        <button type="button" className="secondary" onClick={resetState}>
          Reset all progress
        </button>
      </section>
    </div>
  )
}
