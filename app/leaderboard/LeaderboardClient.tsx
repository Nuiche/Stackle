'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getDailyLeaderboard,
  getEndlessLatest,
  getAllTime,
  Row,
} from '@/lib/getLeaderboard';
import { getTotalGames } from '@/lib/getTotalGames';
import { dayKey as getESTDayKey } from '@/lib/dayKey';

export default function LeaderboardClient() {
  const [daily, setDaily] = useState<Row[]>([]);
  const [endless, setEndless] = useState<Row[]>([]);
  const [allTime, setAllTime] = useState<Row[]>([]);
  const [totalGames, setTotalGames] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const dk = getESTDayKey();
        const [d, e, a, tg] = await Promise.all([
          getDailyLeaderboard(dk),
          getEndlessLatest(),
          getAllTime(),
          getTotalGames(),
        ]);
        setDaily(d);
        setEndless(e);
        setAllTime(a);
        setTotalGames(tg);
      } catch (e) {
        console.error('Leaderboard load error', e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#334155]">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-xl mx-auto px-4 py-6 text-[#334155]">
      <Link href="/" className="text-sm underline">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold text-center mb-6">Global Rankings</h1>

      <Section title="Daily Challenge" rows={daily} />
      <Section title="Endless" rows={endless} />
      <Section title="All Time (Top 20)" rows={allTime} />

      <div className="text-xs text-right mt-10 text-[#334155]/70">
        Total games played: {totalGames}
      </div>
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-3">{title}</h2>
      {rows.length === 0 && (
        <div className="text-sm italic mb-4">No scores yet.</div>
      )}
      <ul>
        {rows.map((r, idx) => (
          <li
            key={`${r.name}-${r.createdAt ?? 0}-${idx}`}

            className={`flex justify-between items-center py-1 px-2 rounded-md mb-1 ${
              idx === 0
                ? 'bg-yellow-100'
                : idx === 1
                ? 'bg-gray-200'
                : idx === 2
                ? 'bg-orange-100'
                : 'bg-transparent'
            }`}
          >
            <span className="w-8 font-semibold">#{idx + 1}</span>
            <span className="flex-1 truncate">{r.name}</span>
            <span className="flex items-center gap-2">
              {/* seed chip */}
              <span className="px-2 py-0.5 rounded bg-[#334155] text-white text-xs font-semibold">
                {r.startSeed}–{r.endSeed}
              </span>
              <span className="w-6 text-right">{r.score}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
