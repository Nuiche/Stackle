'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getDailyLeaderboard,
  getEndlessTop,
  getAllTime,
  Row
} from '@/lib/getLeaderboard'
import { getTotalGames } from '@/lib/getTotalGames'
import { getESTDayKey } from '@/lib/dayKey'

export default function LeaderboardClient() {
  const [daily, setDaily] = useState<Row[]>([])
  const [endless, setEndless] = useState<Row[]>([])
  const [allTime, setAllTime] = useState<Row[]>([])
  const [total, setTotal] = useState<number>(0)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const today = getESTDayKey()

  useEffect(() => {
    (async () => {
      try {
        const [d, e, a, t] = await Promise.all([
          getDailyLeaderboard(today, 20),
          getEndlessTop(20),
          getAllTime(20),
          getTotalGames()
        ])
        setDaily(d)
        setEndless(e)
        setAllTime(a)
        setTotal(t)
      } catch (e: any) {
        console.error('Leaderboard load error', e)
        setErr('Failed to load leaderboard.')
      } finally {
        setLoading(false)
      }
    })()
  }, [today])

  const podiumBg = (i: number) =>
    i === 0 ? 'bg-[#FFD70033]'
    : i === 1 ? 'bg-[#C0C0C033]'
    : i === 2 ? 'bg-[#CD7F3233]'
    : ''

  // NAME | [seed chip] score
  const renderRow = (r: Row, i: number) => (
    <div
      key={r.id}
      className={`grid grid-cols-[40px_1fr_auto] px-3 py-2 text-base ${podiumBg(i)}`}
    >
      <span className="text-[#334155] font-medium">#{i + 1}</span>
      <span className="truncate px-2 text-[#334155]">
        {(r.name && r.name.trim()) || 'Anon'}
      </span>
      <span className="flex items-center justify-end gap-2">
        {r.seed && (
          <span className="inline-block bg-[#334155] text-white px-2 py-0.5 rounded-md tracking-widest text-xs leading-none">
            {r.seed}
          </span>
        )}
        <span className="text-right font-semibold text-[#334155]">{r.score}</span>
      </span>
    </div>
  )

  const Section = ({ title, rows }: { title: string; rows: Row[] }) => (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold text-[#334155] mb-3">{title}</h2>
      {rows.length === 0 && <p className="text-sm text-gray-500">No scores yet.</p>}
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden bg-white">
        {rows.map(renderRow)}
      </div>
    </section>
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F1F5F9] px-4 py-6 flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    )
  }

  if (err) {
    return (
      <main className="min-h-screen bg-[#F1F5F9] px-4 py-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6 text-[#334155]">Global Rankings</h1>
          <p className="text-red-600 mb-4">{err}</p>
          <Link href="/" className="underline text-sm text-gray-500">← Back</Link>
        </div>
      </main>
    )
  }

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
