import React from 'react'
import Link from 'next/link'
import { getDailyLeaderboard, getEndlessLatest, getAllTime } from '@/lib/getLeaderboard'
import { getTotalGames } from '@/lib/getTotalGames'


export const revalidate = 0;

const todayISO = () => new Date().toISOString().slice(0, 10)

type Row = { id: string; name?: string; score: number }

export default async function LeaderboardPage() {
  const today = todayISO()
  const [daily, endless, allTime, total] = await Promise.all([
    getDailyLeaderboard(today, 20),
    getEndlessLatest(20),
    getAllTime(20),
    getTotalGames()
  ])

  const podiumBg = (i: number) =>
    i === 0 ? 'bg-[#FFD70033]'
    : i === 1 ? 'bg-[#C0C0C033]'
    : i === 2 ? 'bg-[#CD7F3233]'
    : ''

  const Section = ({ title, rows }: { title: string; rows: Row[] }) => (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold text-[#334155] mb-3">{title}</h2>
      {rows.length === 0 && <p className="text-sm text-gray-500">No scores yet.</p>}
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden bg-white">
        {rows.map((r, i) => (
          <div
            key={r.id}
            className={`grid grid-cols-[40px_1fr_40px] px-3 py-2 text-base ${podiumBg(i)}`}
          >
            <span className="text-[#334155] font-medium">#{i + 1}</span>
            <span className="truncate px-2 text-[#334155]">{(r.name && r.name.trim()) || 'Anon'}</span>
            <span className="text-right font-semibold text-[#334155]">{r.score}</span>
          </div>
        ))}
      </div>
    </section>
  )

  return (
    <main className="min-h-screen bg-[#F1F5F9] px-4 py-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-white py-3 rounded-xl bg-gradient-to-r from-[#3BB2F6] to-[#10B981] shadow-lg">
          Global Rankings
        </h1>

        <Link href="/" className="text-sm underline text-gray-500 block mb-4">← Back</Link>

        <Section title="Daily Challenge" rows={daily} />
        <Section title="Endless" rows={endless} />
        <Section title="All Time (Top 20)" rows={allTime} />

        <footer className="text-[11px] text-gray-600 text-right mt-8">
          Total games played: {total.toLocaleString()}
        </footer>
      </div>
    </main>
  )
}
