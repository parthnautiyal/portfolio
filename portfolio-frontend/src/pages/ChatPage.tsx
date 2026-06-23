import { useState, useEffect, useRef } from 'react'
import { FiMessageSquare, FiBook, FiUploadCloud, FiTrash2, FiFileText, FiInfo } from 'react-icons/fi'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type Document = {
  name: string
  size: number
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi, I'm Parth's AI Hiring Agent. You can ask me anything about his engineering experience, system architecture, or tech stack. You can also upload reference documents on the right (like JDs, team notes, or blog write-ups) to query Parth's profile against them!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined

  useEffect(() => {
    // Load persisted documents if any
    const savedDocs = localStorage.getItem('portfolio_kb_documents')
    if (savedDocs) {
      try {
        setDocuments(JSON.parse(savedDocs))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  useEffect(() => {
    // Scroll chat window to bottom
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.size > 200 * 1024) {
        alert('File size exceeds 200KB. Please upload smaller text/markdown files.')
        return
      }
      const fileReader = new FileReader()
      fileReader.onload = (event) => {
        const text = event.target?.result as string
        setDocuments((prev) => {
          const next = [...prev.filter((d) => d.name !== file.name), {
            name: file.name,
            size: file.size,
            content: text,
          }]
          localStorage.setItem('portfolio_kb_documents', JSON.stringify(next))
          return next
        })
      }
      fileReader.readAsText(file)
    }
  }

  const handleDeleteDoc = (name: string) => {
    setDocuments((prev) => {
      const next = prev.filter((d) => d.name !== name)
      localStorage.setItem('portfolio_kb_documents', JSON.stringify(next))
      return next
    })
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMessage: ChatMessage = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Calculate knowledge base context to append
    let kbContext = ''
    if (documents.length > 0) {
      kbContext = documents
        .map((doc) => `--- DOCUMENT: ${doc.name} ---\n${doc.content}\n--- END DOCUMENT ---`)
        .join('\n\n')
    }

    const provider = localStorage.getItem('portfolio_api_provider') || 'gemini'
    const customKey = localStorage.getItem('portfolio_custom_api_key') || ''
    const ollamaUrl = localStorage.getItem('portfolio_ollama_url') || 'http://localhost:11434'
    const ollamaModel = localStorage.getItem('portfolio_ollama_model') || 'llama3'

    // If provider is local Ollama, call it directly from browser
    if (provider === 'ollama') {
      try {
        await callOllamaDirectly(userMessage.content, kbContext, ollamaUrl, ollamaModel)
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `❌ Local Ollama call failed. Make sure your Ollama daemon is running at ${ollamaUrl} and model "${ollamaModel}" is pulled. Error: ${err.message}`,
          },
        ])
      } finally {
        setLoading(false)
      }
      return
    }

    // Call serverless Vercel function
    const chatEndpoint = apiBase ? `${apiBase}/chat` : '/api/chat'
    try {
      const res = await fetch(chatEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          customApiKey: customKey,
          apiProvider: provider,
          kbContext: kbContext,
        }),
      })

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}))
        throw new Error(errorJson.error || 'Failed to communicate with LLM server')
      }

      const data = (await res.json()) as { reply: string }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err: any) {
      console.warn('Backend serverless chat failed, checking local Ollama fallback:', err.message)
      
      // Automatic client-side fallback to local Ollama if backend fails or is missing key credentials
      try {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '⚠️ Cloud service unavailable or rate-limited. Attempting local Ollama fallback...',
          },
        ])
        await callOllamaDirectly(userMessage.content, kbContext, ollamaUrl, ollamaModel)
      } catch (ollamaErr: any) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Chat Service Error: ${err.message}. (Local Ollama fallback also failed: ${ollamaErr.message}. Make sure Ollama is running and has pulled Llama3).`,
          },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  const callOllamaDirectly = async (msg: string, kbContext: string, url: string, model: string) => {
    // Format system context
    const resumeContext = `
