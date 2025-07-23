// app/leaderboard/page.tsx
import React from 'react'
import Link from 'next/link'
import { getDailyLeaderboard, getEndlessLatest, getAllTime } from '@/lib/getLeaderboard'
import { getTotalGames } from '@/lib/getTotalGames'

export const revalidate = 120

const todayISO = () => new Date().toISOString().slice(0, 10) // YYYY-MM-DD

export default async function LeaderboardPage() {
  const today = todayISO()

  const [daily, endless, allTime, total] = await Promise.all([
    getDailyLeaderboard(today, 20),
    getEndlessLatest(20),
    getAllTime(20),
    getTotalGames(),
  ])

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mt-6">
      <h2 className="text-[#334155] font-semibold text-lg mb-2">{title}</h2>
      {children}
    </section>
  )

  const Row = ({ i, n, s }: { i: number; n: string; s: number }) => (
    <div className="flex justify-between py-1 text-sm">
      <span className="w-8">#{i + 1}</span>
      <span className="flex-1 truncate px-2">{n || 'Anon'}</span>
      <span className="w-8 text-right">{s}</span>
    </div>
  )

  const podiumBg = (i: number) =>
    i === 0 ? 'bg-[#FFD70033]'
      : i === 1 ? 'bg-[#C0C0C033]'
      : i === 2 ? 'bg-[#CD7F3233]'
      : ''

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-[#CFCFCF] px-4 py-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4 text-white py-2 rounded-xl bg-gradient-to-r from-[#3BB2F6] to-[#10B981] shadow-lg">
          Global Rankings
        </h1>

        <Link href="/" className="text-sm underline text-gray-500">← Back</Link>

        <Section title="Daily Challenge">
          {daily.length === 0 && <p className="text-sm text-gray-500">No scores yet.</p>}
          <div>
            {daily.map((r, i) => (
              <div key={r.id} className={`${podiumBg(i)} rounded`}>
                <Row key={r.id} i={i} n={r.name ?? 'Anon'} s={r.score} />

              </div>
            ))}
          </div>
        </Section>

        <Section title="Endless">
          {endless.length === 0 && <p className="text-sm text-gray-500">No scores yet.</p>}
          <div>
            {endless.map((r, i) => <Row key={r.id} i={i} n={r.name ?? 'Anon'} s={r.score} />
)}
          </div>
        </Section>

        <Section title="All Time (Top 20)">
          {allTime.length === 0 && <p className="text-sm text-gray-500">No scores yet.</p>}
          <div>
            {allTime.map((r, i) => <Row key={r.id} i={i} n={r.name ?? 'Anon'} s={r.score} />
)}
          </div>
        </Section>

        <footer className="text-[10px] text-gray-600 text-right mt-8">
          Total games played: {total.toLocaleString()}
        </footer>
      </div>
    </main>
  )
}
