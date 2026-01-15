import type { ReputationApiResponse } from '@/types/api';

export const MOCK_REPUTATION_RESPONSE: ReputationApiResponse = {
  success: true,
  timestamp: new Date().toISOString(),
  data: {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    totalScore: 875,
    tier: "BASED",
    rank: 42,
    totalUsers: 10000,
    multiplier: 1.5,
    breakdown: {
      tenure: 365,
      economic: 350,
      social: 280
    },
    pillars: {
      capital: 350,
      diversity: 250,
      identity: 280
    },
    decayInfo: {
      daysSinceLastActivity: 5,
      decayMultiplier: 1.0,
      willDecay: false
    },
    linkedWallets: [],
    lastUpdated: new Date().toISOString()
  }
};

export const getMockReputation = (address: string): ReputationApiResponse => {
  return {
    ...MOCK_REPUTATION_RESPONSE,
    data: {
      ...MOCK_REPUTATION_RESPONSE.data,
      address,
      lastUpdated: new Date().toISOString()
    }
  };
};