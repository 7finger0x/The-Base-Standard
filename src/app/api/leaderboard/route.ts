import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RequestLogger } from '@/lib/request-logger';
import { addCorsHeaders } from '@/lib/cors';
import { leaderboardQuerySchema } from '@/lib/validation/schemas';
import { error, Errors } from '@/lib/api-utils';

const PONDER_URL = process.env.PONDER_URL || 'http://localhost:42069';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);

  // Validate query parameters with Zod
  const validationResult = leaderboardQuerySchema.safeParse({
    limit: searchParams.get('limit'),
    offset: searchParams.get('offset'),
  });

  if (!validationResult.success) {
    const response = NextResponse.json(
      error(Errors.INVALID_INPUT(validationResult.error.issues[0]?.message || 'Invalid pagination parameters')),
      { status: 400 }
    );
    addCorsHeaders(response, request.headers.get('origin'));
    RequestLogger.logRequest(request, 400, Date.now() - startTime);
    return response;
  }

  const { limit, offset } = validationResult.data;

  try {
    // Try to fetch from Ponder indexer
    const ponderResponse = await fetch(
      `${PONDER_URL}/api/leaderboard?limit=${limit}&offset=${offset}`,
      { next: { revalidate: 30 } }
    );

    if (ponderResponse.ok) {
      const data = await ponderResponse.json();
      const response = NextResponse.json(data);
      addCorsHeaders(response, request.headers.get('origin'));
      RequestLogger.logRequest(request, 200, Date.now() - startTime);
      return response;
    }
  } catch (error) {
    RequestLogger.logWarning('Ponder not available, returning empty leaderboard', {
      limit,
      offset,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Return empty leaderboard when Ponder is not available
  // Leaderboard will only show real users who have minted NFTs
  const emptyLeaderboard = {
    leaderboard: [],
    pagination: {
      limit,
      offset,
      hasMore: false,
      total: 0,
    },
  };
  const response = NextResponse.json(emptyLeaderboard);
  addCorsHeaders(response, request.headers.get('origin'));
  RequestLogger.logRequest(request, 200, Date.now() - startTime);
  return response;
}
