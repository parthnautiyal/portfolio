import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.tsx'
import Footer from '../components/Footer.tsx'
import StructuredData from '../components/StructuredData.tsx'

export default function RootLayout() {
  return (
    <div className="min-h-screen text-[var(--color-text)]">
      <StructuredData />
      <Navbar />
      <main id="main-content" className="max-w-7xl mx-auto px-6 pb-16 pt-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
