import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { IdentityService } from '@/lib/identity/identity-service';
import { success, error, Errors } from '@/lib/api-utils';
import { RequestLogger } from '@/lib/request-logger';
import { addCorsHeaders } from '@/lib/cors';
import { getUserIdFromRequest } from '@/lib/session';

/**
 * GET /api/identity/nonce
 * Generate SIWE nonce for wallet linking
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Optional: Get userId from session if authenticated
    const userId = await getUserIdFromRequest(request) || undefined;
    const address = request.nextUrl.searchParams.get('address') || undefined;

    const nonce = await IdentityService.generateNonce(
      userId,
      address as `0x${string}` | undefined
    );

    const response = NextResponse.json(success({ nonce }));
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
