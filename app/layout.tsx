// app/layout.tsx
import '../styles/globals.css'
import Script from 'next/script'
import type { ReactNode } from 'react'
import Analytics from './analytics' 

export const metadata = {
  title: 'Stackle Word',
  description: 'Daily & Endless word-stacking game',
  themeColor: '#3B82F6',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {gaId && (
          <>
            <Script
              id="ga-loader"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { send_page_view: false });
              `}
            </Script>
          </>
        )}
      </head>
      
      <body><Analytics/>{children}</body>
    </html>
  )
}
