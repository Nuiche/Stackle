'use client';

import React, { useEffect, useState } from 'react';
import {
  getDailyLeaderboard,
  getAllTime,
  getMostRecent,
  Row,
} from '@/lib/getLeaderboard';
import { getTotalGames } from '@/lib/getTotalGames';
import { dayKey as getDayKey } from '@/lib/dayKey';
import Link from 'next/link';

export default function LeaderboardClient() {
  const [daily, setDaily] = useState<Row[]>([]);
  const [recent, setRecent] = useState<Row[]>([]);
  const [allTime, setAllTime] = useState<Row[]>([]);
  const [totalGames, setTotalGames] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Track which entry is active (clicked)
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const dk = getDayKey();
        const [d, r, a, total] = await Promise.all([
          getDailyLeaderboard(dk, 15),
          getMostRecent(10),
          getAllTime(50),
          getTotalGames(),
        ]);
        setDaily(d);
        setRecent(r);
        setAllTime(a);
        setTotalGames(total);
      } catch (e) {
        console.error('Leaderboard load error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F1F5F9] to-white text-[#334155]">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F1F5F9] to-white text-[#334155] p-4 pb-16">
      <div className="max-w-md mx-auto">
        <Section
          title="Daily Challenge"
          rows={daily}
          activeId={activeId}
          setActiveId={setActiveId}
        />
        <Section
          title="Recent Games"
          rows={recent}
          activeId={activeId}
          setActiveId={setActiveId}
          disableHighlights
        />
        <Section
          title="All Time"
          rows={allTime}
          activeId={activeId}
          setActiveId={setActiveId}
        />

        {totalGames !== null && (
          <div className="text-right text-xs text-[#334155]/70 mt-6">
            Total games: {totalGames}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/" className="underline text-sm">
            ← Back to game
          </Link>
        </div>
      </div>
    </div>
  );
}

type SectionProps = {
  title: string;
  rows: Row[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  disableHighlights?: boolean;
};

function Section({ title, rows, activeId, setActiveId, disableHighlights = false }: SectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-3">{title}</h2>
      {rows.length === 0 && (
        <div className="text-sm italic mb-4">No scores yet.</div>
      )}
      <ul>
        {rows.map((r, idx) => {
          const isActive = activeId === r.id;
          const dateStr = new Date(r.createdAt).toLocaleString(undefined, {
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
          });

          const bgClass = disableHighlights
            ? 'bg-white/70'
            : idx === 0
            ? 'bg-yellow-300/70'
            : idx === 1
            ? 'bg-gray-300/70'
            : idx === 2
            ? 'bg-orange-300/70'
            : 'bg-white/70';

          return (
            <li
              key={r.id}
              onClick={() => setActiveId(isActive ? null : r.id)}
              className={`relative flex items-center justify-between py-2 px-3 mb-2 rounded-lg cursor-pointer ${bgClass}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 text-left font-semibold">{idx + 1}.</span>
                <span className="font-medium truncate max-w-[110px]">{r.name}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <SeedChip start={r.startSeed} end={r.endSeed} />
                <span className="font-bold">{r.score}</span>
              </div>

              {isActive && (
                <div className="absolute top-0 right-0 mt-[-1.5rem] mr-2 px-2 py-1 bg-[#334155] text-white text-xs rounded-md whitespace-nowrap shadow-lg">
                  {dateStr}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SeedChip({ start, end }: { start?: string; end?: string }) {
  if (!start && !end) return null;
  return (
    <span className="px-2 py-1 bg-[#334155] text-white rounded-md text-xs font-semibold whitespace-nowrap">
      {start || '???'} → {end || '???'}
    </span>
  );
}