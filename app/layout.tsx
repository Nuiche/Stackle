// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://lexit.uno'),
  title: 'Lexit',
  description: 'Change one letter. Stack your way to the top.',
  alternates: { canonical: '/' },
  openGraph: {
    url: 'https://lexit.uno',
    title: 'Lexit',
    description: 'Change one letter. Stack your way to the top.',
    siteName: 'Lexit',
    images: ['/og-image.png'],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lexit',
    description: 'Change one letter. Stack your way to the top.',
    images: ['/og-image.png']
  }
}

export const viewport: Viewport = {
  themeColor: '#3B82F6'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
