import { Providers } from '@/providers';
import { FontLoader } from '@/components/FontLoader';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'block', // Block fallback fonts until Outfit loads
  preload: true,
  adjustFontFallback: false, // Disable automatic fallback to ensure Outfit loads first
});

export const metadata: Metadata = {
  title: 'Knova - Prediction Markets',
  description: 'The future of prediction markets. Make predictions and win!',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        {/* Force early font loading to prevent fallback font on first visit */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=block');
          `
        }} />
      </head>
      <body className={outfit.className}>
        <FontLoader>
          <Providers>{children}</Providers>
        </FontLoader>
      </body>
    </html>
  );
}
