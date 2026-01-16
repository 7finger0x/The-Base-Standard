/**
 * Farcaster Frame Page for Reputation Display
 * 
 * This page serves the Frame meta tags that Farcaster uses
 * to render interactive reputation cards in feeds.
 */

import type { Metadata } from 'next';

interface PageProps {
  searchParams: { address?: string };
}

import { BASE_URL } from '@/lib/env';

// Use validated env variable  
const getBaseUrl = () => BASE_URL || 'http://localhost:3000';

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const address = searchParams.address || '0x0000000000000000000000000000000000000000';
  const baseUrl = getBaseUrl();
  const frameImageUrl = `${baseUrl}/api/frame/reputation?address=${address}`;
  const frameUrl = `${baseUrl}/frame/reputation?address=${address}`;

  return {
    title: 'The Base Standard - Reputation',
    description: 'Check your on-chain reputation score on Base L2',
    openGraph: {
      title: 'The Base Standard - Reputation',
      description: 'Check your on-chain reputation score on Base L2',
      images: [frameImageUrl],
    },
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': frameImageUrl,
      'fc:frame:button:1': 'Check My Reputation',
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': `${baseUrl}/my-reputation?address=${address}`,
      'fc:frame:button:2': 'Mint Badge NFT',
      'fc:frame:button:2:action': 'tx',
      'fc:frame:button:2:target': `${baseUrl}/api/frame/mint-badge-tx?address=${address}`,
      'fc:frame:button:2:post_url': `${baseUrl}/api/frame/mint-badge-result`,
      'fc:frame:button:3': 'View Leaderboard',
      'fc:frame:button:3:action': 'link',
      'fc:frame:button:3:target': `${baseUrl}/leaderboard`,
    },
  };
}

export default function ReputationFramePage({ searchParams }: PageProps) {
  const address = searchParams.address || '0x0000000000000000000000000000000000000000';

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen flex items-center justify-center px-12 py-20">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            The Base Standard
          </h1>
          <p className="text-xl text-gray-700 mb-8">Reputation Frame</p>
          <p className="text-gray-600 font-mono text-sm mb-4">
            Address: {address}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Share this frame in Farcaster to display your reputation!
          </p>
        </div>
      </div>
    </div>
  );
}
