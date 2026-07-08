import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.tsx'
import Footer from '../components/Footer.tsx'
import StructuredData from '../components/StructuredData.tsx'
import DevConsolePanel from '../components/DevConsolePanel.tsx'

export default function RootLayout() {
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
