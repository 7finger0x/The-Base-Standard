'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Share2, Copy, Check, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  pointsEarned: number;
  maxReferrals: number;
  pointsPerReferral: number;
}

const POINTS_PER_REFERRAL = 10;

export function ReferralSystem() {
  const { address } = useAccount();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReferralStats = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/referral/stats?address=${address}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchReferralStats();
    }
  }, [address, fetchReferralStats]);

  const copyReferralLink = () => {
    if (!stats) return;

    const referralLink = `${window.location.origin}?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralLink = async () => {
    if (!stats) return;

    const referralLink = `${window.location.origin}?ref=${stats.referralCode}`;
    const shareData = {
      title: 'Join The Base Standard',
      text: 'Build your on-chain reputation on Base!',
      url: referralLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  if (!address) return null;

  if (isLoading || !stats) {
    return (
      <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm animate-pulse">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  const progress = Math.min(100, (stats.totalReferrals / stats.maxReferrals) * 100);
  const remainingReferrals = stats.maxReferrals - stats.totalReferrals;
  const canEarnMore = stats.totalReferrals < stats.maxReferrals;

  return (
    <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Referral Program
        </h3>
        <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
          +{stats.pointsEarned} Points
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Referrals
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats.totalReferrals} / {stats.maxReferrals}
          </div>
        </div>
        <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Points Earned
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats.pointsEarned}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{canEarnMore ? `${remainingReferrals} left to max` : 'Maxed out!'}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              canEarnMore
                ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                : 'bg-gradient-to-r from-green-600 to-emerald-600'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Your Referral Code
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm font-mono font-semibold text-gray-900 dark:text-white">
            {stats.referralCode}
          </code>
          <button
            onClick={copyReferralLink}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Copy link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <button
            onClick={shareReferralLink}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-600 dark:text-gray-400">
        {canEarnMore ? (
          <>
            Earn <strong className="text-purple-600 dark:text-purple-400">{POINTS_PER_REFERRAL} points</strong>{' '}
            for each friend who joins with your code. Maximum {stats.maxReferrals} referrals.
          </>
        ) : (
          <>
            You have reached the maximum number of referrals! Thanks for spreading the word about The Base Standard.
          </>
        )}
      </div>
    </div>
  );
}
