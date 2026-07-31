import { NavLink, Outlet } from 'react-router-dom'
import { navigationSections } from '../data/navigation'

export function Layout() {
  return (
    <div className="app-shell">
      <header className="top-banner">
        <div>
          <p className="eyebrow">Ignition Core Exam Prep</p>
          <h1>Unofficial practice for Ignition Platform 8.1.45</h1>
          <p className="banner-copy">
            Study lessons, flashcards, quizzes, mock exams, lab checklists, and troubleshooting drills in one local app.
          </p>
        </div>
        <div className="banner-note">
          <strong>Unofficial practice material</strong>
          <span>Readiness estimates are app calculations only.</span>
        </div>
      </header>

      <nav className="main-nav" aria-label="Primary navigation">
        {navigationSections.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  )
}
