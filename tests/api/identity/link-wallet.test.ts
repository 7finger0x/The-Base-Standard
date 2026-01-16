/**
 * Tests for POST /api/identity/link-wallet
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/identity/link-wallet/route';
import { NextRequest } from 'next/server';
import { IdentityService } from '@/lib/identity/identity-service';
import { requireAuth } from '@/lib/session';

// Mock dependencies
vi.mock('@/lib/identity/identity-service', () => ({
  IdentityService: {
    linkWallet: vi.fn(),
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

describe('POST /api/identity/link-wallet', () => {
  const mockUserId = 'user-123';
  const mockAddress = '0x1234567890123456789012345678901234567890';
  const validBody = {
    address: mockAddress,
    chainType: 'EVM' as const,
    siweMessage: 'test message',
    signature: '0x' + 'a'.repeat(130),
    nonce: 'test-nonce',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should link wallet successfully', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      userId: mockUserId,
      address: mockAddress,
    });
    vi.mocked(IdentityService.linkWallet).mockResolvedValue({
      success: true,
    });

    const request = new NextRequest('http://localhost:3000/api/identity/link-wallet', {
      method: 'POST',
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.message).toBe('Wallet linked successfully');
    expect(IdentityService.linkWallet).toHaveBeenCalledWith(mockUserId, {
      address: mockAddress,
      chainType: 'EVM',
      siweMessage: validBody.siweMessage,
      signature: validBody.signature,
      nonce: validBody.nonce,
    });
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('Not authenticated'));

    const request = new NextRequest('http://localhost:3000/api/identity/link-wallet', {
      method: 'POST',
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 422 for invalid address format', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      userId: mockUserId,
      address: mockAddress,
    });

    const request = new NextRequest('http://localhost:3000/api/identity/link-wallet', {
      method: 'POST',
      body: JSON.stringify({
        ...validBody,
        address: 'invalid-address',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 422 for invalid signature format', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      userId: mockUserId,
      address: mockAddress,
    });

    const request = new NextRequest('http://localhost:3000/api/identity/link-wallet', {
      method: 'POST',
      body: JSON.stringify({
        ...validBody,
        signature: 'invalid-signature',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.success).toBe(false);
  });

  it('should return 400 if linkWallet fails', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      userId: mockUserId,
      address: mockAddress,
    });
    vi.mocked(IdentityService.linkWallet).mockResolvedValue({
      success: false,
      error: 'Wallet already linked',
    });

    const request = new NextRequest('http://localhost:3000/api/identity/link-wallet', {
      method: 'POST',
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('Wallet already linked');
  });

  it('should handle missing required fields', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      userId: mockUserId,
      address: mockAddress,
    });

    const request = new NextRequest('http://localhost:3000/api/identity/link-wallet', {
      method: 'POST',
      body: JSON.stringify({
        address: mockAddress,
        // Missing other required fields
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.success).toBe(false);
  });

  it('should handle invalid JSON', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      userId: mockUserId,
      address: mockAddress,
    });

    const request = new NextRequest('http://localhost:3000/api/identity/link-wallet', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
