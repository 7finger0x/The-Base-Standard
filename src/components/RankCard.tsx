'use client';

import { useAccount } from 'wagmi';
import { Identity, Name, Avatar, Badge } from '@coinbase/onchainkit/identity';
import { useReputation } from '@/hooks/useReputation';
import { TierBadge } from './TierBadge';
import { ShareButton } from './ShareButton';
import { cn } from '@/lib/utils';

interface RankCardProps {
  className?: string;
}

export function RankCard({ className }: RankCardProps) {
  const { address } = useAccount();
  const { data: reputation, isLoading } = useReputation(address);

  if (!address) return null;

  return (
    <div
      className={cn(
        'p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm card-hover',
        className
      )}
    >
      {/* Header with Identity */}
      <div className="flex items-center justify-between mb-6">
        <Identity address={address} className="bg-transparent">
          <Avatar className="h-12 w-12 rounded-full ring-2 ring-cyan-500/50" />
          <div className="ml-3">
            <Name className="font-bold text-lg text-white" />
            <Badge className="mt-1" />
          </div>
        </Identity>
        {reputation && <TierBadge tier={reputation.tier} mini />}
      </div>

      {/* Score Display */}
      <div className="text-center py-8">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-20 w-32 mx-auto bg-zinc-800 rounded-lg" />
          </div>
        ) : (
          <>
            <div className="text-7xl font-black text-gradient animate-score-up">
              {reputation?.totalScore ?? 0}
            </div>
            <p className="text-zinc-500 mt-2 uppercase tracking-wider text-sm">
              Reputation Score
            </p>
          </>
        )}
      </div>

      {/* Quick Stats */}
      {reputation && (
        <>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {reputation.breakdown.baseTenure.days}
              </p>
              <p className="text-xs text-zinc-500 uppercase">Days on Base</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {reputation.breakdown.zoraMints.count}
              </p>
              <p className="text-xs text-zinc-500 uppercase">Zora Mints</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">
                {reputation.breakdown.timeliness.earlyAdopterCount}
              </p>
              <p className="text-xs text-zinc-500 uppercase">Early Mints</p>
            </div>
          </div>

          {/* Share Button */}
          <div className="mt-6 flex justify-center">
            <ShareButton score={reputation.totalScore} tier={reputation.tier} />
          </div>
        </>
      )}
    </div>
  );
}
