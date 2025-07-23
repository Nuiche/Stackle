// lib/dayKey.ts
// Always return today's date in EST as YYYY-MM-DD

function buildKey(): string {
  const now = new Date();
  const est = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/New_York' })
  );
  const y = est.getFullYear();
  const m = String(est.getMonth() + 1).padStart(2, '0');
  const d = String(est.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Export every name anyone used
export const getESTDayKey = buildKey;
export const dayKey = buildKey;
export const buildDayKey = buildKey;
