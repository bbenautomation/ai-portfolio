'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  inline?: boolean
}

export default function ThemeToggle({ inline = false }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(true)

  /* Sync to HTML attribute */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <motion.button
      onClick={() => setIsDark(d => !d)}
      aria-label="Toggle color theme"
      style={{
        ...(!inline && { position: 'fixed', top: '1rem', right: '1rem', zIndex: 100 }),
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}
      whileHover={{ scale: 1.1, color: 'var(--accent)' }}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </motion.div>
    </motion.button>
  )
}
