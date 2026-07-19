import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import RootLayout from './routes/RootLayout.tsx'
import HomePage from './pages/HomePage.tsx'
import ExperiencePage from './pages/ExperiencePage.tsx'
import ProjectsPage from './pages/ProjectsPage.tsx'
import ContactPage from './pages/ContactPage.tsx'
import ResumeViewerPage from './pages/ResumeViewerPage.tsx'
import SystemCockpitPage from './pages/SystemCockpitPage.tsx'
import ChatPage from './pages/ChatPage.tsx'
import ResumeManagerPage from './pages/ResumeManagerPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { reportWebVitals } from './utils/reportWebVitals.ts'
import { initGA } from './utils/analytics.ts'

// Start Google Analytics (GA4) tracker instance
initGA()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Analytics />
          <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="experience" element={<ExperiencePage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="resume" element={<ResumeViewerPage />} />
            <Route path="system" element={<SystemCockpitPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="resume-manager" element={<ResumeManagerPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)

// Report web vitals for performance monitoring
reportWebVitals()