You are a helpful, professional assistant representing Parth Nautiyal. Answers should be derived from his career profile:
- SDE I at ZopSmart (Jul 2024 - Present): Built Spring Boot microservices, Kafka, Spring Security, Helm, Kubernetes, Grafana, Datadog. Reduced API latency by ~50%.
- SDE Intern at ZopSmart (Jan 2024 - Jun 2024): Worked on TDD, JUnit, Mockito, increasing coverage by 45%.
- Skills: Java, Spring Boot, Microservices, Kafka, SQL, TypeScript, React, Docker, Kubernetes, Jenkins, Ansible, Grafana.
- Education: B.Tech in Computer Science from Lovely Professional University.
- Hobbies & Interests: System Design, Open Source, Obsidian notes, custom CLI tools.

Base answers on the above facts. Be concise, developer-friendly, and polite.
`

    let fullPrompt = `${resumeContext}\n`
    if (kbContext.trim()) {
      fullPrompt += `\nADDITIONAL CONTEXT DOCUMENTS:\n${kbContext}\n`
    }
    fullPrompt += `\nUser Question: ${msg}\n\nHelpful Response:`

    const res = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.2
        }
      }),
    })

    if (!res.ok) {
      throw new Error(`Ollama status code ${res.status}`)
    }

    const data = await res.json()
    setMessages((prev) => {
      // Remove the fallback warning if it was the last message
      const list = [...prev]
      if (list[list.length - 1].content.includes('Ollama fallback')) {
        list.pop()
      }
      return [...list, { role: 'assistant', content: data.response }]
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void sendMessage()
  }

  return (
    <section className="py-8 space-y-8 animate-fade-up">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">AI Agent Sandbox</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Chat with Parth&apos;s AI Agent, query his profile, and inject custom files into the knowledge base.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
        {/* Chat Console Area */}
        <div className="glass-card flex h-[500px] flex-col p-5 justify-between">
          <div className="border-b border-slate-200/40 dark:border-slate-800/40 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FiMessageSquare className="text-blue-500" />
              Chatbot Console
            </h3>
            <span className="flex items-center gap-1.5 text-[0.6rem] font-bold text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
              GEMINI / OLLAMA ACTIVE
            </span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1 py-4 text-xs scrollbar">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-blue-650 text-white rounded-tr-none'
                      : 'glass-panel text-[var(--color-text)] rounded-tl-none border-[var(--border-color)]'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-1 items-center text-[0.65rem] text-slate-400 font-medium">
                <svg className="animate-spin h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Hiring Agent is formulating response...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-[var(--border-color)] pt-4"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Spring Boot, system architecture, observability, Docker..."
              className="flex-1 rounded-xl glass-panel px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-900 border-none text-[var(--color-text)]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              Send
            </button>
          </form>
        </div>

        {/* Right Side: RAG Document Knowledge Base panel */}
        <div className="glass-card p-5 space-y-4 flex flex-col justify-between h-[500px]">
          <div className="space-y-4 overflow-y-auto scrollbar pr-1">
            <h3 className="text-sm font-semibold flex items-center gap-2 border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
              <FiBook className="text-blue-500" />
              Document Knowledge Base
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inject custom logs, job requirements, or project details into the RAG context. The AI Agent will use this background to tailor its answers.
            </p>

            {/* File Drag and Drop */}
            <div className="border border-dashed border-[var(--border-color)] hover:border-[var(--border-color-hover)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative">
              <input
                type="file"
                accept=".txt,.md,.json"
                onChange={handleDocUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FiUploadCloud className="text-slate-400 mb-1" size={20} />
              <span className="text-[0.65rem] font-semibold text-[var(--color-text)]">
                Upload context (.txt, .md, .json)
              </span>
              <span className="text-[0.55rem] text-slate-500 mt-0.5">Max size 200KB</span>
            </div>

            {/* Document List */}
            <div className="space-y-2">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 block">
                Active Knowledge Documents ({documents.length})
              </span>
              {documents.length === 0 ? (
                <div className="p-3 text-[0.65rem] text-slate-500 bg-slate-900/5 dark:bg-slate-100/5 rounded-xl border border-dashed border-[var(--border-color)] text-center">
                  No custom documents loaded.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar">
                  {documents.map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between p-2 glass-panel rounded-xl text-[0.65rem]">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <FiFileText className="text-blue-500 shrink-0" />
                        <span className="truncate font-semibold text-[var(--color-text)]">{doc.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteDoc(doc.name)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                        title="Delete document"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-3 space-y-2 text-[0.65rem] text-slate-500">
            <div className="flex items-center gap-1">
              <FiInfo className="shrink-0" />
              <span>Context will be automatically added to prompt messages.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
