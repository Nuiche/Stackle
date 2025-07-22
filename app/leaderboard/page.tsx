// app/leaderboard/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getDailyLeaderboard, getEndlessLatest, getAllTime } from '@/lib/getLeaderboard'

type Row = { id: string; name?: string; score: number; mode: string; date: string }

export default function LeaderboardPage() {
  const [todayRows, setTodayRows] = useState<Row[]>([])
  const [endlessRows, setEndlessRows] = useState<Row[]>([])
  const [allTimeRows, setAllTimeRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const todayStr = new Date().toISOString().slice(0, 10)
      const [t, e, a] = await Promise.all([
        getDailyLeaderboard(todayStr, 50), // show more if you like
        getEndlessLatest(20),
        getAllTime(20),
      ])
      setTodayRows(t)
      setEndlessRows(e)
      setAllTimeRows(a)
      setLoading(false)
    }
    run().catch(console.error)
  }, [])

  const Section = ({
    title,
    rows,
  }: {
    title: string
    rows: Row[]
  }) => (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-3 text-blue-600">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">No scores yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r, i) => {
            const medal =
              i === 0
                ? 'bg-yellow-400 text-black'
                : i === 1
                ? 'bg-gray-300 text-black'
                : i === 2
                ? 'bg-orange-400 text-black'
                : 'bg-white text-gray-900'

            return (
              <li
                key={r.id}
                className={`flex items-center justify-between rounded-lg p-3 text-sm md:text-base shadow ${medal}`}
              >
                <span className="font-semibold">#{i + 1}</span>
                <span className="truncate mx-2 flex-1 text-center">
                  {r.name || 'Anon'}
                </span>
                <span className="font-semibold">{r.score}</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-black text-gray-900 px-4 pb-16 max-w-md mx-auto">
      {/* Back button */}
      <div className="pt-4 pb-2">
        <Link
          href="/"
          className="inline-block px-3 py-2 rounded-lg bg-gray-700 text-white text-sm"
        >
          ← Back
        </Link>
      </div>

      <h1 className="text-3xl font-extrabold text-center mb-6">Leaderboard</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading…</p>
      ) : (
        <>
          <Section
            title={`Today (${new Date().toISOString().slice(0, 10)})`}
            rows={todayRows}
          />
          <Section title="Endless (latest 20)" rows={endlessRows} />
          <Section title="All Time (Top 20)" rows={allTimeRows} />
        </>
      )}
    </main>
  )
}
