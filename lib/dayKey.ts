// lib/dayKey.ts

/**
 * Returns the EST‑based day key (YYYY‑MM‑DD), rolling over at 2 AM EST.
 * If current EST time is before 2 AM, yields yesterday’s date.
 */
function buildKey(date: Date = new Date()): string {
  const estDate = new Date(
    date.toLocaleString('en-US', { timeZone: 'America/New_York' })
  )
  estDate.setHours(estDate.getHours() - 2)

  const y = estDate.getFullYear()
  const m = String(estDate.getMonth() + 1).padStart(2, '0')
  const d = String(estDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const getESTDayKey = buildKey
export const dayKey      = buildKey
export const buildDayKey = buildKey
