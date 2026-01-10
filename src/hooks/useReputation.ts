'use client';

import { useQuery } from '@tanstack/react-query';

export interface ReputationData {
  address: string;
  totalScore: number;
  tier: string;
  breakdown: {
    baseTenure: {
      score: number;
      days: number;
      firstTx: string;
    };
    zoraMints: {
      score: number;
      count: number;
      earlyMints: number;
    };
    timeliness: {
      score: number;
      earlyAdopterCount: number;
    };
  };
  linkedWallets: string[];
  lastUpdated: string;
}

async function fetchReputation(address: string): Promise<ReputationData> {
  const response = await fetch(`/api/reputation?address=${address}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reputation');
  }
  return response.json();
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
