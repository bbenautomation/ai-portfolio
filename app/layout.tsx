import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ben Automation',
  description:
    'Chat with John\'s AI avatar. Ask about his projects, automation skills, and how he can help streamline your business.',
  openGraph: {
    title: 'Ben Automation',
    description: 'An interactive AI portfolio. Ask me anything.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geist.variable} ${geistMono.variable}`}
      style={{ fontFamily: 'var(--font-geist), system-ui, sans-serif' }}
    >
      <body>{children}</body>
    </html>
  )
}
