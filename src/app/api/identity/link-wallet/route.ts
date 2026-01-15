import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { IdentityService } from '@/lib/identity/identity-service';
import { success, error, Errors } from '@/lib/api-utils';
import { RequestLogger } from '@/lib/request-logger';
import { addCorsHeaders } from '@/lib/cors';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';

const linkWalletSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address format'),
  chainType: z.enum(['EVM', 'SOLANA', 'BITCOIN', 'COSMOS', 'FLOW']).default('EVM'),
  siweMessage: z.string().min(1),
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/, 'Invalid signature format'),
  nonce: z.string().min(1),
});

/**
 * POST /api/identity/link-wallet
 * Link a wallet to user identity using SIWE
 * 
 * Requires: User session (authenticated user)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Require authentication
  let auth: { userId: string; address?: string };
  try {
    auth = await requireAuth();
  } catch {
    const response = NextResponse.json(
      error(Errors.UNAUTHORIZED('Authentication required')),
      { status: 401 }
    );
    addCorsHeaders(response, request.headers.get('origin'));
    RequestLogger.logRequest(request, 401, Date.now() - startTime);
    return response;
  }

  try {
    const body = await request.json();
    const validated = linkWalletSchema.parse(body);

    // Link wallet
    const result = await IdentityService.linkWallet(auth.userId, {
      address: validated.address as `0x${string}`,
      chainType: validated.chainType,
      siweMessage: validated.siweMessage,
      signature: validated.signature as `0x${string}`,
      nonce: validated.nonce,
    });

    if (!result.success) {
      const response = NextResponse.json(
        error(Errors.BAD_REQUEST(result.error || 'Failed to link wallet')),
        { status: 400 }
      );
      addCorsHeaders(response, request.headers.get('origin'));
      RequestLogger.logRequest(request, 400, Date.now() - startTime);
      return response;
    }

    const response = NextResponse.json(success({
      message: 'Wallet linked successfully',
      address: validated.address,
    }));
    addCorsHeaders(response, request.headers.get('origin'));
    RequestLogger.logRequest(request, 200, Date.now() - startTime);
    return response;

  } catch (err) {
    if (err instanceof z.ZodError) {
      const response = NextResponse.json(
        error(Errors.VALIDATION_ERROR(err.issues)),
        { status: 422 }
      );
      addCorsHeaders(response, request.headers.get('origin'));
      RequestLogger.logRequest(request, 422, Date.now() - startTime);
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
