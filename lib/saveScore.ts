// lib/saveScore.ts
import { db } from './firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

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

export async function saveScore(payload: SaveScorePayload): Promise<SaveScoreResult> {
  try {
    await addDoc(collection(db, 'scores'), {
      name: payload.name,
      mode: payload.mode,
      score: payload.score,
      startSeed: payload.startSeed,
      endSeed: payload.endSeed,
      dayKey: payload.dayKey ?? null,
      createdAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (e: any) {
    console.error('saveScore error', e);
    return { ok: false, error: e?.message || 'unknown' };
  }
}
