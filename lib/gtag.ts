// lib/gtag.ts
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''

type PageViewParams = { page_path: string }
type EventParams = Record<string, string | number | boolean | undefined>

type Gtag =
  | ['js', Date]
  | ['config', string, PageViewParams?]
  | ['event', string, EventParams?]

declare global {
  interface Window {
    gtag: (...args: Gtag) => void
  }
}

export const pageview = (url: string): void => {
  if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('config', GA_ID, { page_path: url })
}

export const event = (action: string, params: EventParams = {}): void => {
  if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', action, params)
}
