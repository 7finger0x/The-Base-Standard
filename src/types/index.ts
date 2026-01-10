export type Tier = 'Novice' | 'Bronze' | 'Silver' | 'Gold' | 'BASED';

export interface ReputationData {
  address: string;
  totalScore: number;
  tier: Tier;
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

export interface LinkedWallet {
  address: string;
  mainAccountId: string;
  zoraMints: number;
  firstTxTimestamp: number;
}

export interface Account {
  id: string;
  baseScore: number;
  zoraScore: number;
  totalScore: number;
  lastUpdated: number;
  wallets: LinkedWallet[];
}
