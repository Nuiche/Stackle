// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { titleFont } from '@/lib/fonts';
import { GA_ID } from '@/lib/gtag';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Lexit',
  description: 'Change one letter. Climb the stack.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  

   return (
    <html lang="en" className={titleFont.className}>
      <head>
        <link rel="icon" href="/favicon_rounded.png" />
      </head>
      <body className="min-h-screen ...">
        {/* GA4 */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        {children}
        <Analytics />;
      </body>
    </html>
  );
}
