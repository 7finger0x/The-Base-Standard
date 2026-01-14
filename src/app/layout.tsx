import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Base Standard',
  description: 'Your on-chain reputation score across Base and Zora - The Standard for Base L2',
  openGraph: {
    title: 'The Base Standard',
    description: 'Your on-chain reputation score across Base and Zora - The Standard for Base L2',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-black text-white antialiased">
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
