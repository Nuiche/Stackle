// app/leaderboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getDailyLeaderboard, getAllTimeLeaderboard, getEndlessLeaderboard } from '@/lib/getLeaderboard'

type Row = {
  id: string
  uid: string
  score: number
  date: string
  mode: string
}

export default function LeaderboardPage() {
  const [todayRows, setTodayRows] = useState<Row[]>([])
  const [endlessRows, setEndlessRows] = useState<Row[]>([])
  const [allTimeRows, setAllTimeRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    (async () => {
      try {
        const [daily, endless, all] = await Promise.all([
          getDailyLeaderboard(today, 20),
          getEndlessLeaderboard(20),
          getAllTimeLeaderboard(20),
        ])
        setTodayRows(daily)
        setEndlessRows(endless)
        setAllTimeRows(all)
      } catch (e: unknown) {
        console.error('Leaderboard load error:', e)
        setError(
          'Could not load leaderboard. Check console for any Firestore index link or errors.'
        )
      } finally {
        setLoading(false)
      }
    })()
  }, [today])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-sm text-gray-500">
          If Firestore suggests creating an index, click the link it prints in the console.
        </p>
      </main>
    )
  }

  const Section = ({
    title,
    rows,
  }: {
    title: string
    rows: Row[]
  }) => (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <ol className="space-y-1">
        {rows.map((r, i) => (
          <li
            key={r.id}
            className="bg-white p-2 rounded flex justify-between text-sm md:text-base"
          >
            <span>#{i + 1}</span>
            <span className="font-semibold">{r.score}</span>
            <span className="text-gray-500">{r.uid.slice(0, 6)}</span>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="text-gray-500">No scores yet.</li>
        )}
      </ol>
    </section>
  )

  return (
    <main className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-center">Leaderboard</h1>

      <Section title={`Today (${today})`} rows={todayRows} />
      <Section title="Endless (latest 20)" rows={endlessRows} />
      <Section title="All Time (Top 20)" rows={allTimeRows} />
    </main>
  )
}
