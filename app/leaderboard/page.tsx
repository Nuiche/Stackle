// app/leaderboard/page.tsx
import LeaderboardClient from './LeaderboardClient'

export const revalidate = 0 // ensure not cached while debugging
export default function Page() {
  return <LeaderboardClient />
}
