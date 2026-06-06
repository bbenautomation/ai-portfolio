'use client'

import { useChat } from 'ai/react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, ArrowDown } from 'lucide-react'
import Avatar, { type AvatarState } from '@/components/Avatar'
import MouseEffect from '@/components/MouseEffect'
import ThemeToggle from '@/components/ThemeToggle'

/* ── Suggestion chips ────────────────────────── */
const CHIPS = [
  { label: 'What can you automate for me? 🤖', emoji: '🤖' },
  { label: 'Show me your work experience', emoji: '💼' },
  { label: 'What tools do you use?', emoji: '🛠️' },
  { label: 'How can we collaborate?', emoji: '🤝' },
  { label: 'Tell me a fun fact 😄', emoji: '😄' },
]

/* ── Typing indicator component ─────────────── */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: 'var(--accent)', color: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 800, letterSpacing: '-0.03em',
      }}>
        JB
      </div>
      <div style={{
        background: 'var(--ai-bubble)',
        border: '1px solid var(--ai-bubble-border)',
        borderRadius: '18px 18px 18px 4px',
        padding: '10px 14px',
        display: 'flex', gap: 5, alignItems: 'center',
        boxShadow: '0 0 16px var(--accent-glow)',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="typing-dot" style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--accent)',
          }} />
        ))}
      </div>
    </motion.div>
  )
}

/* ── Individual message bubble ───────────────── */
function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 8,
      }}
    >
      {/* Avatar badge for AI messages */}
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'var(--accent)', color: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, letterSpacing: '-0.03em',
          boxShadow: '0 0 12px var(--accent-glow)',
        }}>
          JB
        </div>
      )}

      {/* Bubble */}
      <div
        className={!isUser ? 'message-content' : undefined}
        style={{
          maxWidth: 'min(80%, 560px)',
          padding: '10px 15px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          fontSize: 14,
          lineHeight: 1.65,
          background: isUser ? 'var(--user-bubble)' : 'var(--ai-bubble)',
          border: `1px solid ${isUser ? 'var(--border)' : 'var(--ai-bubble-border)'}`,
          color: 'var(--text)',
          boxShadow: isUser ? 'none' : '0 0 20px var(--accent-glow)',
          wordBreak: 'break-word',
        }}
      >
        {isUser ? (
          <p style={{ margin: 0 }}>{content}</p>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        )}
      </div>
    </motion.div>
  )
}

