// lib/fonts.ts
import { Inter, Playfair_Display } from 'next/font/google';

export const baseFont = Inter({ subsets: ['latin'], display: 'swap' });

export const titleFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  display: 'swap',
});
