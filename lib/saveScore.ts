// lib/saveScore.ts

export type GameMode = 'daily' | 'endless';

export interface SaveScorePayload {
  name: string;
  mode: GameMode;
  score: number;
  startSeed: string;
  endSeed: string;
  dayKey?: string;
}

export interface SaveScoreResult {
  ok: boolean;
  error?: string;
}

export async function saveScore(
  payload: SaveScorePayload
): Promise<SaveScoreResult> {
  try {
    const res = await fetch('/api/submit-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { ok: false, error: errorText };
    }

    const data: SaveScoreResult = await res.json();
    return data;
  } catch (e: any) {
    console.error('saveScore error', e);
    return { ok: false, error: e.message || 'unknown' };
  }
}
