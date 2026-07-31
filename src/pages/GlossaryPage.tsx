import { useMemo, useState } from 'react'
import { glossaryEntries } from '../data/glossary'

export function GlossaryPage() {
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState('all')
  const [difficulty, setDifficulty] = useState('all')

  const topics = useMemo(() => Array.from(new Set(glossaryEntries.map((entry) => entry.topic))), [])

  const filtered = glossaryEntries.filter((entry) => {
    const q = query.trim().toLowerCase()
    const matchesQuery = q.length === 0 || entry.term.toLowerCase().includes(q) || entry.definition.toLowerCase().includes(q)
    const matchesTopic = topic === 'all' || entry.topic === topic
    const matchesDifficulty = difficulty === 'all' || entry.difficulty === difficulty
    return matchesQuery && matchesTopic && matchesDifficulty
  })

  return (
    <div className="page-stack">
      <section className="section-card">
        <h2>Glossary</h2>
        <p>Search core terms used in the Ignition 8.1.45 study lessons and labs.</p>
      </section>

      <section className="section-card settings-grid">
        <label>
          Search
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type a term or definition" />
        </label>
        <label>
          Topic
          <select value={topic} onChange={(event) => setTopic(event.target.value)}>
            <option value="all">All</option>
            {topics.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Difficulty
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="all">All</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
      </section>

      <section className="section-card">
        <h3>Entries ({filtered.length})</h3>
        <ul>
          {filtered.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.term}</strong> ({entry.difficulty})
              <p>{entry.definition}</p>
              <p>Topic: {entry.topic}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
