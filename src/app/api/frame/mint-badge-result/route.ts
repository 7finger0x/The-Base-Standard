/**
 * Farcaster Frame Transaction Result Handler
 * 
 * Handles the result after a user signs the mint transaction
 * POST /api/frame/mint-badge-result
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createPublicClient, http, type Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';

const REPUTATION_BADGE_ABI = [
  {
    type: 'function',
    name: 'getTokenId',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { untrustedData } = body;
    const address = untrustedData?.address as Address;

    if (!address) {
      return NextResponse.json(
        { message: 'Address required' },
        { status: 400 }
      );
    }

    const badgeContractAddress = process.env.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS as Address;
    if (!badgeContractAddress) {
      return NextResponse.json(
        { message: 'Badge contract not configured' },
        { status: 503 }
      );
    }

    const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453');
    const chain = chainId === 8453 ? base : baseSepolia;

    const publicClient = createPublicClient({
      chain,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    });

    // Get token ID from contract
    const tokenId = await publicClient.readContract({
      address: badgeContractAddress,
      abi: REPUTATION_BADGE_ABI,
      functionName: 'getTokenId',
      args: [address],
    });

    // Get tier from reputation
    // For now, use a default tier - in production, fetch from reputation registry
    const tier = 'BASED'; // Should fetch from actual reputation score

    // Save to database
    await prisma.reputationBadge.upsert({
      where: { tokenId: Number(tokenId) },
      create: {
        address: address.toLowerCase(),
        tokenId: Number(tokenId),
        tier,
      },
      update: {
        tier,
      },
    });

    // Return success response for Frame
    return NextResponse.json({
      type: 'message',
      message: `Badge minted successfully! Token ID: ${tokenId}`,
    });
  } catch (error) {
    console.error('Frame result handler error:', error);
    return NextResponse.json(
      { message: 'Error processing mint result' },
      { status: 500 }
    );
  }
}
