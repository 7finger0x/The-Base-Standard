'use client';

import { Sidebar } from '@/components/Sidebar';
import Image from 'next/image';
import { useState } from 'react';

const TIERS = [
  {
    name: 'LEGEND',
    range: '951-1000',
    description: 'Top 1% Ecosystem Leaders',
    color: 'yellow',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/50',
    textColor: 'text-yellow-400',
    image: '/tier-legend.svg',
  },
  {
    name: 'BASED',
    range: '851-950',
    description: 'Top 5% Elite (Hard Gate)',
    color: 'cyan',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/50',
    textColor: 'text-cyan-400',
    image: '/tier-based.svg',
  },
  {
    name: 'BUILDER',
    range: '651-850',
    description: 'Power Users with Diversity',
    color: 'blue',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/50',
    textColor: 'text-blue-400',
    image: '/tier-builder.svg',
  },
  {
    name: 'RESIDENT',
    range: '351-650',
    description: 'Average Active Users',
    color: 'amber',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/50',
    textColor: 'text-amber-400',
    image: '/tier-resident.svg',
  },
  {
    name: 'TOURIST',
    range: '0-350',
    description: 'New to Base',
    color: 'zinc',
    bgColor: 'bg-zinc-400/10',
    borderColor: 'border-zinc-400/50',
    textColor: 'text-zinc-400',
    image: '/tier-tourist.svg',
  },
];

export default function TiersPage() {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (tierName: string) => {
    setImageErrors(prev => ({ ...prev, [tierName]: true }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-64 min-h-screen">
        <div className="px-12 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 mb-4">Tier System</h1>
              <p className="text-lg text-gray-600 max-w-3xl">
                Your reputation score determines your tier. Each tier unlocks different benefits and recognition 
                within The Base Standard ecosystem. Climb the ranks by building your on-chain reputation.
              </p>
            </div>

            {/* Tier Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {TIERS.map((tier) => (
                <TierCard
                  key={tier.name}
                  tier={tier}
                  hasImageError={imageErrors[tier.name] || false}
                  onImageError={() => handleImageError(tier.name)}
                />
              ))}
            </div>

            {/* How Tiers Work Section */}
            <div className="mt-12 p-8 bg-gray-50 rounded-2xl border border-gray-200">
              <h2 className="text-2xl font-black text-gray-900 mb-4">How Tiers Work</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Your tier is calculated based on your total reputation score, which combines multiple factors:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Capital (0-400 points):</strong> Your on-chain transaction volume and economic activity</li>
                  <li><strong>Diversity (0-300 points):</strong> Variety of protocols, dApps, and contracts you interact with</li>
                  <li><strong>Identity (0-300 points):</strong> Social connections, verified accounts, and community engagement</li>
                </ul>
                <p className="mt-4">
                  Your tier is updated in real-time as your score changes. Higher tiers unlock exclusive benefits, 
                  early access to features, and recognition in the Base ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface TierCardProps {
  tier: typeof TIERS[0];
  hasImageError: boolean;
  onImageError: () => void;
}

function TierCard({ tier, hasImageError, onImageError }: TierCardProps) {
  const isLegend = tier.name === 'LEGEND';
  const isBased = tier.name === 'BASED';

  return (
    <div
      className={`
        relative p-6 rounded-2xl border-2 transition-all duration-300
        ${tier.bgColor} ${tier.borderColor}
        hover:shadow-lg hover:scale-105
        ${isLegend ? 'shadow-[0_0_20px_rgba(250,204,21,0.3)]' : ''}
        ${isBased ? 'shadow-[0_0_15px_rgba(34,211,238,0.2)]' : ''}
      `}
    >
      {/* Tier Badge Image or Fallback */}
      <div className="mb-4 flex justify-center">
        {!hasImageError ? (
          <div className="relative w-24 h-24">
            <Image
              src={tier.image}
              alt={`${tier.name} tier badge`}
              width={96}
              height={96}
              className="object-contain"
              onError={onImageError}
            />
          </div>
        ) : (
          <div className={`
            w-24 h-24 rounded-full border-2 flex items-center justify-center
            ${tier.bgColor} ${tier.borderColor}
            ${isLegend ? 'animate-pulse' : ''}
          `}>
            <span className={`${tier.textColor} font-black text-2xl`}>
              {tier.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Tier Name */}
      <div className="text-center mb-2">
        <h3 className={`
          text-2xl font-black mb-1
          ${tier.textColor}
        `}>
          {tier.name}
        </h3>
        <div className="text-sm font-mono text-gray-600">
          {tier.range} points
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 text-center mb-4">
        {tier.description}
      </p>

      {/* Score Range Bar */}
      <div className="mt-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${tier.textColor.replace('text-', 'bg-').replace('-400', '-500')} rounded-full`}
            style={{
              width: tier.name === 'LEGEND' ? '100%' :
                     tier.name === 'BASED' ? '90%' :
                     tier.name === 'BUILDER' ? '70%' :
                     tier.name === 'RESIDENT' ? '50%' : '30%'
            }}
          />
        </div>
      </div>
    </div>
  );
}
