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
  name: string;
  mode: 'daily' | 'endless';
  score: number;
  seed?: string;        // legacy single seed (keep for old rows)
  startSeed?: string;   // new fields
  endSeed?: string;
  dayKey?: string;
  createdAt: number;
};

export async function getDailyLeaderboard(dayKey: string): Promise<Row[]> {
  const ref = collection(db, 'scores');
  const q = query(
    ref,
    where('mode', '==', 'daily'),
    where('dayKey', '==', dayKey),
    orderBy('score', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(15)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Row);
}

export async function getEndlessLatest(): Promise<Row[]> {
  const ref = collection(db, 'scores');
  const q = query(
    ref,
    where('mode', '==', 'endless'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Row);
}

export async function getAllTime(): Promise<Row[]> {
  const ref = collection(db, 'scores');
  const q = query(
    ref,
    orderBy('score', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Row);
}
