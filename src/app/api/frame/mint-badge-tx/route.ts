/**
 * Farcaster Frame Transaction Handler
 * 
 * Returns transaction data for minting a reputation badge NFT
 * GET /api/frame/mint-badge-tx
 */

import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData, type Address } from 'viem';

const REPUTATION_BADGE_ABI = [
  {
    type: 'function',
    name: 'mint',
    inputs: [{ name: 'to', type: 'address' }],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address') as Address;

    if (!address) {
      return NextResponse.json(
        { message: 'Address parameter required' },
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

    // Encode mint transaction
    const data = encodeFunctionData({
      abi: REPUTATION_BADGE_ABI,
      functionName: 'mint',
      args: [address],
    });

    // Return transaction data for Farcaster Frame
    return NextResponse.json({
      chainId: `eip155:${process.env.NEXT_PUBLIC_CHAIN_ID || '8453'}`,
      method: 'eth_sendTransaction',
      params: {
        abi: REPUTATION_BADGE_ABI,
        to: badgeContractAddress,
        data,
      },
    });
  } catch (error) {
    console.error('Frame transaction error:', error);
    return NextResponse.json(
      { message: 'Error generating transaction' },
      { status: 500 }
    );
  }
}
