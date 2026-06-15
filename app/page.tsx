'use client'

import { useChat } from 'ai/react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, Download, Mail, Phone, MapPin, MessageCircle } from 'lucide-react'
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
      'Build reliable, end-to-end automations that eliminate repetitive manual work and keep your operations running around the clock.',
  },
  {
    title: 'System Integration',
    description:
      'Bring your apps, tools, and data sources together so your entire stack works as one connected, efficient system.',
  },
  {
    title: 'Process Optimization',
    description:
      'Identify where your team is losing time and build smarter automations that handle the slow, repetitive steps without missing a beat.',
  },
]


type AutomationItem = { id: string; name: string; subtitle: string; image: string; images?: string[]; summary: string; imageScale?: number }
const AUTOMATIONS: AutomationItem[] = [
  {
    id: 'ghost',
    name: 'GHOST',
    subtitle: 'Self-Healing Workflow Monitor',
    image: '/workflows/ghost.png',
    summary: 'A fully autonomous monitoring system that checks every 15 minutes for failed n8n executions. For each failure, AI diagnoses the root cause, retries the execution automatically, logs the incident to Google Sheets, and fires a Discord alert with the suggested fix — all without human input.',
  },
  {
    id: 'apex',
    name: 'APEX',
    subtitle: 'Lead Outreach System',
    image: '/workflows/apex.png',
    images: ['/workflows/apex.png', '/workflows/apex-reply.png'],
    summary: 'A two-workflow outreach system that reads new leads from Google Sheets, uses AI to write personalized emails, and sends them via Gmail. A second workflow monitors replies, classifies them as Interested, Not Interested, or Question, then routes each one automatically — hot lead alerts to Discord, auto-replies to questions, status updates for rejections.',
  },
  {
    id: 'cipher',
    name: 'CIPHER',
    subtitle: 'AI Content Factory',
    image: '/workflows/cipher.png',
    summary: 'Send one topic via webhook and get five ready-to-publish content pieces in return: a full blog post, a LinkedIn post, a Twitter thread, an email newsletter, and an AI image prompt. All five are saved to Google Sheets and delivered to your inbox in a single formatted digest.',
  },
  {
    id: 'verdict',
    name: 'VERDICT',
    subtitle: 'AI Job Application Screener',
    image: '/workflows/verdict.png',
    summary: 'An automated hiring pipeline that scores job applicants from 0 to 100 against role-specific requirements pulled from Google Sheets. Candidates above 70 receive a personalized interview invite; others get a polite rejection. Every decision is logged with the AI score and reasoning.',
  },
  {
    id: 'forge',
    name: 'FORGE',
    subtitle: 'Lead Enrichment Pipeline',
    image: '/workflows/forge.png',
    summary: 'Pulls leads from two separate Google Sheets sources, merges them into one unified list, and processes them in batches of three. AI generates a company summary and outreach score for each lead, with built-in rate limit handling between batches.',
  },
  {
    id: 'pulse',
    name: 'PULSE',
    subtitle: 'Weekly Project Status Report',
    image: '/workflows/pulse.png',
    summary: 'Every Monday at 8AM, the workflow pulls all project tasks from Google Sheets, calculates completion stats with JavaScript, and uses AI to write a professional status report. The full report goes out via Gmail; a condensed summary is posted to Discord.',
  },
  {
    id: 'herald',
    name: 'HERALD',
    subtitle: 'E-Commerce Support Bot',
    image: '/workflows/herald.png',
    summary: 'An AI-powered customer support chatbot backed by a Google Sheets knowledge base. Powered by Claude Haiku 4.5, it answers questions about shipping, returns, and orders while remembering the last 10 messages for context-aware responses. Unknown questions redirect to the support email.',
  },
]

