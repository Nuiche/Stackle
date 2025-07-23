export function dayKey(): string {
  const now = new Date();
  const est = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/New_York' })
  );
  const y = est.getFullYear();
  const m = String(est.getMonth() + 1).padStart(2, '0');
  const d = String(est.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
