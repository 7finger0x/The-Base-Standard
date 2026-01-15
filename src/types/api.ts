export interface DecayInfo {
  daysSinceLastActivity: number;
  decayMultiplier: number;
  willDecay: boolean;
}

export interface PillarBreakdown {
  capital: number;
  diversity: number;
  identity: number;
}

export interface ScoreBreakdown {
  tenure: number;
  economic: number;
  social: number;
}

export interface ReputationData {
  address: string;
  totalScore: number;
  tier: string;
  rank: number;
  totalUsers: number;
  multiplier: number;
  breakdown: ScoreBreakdown;
  pillars: PillarBreakdown;
  decayInfo: DecayInfo;
  linkedWallets: string[];
  lastUpdated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ReputationApiResponse = ApiResponse<ReputationData>;