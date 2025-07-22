'use client'

import { useEffect, useState } from 'react'
import { getDailyLeaderboard, getAllTimeLeaderboard } from '@/lib/getLeaderboard'

export default function LeaderboardPage() {
  const [todayList, setTodayList] = useState<any[]>([])
  const [allTimeList, setAllTimeList] = useState<any[]>([])
  const today = new Date().toISOString().slice(0,10)

  useEffect(() => {
    ;(async () => {
      setTodayList(await getDailyLeaderboard(today, 10))
      setAllTimeList(await getAllTimeLeaderboard(10))
    })()
  }, [today])

  return (
    <main className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Today ({today})</h2>
        <ol className="space-y-1">
          {todayList.map((row, i) => (
            <li key={row.id} className="bg-white p-2 rounded">
              #{i+1} – {row.score} (uid: {row.uid.slice(0,6)})
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">All Time</h2>
        <ol className="space-y-1">
          {allTimeList.map((row, i) => (
            <li key={row.id} className="bg-white p-2 rounded">
              #{i+1} – {row.score} (uid: {row.uid.slice(0,6)})
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
