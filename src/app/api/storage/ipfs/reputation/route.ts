/**
 * API Route: Store Reputation Metadata on IPFS
 * 
 * POST /api/storage/ipfs/reputation
 */

import { NextRequest, NextResponse } from 'next/server';
import { storeReputationMetadata } from '@/lib/storage/ipfs';
import { resolveIPFSUrl } from '@/lib/storage/gateway';
import { isServiceConfigured } from '@/lib/env';
import { Errors, success, error } from '@/lib/api-utils';
import { addCorsHeaders } from '@/lib/cors';
import { z } from 'zod';

const reputationMetadataSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  score: z.number().int().min(0).max(1000),
  tier: z.enum(['TOURIST', 'RESIDENT', 'BUILDER', 'BASED', 'LEGEND']),
  timestamp: z.number().int().positive().optional(),
  linkedWallets: z.array(z.string().regex(/^0x[a-fA-F0-9]{40}$/)).optional(),
  breakdown: z.object({
    tenure: z.number().int().min(0).optional(),
    economic: z.number().int().min(0).optional(),
    social: z.number().int().min(0).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check if IPFS is configured
    if (!isServiceConfigured('ipfs')) {
      return NextResponse.json(
        error(Errors.SERVICE_UNAVAILABLE('IPFS service not configured. Set PINATA_JWT_TOKEN.')),
        { status: 503 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = reputationMetadataSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        error(Errors.INVALID_INPUT(validationResult.error.message)),
        { status: 400 }
      );
    }

    const metadata = {
      ...validationResult.data,
      timestamp: validationResult.data.timestamp || Date.now(),
      linkedWallets: validationResult.data.linkedWallets || [],
    };

    // Store on IPFS
    const cid = await storeReputationMetadata(metadata);
    const ipfsUrl = `ipfs://${cid}`;
    const gatewayUrl = resolveIPFSUrl(ipfsUrl);

    const response = NextResponse.json(
      success({
        cid,
        ipfsUrl,
        gatewayUrl,
        metadata,
      })
    );

    addCorsHeaders(response, request.headers.get('origin'));
    return response;

  } catch (err) {
    console.error('IPFS storage error:', err);
    const response = NextResponse.json(
      error(Errors.INTERNAL_SERVER_ERROR()),
      { status: 500 }
    );
    addCorsHeaders(response, request.headers.get('origin'));
    return response;
  }
}
