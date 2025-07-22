// lib/gtag.ts
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export const pageview = (url: string) => {
  if (!GA_ID || typeof window === 'undefined') return
  window.gtag('config', GA_ID, { page_path: url })
}

export const event = (action: string, params: Record<string, any> = {}) => {
  if (!GA_ID || typeof window === 'undefined') return
  window.gtag('event', action, params)
}
