import Hero from '../sections/Hero'
import About from '../sections/About'
import Skills from '../sections/Skills'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <Hero />
      <About />
      <Skills />
    </div>
  )
}

