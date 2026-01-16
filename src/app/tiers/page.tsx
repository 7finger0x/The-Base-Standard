'use client';

import { Sidebar } from '@/components/Sidebar';
import { TierBadge } from '@/components/TierBadge';

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

export default function TiersPage() {
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
          </div>
        </div>
      </main>
    </div>
  );
}
