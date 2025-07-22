// app/leaderboard/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getDailyLeaderboard,
  getEndlessLeaderboard,
  getAllTimeLeaderboard,
  Row,
} from '@/lib/getLeaderboard'

export default function LeaderboardPage() {
  const [todayRows, setTodayRows] = useState<Row[]>([])
  const [endlessRows, setEndlessRows] = useState<Row[]>([])
  const [allTimeRows, setAllTimeRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const todayStr = new Date().toISOString().slice(0, 10)
      const [t, e, a] = await Promise.all([
        getDailyLeaderboard(todayStr, 50),
        getEndlessLeaderboard(20),
        getAllTimeLeaderboard(20),
      ])
      setTodayRows(t)
      setEndlessRows(e)
      setAllTimeRows(a)
      setLoading(false)
    })().catch(console.error)
  }, [])

  const Section = ({ title, rows }: { title: string; rows: Row[] }) => (
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
                <span className="font-semibold w-10 text-left">#{i + 1}</span>
                <span className="truncate mx-2 flex-1 text-center">
                  {r.name || 'Anon'}
                </span>
                <span className="font-semibold w-12 text-right">{r.score}</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-black text-gray-900 px-4 pb-16 max-w-md mx-auto">
      {/* Back */}
      <div className="pt-4 pb-2">
        <Link
          href="/"
          className="inline-block px-3 py-2 rounded-lg bg-gray-700 text-white text-sm"
        >
          ← Back
        </Link>
      </div>

      {/* Banner */}
      <div className="mb-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-green-500 px-4 py-4 shadow-lg text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-wide">
            Global Rankings
          </h1>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading…</p>
      ) : (
        <>
          <Section title="Daily Challenge" rows={todayRows} />
          <Section title="Endless" rows={endlessRows} />
          <Section title="All Time (Top 20)" rows={allTimeRows} />
        </>
      )}
    </main>
  )
}
