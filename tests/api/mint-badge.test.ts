/**
 * Tests for /api/mint-badge
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/mint-badge/route';
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/session';
import { prisma } from '@/lib/db';
import { createPublicClient } from 'viem';

// Mock dependencies
vi.mock('@/lib/session', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    reputationBadge: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('viem', () => ({
  createPublicClient: vi.fn(),
  http: vi.fn(),
  encodeFunctionData: vi.fn(() => '0x1234'),
  base: { id: 8453 },
  baseSepolia: { id: 84532 },
}));

vi.mock('@/lib/request-logger', () => ({
  RequestLogger: {
    logRequest: vi.fn(),
  },
}));

vi.mock('@/lib/cors', () => ({
  addCorsHeaders: vi.fn((response) => response),
}));

describe('POST /api/mint-badge', () => {
  const mockUserId = 'user-123';
  const mockAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    process.env.NEXT_PUBLIC_CHAIN_ID = '8453';
    process.env.NEXT_PUBLIC_BASE_RPC_URL = 'https://mainnet.base.org';
  });

  it('should return mint transaction data', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      userId: mockUserId,
      address: mockAddress,
    });

    const mockReadContract = vi.fn().mockResolvedValue(false);
    vi.mocked(createPublicClient).mockReturnValue({
      readContract: mockReadContract,
    } as any);

    const request = new NextRequest('http://localhost:3000/api/mint-badge', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.to).toBe(process.env.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS);
    expect(data.data.data).toBeDefined();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('Not authenticated'));

    const request = new NextRequest('http://localhost:3000/api/mint-badge', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return existing badge if already minted', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      userId: mockUserId,
      address: mockAddress,
    });

    const mockReadContract = vi.fn()
      .mockResolvedValueOnce(true) // hasBadge
      .mockResolvedValueOnce(123n); // tokenId

    vi.mocked(createPublicClient).mockReturnValue({
      readContract: mockReadContract,
    } as any);

    vi.mocked(prisma.reputationBadge.findUnique).mockResolvedValue({
      id: 'badge-123',
      address: mockAddress,
      tokenId: 123,
      tier: 'BUILDER',
      mintedAt: new Date(),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/mint-badge', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.message).toBe('Badge already minted');
    expect(data.data.tokenId).toBe(123);
  });

  it('should return 503 if contract not configured', async () => {
    delete process.env.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS;
    vi.mocked(requireAuth).mockResolvedValue({
      userId: mockUserId,
      address: mockAddress,
    });

    const request = new NextRequest('http://localhost:3000/api/mint-badge', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(503);
  });
});

describe('GET /api/mint-badge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    process.env.NEXT_PUBLIC_CHAIN_ID = '8453';
    process.env.NEXT_PUBLIC_BASE_RPC_URL = 'https://mainnet.base.org';
  });

  it('should return badge status', async () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';
    const mockReadContract = vi.fn()
      .mockResolvedValueOnce(true) // hasBadge
      .mockResolvedValueOnce(123n); // tokenId

    vi.mocked(createPublicClient).mockReturnValue({
      readContract: mockReadContract,
    } as any);

    vi.mocked(prisma.reputationBadge.findUnique).mockResolvedValue({
      id: 'badge-123',
      address: mockAddress,
      tokenId: 123,
      tier: 'BUILDER',
      mintedAt: new Date(),
    } as any);

    const request = new NextRequest(
      `http://localhost:3000/api/mint-badge?address=${mockAddress}`,
      { method: 'GET' }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.hasBadge).toBe(true);
    expect(data.data.tokenId).toBe(123);
  });

  it('should return 400 if address missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/mint-badge', {
      method: 'GET',
    });

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('should return 503 if contract not configured', async () => {
    delete process.env.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS;
    const mockAddress = '0x1234567890123456789012345678901234567890';

    const request = new NextRequest(
      `http://localhost:3000/api/mint-badge?address=${mockAddress}`,
      { method: 'GET' }
    );

    const response = await GET(request);
    expect(response.status).toBe(503);
  });
});
