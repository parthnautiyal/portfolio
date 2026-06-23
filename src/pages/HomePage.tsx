import Hero from '../sections/Hero.tsx'
import About from '../sections/About.tsx'
import Skills from '../sections/Skills.tsx'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <Hero />
      <About />
      <Skills />
    </div>
  )
}

