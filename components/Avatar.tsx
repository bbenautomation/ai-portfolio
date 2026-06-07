'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

export type AvatarState = 'idle' | 'thinking' | 'speaking'

interface AvatarProps {
  state: AvatarState
  compact?: boolean
  size?: number
}

export default function Avatar({ state, compact = false, size: sizeProp }: AvatarProps) {
  const [blink, setBlink] = useState(false)
  const reduced   = useReducedMotion()
  const size      = sizeProp ?? (compact ? 64 : 180)

  /* ── Refs for eye tracking ───────────────────── */
  const containerRef  = useRef<HTMLDivElement>(null)
  const leftEyeRef    = useRef<SVGGElement>(null)   // iris + pupil + shine group
  const rightEyeRef   = useRef<SVGGElement>(null)
  const targetOff     = useRef({ x: 0, y: 0 })
  const currentOff    = useRef({ x: 0, y: 0 })
  const rafEyeRef     = useRef<number>(0)

  /* ── Blink scheduler ─────────────────────────── */
  useEffect(() => {
    if (reduced) return
    let timeout: ReturnType<typeof setTimeout>
    const schedule = () => {
      const delay = 2500 + Math.random() * 4000
      timeout = setTimeout(() => {
        setBlink(true)
        setTimeout(() => { setBlink(false); schedule() }, 120)
      }, delay)
    }
    schedule()
    return () => clearTimeout(timeout)
  }, [reduced])

  /* ── Eye tracking ────────────────────────────── */
  useEffect(() => {
    if (reduced) return

    const MAX_TRAVEL = 2.8   // SVG units — how far the pupil moves

    const onMouseMove = (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()

      // Direction from avatar center to cursor
      const dx = e.clientX - (rect.left + rect.width  / 2)
      const dy = e.clientY - (rect.top  + rect.height / 2)
      const dist = Math.sqrt(dx * dx + dy * dy) || 1

      // Travel scales with distance up to ~120px, then caps
      const travel = Math.min(dist / 120, 1) * MAX_TRAVEL
      targetOff.current = {
        x: (dx / dist) * travel,
        y: (dy / dist) * travel,
      }
    }

    /* Smooth lerp loop — updates SVG attrs directly, no React re-renders */
    const loop = () => {
      rafEyeRef.current = requestAnimationFrame(loop)

      const cx = currentOff.current
      const tx = targetOff.current
      const dx = tx.x - cx.x
      const dy = tx.y - cx.y

      if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return

      cx.x += dx * 0.12
      cx.y += dy * 0.12

      const transform = `translate(${cx.x.toFixed(2)}, ${cx.y.toFixed(2)})`
      leftEyeRef.current?.setAttribute('transform', transform)
      rightEyeRef.current?.setAttribute('transform', transform)
    }

    window.addEventListener('mousemove', onMouseMove)
    rafEyeRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafEyeRef.current)
    }
  }, [reduced])

  const glowColor    = 'rgba(0, 212, 255, 0.4)'
  const glowColorDim = 'rgba(0, 212, 255, 0.15)'

  return (
    <div ref={containerRef} style={{ position: 'relative', width: size, height: size }}>

      {/* Outer pulse ring */}
      {!compact && !reduced && (
        <motion.div
          style={{
            position: 'absolute', inset: -12, borderRadius: '50%',
            border: `1px solid ${glowColorDim}`, pointerEvents: 'none',
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Inner glow ring */}
      {!compact && !reduced && (
        <motion.div
          style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: `2px solid ${glowColor}`,
            boxShadow: `0 0 24px ${glowColor}, inset 0 0 24px ${glowColorDim}`,
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      )}

      {/* Avatar body */}
      <motion.div
        style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden' }}
        animate={reduced ? {} : {
          scale: [1, 1.018, 1],
          rotate: state === 'thinking' ? [-2, 2, -2] : 0,
        }}
        transition={state === 'thinking'
          ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 4,   repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <svg viewBox="0 0 180 180" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bg-grad"   cx="50%" cy="40%" r="70%">
              <stop offset="0%"   stopColor="#111128" />
              <stop offset="100%" stopColor="#050510" />
            </radialGradient>
            <radialGradient id="skin-grad" cx="45%" cy="35%" r="70%">
              <stop offset="0%"   stopColor="#fcd5a4" />
              <stop offset="100%" stopColor="#e8a870" />
            </radialGradient>
            <radialGradient id="skin-ear"  cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#f0b880" />
              <stop offset="100%" stopColor="#dc9660" />
            </radialGradient>
            <radialGradient id="shirt-grad" cx="50%" cy="20%" r="80%">
              <stop offset="0%"   stopColor="#1e3a6e" />
              <stop offset="100%" stopColor="#0d1f42" />
            </radialGradient>
            <clipPath id="avatar-clip">
              <circle cx="90" cy="90" r="89" />
            </clipPath>
          </defs>

          <circle cx="90" cy="90" r="90" fill="url(#bg-grad)" />

          <g clipPath="url(#avatar-clip)">
            {/* Shirt */}
            <ellipse cx="90" cy="195" rx="70" ry="50" fill="url(#shirt-grad)" />
            <path d="M 65,155 L 90,175 L 115,155" fill="#0d1f42" stroke="#1a2e5a" strokeWidth="1" />

            {/* Neck */}
            <rect x="76" y="136" width="28" height="24" rx="4" fill="url(#skin-grad)" />

            {/* Ears */}
            <ellipse cx="39"  cy="92" rx="7" ry="9" fill="url(#skin-ear)" />
            <ellipse cx="40"  cy="92" rx="4" ry="6" fill="#d89060" opacity="0.5" />
            <ellipse cx="141" cy="92" rx="7" ry="9" fill="url(#skin-ear)" />
            <ellipse cx="140" cy="92" rx="4" ry="6" fill="#d89060" opacity="0.5" />

            {/* Head */}
            <ellipse cx="90" cy="90" rx="52" ry="57" fill="url(#skin-grad)" />

            {/* Hair */}
            <ellipse cx="90" cy="45" rx="53" ry="30" fill="#1a0800" />
            <ellipse cx="40"  cy="70" rx="9"  ry="18" fill="#1a0800" />
            <ellipse cx="140" cy="70" rx="9"  ry="18" fill="#1a0800" />
            <path d="M 44,68 Q 60,58 90,56 Q 120,58 136,68"
              fill="none" stroke="#1a0800" strokeWidth="8" strokeLinecap="round" />

            {/* ── LEFT EYE ── */}
            {blink ? (
              <path d="M 62,87 Q 72,84 82,87"
                stroke="#d09060" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            ) : (
              <>
                {/* White of eye — static */}
                <ellipse cx="72" cy="87" rx="10" ry="8" fill="white" />
                {/* Iris + pupil + shine — tracked group */}
                <g ref={leftEyeRef}>
                  <ellipse cx="73" cy="88" rx="6"   ry="6"   fill="#2a1400" />
                  <ellipse cx="73" cy="88" rx="3.5" ry="3.5" fill="#0a0400" />
                  <circle  cx="75" cy="85" r="1.8"  fill="white" opacity="0.9" />
                </g>
              </>
            )}
            {/* Eyelid crease */}
            <path d="M 62,82 Q 72,78 82,82"
              fill="none" stroke="#c07848" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

            {/* ── RIGHT EYE ── */}
            {blink ? (
              <path d="M 98,87 Q 108,84 118,87"
                stroke="#d09060" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            ) : (
              <>
                {/* White of eye — static */}
                <ellipse cx="108" cy="87" rx="10" ry="8" fill="white" />
                {/* Iris + pupil + shine — tracked group */}
                <g ref={rightEyeRef}>
                  <ellipse cx="109" cy="88" rx="6"   ry="6"   fill="#2a1400" />
                  <ellipse cx="109" cy="88" rx="3.5" ry="3.5" fill="#0a0400" />
                  <circle  cx="111" cy="85" r="1.8"  fill="white" opacity="0.9" />
                </g>
              </>
            )}
            {/* Eyelid crease */}
            <path d="M 98,82 Q 108,78 118,82"
              fill="none" stroke="#c07848" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

            {/* ── EYEBROWS ── */}
            <path d="M 61,76 Q 72,71 83,73"
              fill="none" stroke="#3a1800" strokeWidth="3" strokeLinecap="round" />
            <path d="M 97,73 Q 108,71 119,76"
              fill="none" stroke="#3a1800" strokeWidth="3" strokeLinecap="round" />

            {/* ── NOSE ── */}
            <path d="M 87,97 Q 84,106 82,108 Q 88,111 98,108 Q 96,106 93,97"
              fill="none" stroke="#c8844a" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="84.5" cy="107" rx="2.5" ry="1.8" fill="#c8844a" opacity="0.5" />
            <ellipse cx="95.5" cy="107" rx="2.5" ry="1.8" fill="#c8844a" opacity="0.5" />

            {/* ── MOUTH ── */}
            {state === 'speaking' ? (
              <motion.path
                d="M 72,120 Q 90,136 108,120"
                fill="none" stroke="#8b3a1a" strokeWidth="2.5" strokeLinecap="round"
                initial={{ d: 'M 76,118 Q 90,128 104,118' }}
                animate={{ d: 'M 72,120 Q 90,136 108,120' }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <path d="M 76,118 Q 90,128 104,118"
                fill="none" stroke="#8b3a1a" strokeWidth="2.5" strokeLinecap="round" />
            )}

            {/* Cheek blush */}
            <ellipse cx="60"  cy="103" rx="9" ry="6" fill="#ff8060" opacity="0.12" />
            <ellipse cx="120" cy="103" rx="9" ry="6" fill="#ff8060" opacity="0.12" />
          </g>
        </svg>
      </motion.div>

      {/* Thinking dots */}
      {state === 'thinking' && (
        <div style={{
          position: 'absolute',
          bottom: compact ? -20 : -32,
          left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '5px', alignItems: 'center',
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="typing-dot" style={{
              width: compact ? 5 : 7, height: compact ? 5 : 7,
              borderRadius: '50%', background: 'var(--accent)',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}
