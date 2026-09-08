import { useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const starterPrompts = [
  'How can I improve my resume for an AI internship?',
  'Create a 30-day plan to learn frontend development.',
  'Give me three behavioral interview questions to practice.',
]

function App() {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [isOnline, setIsOnline] = useState(null)
  const textareaRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    checkHealth()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  async function checkHealth() {
    try {
      const response = await fetch(`${API_URL}/health`)
      setIsOnline(response.ok)
    } catch {
      setIsOnline(false)
    }
  }

  async function sendMessage(event) {
    event?.preventDefault()
    const message = draft.trim()
    if (!message || isSending) return

    setMessages((current) => [...current, { role: 'user', content: message }])
    setDraft('')
    setError('')
    setIsSending(true)

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'The coach could not respond.')

      setMessages((current) => [...current, { role: 'assistant', content: data.response }])
      setIsOnline(true)
    } catch (requestError) {
      setError(requestError.message || 'Unable to reach the Career Coach API.')
      setIsOnline(false)
    } finally {
      setIsSending(false)
      textareaRef.current?.focus()
    }
  }

  async function resetConversation() {
    try {
      const response = await fetch(`${API_URL}/chat/reset`, { method: 'POST' })
      if (!response.ok) throw new Error('Reset failed')
      setMessages([])
      setError('')
      setIsOnline(true)
    } catch {
      setError('Unable to reset the conversation. Check that the API is running.')
    }
  }

  function usePrompt(prompt) {
    setDraft(prompt)
    textareaRef.current?.focus()
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Career Coach home">
          <span className="brand-mark">CC</span>
          <span>Career Coach <em>AI</em></span>
        </a>
        <div className="connection-state" aria-live="polite">
          <span className={`status-dot ${isOnline === false ? 'offline' : ''}`} />
          {isOnline === false ? 'API offline' : 'Coach online'}
          <button className="reset-button" onClick={resetConversation} type="button">
            Reset chat
          </button>
        </div>
      </header>

      <section className="workspace">
        <aside className="intro-panel">
          <p className="eyebrow">Your next move, clearer</p>
          <h1>A career conversation that moves you forward.</h1>
          <p className="intro-copy">
            Get practical guidance on resumes, interviews, career paths, and the skills that matter next.
          </p>
          <div className="focus-list">
            <div><span>01</span><p>Resume direction</p></div>
            <div><span>02</span><p>Interview confidence</p></div>
            <div><span>03</span><p>Skill-building plans</p></div>
          </div>
          <p className="api-note">Connected to <strong>{API_URL.replace(/^https?:\/\//, '')}</strong></p>
        </aside>

        <section className="chat-panel" aria-label="Career Coach chat">
          <div className="chat-heading">
            <div>
              <p className="eyebrow">Open coaching session</p>
              <h2>What are you working toward?</h2>
            </div>
            <span className="spark">✦</span>
          </div>

          <div className="messages" aria-live="polite">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="coach-avatar">✦</div>
                <h3>Start with a real question.</h3>
                <p>The more context you share, the more useful the next step will be.</p>
                <div className="prompt-grid">
                  {starterPrompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => usePrompt(prompt)}>
                      {prompt}<span>↗</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
                  <span className="message-label">{message.role === 'user' ? 'You' : 'Coach'}</span>
                  <p>{message.content}</p>
                </article>
              ))
            )}
            {isSending && <article className="message assistant"><span className="message-label">Coach</span><p className="typing">Thinking <i /><i /><i /></p></article>}
            <div ref={messagesEndRef} />
          </div>

          {error && <p className="error-message" role="alert">{error}</p>}
          <form className="composer" onSubmit={sendMessage}>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  sendMessage(event)
                }
              }}
              placeholder="Tell me what you want to figure out..."
              rows="1"
              aria-label="Message your career coach"
            />
            <button className="send-button" type="submit" disabled={!draft.trim() || isSending} aria-label="Send message">
              <span>Send</span><span aria-hidden="true">↗</span>
            </button>
          </form>
          <p className="composer-hint">Press Enter to send · Shift + Enter for a new line</p>
        </section>
      </section>
    </main>
  )
}

export default App
