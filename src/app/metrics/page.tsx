'use client';

import { Sidebar } from '@/components/Sidebar';
import { MetricCard, BaseTenureGraphic, ZoraMintsGraphic, ReputationScoreGraphic, EarlyAdopterGraphic } from '@/components/MetricCard';

const metrics = [
  {
    title: 'BASE TENURE',
    description: 'Days since your first transaction on Base L2. Longer tenure demonstrates commitment to the ecosystem.',
    weight: '25%',
    maxPoints: 250,
    graphic: <BaseTenureGraphic />,
  },
  {
    title: 'ZORA MINTS',
    description: 'NFTs minted on Zora. Rewards creators and collectors who actively participate in the NFT ecosystem.',
    weight: '25%',
    maxPoints: 250,
    graphic: <ZoraMintsGraphic />,
  },
  {
    title: 'TRANSACTION ACTIVITY',
    description: 'Your overall transaction history on Base. More activity shows deeper engagement.',
    weight: '20%',
    maxPoints: 200,
    graphic: <ReputationScoreGraphic />,
  },
  {
    title: 'EARLY ADOPTER',
    description: 'Bonus multipliers for being among the first to engage with new collections and protocols.',
    weight: '15%',
    maxPoints: 150,
    graphic: <EarlyAdopterGraphic />,
  },
  {
    title: 'CONTRACT INTERACTIONS',
    description: 'Unique smart contracts you have interacted with. Diversity of usage indicates expertise.',
    weight: '15%',
    maxPoints: 150,
    graphic: <BaseTenureGraphic />,
  },
];

export default function MetricsPage() {
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
            <h1 className="text-4xl font-black text-gray-900 mb-4">How We Calculate Your Score</h1>
            <p className="text-lg text-gray-600 mb-8">
              Your reputation score is calculated from multiple on-chain metrics. Each metric contributes to your total score up to 1,000 points.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-bold text-blue-900 mb-2">Total Score: 0-1,000 points</h2>
              <p className="text-blue-700">
                Your tier is determined by your total score across all metrics. Connect your wallet to see your personalized breakdown.
              </p>
            </div>

            <div className="space-y-6">
              {metrics.map((metric) => (
                <div
                  key={metric.title}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-24 flex-shrink-0">
                      {metric.graphic}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-gray-900">{metric.title}</h2>
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {metric.weight} weight
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{metric.description}</p>
                      <p className="text-sm text-gray-500">
                        Maximum contribution: <span className="font-semibold text-gray-700">{metric.maxPoints} points</span>
                      </p>
                    </div>
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
