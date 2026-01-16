/**
 * Tests for DELETE /api/identity/wallets/[walletId]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from '@/app/api/identity/wallets/[walletId]/route';
import { NextRequest } from 'next/server';
import { IdentityService } from '@/lib/identity/identity-service';
import { requireAuth } from '@/lib/session';

// Mock dependencies
vi.mock('@/lib/identity/identity-service', () => ({
  IdentityService: {
    unlinkWallet: vi.fn(),
  },
}));

vi.mock('@/lib/session', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/request-logger', () => ({
  RequestLogger: {
    logRequest: vi.fn(),
  },
}));

vi.mock('@/lib/cors', () => ({
  addCorsHeaders: vi.fn((response) => response),
}));

describe('DELETE /api/identity/wallets/[walletId]', () => {
  const mockUserId = 'user-123';
  const mockWalletId = 'wallet-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should unlink wallet successfully', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      userId: mockUserId,
    });
    vi.mocked(IdentityService.unlinkWallet).mockResolvedValue({
      success: true,
    });

    const request = new NextRequest(
      `http://localhost:3000/api/identity/wallets/${mockWalletId}`,
      { method: 'DELETE' }
    );

    const params = Promise.resolve({ walletId: mockWalletId });
    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.message).toBe('Wallet unlinked successfully');
    expect(IdentityService.unlinkWallet).toHaveBeenCalledWith(mockUserId, mockWalletId);
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('Not authenticated'));

    const request = new NextRequest(
      `http://localhost:3000/api/identity/wallets/${mockWalletId}`,
      { method: 'DELETE' }
    );

    const params = Promise.resolve({ walletId: mockWalletId });
    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 400 for invalid wallet ID', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      userId: mockUserId,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/identity/wallets/invalid-id',
      { method: 'DELETE' }
    );

    const params = Promise.resolve({ walletId: 'invalid-id' });
    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 if unlinkWallet fails', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      userId: mockUserId,
    });
    vi.mocked(IdentityService.unlinkWallet).mockResolvedValue({
      success: false,
      error: 'Wallet not found',
    });

    const request = new NextRequest(
      `http://localhost:3000/api/identity/wallets/${mockWalletId}`,
      { method: 'DELETE' }
    );

    const params = Promise.resolve({ walletId: mockWalletId });
    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('Wallet not found');
  });
});
