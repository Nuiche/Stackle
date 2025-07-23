// lib/fonts.ts
import { Playfair_Display } from 'next/font/google';

export const titleFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-title',
});
