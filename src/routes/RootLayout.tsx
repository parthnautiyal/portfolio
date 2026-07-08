import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar.tsx'
import Footer from '../components/Footer.tsx'
import StructuredData from '../components/StructuredData.tsx'
import DevConsolePanel from '../components/DevConsolePanel.tsx'
import { trackEvent } from '../utils/analytics.ts'

export default function RootLayout() {
  const location = useLocation()

  useEffect(() => {
    // Track client-side page views dynamically on route shifts
    trackEvent('page_view', {
      page_path: location.pathname,
      page_search: location.search,
      page_title: document.title || 'Parth Nautiyal Portfolio'
    })
  }, [location])

  return (
    <div className="min-h-screen text-[var(--color-text)]">
      <StructuredData />
      <Navbar />
      <main id="main-content" className="max-w-[1600px] mx-auto px-6 md:px-12 xl:px-16 pb-16 pt-6">
        <Outlet />
      </main>
      <Footer />
      <DevConsolePanel />
    </div>
  )
}
