/**
 * API Route: Mint Reputation Badge NFT
 * 
 * POST /api/mint-badge
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { Errors, success, error } from '@/lib/api-utils';
import { addCorsHeaders } from '@/lib/cors';
import { RequestLogger } from '@/lib/request-logger';
import { z } from 'zod';
import { createPublicClient, http, encodeFunctionData, type Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { prisma } from '@/lib/db';

const mintBadgeSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address').optional(),
});

const REPUTATION_BADGE_ABI = [
  {
    type: 'function',
    name: 'mint',
    inputs: [{ name: 'to', type: 'address' }],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hasBadge',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'hasBadge', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTokenId',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Require authentication
    const auth = await requireAuth();
    const userAddress = (auth as { address?: string }).address;

    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validationResult = mintBadgeSchema.safeParse(body);

    if (!validationResult.success) {
      const response = NextResponse.json(
        error(Errors.INVALID_INPUT(validationResult.error.message)),
        { status: 400 }
      );
      addCorsHeaders(response, request.headers.get('origin'));
      RequestLogger.logRequest(request, 400, Date.now() - startTime);
      return response;
    }

    const targetAddress = (validationResult.data.address || userAddress) as Address;
    if (!targetAddress) {
      const response = NextResponse.json(
        error(Errors.INVALID_INPUT('Address required')),
        { status: 400 }
      );
      addCorsHeaders(response, request.headers.get('origin'));
      RequestLogger.logRequest(request, 400, Date.now() - startTime);
      return response;
    }

    // Get contract addresses from environment
    const badgeContractAddress = process.env.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS as Address;
    if (!badgeContractAddress) {
      const response = NextResponse.json(
        error(Errors.SERVICE_UNAVAILABLE('Badge contract not configured')),
        { status: 503 }
      );
      addCorsHeaders(response, request.headers.get('origin'));
      RequestLogger.logRequest(request, 503, Date.now() - startTime);
      return response;
    }

    const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453');
    const chain = chainId === 8453 ? base : baseSepolia;

    // Initialize public client to check if badge already exists
    const publicClient = createPublicClient({
      chain,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    });

    // Check if user already has a badge
    const hasBadge = await publicClient.readContract({
      address: badgeContractAddress,
      abi: REPUTATION_BADGE_ABI,
      functionName: 'hasBadge',
      args: [targetAddress],
    });

    if (hasBadge) {
      // Get existing token ID
      const tokenId = await publicClient.readContract({
        address: badgeContractAddress,
        abi: REPUTATION_BADGE_ABI,
        functionName: 'getTokenId',
        args: [targetAddress],
      });

      // Check database for existing record
      const existingBadge = await prisma.reputationBadge.findUnique({
        where: { tokenId: Number(tokenId) },
      });

      if (existingBadge) {
        const response = NextResponse.json(
          success({
            message: 'Badge already minted',
            tokenId: Number(tokenId),
            address: targetAddress,
            tier: existingBadge.tier,
            mintedAt: existingBadge.mintedAt.toISOString(),
          })
        );
        addCorsHeaders(response, request.headers.get('origin'));
        RequestLogger.logRequest(request, 200, Date.now() - startTime);
        return response;
      }
    }

    // Encode mint transaction data
    const mintData = encodeFunctionData({
      abi: REPUTATION_BADGE_ABI,
      functionName: 'mint',
      args: [targetAddress],
    });

    // Return transaction data for client to sign and send
    // In production, you might want to use a relayer or have the backend sign with an admin wallet
    const response = NextResponse.json(
      success({
        message: 'Mint transaction ready',
        to: badgeContractAddress,
        data: mintData,
        chainId,
        // Return read-only view for client-side checks
        // Client should call mint function via their wallet
      })
    );

    addCorsHeaders(response, request.headers.get('origin'));
    RequestLogger.logRequest(request, 200, Date.now() - startTime);
    return response;

  } catch (err) {
    console.error('Mint badge error:', err);
    
    // Handle authentication errors
    if (err instanceof Error && err.message.includes('Authentication')) {
      const response = NextResponse.json(
        error(Errors.UNAUTHORIZED(err.message)),
        { status: 401 }
      );
      addCorsHeaders(response, request.headers.get('origin'));
      RequestLogger.logRequest(request, 401, Date.now() - startTime);
      return response;
    }

    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    const response = NextResponse.json(
      error(Errors.INTERNAL_SERVER_ERROR(errorObj.message)),
      { status: 500 }
    );
    addCorsHeaders(response, request.headers.get('origin'));
    RequestLogger.logRequest(request, 500, Date.now() - startTime, errorObj);
    return response;
  }
}

/**
 * GET /api/mint-badge
 * Check badge status for an address
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address') as Address;

    if (!address) {
      const response = NextResponse.json(
        error(Errors.INVALID_INPUT('Address parameter required')),
        { status: 400 }
      );
      addCorsHeaders(response, request.headers.get('origin'));
      RequestLogger.logRequest(request, 400, Date.now() - startTime);
      return response;
    }

    const badgeContractAddress = process.env.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS as Address;
    if (!badgeContractAddress) {
      const response = NextResponse.json(
        error(Errors.SERVICE_UNAVAILABLE('Badge contract not configured')),
        { status: 503 }
      );
      addCorsHeaders(response, request.headers.get('origin'));
      RequestLogger.logRequest(request, 503, Date.now() - startTime);
      return response;
    }

    const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453');
    const chain = chainId === 8453 ? base : baseSepolia;

    const publicClient = createPublicClient({
      chain,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    });

    const hasBadge = await publicClient.readContract({
      address: badgeContractAddress,
      abi: REPUTATION_BADGE_ABI,
      functionName: 'hasBadge',
      args: [address],
    });

    let tokenId: bigint | null = null;
    if (hasBadge) {
      tokenId = await publicClient.readContract({
        address: badgeContractAddress,
        abi: REPUTATION_BADGE_ABI,
        functionName: 'getTokenId',
        args: [address],
      });
    }

    // Check database for additional info
    let badgeInfo = null;
    if (tokenId) {
      badgeInfo = await prisma.reputationBadge.findUnique({
        where: { tokenId: Number(tokenId) },
      });
    }

    const response = NextResponse.json(
      success({
        address,
        hasBadge,
        tokenId: tokenId ? Number(tokenId) : null,
        tier: badgeInfo?.tier || null,
        mintedAt: badgeInfo?.mintedAt?.toISOString() || null,
      })
    );

    addCorsHeaders(response, request.headers.get('origin'));
    RequestLogger.logRequest(request, 200, Date.now() - startTime);
    return response;

  } catch (err) {
    console.error('Get badge error:', err);
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    const response = NextResponse.json(
      error(Errors.INTERNAL_SERVER_ERROR(errorObj.message)),
      { status: 500 }
    );
    addCorsHeaders(response, request.headers.get('origin'));
    RequestLogger.logRequest(request, 500, Date.now() - startTime, errorObj);
    return response;
  }
}
