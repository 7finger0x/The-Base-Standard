'use client';

import { Sidebar } from '@/components/Sidebar';
import { TierBadge } from '@/components/TierBadge';
import { TierCardMinter } from '@/components/TierCardMinter';
import { ScoreTierDisplay } from '@/components/ScoreTierDisplay';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

const tiers = [
  {
    name: 'LEGEND',
    threshold: '951+',
    description: 'Top 1% of Base users. Elite status with maximum rewards and exclusive access.',
    color: 'from-yellow-400 to-amber-500',
    benefits: ['Exclusive NFT drops', 'Priority support', 'Governance voting power', 'Early access to features'],
  },
  {
    name: 'BASED',
    threshold: '851-950',
    description: 'Top 5% of Base users. Highly engaged community member.',
    color: 'from-purple-400 to-purple-600',
    benefits: ['Premium features', 'Community recognition', 'Bonus multipliers', 'Special badges'],
  },
  {
    name: 'BUILDER',
    threshold: '651-850',
    description: 'Active contributor to the Base ecosystem.',
    color: 'from-blue-400 to-blue-600',
    benefits: ['Builder tools access', 'Network perks', 'Event invites', 'Collaboration opportunities'],
  },
  {
    name: 'RESIDENT',
    threshold: '351-650',
    description: 'Established presence on Base with consistent activity.',
    color: 'from-green-400 to-green-600',
    benefits: ['Standard rewards', 'Community access', 'Basic multipliers', 'Activity tracking'],
  },
  {
    name: 'TOURIST',
    threshold: '0-350',
    description: 'New to Base. Start your journey and build your reputation!',
    color: 'from-gray-400 to-gray-500',
    benefits: ['Welcome bonus', 'Onboarding guides', 'Getting started rewards', 'Community support'],
  },
];

const nftTiers = [
  {
    tier: 'BASED' as const,
    score: 'ELITE STATUS',
    descriptor: 'Top 5% of Base',
    mintPrice: '0.005',
    minScore: 851,
  },
  {
    tier: 'GOLD' as const,
    score: '850+',
    descriptor: 'Premium Builder',
    mintPrice: '0.003',
    minScore: 850,
  },
  {
    tier: 'SILVER' as const,
    score: '500-849',
    descriptor: 'Active Resident',
    mintPrice: '0.002',
    minScore: 500,
  },
  {
    tier: 'BRONZE' as const,
    score: '100-499',
    descriptor: 'Base Explorer',
    mintPrice: '0.001',
    minScore: 100,
  },
  {
    tier: 'TOURIST' as const,
    score: '0-99',
    descriptor: 'Welcome to Base',
    mintPrice: '0.0005',
    minScore: 0,
  },
];

export default function TiersPage() {
  const { address } = useAccount();
  const [userScore, setUserScore] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (address) {
      fetch(`/api/reputation?address=${address}`)
        .then((res) => res.json())
        .then((data) => {
          setUserScore(data.totalScore || 0);
        })
        .catch((err) => {
          console.error('Error fetching reputation:', err);
        });
    }
  }, [address]);
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-64 min-h-screen">
        {/* Status Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Base L2</span>
        </div>

        {/* Content */}
        <div className="px-12 py-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-black text-gray-900 mb-4">Reputation Tiers</h1>
            <p className="text-lg text-gray-600 mb-8">
              Your tier is determined by your reputation score. Higher tiers unlock more benefits and recognition in the Base ecosystem.
            </p>

            <div className="space-y-6">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <TierBadge tier={tier.name} size="lg" />
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{tier.name}</h2>
                        <p className="text-sm text-gray-500">Score: {tier.threshold}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{tier.description}</p>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Benefits:</h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {tier.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* NFT Tier Cards Section */}
            <div className="mt-16">
              <div className="border-t border-gray-200 pt-12">
                <h2 className="text-3xl font-black text-gray-900 mb-3">
                  Mint Your Tier NFT
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Immortalize your achievement on-chain. Mint an NFT representing your tier status
                  in The Base Standard reputation system.
                </p>

                {address && userScore !== undefined && (
                  <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <ScoreTierDisplay score={userScore} showProgress={true} />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {nftTiers.map((nftTier) => (
                    <TierCardMinter
                      key={nftTier.tier}
                      tier={nftTier.tier}
                      score={nftTier.score}
                      descriptor={nftTier.descriptor}
                      mintPrice={nftTier.mintPrice}
                      userScore={userScore}
                      className="w-full"
                    />
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">About Tier NFTs</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>
                        <strong>Permanent Record:</strong> Your tier NFT is a permanent on-chain
                        record of your achievement in The Base Standard ecosystem.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>
                        <strong>Eligibility:</strong> You must meet the minimum score requirement
                        to mint a tier NFT. Keep building your reputation to unlock higher tiers!
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>
                        <strong>Collectible:</strong> Each tier has a unique design featuring
                        The Base Standard logo and your tier status.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>
                        <strong>Future Utility:</strong> Tier NFTs may unlock exclusive benefits,
                        governance rights, and special access in future ecosystem developments.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
