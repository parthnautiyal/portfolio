import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import StructuredData from '../components/StructuredData'

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
      <StructuredData />
      <Navbar />
      <main id="main-content" className="max-w-5xl mx-auto px-4 pb-16 pt-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

