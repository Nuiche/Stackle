// app/leaderboard/page.tsx
import LeaderboardClient from './LeaderboardClient';

export const revalidate = 120;

export default function Page() {
  return <LeaderboardClient />;
}
