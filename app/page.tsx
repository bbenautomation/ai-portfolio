'use client'

import { useChat } from 'ai/react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send } from 'lucide-react'
import Avatar, { type AvatarState } from '@/components/Avatar'
import MouseEffect from '@/components/MouseEffect'
import ThemeToggle from '@/components/ThemeToggle'

/* ── Data ────────────────────────────────────────── */
const CHIPS = [
  { label: 'What can you automate for me? 🤖' },
  { label: 'Show me your work experience' },
  { label: 'What tools do you use?' },
  { label: 'How can we collaborate?' },
  { label: 'Tell me a fun fact 😄' },
]

const SERVICES = [
  {
    title: 'Workflow Automation',
    description:
      'Build end-to-end automated workflows using Make.com, Zapier, and n8n that run without manual intervention.',
  },
  {
    title: 'System Integration',
    description:
      'Connect your CRM, apps, and data sources so information flows seamlessly across your entire tech stack.',
  },
  {
    title: 'Process Optimization',
    description:
      'Audit existing workflows, remove bottlenecks, and replace repetitive manual tasks with reliable automations.',
  },
]

const EXPERIENCE = [
  {
    company: 'Starrett Family Trucking',
    role: 'Personal Assistant to CEO',
    period: 'Feb 2022 – May 2023',
    location: 'Pennsylvania, USA (Remote)',
  },
  {
    company: 'MDS',
    role: 'Social Media Coordinator',
    period: 'Feb 2024 – May 2025',
    location: '',
  },
]

const TOOLS = [
  'Make.com', 'Zapier', 'n8n', 'Airtable', 'Notion',
  'Google Workspace', 'Slack', 'HubSpot', 'Trello', 'ChatGPT API',
]

/* ── Scroll-reveal wrapper ───────────────────────── */
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

/* ── Typing indicator ────────────────────────────── */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}
    >
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        background: 'var(--accent)', color: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 800, letterSpacing: '-0.03em',
      }}>
        JB
      </div>
      <div style={{
        background: 'var(--ai-bubble)', border: '1px solid var(--ai-bubble-border)',
        borderRadius: '16px 16px 16px 4px', padding: '10px 14px',
        display: 'flex', gap: 5, alignItems: 'center',
        boxShadow: '0 0 16px var(--accent-glow)',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="typing-dot" style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
          }} />
        ))}
      </div>
    </motion.div>
  )
}