type ToolkitItem = { name: string; abbr: string; color: string; bg: string; icon?: string; src?: string }
const TOOLKIT: ToolkitItem[] = [
  { name: 'Make.com',         abbr: 'Mk',  color: '#c084fc', bg: 'rgba(192,132,252,0.12)', icon: 'make' },
  { name: 'Zapier',           abbr: 'Zap', color: '#ff6b35', bg: 'rgba(255,107,53,0.12)',  icon: 'zapier' },
  { name: 'n8n',              abbr: 'n8n', color: '#ea4b71', bg: 'rgba(234,75,113,0.12)',  icon: 'n8n' },
  { name: 'Airtable',         abbr: 'Air', color: '#fcb400', bg: 'rgba(252,180,0,0.12)',   icon: 'airtable' },
  { name: 'Notion',           abbr: 'N',   color: '#e0e0e0', bg: 'rgba(255,255,255,0.06)', icon: 'notion' },
  { name: 'Google Workspace', abbr: 'G',   color: '#4285f4', bg: 'rgba(66,133,244,0.12)',  icon: 'google' },
  { name: 'Slack',            abbr: 'Sl',  color: '#e01e5a', bg: 'rgba(224,30,90,0.12)',   src: '/icons/slackicon.png' },
  { name: 'HubSpot',          abbr: 'Hs',  color: '#ff7a59', bg: 'rgba(255,122,89,0.12)',  icon: 'hubspot' },
  { name: 'Trello',           abbr: 'Tr',  color: '#0079bf', bg: 'rgba(0,121,191,0.12)',   icon: 'trello' },
  { name: 'ChatGPT',          abbr: 'GPT', color: '#10a37f', bg: 'rgba(16,163,127,0.12)',  src: '/icons/chatgpticon.svg' },
  { name: 'Webhooks',         abbr: 'Wh',  color: '#00d4ff', bg: 'rgba(0,212,255,0.10)',  src: '/icons/webhookicon.svg' },
  { name: 'Google Sheets',    abbr: 'GS',  color: '#34a853', bg: 'rgba(52,168,83,0.12)',   icon: 'googlesheets' },
  { name: 'PayPal',           abbr: 'PP',  color: '#00b4e6', bg: 'rgba(0,180,230,0.10)',   icon: 'paypal' },
  { name: 'Wise',             abbr: 'Ws',  color: '#9fe870', bg: 'rgba(159,232,112,0.10)', icon: 'wise' },
  { name: 'Claude AI',        abbr: 'Cl',  color: '#e8956d', bg: 'rgba(232,149,109,0.12)', src: '/icons/claudeicon.png' },
  { name: 'Claude Code',      abbr: 'CC',  color: '#d4764f', bg: 'rgba(212,118,79,0.12)',  src: '/icons/claudecodeicon.png' },
  { name: 'Gemini',           abbr: 'Gem', color: '#a8c7fa', bg: 'rgba(168,199,250,0.10)', icon: 'googlegemini' },
  { name: 'Clockify',         abbr: 'Clk', color: '#03A9F4', bg: 'rgba(3,169,244,0.12)',   icon: 'clockify' },
  { name: 'Typeform',         abbr: 'Tf',  color: '#d4d4d4', bg: 'rgba(255,255,255,0.06)', icon: 'typeform' },
  { name: 'Zoom',             abbr: 'Zm',  color: '#2D8CFF', bg: 'rgba(45,140,255,0.12)',  icon: 'zoom' },
  { name: 'AnyDesk',          abbr: 'AD',  color: '#EF443B', bg: 'rgba(239,68,59,0.12)',   icon: 'anydesk' },
  { name: 'Groq',             abbr: 'Gq',  color: '#F55036', bg: 'rgba(245,80,54,0.12)' },
  { name: 'Grok',             abbr: 'Gk',  color: '#e0e0e0', bg: 'rgba(255,255,255,0.06)' },
  { name: 'API Integration',  abbr: 'API', color: '#00d4ff', bg: 'rgba(0,212,255,0.10)' },
]

