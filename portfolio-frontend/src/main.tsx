import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import RootLayout from './routes/RootLayout.tsx'
import HomePage from './pages/HomePage.tsx'
import ExperiencePage from './pages/ExperiencePage.tsx'
import ProjectsPage from './pages/ProjectsPage.tsx'
import ContactPage from './pages/ContactPage.tsx'
import PlaygroundPage from './pages/PlaygroundPage.tsx'
import ChatPage from './pages/ChatPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { reportWebVitals } from './utils/reportWebVitals'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="experience" element={<ExperiencePage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="playground" element={<PlaygroundPage />} />
            <Route path="chat" element={<ChatPage />} />
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
