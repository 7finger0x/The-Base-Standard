import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatabaseService } from '@/lib/database-service';

// Mock Prisma client
const mockPrisma = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  reputationLog: {
    create: vi.fn(),
  },
  activityLog: {
    create: vi.fn(),
  },
  leaderboardSnapshot: {
    create: vi.fn(),
    findFirst: vi.fn(),
  },
  $queryRaw: vi.fn(),
};

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DatabaseService();
  });

  describe('createUser', () => {
    it('should create user with default values', async () => {
      const mockUser = {
        id: 'user-1',
        address: '0xtest',
        ensName: null,
        score: 0,
        tier: 'NOVICE',
        rank: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.create.mockResolvedValueOnce(mockUser);

      const result = await service.createUser({ address: '0xTEST' });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          address: '0xtest',
          ensName: undefined,
          score: 0,
          tier: 'NOVICE',
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should create user with custom values', async () => {
      const mockUser = {
        id: 'user-2',
        address: '0xcustom',
        ensName: 'test.base.eth',
        score: 100,
        tier: 'BRONZE',
        rank: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.create.mockResolvedValueOnce(mockUser);

      const result = await service.createUser({
        address: '0xCUSTOM',
        ensName: 'test.base.eth',
        score: 100,
        tier: 'BRONZE',
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          address: '0xcustom',
          ensName: 'test.base.eth',
          score: 100,
          tier: 'BRONZE',
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should lowercase addresses', async () => {
      mockPrisma.user.create.mockResolvedValueOnce({} as any);

      await service.createUser({ address: '0xABCDEF' });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          address: '0xabcdef',
        }),
      });
    });
  });

  describe('getUserByAddress', () => {
    it('should find user by lowercase address', async () => {
      const mockUser = {
        id: 'user-1',
        address: '0xtest',
        score: 500,
        tier: 'SILVER',
      };

      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.getUserByAddress('0xTEST');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { address: '0xtest' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      const result = await service.getUserByAddress('0xnonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getTopUsers', () => {
    it('should return users ordered by score descending', async () => {
      const mockUsers = [
        { id: '1', score: 1000, createdAt: new Date() },
        { id: '2', score: 900, createdAt: new Date() },
        { id: '3', score: 800, createdAt: new Date() },
      ];

      mockPrisma.user.findMany.mockResolvedValueOnce(mockUsers);

      const result = await service.getTopUsers(3);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
        take: 3,
      });
      expect(result).toEqual(mockUsers);
    });

    it('should use default limit of 100', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([]);

      await service.getTopUsers();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
        take: 100,
      });
    });
  });

  describe('getUserRank', () => {
    it('should calculate correct rank', async () => {
      const mockUser = { id: 'user-1', score: 500 };

      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
      mockPrisma.user.count.mockResolvedValueOnce(10); // 10 users with higher score
      mockPrisma.user.count.mockResolvedValueOnce(100); // 100 total users

      const result = await service.getUserRank('0xtest');

      expect(result).toEqual({
        rank: 11,
        totalUsers: 100,
      });
    });

    it('should return null for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      const result = await service.getUserRank('0xnonexistent');

      expect(result).toBeNull();
    });

    it('should return rank 1 for top user', async () => {
      const mockUser = { id: 'user-1', score: 2000 };

      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
      mockPrisma.user.count.mockResolvedValueOnce(0); // 0 users with higher score
      mockPrisma.user.count.mockResolvedValueOnce(50);

      const result = await service.getUserRank('0xtest');

      expect(result?.rank).toBe(1);
    });
  });

  describe('logActivity', () => {
    it('should create activity log', async () => {
      const mockLog = {
        id: 'log-1',
        userId: 'user-1',
        type: 'transaction',
        timestamp: new Date(),
      };

      mockPrisma.activityLog.create.mockResolvedValueOnce(mockLog);

      const result = await service.logActivity('user-1', 'transaction', {
        contract: '0xcontract',
        amount: 100,
      });

      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: 'transaction',
          contract: '0xcontract',
          tokenId: undefined,
          amount: 100,
          metadata: undefined,
        },
      });
      expect(result).toEqual(mockLog);
    });

    it('should stringify metadata', async () => {
      mockPrisma.activityLog.create.mockResolvedValueOnce({} as any);

      await service.logActivity('user-1', 'mint', {
        metadata: JSON.stringify({ nftId: 123 }),
      });

      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: JSON.stringify({ nftId: 123 }),
        }),
      });
    });
  });

  describe('createLeaderboardSnapshot', () => {
    it('should create snapshot with top users', async () => {
      const mockUsers = [
        { address: '0x1', score: 1000, tier: 'BASED' },
        { address: '0x2', score: 900, tier: 'GOLD' },
      ];

      mockPrisma.user.findMany.mockResolvedValueOnce(mockUsers);
      mockPrisma.user.count.mockResolvedValueOnce(50);
      mockPrisma.leaderboardSnapshot.create.mockResolvedValueOnce({
        id: 'snap-1',
        topUsers: JSON.stringify(mockUsers),
        totalUsers: 50,
        timestamp: new Date(),
      });

      const result = await service.createLeaderboardSnapshot();

      expect(result.totalUsers).toBe(50);
      expect(mockPrisma.leaderboardSnapshot.create).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('should return true when database is healthy', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ '1': 1 }]);

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it('should return false when database query fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });
});
