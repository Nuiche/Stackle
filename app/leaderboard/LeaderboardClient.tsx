'use client';

import React, { useEffect, useState } from 'react';
import {
  getDailyLeaderboard,
  getEndlessLatest,
  getAllTime,
  Row,
} from '@/lib/getLeaderboard';
import { getESTDayKey } from '@/lib/dayKey';

export default function LeaderboardClient() {
  const [daily, setDaily] = useState<Row[]>([]);
  const [endless, setEndless] = useState<Row[]>([]);
  const [allTime, setAllTime] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const dk = getESTDayKey();
        const [d, e, a] = await Promise.all([
          getDailyLeaderboard(dk),
          getEndlessLatest(),
          getAllTime(),
        ]);
        setDaily(d);
        setEndless(e);
        setAllTime(a);
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
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-200 text-[#334155] p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Global Rankings</h1>

      <Section title="Daily Challenge" rows={daily} />
      <Section title="Endless" rows={endless} />
      <Section title="All Time" rows={allTime} />

      <div className="mt-10 text-center">
        <a href="/" className="underline text-sm">
          ← Back
        </a>
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
            className="flex justify-between items-center py-2 border-b border-slate-200 text-sm sm:text-base"
          >
            <span className="font-semibold truncate max-w-[45%]">{r.name}</span>
            <span className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-[#334155] text-white text-xs sm:text-sm font-bold">
                {(r.startSeed ?? r.seed ?? '').toUpperCase()} – {(r.endSeed ?? r.seed ?? '').toUpperCase()}
              </span>
              <span className="font-bold">{r.score}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
