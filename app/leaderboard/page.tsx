// app/leaderboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  getDailyLeaderboard,
  getEndlessLeaderboard,
  getAllTimeLeaderboard,
  Row,
} from '@/lib/getLeaderboard'
import { getUserId } from '@/lib/user'

export default function LeaderboardPage() {
  const [daily, setDaily] = useState<Row[]>([])
  const [endless, setEndless] = useState<Row[]>([])
  const [allTime, setAllTime] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)
  const uid = getUserId()

  useEffect(() => {
    ;(async () => {
      try {
        const [d, e, a] = await Promise.all([
          getDailyLeaderboard(today, 20),
          getEndlessLeaderboard(20),
          getAllTimeLeaderboard(20),
        ])
        setDaily(d)
        setEndless(e)
        setAllTime(a)
      } catch (err: unknown) {
        console.error('Leaderboard load error:', err)
        setError(
          'Could not load leaderboard. If Firestore prints an index URL in the console, click it to create the index.'
        )
      } finally {
        setLoading(false)
      }
    })()
  }, [today])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-2xl font-bold text-center mb-6">Leaderboard</h1>
        <SkeletonSection title={`Today (${today})`} />
        <SkeletonSection title="Endless (latest 20)" />
        <SkeletonSection title="All Time (Top 20)" />
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-sm text-gray-500">
          Check your browser console for a Firestore index link if needed.
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Leaderboard</h1>

      <Section title={`Today (${today})`} rows={daily} uid={uid} />
      <Section title="Endless (latest 20)" rows={endless} uid={uid} />
      <Section title="All Time (Top 20)" rows={allTime} uid={uid} />
    </main>
  )
}

/* ---------- Components ---------- */

function Section({ title, rows, uid }: { title: string; rows: Row[]; uid: string }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <ol className="space-y-1">
        {rows.map((r, i) => {
          const isMe = r.uid === uid
          return (
            <li
              key={r.id}
              className={`bg-white p-2 rounded flex justify-between text-sm md:text-base ${
                isMe ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              <span className="w-8 text-gray-500">#{i + 1}</span>
              <span className="flex-1 text-center font-semibold">{r.score}</span>
              <span className="w-16 text-right text-gray-500">{r.uid.slice(0, 6)}</span>
            </li>
          )
        })}
        {rows.length === 0 && (
          <li className="text-gray-500 italic">No scores yet.</li>
        )}
      </ol>
    </section>
  )
}

function SkeletonSection({ title }: { title: string }) {
  return (
    <section className="mb-8 animate-pulse">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 bg-gray-300 rounded"
          />
        ))}
      </div>
    </section>
  )
}
