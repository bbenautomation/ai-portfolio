'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  hue: number
  size: number
}

interface SplashRing {
  r: number
  maxR: number
  opacity: number
  hue: number
}

interface Splash {
  x: number
  y: number
  life: number
  maxLife: number
  rings: SplashRing[]
}

export default function MouseEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let particles: Particle[] = []
    let splashes: Splash[] = []
    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let lastMove = Date.now()
    let hue = 180
    let animId: number
    let rafActive = false

    // Throttle mousemove to once per frame
    let pendingMove = false
    let pendingX = 0
    let pendingY = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    const startLoop = () => {
      if (!rafActive) {
        rafActive = true
        animId = requestAnimationFrame(draw)
      }
    }

    const onMove = (e: MouseEvent) => {
      pendingX = e.clientX
      pendingY = e.clientY
      pendingMove = true
      lastMove = Date.now()
      startLoop()
    }

    const onClick = (e: MouseEvent) => {
      const cx = e.clientX
      const cy = e.clientY
      const baseHue = hue

      splashes.push({
        x: cx,
        y: cy,
        life: 70,
        maxLife: 70,
        rings: [
          { r: 0, maxR: 70, opacity: 0.85, hue: baseHue },
          { r: 0, maxR: 115, opacity: 0.55, hue: (baseHue + 30) % 360 },
          { r: 0, maxR: 160, opacity: 0.3, hue: (baseHue + 60) % 360 },
        ],
      })

      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2
        const speed = 2.5 + Math.random() * 5
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 45 + Math.random() * 30,
          maxLife: 45 + Math.random() * 30,
          hue: (baseHue + i * 15) % 360,
          size: 2 + Math.random() * 5,
        })
      }
      startLoop()
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Process one mouse update per frame — the throttle
      if (pendingMove) {
        pendingMove = false
        mouseX = pendingX
        mouseY = pendingY
        hue = (hue + 2.5) % 360

        for (let i = 0; i < 4; i++) {
          const spread = 14
          particles.push({
            x: mouseX + (Math.random() - 0.5) * spread,
            y: mouseY + (Math.random() - 0.5) * spread,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5 - 0.5,
            life: 55 + Math.random() * 35,
            maxLife: 55 + Math.random() * 35,
            hue: (hue + Math.random() * 40 - 20 + 360) % 360,
            size: 3 + Math.random() * 7,
          })
        }
      }

      const inactiveMs = Date.now() - lastMove
      const globalFade = inactiveMs < 300
        ? 1
        : Math.max(0, 1 - (inactiveMs - 300) / 1800)

      // Stop the loop when there's nothing left to draw
      if (globalFade === 0 && splashes.length === 0 && particles.length === 0) {
        rafActive = false
        return
      }

      /* Particles */
      particles = particles.filter(p => p.life > 0)
      for (const p of particles) {
        const alpha = (p.life / p.maxLife) * globalFade * 0.85
        if (alpha <= 0) { p.life = 0; continue }

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        g.addColorStop(0, `hsla(${p.hue}, 100%, 65%, ${alpha})`)
        g.addColorStop(1, `hsla(${p.hue}, 100%, 65%, 0)`)

        ctx.beginPath()
        ctx.fillStyle = g
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy *= 0.96
        p.size *= 0.975
        p.life -= 1
      }

      /* Splashes */
      splashes = splashes.filter(s => s.life > 0)
      for (const s of splashes) {
        const prog = 1 - s.life / s.maxLife
        for (const ring of s.rings) {
          ring.r = prog * ring.maxR
          const rAlpha = ring.opacity * (s.life / s.maxLife)
          ctx.beginPath()
          ctx.strokeStyle = `hsla(${ring.hue}, 100%, 65%, ${rAlpha})`
          ctx.lineWidth = 1.5
          ctx.arc(s.x, s.y, ring.r, 0, Math.PI * 2)
          ctx.stroke()
        }
        s.life -= 1
      }

      animId = requestAnimationFrame(draw)
    }

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      cancelAnimationFrame(animId)
    }
  }, [reduced])

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'screen',
      }}
    />
  )
}
