import { describe, expect, it } from 'vitest'
import { defaultAppState, exportAppState, importAppState } from '../services/localStorage'

describe('storage helpers', () => {
  it('exports and imports state', () => {
    const state = defaultAppState()
    const exported = exportAppState(state)
    const imported = importAppState(exported)
    expect(imported.settings.defaultQuizLength).toBe(25)
  })
})
