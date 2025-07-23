// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import Script from 'next/script';
import { titleFont } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Lexit',
  description: 'Change one letter. Stack your words. Climb the board.',
};

export const viewport: Viewport = {
  themeColor: '#3BB2F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* GA4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { send_page_view: true });
          `}
        </Script>
      </head>
     <body
  className={`${titleFont.className} min-h-screen overflow-x-hidden bg-gradient-to-b from-[#F1F5F9] to-white text-[#334155]`}
>
  {children}
</body>
    </html>
  );
}
