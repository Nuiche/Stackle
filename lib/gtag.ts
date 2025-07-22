// lib/gtag.ts
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

type GAParams = Record<string, unknown>

export const pageview = (url: string) => {
  if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('config', GA_ID, { page_path: url } as GAParams)
}

export const event = (action: string, params: GAParams = {}) => {
  if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', action, params)
}
