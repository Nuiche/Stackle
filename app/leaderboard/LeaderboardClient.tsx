'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
    (async () => {
      const dayKey = getESTDayKey();
      const [d, e, a] = await Promise.all([
        getDailyLeaderboard(dayKey),
        getEndlessLatest(),
        getAllTime(),
      ]);
      setDaily(d);
      setEndless(e);
      setAllTime(a);
      setLoading(false);
    })();
  }, []);

  const renderSection = (title: string, rows: Row[]) => (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-3 text-[#334155]">{title}</h2>
      <div className="space-y-2">
        {rows.map((r, idx) => {
          const start = r.startSeed?.toUpperCase() ?? r.seed?.toUpperCase() ?? '';
          const end = r.seed?.toUpperCase() ?? '';
          return (
            <div
              key={r.id}
              className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow"
            >
              <div className="flex-1 mr-2 truncate text-[#334155] font-medium">
                #{idx + 1} {r.name}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#334155]">
                <span className="px-2 py-1 rounded-md bg-[#334155] text-white">
                  {start}
                </span>
                <span>–</span>
                <span className="px-2 py-1 rounded-md bg-[#334155] text-white">
                  {end}
                </span>
                <span className="font-bold ml-2">{r.score}</span>
              </div>
            </div>
          );
        })}
        {!rows.length && (
          <div className="text-center text-sm text-gray-500">No scores yet.</div>
        )}
      </div>
    </section>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F1F5F9] text-[#334155] p-4 pb-16">
      <Link href="/" className="inline-block mb-4 underline text-[#334155]">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-[#334155]">Global Rankings</h1>

      {renderSection('Daily Challenge', daily)}
      {renderSection('Endless', endless)}
      {renderSection('All Time', allTime)}
    </main>
  );
}
