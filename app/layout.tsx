// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { titleFont } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Lexit',
  description: 'Change one letter. Climb the stack.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={titleFont.variable}>
      <body className="min-h-screen bg-gradient-to-b from-white to-slate-200 text-[#334155]">
        {children}
      </body>
    </html>
  );
}
