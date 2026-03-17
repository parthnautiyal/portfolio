import { useState } from 'react'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi, I'm a chatbot trained on Parth's profile. Ask me about experience, skills, or projects.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMessage: ChatMessage = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    if (!apiBase) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Backend chat endpoint is not configured. Please set VITE_API_BASE_URL to enable this feature.",
        },
      ])
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      })
      if (!res.ok) {
        throw new Error('Failed to get response')
      }
      const data = (await res.json()) as { reply: string }
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Something went wrong while fetching a response. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void sendMessage()
  }

  return (
    <section className="py-16">
      <h2 className="section-heading animate-fade-up">
        Ask about Parth&apos;s journey
      </h2>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        This chatbot uses a small knowledge base built from the resume. In the
        future you can plug it into a richer dataset (blog posts, notes,
        project docs) for a full RAG experience.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="card-elevated flex h-[420px] flex-col p-4">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1 text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <p className="text-[0.65rem] text-slate-500">
                Thinking about a reply…
              </p>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about experience, skills, or projects…"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none ring-offset-1 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full border border-slate-900 px-4 py-1.5 text-[0.7rem] font-medium text-slate-900 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
            >
              Send
            </button>
          </form>
        </div>

        <div className="space-y-3 text-xs text-slate-700">
          <p className="font-medium text-slate-900">What this page shows</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>Multi-page routing with a dedicated chat screen.</li>
            <li>
              A chat UI that talks to a backend endpoint you can later back with
              a full RAG pipeline.
            </li>
            <li>
              Room to plug in additional documents (blogs, notes, project
              writeups) as your personal knowledge base grows.
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

