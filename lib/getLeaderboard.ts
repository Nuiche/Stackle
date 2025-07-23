// lib/getLeaderboard.ts
import { db } from './firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { GameMode } from './saveScore';

export interface Row {
  id: string;
  name: string;
  score: number;
  mode: GameMode;
  startSeed: string;
  endSeed: string;
  dayKey?: string | null;
  createdAt?: any;
}

const scoresRef = collection(db, 'scores');

export async function getDailyLeaderboard(dayKey: string): Promise<Row[]> {
  const q = query(
    scoresRef,
    where('mode', '==', 'daily'),
    where('dayKey', '==', dayKey),
    orderBy('score', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Row[];
}

export async function getEndlessLatest(): Promise<Row[]> {
  const q = query(
    scoresRef,
    where('mode', '==', 'endless'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Row[];
}

export async function getAllTime(): Promise<Row[]> {
  const q = query(
    scoresRef,
    orderBy('score', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Row[];
}
