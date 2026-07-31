import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { StudyLessonsPage } from './pages/StudyLessonsPage'
import { FlashcardsPage } from './pages/FlashcardsPage'
import { MockExamPage } from './pages/MockExamPage'
import { GlossaryPage } from './pages/GlossaryPage'
import { LabsPage } from './pages/LabsPage'
import { TroubleshootingPage } from './pages/TroubleshootingPage'
import { ProgressPage } from './pages/ProgressPage'
import { QuizzesPage } from './pages/QuizzesPage'
import { SettingsPage } from './pages/SettingsPage'
import { StudyStateProvider } from './state/study-state'

export default function App() {
  return (
    <StudyStateProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="lessons" element={<StudyLessonsPage />} />
          <Route path="flashcards" element={<FlashcardsPage />} />
          <Route path="quizzes" element={<QuizzesPage />} />
          <Route path="mock-exam" element={<MockExamPage />} />
          <Route path="labs" element={<LabsPage />} />
          <Route path="troubleshooting" element={<TroubleshootingPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="glossary" element={<GlossaryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </StudyStateProvider>
  )
}
