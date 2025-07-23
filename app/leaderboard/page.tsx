// app/leaderboard/page.tsx
import dynamic from 'next/dynamic';

export const dynamicParams = false;
export const revalidate = 120;

const Client = dynamic(() => import('./LeaderboardClient'), { ssr: false });

export default function Page() {
  return <Client />;
}