/* ── Main page ───────────────────────────────── */
export default function Home() {
  const reduced = useReducedMotion()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
  })

  const hasMessages = messages.length > 0

  /* Determine avatar state */
  const lastMsg = messages[messages.length - 1]
  const avatarState: AvatarState = isLoading
    ? (lastMsg?.role === 'assistant' ? 'speaking' : 'thinking')
    : 'idle'

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
  }, [messages, isLoading, reduced])

  /* Show scroll-to-bottom button when scrolled up */
  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const onScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      setShowScrollBtn(distFromBottom > 120)
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [hasMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendChip = (text: string) => {
    void append({ role: 'user', content: text })
    inputRef.current?.focus()
  }

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Mouse rainbow effect */}
      <MouseEffect />

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Background grid — subtle depth */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(var(--border) 1px, transparent 1px),
          linear-gradient(90deg, var(--border) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        opacity: 0.25,
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 100%)',
      }} />

      {/* Content layer */}
      <div style={{
        display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 1,
        maxWidth: 720, width: '100%', margin: '0 auto',
        padding: '0 16px',
      }}>

        {/* ── Avatar + welcome header ── */}
        <motion.div
          layout={!reduced}
          style={{
            display: 'flex',
            flexDirection: hasMessages ? 'row' : 'column',
            alignItems: 'center',
            gap: hasMessages ? 12 : 0,
            paddingTop: hasMessages ? '1rem' : '18vh',
            paddingBottom: hasMessages ? '0.75rem' : '0',
            borderBottom: hasMessages ? '1px solid var(--border)' : 'none',
            transition: 'padding 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <Avatar state={avatarState} compact={hasMessages} />

          <AnimatePresence mode="wait">
            {!hasMessages ? (
              /* Full welcome text */
              <motion.div
                key="welcome"
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ textAlign: 'center', marginTop: '1.5rem' }}
              >
                <h1 style={{
                  fontSize: 'clamp(1.4rem, 5vw, 2rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                  marginBottom: '0.4rem',
                }}>
                  Hey, I'm Ben{' '}
                  <span role="img" aria-label="wave">👋</span>
                </h1>
                <p style={{
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.02em',
                }}>
                  AI Automation Specialist — Pasig City, PH
                </p>
              </motion.div>
            ) : (
              /* Compact name row */
              <motion.div
                key="compact"
                initial={reduced ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <p style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                  John Benedict Biagtas
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  AI Automation Specialist
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Suggestion chips (shown before first message) ── */}
        <AnimatePresence>
          {!hasMessages && (
            <motion.div
              key="chips"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                justifyContent: 'center',
                marginTop: '2rem',
              }}
            >
              {CHIPS.map((chip, i) => (
                <motion.button
                  key={chip.label}
                  className="chip"
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 + i * 0.06, duration: 0.3 }}
                  onClick={() => sendChip(chip.label)}
                  style={{
                    padding: '8px 15px',
                    borderRadius: 9999,
                    fontSize: 13,
                    fontWeight: 500,
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--ai-bubble-border)',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: 'inherit',
                  }}
                >
                  {chip.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Message list ── */}
        <div
          ref={messagesContainerRef}
          style={{
            flex: 1,
            overflowY: hasMessages ? 'auto' : 'hidden',
            paddingTop: '1rem',
            paddingBottom: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <AnimatePresence>
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
              />
            ))}

            {/* Typing indicator while waiting for first token */}
            {isLoading && lastMsg?.role === 'user' && (
              <TypingIndicator key="typing" />
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll-to-bottom button */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              style={{
                position: 'fixed',
                bottom: 88,
                right: 'max(16px, calc((100vw - 720px) / 2 + 16px))',
                width: 36, height: 36,
                borderRadius: '50%',
                background: 'var(--surface)',
                border: '1px solid var(--border-bright)',
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 20,
                boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowDown size={15} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Input bar ── */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          paddingTop: 8,
          paddingBottom: 16,
          background: `linear-gradient(to top, var(--bg) 70%, transparent)`,
          zIndex: 10,
        }}>
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--surface)',
              border: `1px solid ${isLoading ? 'var(--ai-bubble-border)' : 'var(--border-bright)'}`,
              borderRadius: 9999,
              padding: '6px 6px 6px 18px',
              transition: 'border-color 0.2s',
              boxShadow: isLoading
                ? '0 0 20px var(--accent-glow)'
                : '0 2px 20px rgba(0,0,0,0.25)',
            }}
          >
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me anything about my work, skills, or how I can help…"
              disabled={isLoading}
              autoComplete="off"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 14,
                color: 'var(--text)',
                fontFamily: 'inherit',
                lineHeight: 1.5,
              }}
            />
            <motion.button
              type="submit"
              disabled={isLoading || !input.trim()}
              whileHover={!isLoading && input.trim() ? { scale: 1.05 } : {}}
              whileTap={!isLoading && input.trim() ? { scale: 0.95 } : {}}
              style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: isLoading || !input.trim() ? 'var(--border)' : 'var(--accent)',
                color: isLoading || !input.trim() ? 'var(--text-dim)' : '#000',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                flexShrink: 0,
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              <Send size={15} strokeWidth={2.5} />
            </motion.button>
          </form>

          {/* Footer note */}
          <p style={{
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--text-dim)',
            marginTop: 6,
          }}>
            AI-powered portfolio — responses may vary
          </p>
        </div>
      </div>
    </main>
  )
}
