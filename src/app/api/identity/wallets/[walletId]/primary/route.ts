import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { IdentityService } from '@/lib/identity/identity-service';
import { success, error, Errors } from '@/lib/api-utils';
import { RequestLogger } from '@/lib/request-logger';
import { addCorsHeaders } from '@/lib/cors';
import { requireAuth } from '@/lib/session';
import { walletIdSchema } from '@/lib/validation/wallet-id-schema';

/**
 * PUT /api/identity/wallets/[walletId]/primary
 * Set a wallet as primary
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ walletId: string }> }
) {
  const startTime = Date.now();
  const { walletId: rawWalletId } = await params;

  // Validate wallet ID with Zod
  const validationResult = walletIdSchema.safeParse(rawWalletId);
  if (!validationResult.success) {
    const response = NextResponse.json(
      error(Errors.INVALID_INPUT(validationResult.error.issues[0]?.message || 'Invalid wallet ID')),
      { status: 400 }
    );
    addCorsHeaders(response, request.headers.get('origin'));
    RequestLogger.logRequest(request, 400, Date.now() - startTime);
    return response;
  }

  const walletId = validationResult.data;

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
    const result = await IdentityService.setPrimaryWallet(auth.userId, walletId);

    if (!result.success) {
      const response = NextResponse.json(
        error(Errors.BAD_REQUEST(result.error || 'Failed to set primary wallet')),
        { status: 400 }
      );
      addCorsHeaders(response, request.headers.get('origin'));
      RequestLogger.logRequest(request, 400, Date.now() - startTime);
      return response;
    }

    const response = NextResponse.json(success({ message: 'Primary wallet updated' }));
    addCorsHeaders(response, request.headers.get('origin'));
    RequestLogger.logRequest(request, 200, Date.now() - startTime);
    return response;

  } catch (err) {
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
