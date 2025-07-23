// app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { baseFont } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Lexit',
  description: 'A little goes a long way.',
};

export const viewport: Viewport = { themeColor: '#3BB2F6' };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={baseFont.className}>
      <body className="bg-[#F1F5F9] text-[#334155] min-h-screen">
        {children}
      </body>
    </html>
  );
}
