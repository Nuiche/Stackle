// lib/getLeaderboard.ts
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';

export type Row = {
  id: string;
  name: string;
  score: number;
  mode: string;
  startSeed?: string;
  endSeed?: string;
  dayKey?: string;
  createdAt?: any;
};

// Daily (top 15)
export async function getDailyLeaderboard(dayKey: string, top = 15): Promise<Row[]> {
  const q = query(
    collection(db, 'scores'),
    where('mode', '==', 'daily'),
    where('dayKey', '==', dayKey),
    orderBy('score', 'desc'),
    orderBy('__name__'),
    limit(top)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

// ALL‑TIME (still here)
export async function getAllTime(top = 50): Promise<Row[]> {
  const q = query(
    collection(db, 'scores'),
    orderBy('score', 'desc'),
    orderBy('__name__'),
    limit(top)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

// NEW: Most recent 10 games (any mode)
export async function getMostRecent(top = 10): Promise<Row[]> {
  const q = query(
    collection(db, 'scores'),
    orderBy('createdAt', 'desc'),
    limit(top)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}
