import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { IdentityService } from '@/lib/identity/identity-service';
import { success, error, Errors } from '@/lib/api-utils';
import { RequestLogger } from '@/lib/request-logger';
import { addCorsHeaders } from '@/lib/cors';
import { getSession, getUserIdFromRequest } from '@/lib/session';
import { identityMeQuerySchema } from '@/lib/validation/schemas';

/**
 * GET /api/identity/me
 * Get current user's identity with all linked accounts
 * 
 * Requires: User session or address parameter
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Validate query parameters with Zod
  const { searchParams } = new URL(request.url);
  const validationResult = identityMeQuerySchema.safeParse({
    address: searchParams.get('address'),
  });

  if (!validationResult.success) {
    const response = NextResponse.json(
      error(Errors.INVALID_INPUT(validationResult.error.issues[0]?.message || 'Invalid address parameter')),
      { status: 400 }
    );
    addCorsHeaders(response, request.headers.get('origin'));
    RequestLogger.logRequest(request, 400, Date.now() - startTime);
    return response;
  }

  // Try to get userId from session or request
  const userId = await getUserIdFromRequest(request);
  const address = validationResult.data.address;

  try {
    let identity;

    if (userId) {
      // Use session userId
      identity = await IdentityService.getUserIdentity(userId);
    } else if (address) {
      // Find user by wallet address (for backward compatibility)
      const user = await IdentityService.findUserByWallet(
        address as `0x${string}`,
        'EVM'
      );
      if (user) {
        identity = await IdentityService.getUserIdentity(user.id);
      }
    } else {
      // Try to get from session
      const session = await getSession();
      if (session?.user?.id) {
        identity = await IdentityService.getUserIdentity(session.user.id);
      }
    }

    if (!identity) {
      const response = NextResponse.json(
        error(Errors.NOT_FOUND('User identity not found')),
        { status: 404 }
      );
      addCorsHeaders(response, request.headers.get('origin'));
      RequestLogger.logRequest(request, 404, Date.now() - startTime);
      return response;
    }

    const response = NextResponse.json(success(identity));
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
