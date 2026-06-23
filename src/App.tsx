import Navbar from './components/Navbar.tsx'
import Hero from './sections/Hero.tsx'
import About from './sections/About.tsx'
import Skills from './sections/Skills.tsx'
import Experience from './sections/Experience.tsx'
import Projects from './sections/Projects.tsx'
import Education from './sections/Education.tsx'
import Contact from './sections/Contact.tsx'
import Footer from './components/Footer.tsx'

function App() {
  return (
    <div className="min-h-screen text-[var(--color-text)]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pb-16">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
