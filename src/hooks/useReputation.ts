'use client';

import { useQuery } from '@tanstack/react-query';

export interface ReputationData {
  address: string;
  totalScore: number;
  tier: string;
  rank?: number;
  totalUsers?: number;
  // New PVC format
  pillars?: {
    capital: number;    // Pillar 1: Capital Efficiency (max 400)
    diversity: number;   // Pillar 2: Ecosystem Diversity (max 300)
    identity: number;   // Pillar 3: Identity & Social Proof (max 300)
  };
  multiplier?: number;   // Sybil resistance multiplier
  decayInfo?: {
    daysSinceLastActivity: number;
    decayMultiplier: number;
    willDecay: boolean;
  };
  // Legacy format (for backward compatibility)
  breakdown?: {
    baseTenure?: {
      score: number;
      days: number;
      firstTx: string;
    };
    zoraMints?: {
      score: number;
      count: number;
      earlyMints: number;
    };
    timeliness?: {
      score: number;
      earlyAdopterCount: number;
    };
    economic?: number;   // Capital pillar (if using old format)
    social?: number;     // Identity pillar (if using old format)
    diversity?: number;  // Diversity pillar (if using old format)
  };
  linkedWallets?: string[];
  lastUpdated?: string;
  scoringModel?: 'PVC' | 'legacy';
}

async function fetchReputation(address: string): Promise<ReputationData> {
  const response = await fetch(`/api/reputation?address=${address}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reputation');
  }
  const json = await response.json();
  // API wraps response in { success: true, data: {...} }
  return json.data || json;
}

export function useReputation(address: string | undefined) {
  return useQuery({
    queryKey: ['reputation', address],
    queryFn: () => fetchReputation(address!),
    enabled: !!address,
    staleTime: 5000, // 5 seconds - sync with Base blocks
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
