// lib/dayKey.ts

/**
 * Returns the EST‑based day key (YYYY‑MM‑DD), rolling over at 2 AM EST.
 * If current EST time is before 2 AM, yields yesterday’s date.
 */
interface ESTParts {
  year:   string
  month:  string
  day:    string
  hour:   string
  minute: string
  second: string
}

function buildKey(date: Date = new Date()): string {
  // Use formatToParts so we get each component in EST
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone:    'America/New_York',
    year:        'numeric',
    month:       '2-digit',
    day:         '2-digit',
    hour:        '2-digit',
    minute:      '2-digit',
    second:      '2-digit',
    hourCycle:   'h23'
  })

  // Initialize all parts to empty strings
  const parts = fmt.formatToParts(date).reduce((acc, p) => {
    if (p.type !== 'literal' && p.type in acc) {
      (acc as any)[p.type] = p.value
    }
    return acc
  }, {
    year:   '',
    month:  '',
    day:    '',
    hour:   '',
    minute: '',
    second: ''
  } as ESTParts)

  // Build a UTC timestamp that matches that EST local time
  const year   = parseInt(parts.year,   10)
  const month  = parseInt(parts.month,  10)
  const day    = parseInt(parts.day,    10)
  const hour   = parseInt(parts.hour,   10)
  const minute = parseInt(parts.minute, 10)
  const estDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))

  // Subtract 2 hours so the “day” flips at 2 AM EST
  estDate.setUTCHours(estDate.getUTCHours() - 2)

  // Format back to YYYY‑MM‑DD
  const y = estDate.getUTCFullYear()
  const m = String(estDate.getUTCMonth() + 1).padStart(2, '0')
  const d = String(estDate.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Export under all existing names
export const getESTDayKey = buildKey
export const dayKey      = buildKey
export const buildDayKey = buildKey