/* ── Message bubble ──────────────────────────────── */
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
      {!isUser && (
        <div style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: 'var(--accent)', color: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 800, letterSpacing: '-0.03em',
          boxShadow: '0 0 10px var(--accent-glow)',
        }}>
          JB
        </div>
      )}
      <div
        className={!isUser ? 'message-content' : undefined}
        style={{
          maxWidth: 'min(80%, 480px)', padding: '9px 14px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          fontSize: 14, lineHeight: 1.65,
          background: isUser ? 'var(--user-bubble)' : 'var(--ai-bubble)',
          border: `1px solid ${isUser ? 'var(--border)' : 'var(--ai-bubble-border)'}`,
          color: 'var(--text)',
          boxShadow: isUser ? 'none' : '0 0 16px var(--accent-glow)',
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

/* ── Shared section container ────────────────────── */
const SC: React.CSSProperties = {
  maxWidth: 760,
  margin: '0 auto',
  position: 'relative',
  zIndex: 1,
}

/* ── Shared section heading ──────────────────────── */
const SH: React.CSSProperties = {
  fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
  fontWeight: 800,
  letterSpacing: '-0.035em',
  color: 'var(--text)',
  marginBottom: '2.5rem',
}

/* ── Main page ───────────────────────────────────── */
export default function Home() {
  const reduced = useReducedMotion()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } =
    useChat({ api: '/api/chat' })

  const hasMessages = messages.length > 0
  const lastMsg = messages[messages.length - 1]
  const avatarState: AvatarState = isLoading
    ? lastMsg?.role === 'assistant' ? 'speaking' : 'thinking'
    : 'idle'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
  }, [messages, isLoading, reduced])

  const sendChip = (text: string) => {
    void append({ role: 'user', content: text })
    inputRef.current?.focus()
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', position: 'relative' }}>
      <MouseEffect />

      {/* Fixed background grid */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(var(--border) 1px, transparent 1px),
          linear-gradient(90deg, var(--border) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        opacity: 0.18,
        maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 20%, transparent 100%)',
      }} />

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--bg) 78%, transparent)',
      }}>
        <a href="#" style={{
          fontWeight: 800, fontSize: 18, letterSpacing: '-0.04em',
          color: 'var(--text)', textDecoration: 'none',
        }}>
          Ben<span style={{ color: 'var(--accent)' }}>.</span>
        </a>

        <div className="nav-links">
          {[['Work', '#work'], ['Experience', '#experience'], ['Chat', '#chat']].map(
            ([label, href]) => (
              <a
                key={href}
                href={href}
                style={{
                  fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none',
                  fontWeight: 500, letterSpacing: '0.01em', transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {label}
              </a>
            )
          )}
        </div>

        <ThemeToggle inline />
      </nav>

      {/* ── HERO ── */}
      <section style={{
        ...SC,
        padding: '0 24px',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: 96,
        paddingBottom: 64,
      }}>
        <FadeIn>
          <Avatar state="idle" size={160} />
        </FadeIn>

        <FadeIn delay={0.08}>
          <h1 style={{
            fontSize: 'clamp(2.6rem, 8vw, 4.5rem)',
            fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05,
            marginTop: '1.5rem', marginBottom: '0.6rem', color: 'var(--text)',
          }}>
            Hey, I'm Ben{' '}
            <span role="img" aria-label="wave">👋</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.14}>
          <p style={{
            fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
            color: 'var(--accent)', fontWeight: 600,
            letterSpacing: '0.01em', marginBottom: '1rem',
          }}>
            AI Automation Specialist — Pasig City, PH
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p style={{
            fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.75,
            maxWidth: 460, marginBottom: '2.25rem',
          }}>
            I build automation workflows that help businesses eliminate repetitive tasks and connect their tools seamlessly.
          </p>
        </FadeIn>

        <FadeIn delay={0.26}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#work" style={{
              padding: '11px 26px', borderRadius: 9999,
              background: 'var(--accent)', color: '#000',
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
              letterSpacing: '-0.01em', fontFamily: 'inherit',
            }}>
              View my work
            </a>
            <a href="#chat" style={{
              padding: '11px 26px', borderRadius: 9999,
              background: 'transparent', color: 'var(--text)',
              fontWeight: 600, fontSize: 14, textDecoration: 'none',
              border: '1px solid var(--border-bright)',
              letterSpacing: '-0.01em', fontFamily: 'inherit',
            }}>
              Chat with me
            </a>
          </div>
        </FadeIn>
      </section>

      {/* ── SERVICES ── */}
      <section id="work" style={{ ...SC, padding: '7rem 24px' }}>
        <FadeIn>
          <h2 style={SH}>What I do</h2>
        </FadeIn>
        <div>
          {SERVICES.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.07}>
              <div className="section-row" style={{ padding: '2rem 0', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                  {s.description}
                </p>
              </div>
            </FadeIn>
          ))}
          <div style={{ borderTop: '1px solid var(--border)' }} />
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section id="experience" style={{ ...SC, padding: '0 24px 7rem' }}>
        <FadeIn>
          <h2 style={SH}>Experience</h2>
        </FadeIn>
        <div>
          {EXPERIENCE.map((e, i) => (
            <FadeIn key={e.company} delay={i * 0.07}>
              <div className="section-row" style={{ padding: '2rem 0', borderTop: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)', letterSpacing: '0.01em', marginBottom: 3 }}>
                    {e.period}
                  </p>
                  {e.location && (
                    <p style={{ fontSize: 12, color: 'var(--text-dim)', opacity: 0.7 }}>
                      {e.location}
                    </p>
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 4 }}>
                    {e.role}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>
                    {e.company}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
          <div style={{ borderTop: '1px solid var(--border)' }} />
        </div>
      </section>

      {/* ── TOOLS ── */}
      <section style={{ ...SC, padding: '0 24px 7rem' }}>
        <FadeIn>
          <h2 style={SH}>Tools &amp; Platforms</h2>
        </FadeIn>
        <FadeIn delay={0.08}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TOOLS.map(tool => (
              <span key={tool} style={{
                padding: '6px 14px', borderRadius: 6,
                border: '1px solid var(--border)',
                fontSize: 13, color: 'var(--text-muted)', fontWeight: 500,
                background: 'var(--surface)', letterSpacing: '0.01em',
              }}>
                {tool}
              </span>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── CHAT ── */}
      <section id="chat" style={{ ...SC, padding: '0 24px 6rem' }}>
        <FadeIn>
          <h2 style={{ ...SH, marginBottom: '0.5rem' }}>Chat with me</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Ask me anything about my work, skills, or how we can collaborate.
          </p>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div style={{
            border: '1px solid var(--border)', borderRadius: 16,
            overflow: 'hidden', background: 'var(--surface)',
            display: 'flex', flexDirection: 'column', height: 580,
            boxShadow: '0 0 40px var(--accent-glow)',
          }}>
            {/* Header */}
            <div style={{
              padding: '10px 14px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 10,
              flexShrink: 0, background: 'var(--bg-alt)',
            }}>
              <Avatar state={avatarState} compact />
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>
                  John Benedict Biagtas
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  AI Automation Specialist
                </p>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              style={{
                flex: 1, overflowY: 'auto', padding: '14px',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              {!hasMessages && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 0 8px' }}>
                  {CHIPS.map(chip => (
                    <button
                      key={chip.label}
                      className="chip"
                      onClick={() => sendChip(chip.label)}
                      style={{
                        padding: '7px 13px', borderRadius: 9999, fontSize: 12, fontWeight: 500,
                        background: 'var(--accent-dim)', border: '1px solid var(--ai-bubble-border)',
                        color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}

              <AnimatePresence>
                {messages.map(msg => (
                  <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
                ))}
                {isLoading && lastMsg?.role === 'user' && <TypingIndicator key="typing" />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg)',
                  border: `1px solid ${isLoading ? 'var(--ai-bubble-border)' : 'var(--border-bright)'}`,
                  borderRadius: 9999, padding: '5px 5px 5px 16px',
                  transition: 'border-color 0.2s',
                  boxShadow: isLoading ? '0 0 16px var(--accent-glow)' : 'none',
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
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontSize: 14, color: 'var(--text)', fontFamily: 'inherit', lineHeight: 1.5,
                  }}
                />
                <motion.button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  whileHover={!isLoading && input.trim() ? { scale: 1.05 } : {}}
                  whileTap={!isLoading && input.trim() ? { scale: 0.95 } : {}}
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: isLoading || !input.trim() ? 'var(--border)' : 'var(--accent)',
                    color: isLoading || !input.trim() ? 'var(--text-dim)' : '#000',
                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                    flexShrink: 0, transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  <Send size={14} strokeWidth={2.5} />
                </motion.button>
              </form>
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
                AI-powered portfolio — responses may vary
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '2rem 24px', textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          Built by Ben. Powered by Groq + Next.js.
        </p>
      </footer>
    </div>
  )
}
