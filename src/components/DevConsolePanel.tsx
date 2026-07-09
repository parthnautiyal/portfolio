import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiTerminal, FiX, FiCornerDownLeft } from 'react-icons/fi'
import { personal } from '../content/personal.ts'
import { skillCategories } from '../content/skills.ts'

type LogEntry = {
  text: string
  type: 'input' | 'output' | 'error' | 'success'
}

export default function DevConsolePanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [history, setHistory] = useState<LogEntry[]>([
    { text: 'Parth OS v1.0.0 (Type "help" for commands)', type: 'success' }
  ])
  
  const consoleEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Toggle console with ctrl + ~
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-scroll to bottom of console logs
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, isOpen])

  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim().toLowerCase()
    if (!trimmed) return

    const newEntries: LogEntry[] = [{ text: `guest@parthnautiyal:~$ ${cmdStr}`, type: 'input' }]

    switch (trimmed) {
      case 'help':
        newEntries.push(
          { text: 'Available commands:', type: 'success' },
          { text: '  about      - Display bio details', type: 'output' },
          { text: '  skills     - List technical capabilities', type: 'output' },
          { text: '  projects   - Navigate to projects page', type: 'output' },
          { text: '  resume     - Launch interactive resume viewer', type: 'output' },
          { text: '  system     - Open system architecture & pipeline', type: 'output' },
          { text: '  joke       - Print a developer joke', type: 'output' },
          { text: '  sudo       - Elevate privileges', type: 'output' },
          { text: '  clear      - Clear screen logs', type: 'output' }
        )
        break
      case 'clear':
        setHistory([])
        setInputVal('')
        return
      case 'about':
        newEntries.push(
          { text: `Name: ${personal.name}`, type: 'output' },
          { text: `Title: ${personal.title}`, type: 'output' },
          { text: `Bio: ${personal.summary}`, type: 'output' },
          { text: `GitHub: ${personal.github}`, type: 'output' }
        )
        break
      case 'skills':
        const skillList = skillCategories.flatMap(c => c.items).map(s => s.name).join(', ')
        newEntries.push({ text: `Technical Skills: ${skillList}`, type: 'output' })
        break
      case 'projects':
        newEntries.push({ text: 'Navigating to /projects...', type: 'success' })
        setTimeout(() => {
          navigate('/projects')
          setIsOpen(false)
        }, 1000)
        break
      case 'resume':
        newEntries.push({ text: 'Navigating to Resume Section /resume...', type: 'success' })
        setTimeout(() => {
          navigate('/resume')
          setIsOpen(false)
        }, 1000)
        break
      case 'system':
        newEntries.push({ text: 'Navigating to System Architecture Section /system...', type: 'success' })
        setTimeout(() => {
          navigate('/system')
          setIsOpen(false)
        }, 1000)
        break
      case 'joke': {
        const jokes = [
          "Why do programmers wear glasses? Because they can't C#.",
          "There are 10 types of people in the world: those who understand binary, and those who don't.",
          "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
          "A SQL query goes into a bar, walks up to two tables and asks, 'Can I join you?'",
          "Why did the developer go broke? Because he used up all his cache.",
          "I have a joke about recursion... I have a joke about recursion...",
          "A byte walks into a bar looking pale. The bartender asks, 'What's wrong?' Byte: 'Bit flip.'",
          "Why do Java developers wear glasses? Because they don't C++.",
          "!false — it's funny because it's true.",
          "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
          "A QA engineer walks into a bar. Orders 0 beers. Orders 999999999 beers. Orders -1 beers. Orders a lizard. Orders null beers. Orders asdfjkl beers.",
          "What do you call a programmer from Finland? Nerdic.",
          "Git commit -m 'fix' pushed 47 times in a row: works on my machine.",
          "The cloud is just someone else's computer having an existential crisis.",
          "I'd explain Kubernetes to you, but we'd be here until the heat death of the cluster.",
          "99 little bugs in the code, 99 little bugs. Take one down, patch it around, 127 little bugs in the code.",
          "Debugging: removing the needles from a haystack you lit on fire yourself.",
          "Stack Overflow is just programmers paying it forward from their own panic.",
          "There are two hard problems in computer science: cache invalidation, naming things, and off-by-one errors.",
          "My code doesn't have bugs. It has undocumented features.",
          "A programmer's spouse asks: 'Go to the store, get a gallon of milk, and if they have eggs, get a dozen.' He comes home with 12 gallons of milk.",
          "Why did the scarecrow win an award? Because he was outstanding in his field... just like my Kubernetes pods.",
          "In Soviet Russia, code reviews you.",
          "I'm not lazy, I'm on energy-saving mode. Like a Lambda on cold start.",
          "Schrodinger's microservice: simultaneously working and not working until someone checks the logs.",
          "The first rule of Kafka club: you do not talk about Kafka. The second rule: you do not understand Kafka.",
          "Spring Boot: because XML configs weren't painful enough.",
          "Temporal workflows: for when your cron job has abandonment issues.",
        ]
        const idx = Math.floor(Math.random() * jokes.length)
        newEntries.push({ text: jokes[idx], type: 'output' })
        break
      }
      case 'sudo':
        newEntries.push({ 
          text: "❌ Error: guest is not in the sudoers file. This incident will be reported to the sysadmin.", 
          type: 'error' 
        })
        break
      default:
        newEntries.push({ 
          text: `❌ bash: command not found: ${trimmed}. Type "help" for options.`, 
          type: 'error' 
        })
    }

    setHistory((prev) => [...prev, ...newEntries])
    setInputVal('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeCommand(inputVal)
  }

  return (
    <>
      {/* Floating CLI Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-40 p-3.5 rounded-full bg-slate-900 text-green-400 border border-slate-700/50 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer dark:bg-slate-900"
        title="Toggle Dev CLI Console (Ctrl + `)"
      >
        <FiTerminal size={20} />
      </button>

      {/* Slide-Up retro console panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 w-[92vw] sm:w-[460px] h-[340px] z-50 rounded-2xl border border-green-500/20 bg-slate-950/95 text-green-400 p-4 font-mono flex flex-col shadow-2xl select-text">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-green-500/10 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-[0.65rem] font-bold text-slate-500 ml-1">developer-console</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-green-400 transition-colors"
            >
              <FiX size={14} />
            </button>
          </div>

          {/* Console Output Log */}
          <div className="flex-1 overflow-y-auto space-y-1.5 text-[0.65rem] pr-1 scrollbar-thin scrollbar-thumb-green-500/20">
            {history.map((entry, idx) => (
              <div
                key={idx}
                className={
                  entry.type === 'error'
                    ? 'text-red-400'
                    : entry.type === 'success'
                    ? 'text-blue-400 font-bold'
                    : entry.type === 'input'
                    ? 'text-slate-300'
                    : 'text-green-400'
                }
              >
                {entry.text}
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>

          {/* Console Command Input Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-2 border-t border-green-500/10 pt-2 flex items-center gap-1.5"
          >
            <span className="text-[0.65rem] text-slate-400">guest@parth:~$</span>
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder='Try "help" or "joke"...'
              className="flex-1 text-[0.65rem] font-mono bg-transparent border-none outline-none text-green-400 placeholder-green-900"
              autoFocus
            />
            <button type="submit" className="text-slate-600 hover:text-green-400 transition-colors">
              <FiCornerDownLeft size={12} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
