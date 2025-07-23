// lib/saveScore.ts
export type SaveScorePayload = {
  name: string;
  mode: 'daily' | 'endless';
  score: number;
  seed: string;
  dayKey?: string;
};

export type SaveScoreResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function saveScore(
  payload: SaveScorePayload
): Promise<SaveScoreResult> {
  const res = await fetch('/api/submit-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let json: any = {};
  try {
    json = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    return { ok: false, error: json?.error || res.statusText };
  }
  return { ok: true, id: json?.id || '' };
}
