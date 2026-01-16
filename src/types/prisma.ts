/**
 * Prisma model type stubs
 * These are used for build-time type checking when Prisma client hasn't been generated.
 * On Vercel, the actual types will be generated during postinstall.
 */

export interface User {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  displayName: string | null;
  score: number;
  rank: number;
  tier: string;
  lastUpdated: Date;
  address: string | null;
  accounts?: Account[];
  activityLogs?: ActivityLog[];
  reputationLogs?: ReputationLog[];
  sessions?: Session[];
  wallets?: Wallet[];
}

export interface Wallet {
  id: string;
  address: string;
  chainType: string;
  label: string | null;
  verifiedAt: Date;
  verificationMethod: string;
  isPrimary: boolean;
  userId: string;
  user?: User;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
  providerUsername: string | null;
  providerAvatar: string | null;
  user?: User;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user?: User;
}

export interface SiweNonce {
  id: string;
  nonce: string;
  userId: string | null;
  address: string | null;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export interface ReputationLog {
  id: string;
  userId: string;
  category: string;
  points: number;
  multiplier: number;
  timestamp: Date;
  metadata: string | null;
  user?: User;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: string;
  contract: string | null;
  tokenId: string | null;
  amount: number | null;
  timestamp: Date;
  metadata: string | null;
  user?: User;
}

export interface LeaderboardSnapshot {
  id: string;
  timestamp: Date;
  topUsers: string;
  totalUsers: number;
}
