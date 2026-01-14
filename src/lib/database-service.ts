import { prisma } from '@/lib/db';
import { User, ReputationLog, ActivityLog, LeaderboardSnapshot } from '@prisma/client';

export interface CreateUserInput {
  address: string;
  ensName?: string;
  score?: number;
  tier?: string;
}

export interface UpdateUserScoreInput {
  address: string;
  score: number;
  tier: string;
  category: string;
  points: number;
  multiplier?: number;
  metadata?: object;
}

export class DatabaseService {
  // User operations
  async createUser(data: CreateUserInput): Promise<User> {
    return await prisma.user.create({
      data: {
        address: data.address.toLowerCase(),
        ensName: data.ensName,
        score: data.score ?? 0,
        tier: data.tier ?? 'NOVICE',
      },
    });
  }

  async getUserByAddress(address: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
    });
  }

  async updateUserScore(input: UpdateUserScoreInput): Promise<User> {
    const user = await this.getUserByAddress(input.address);
    
    if (!user) {
      throw new Error(`User not found: ${input.address}`);
    }

    // Create reputation log entry
    await prisma.reputationLog.create({
      data: {
        userId: user.id,
        category: input.category,
        points: input.points,
        multiplier: input.multiplier ?? 1.0,
        metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
      },
    });

    // Update user score and tier
    const newScore = user.score + (input.points * (input.multiplier ?? 1.0));
    const newTier = this.calculateTier(newScore);

    return await prisma.user.update({
      where: { id: user.id },
      data: {
        score: newScore,
        tier: newTier,
        lastUpdated: new Date(),
      },
    });
  }

  async getTopUsers(limit: number = 100): Promise<User[]> {
    return await prisma.user.findMany({
      orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
      take: limit,
    });
  }

  async getUserRank(address: string): Promise<{ rank: number; totalUsers: number } | null> {
    const user = await this.getUserByAddress(address);
    if (!user) return null;

    const higherRankedUsers = await prisma.user.count({
      where: {
        score: {
          gt: user.score,
        },
      },
    });

    const totalUsers = await prisma.user.count();

    return {
      rank: higherRankedUsers + 1,
      totalUsers,
    };
  }

  // Activity logging
  async logActivity(userId: string, type: string, data: Partial<ActivityLog>): Promise<ActivityLog> {
    return await prisma.activityLog.create({
      data: {
        userId,
        type,
        contract: data.contract,
        tokenId: data.tokenId,
        amount: data.amount,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
    });
  }

  // Leaderboard operations
  async createLeaderboardSnapshot(): Promise<LeaderboardSnapshot> {
    const topUsers = await this.getTopUsers(100);
    const totalUsers = await prisma.user.count();

    return await prisma.leaderboardSnapshot.create({
      data: {
        topUsers: JSON.stringify(topUsers.map(user => ({
          address: user.address,
          score: user.score,
          tier: user.tier,
        }))),
        totalUsers,
      },
    });
  }

  async getLatestLeaderboardSnapshot(): Promise<LeaderboardSnapshot | null> {
    return await prisma.leaderboardSnapshot.findFirst({
      orderBy: { timestamp: 'desc' },
    });
  }

  // Utility methods
  private calculateTier(score: number): string {
    if (score >= 1000) return 'BASED';
    if (score >= 850) return 'GOLD';
    if (score >= 500) return 'SILVER';
    if (score >= 100) return 'BRONZE';
    return 'NOVICE';
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const dbService = new DatabaseService();