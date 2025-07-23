// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Lexit',
  description: 'A little goes a long way.',
}

export const viewport: Viewport = {
  themeColor: '#3BB2F6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-[#F1F5F9] text-[#334155] min-h-screen">
        {children}
      </body>
    </html>
  )
}