const TECH_CATEGORIES: { name: string; items: string[] }[] = [
  { name: 'Automation',        items: ['Make.com', 'Zapier', 'n8n'] },
  { name: 'AI & Models',       items: ['ChatGPT', 'Claude AI', 'Gemini', 'Groq', 'Grok'] },
  { name: 'Dev & Integration', items: ['Claude Code', 'Webhooks', 'API Integration'] },
  { name: 'CRM & Analytics',   items: ['HubSpot', 'Google Sheets', 'Airtable', 'Clockify'] },
  { name: 'Workspace',         items: ['Google Workspace', 'Notion', 'Trello', 'PayPal', 'Wise'] },
  { name: 'Comms & Ops',       items: ['Slack', 'Zoom', 'AnyDesk', 'Typeform'] },
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

/* ── Tech category card ──────────────────────────── */
function TechCategoryCard({ name, items }: { name: string; items: string[] }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '20px 18px',
    }}>
      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
        color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 14,
      }}>
        {name}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map(itemName => {
          const tool = TOOLKIT.find(t => t.name === itemName)
          const color = tool?.color ?? 'var(--text-muted)'
          return (
            <span key={itemName} style={{
              padding: '5px 11px', borderRadius: 9999,
              fontSize: 12, fontWeight: 500,
              color, background: tool?.bg ?? 'rgba(255,255,255,0.05)',
              border: `1px solid ${color}40`,
            }}>
              {itemName}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* ── Automation card + modal ─────────────────────── */
function AutomationCard({ item, index }: { item: AutomationItem; index: number }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        initial={reduced ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
        style={{
          width: '100%', padding: '22px 28px',
          borderRadius: 50, border: '1px solid var(--border-bright)',
          background: 'var(--surface)', cursor: 'pointer',
          textAlign: 'center', display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
          ;(e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-bright)'
          ;(e.currentTarget as HTMLElement).style.background = 'var(--surface)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          {item.subtitle}
        </span>
      </motion.button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={e => e.stopPropagation()}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 20, overflow: 'hidden',
                  maxWidth: 1040, width: '100%', maxHeight: '90vh',
                  overflowY: 'auto', position: 'relative',
                }}
              >
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    position: 'absolute', top: 12, right: 12, zIndex: 1,
                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 50, width: 36, height: 36, cursor: 'pointer',
                    color: '#fff', fontSize: 18, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'inherit',
                  }}
                >
                  ×
                </button>
                {(item.images ?? [item.image]).map((src, i) => (
                  <div key={i} style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
                    {item.images && item.images.length > 1 && (
                      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)', textTransform: 'uppercase', padding: '10px 16px 0', margin: 0 }}>
                        Workflow {i + 1} of {item.images.length}
                      </p>
                    )}
                    <img
                      src={src} alt={`${item.name} workflow ${i + 1}`}
                      style={{
                        width: '100%', display: 'block',
                        transform: item.imageScale ? `scale(${item.imageScale})` : undefined,
                        transformOrigin: 'center center',
                      }}
                    />
                  </div>
                ))}
                <div style={{ padding: '28px 32px' }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', margin: '0 0 16px' }}>
                    {item.subtitle}
                  </h3>
                  <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.75, margin: 0 }}>
                    {item.summary}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
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

/* ── Shared section containers ───────────────────── */
const SC: React.CSSProperties = {
  maxWidth: 760,
  margin: '0 auto',
  position: 'relative',
  zIndex: 1,
}
const SC_WIDE: React.CSSProperties = {
  maxWidth: 1100,
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
  textAlign: 'center',
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

  const [navVisible, setNavVisible] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  useEffect(() => {
    const el = document.getElementById('chat')
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setNavVisible(true) },
      { threshold: 0.05 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container || messages.length === 0) return
    container.scrollTo({ top: container.scrollHeight, behavior: reduced ? 'instant' : 'smooth' })
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

        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={navVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            display: 'flex', gap: 28, pointerEvents: navVisible ? 'auto' : 'none',
          }}
        >
          {[
            ['What I Do', '#work'],
            ['Automations', '#automations'],
            ['Systems & Technologies', '#systems'],
            ['Full Toolkit', '#toolkit'],
            ['Contact', '#chat'],
            ['Chat', '#chat-widget'],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              style={{
                fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none',
                fontWeight: 500, letterSpacing: '0.01em', transition: 'color 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {label}
            </a>
          ))}
        </motion.div>

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
        <div className="hero-layout">
          {/* Avatar — left */}
          <FadeIn>
            <Avatar state="idle" size={200} />
          </FadeIn>

          {/* Text stack — right */}
          <div style={{ flex: 1 }}>
            <FadeIn delay={0.08}>
              <h1 style={{
                fontSize: 'clamp(2.4rem, 7vw, 4rem)',
                fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05,
                marginBottom: '0.6rem', color: 'var(--text)',
              }}>
                Hey, I'm Ben
              </h1>
            </FadeIn>

            <FadeIn delay={0.14}>
              <p style={{
                fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
                color: 'var(--accent)', fontWeight: 600,
                letterSpacing: '0.01em', marginBottom: '1rem',
              }}>
                AI Automation Specialist
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p style={{
                fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.75,
                maxWidth: 420, marginBottom: '2rem',
              }}>
                I build the automations that handle your repetitive work behind the scenes, so your team can stay focused on what actually moves the business forward.
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
                <a
                  href="/johnbenedictbiagtas.pdf"
                  download
                  style={{
                    padding: '11px 26px', borderRadius: 9999,
                    background: 'transparent', color: 'var(--text-muted)',
                    fontWeight: 600, fontSize: 14, textDecoration: 'none',
                    border: '1px solid var(--border)',
                    letterSpacing: '-0.01em', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}
                >
                  <Download size={14} strokeWidth={2.5} />
                  Resume
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="work" style={{ ...SC_WIDE, padding: '7rem 24px' }}>
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

      {/* ── AUTOMATIONS ── */}
      <section id="automations" style={{ ...SC_WIDE, padding: '0 24px 7rem' }}>
        <FadeIn>
          <h2 style={SH}>Automations</h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {AUTOMATIONS.slice(0, 4).map((a, i) => (
                <AutomationCard key={a.id} item={a} index={i} />
              ))}
            </div>
            <div style={{ width: 'calc(75% - 4px)', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {AUTOMATIONS.slice(4).map((a, i) => (
                <AutomationCard key={a.id} item={a} index={i + 4} />
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── SYSTEMS & TECH ── */}
      <section id="systems" style={{ ...SC_WIDE, padding: '0 24px 7rem' }}>
        <FadeIn>
          <h2 style={SH}>Systems &amp; Technologies</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: 520, marginBottom: '3rem', textAlign: 'center', margin: '0 auto 3rem' }}>
            A full-spectrum automation stack covering everything from CRM architecture to AI model integration.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {TECH_CATEGORIES.map(cat => (
              <TechCategoryCard key={cat.name} name={cat.name} items={cat.items} />
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── TOOLKIT MARQUEE ── */}
      <section id="toolkit" style={{ ...SC_WIDE, padding: '0 24px 7rem' }}>
        <FadeIn>
          <h2 style={SH}>Full Toolkit</h2>
        </FadeIn>

        <div className="marquee-outer">
          <div className="marquee-track">
            {[...TOOLKIT, ...TOOLKIT].map((tool, i) => (
              <div
                key={i}
                className="toolkit-item"
                data-tooltip={tool.name}
                style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: tool.bg,
                  border: `1px solid ${tool.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.15s, border-color 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = tool.color + '80'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = tool.color + '30'
                }}
              >
                {tool.src ? (
                  <img src={tool.src} alt="" width={26} height={26} style={{ display: 'block', objectFit: 'contain' }} />
                ) : tool.icon ? (
                  <>
                    <img
                      src={`https://cdn.simpleicons.org/${tool.icon}/${tool.color.replace('#', '')}`}
                      alt=""
                      width={22}
                      height={22}
                      style={{ display: 'block' }}
                      onError={e => {
                        ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                        const next = (e.currentTarget as HTMLImageElement).nextElementSibling as HTMLElement
                        if (next) next.style.display = 'block'
                      }}
                    />
                    <span style={{
                      display: 'none', fontSize: tool.abbr.length > 2 ? 9 : 12,
                      fontWeight: 800, color: tool.color, letterSpacing: '-0.02em',
                    }}>
                      {tool.abbr}
                    </span>
                  </>
                ) : (
                  <span style={{
                    fontSize: tool.abbr.length > 2 ? 9 : 12,
                    fontWeight: 800, color: tool.color, letterSpacing: '-0.02em',
                  }}>
                    {tool.abbr}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT + CHAT ── */}
      <section id="chat" style={{ ...SC_WIDE, padding: '0 24px 7rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

          {/* LEFT: Contact */}
          <FadeIn>
            <div>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1.25rem' }}>
                {"Let's Automate Your"}<br />
                <span style={{ color: 'var(--accent)' }}>Business</span>
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: 480, marginBottom: '2.5rem' }}>
                Have repetitive tasks slowing your team down, or tools that need connecting? Let&apos;s talk.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: '2.5rem' }}>
                {[
                  { icon: <Mail size={16} />, label: 'Email', value: 'johnbenedictbiagtas@gmail.com', href: 'mailto:johnbenedictbiagtas@gmail.com' },
                  { icon: <Phone size={16} />, label: 'Phone', value: '+639295659969', href: 'tel:+639295659969' },
                  { icon: <MessageCircle size={16} />, label: 'WhatsApp', value: 'Chat on WhatsApp', href: 'https://wa.me/639295659969' },
                  { icon: <MapPin size={16} />, label: 'Location', value: 'Pasig City, Philippines', href: null },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent)',
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 500, marginBottom: 2 }}>{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                          style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
                        >{item.value}</a>
                      ) : (
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a
                  href="https://wa.me/639295659969"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    padding: '13px 28px', borderRadius: 9999,
                    background: 'var(--accent)', color: '#000',
                    fontWeight: 700, fontSize: 14, textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: 8,
                    letterSpacing: '-0.01em', fontFamily: 'inherit',
                    boxShadow: '0 0 24px var(--accent-glow)',
                  }}
                >
                  <MessageCircle size={15} strokeWidth={2.5} />
                  Chat on WhatsApp
                </a>
                <a
                  href="mailto:johnbenedictbiagtas@gmail.com"
                  style={{
                    padding: '13px 28px', borderRadius: 9999,
                    background: 'transparent', color: 'var(--text-muted)',
                    fontWeight: 600, fontSize: 14, textDecoration: 'none',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    letterSpacing: '-0.01em', fontFamily: 'inherit',
                  }}
                >
                  <Mail size={15} strokeWidth={2.5} />
                  Send an Email Directly
                </a>
              </div>
            </div>
          </FadeIn>

          {/* RIGHT: Chat widget */}
          <FadeIn delay={0.08}>
            <div id="chat-widget" style={{
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

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '2rem 24px', textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          Built by Ben. with
          <svg width="14" height="12" viewBox="0 0 7 6" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated', display: 'inline-block', verticalAlign: 'middle', color: 'var(--accent)' }}>
            <rect x="1" y="0" width="2" height="1" fill="currentColor"/>
            <rect x="4" y="0" width="2" height="1" fill="currentColor"/>
            <rect x="0" y="1" width="7" height="2" fill="currentColor"/>
            <rect x="1" y="3" width="5" height="1" fill="currentColor"/>
            <rect x="2" y="4" width="3" height="1" fill="currentColor"/>
            <rect x="3" y="5" width="1" height="1" fill="currentColor"/>
          </svg>
        </p>
      </footer>
    </div>
  )
}
