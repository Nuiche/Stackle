'use client';

import React, { useEffect, useState } from 'react';
import {
  getDailyLeaderboard,
  getEndlessLatest,
  getAllTime,
  Row,
} from '@/lib/getLeaderboard';
import { getTotalGames } from '@/lib/getTotalGames';
import { getESTDayKey } from '@/lib/dayKey';

export default function LeaderboardClient() {
  const [daily, setDaily] = useState<Row[]>([]);
  const [endless, setEndless] = useState<Row[]>([]);
  const [allTime, setAllTime] = useState<Row[]>([]);
  const [totalGames, setTotalGames] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
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
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-200 flex items-center justify-center text-[#334155]">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-200 text-[#334155] p-6 max-w-xl mx-auto relative">
      <h1 className="text-3xl font-bold text-center mb-6">Global Rankings</h1>

      <Section title="Daily Challenge" rows={daily} />
      <Section title="Endless" rows={endless} />
      <Section title="All Time (Top 20)" rows={allTime} />

      <div className="mt-10 text-center">
        <a href="/" className="underline text-sm">
          ← Back
        </a>
      </div>

      <div className="absolute right-4 bottom-4 text-xs text-slate-600">
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
      <ul className="space-y-2">
        {rows.map((r, idx) => {
          const rank = idx + 1;
          const topBg =
            rank === 1
              ? 'bg-[#FACC15]/60'
              : rank === 2
              ? 'bg-[#CBD5E1]/60'
              : rank === 3
              ? 'bg-[#F97316]/50'
              : 'bg-white/60';

          return (
            <li
              key={`${r.name}-${r.createdAt ?? 0}-${idx}`}
              className={`rounded-xl ${topBg} shadow-sm border border-slate-200/40 overflow-hidden`}
            >
              <div className="flex items-center gap-2 px-3 py-2">
                {/* Rank */}
                <span className="w-6 shrink-0 text-right font-bold text-[#334155]">
                  {rank}.
                </span>

                {/* Name */}
                <span className="flex-1 font-semibold truncate text-[#334155]">
                  {r.name}
                </span>

                {/* Seed chip + score */}
                <span className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-1 rounded-md bg-[#334155] text-white text-xs sm:text-sm font-bold whitespace-nowrap">
                    {(r.startSeed ?? r.seed ?? '').toUpperCase()} –{' '}
                    {(r.endSeed ?? r.seed ?? '').toUpperCase()}
                  </span>
                  <span className="font-bold text-[#334155]">{r.score}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
