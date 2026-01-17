import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from './providers';
import MyStatsig from './my-statsig';
import './globals.css';

// Determine the base URL for metadata (social images)
const getMetadataBase = (): URL => {
  // Production: Use explicit URL or Vercel URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return new URL(process.env.NEXT_PUBLIC_APP_URL);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  // Fallback to production URL
  if (process.env.NODE_ENV === 'production') {
    return new URL('https://tbs-alpha.vercel.app');
  }
  // Development: Use localhost
  return new URL('http://localhost:3000');
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: 'The Base Standard',
  description: 'Your on-chain reputation score across Base and Zora - The Standard for Base L2',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'The Base Standard',
    description: 'Your on-chain reputation score across Base and Zora - The Standard for Base L2',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Base Standard',
    description: 'Your on-chain reputation score across Base and Zora',
    images: ['/twitter-card.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Meticulous recorder - must be first script to load */}
        {(process.env.NODE_ENV === 'development' ||
          process.env.VERCEL_ENV === 'preview') && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            data-recording-token="jVxpO0mkJ5BCQ3Gha8Wl9IXhKZDvggAidDXI1AV0"
            data-is-production-environment="false"
            src="https://snippet.meticulous.ai/v1/meticulous.js"
          />
        )}
      </head>
      <body className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased transition-colors">
        <MyStatsig>
          <Providers>{children}</Providers>
        </MyStatsig>
        <SpeedInsights />
      </body>
    </html>
  );
}
