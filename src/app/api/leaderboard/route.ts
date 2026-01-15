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
    RequestLogger.logWarning('Ponder not available, using mock data', {
      limit,
      offset,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Fallback mock leaderboard
  const mockLeaderboard = generateMockLeaderboard(limit, offset);
  const response = NextResponse.json(mockLeaderboard);
  addCorsHeaders(response, request.headers.get('origin'));
  RequestLogger.logRequest(request, 200, Date.now() - startTime);
  return response;
}

function generateMockLeaderboard(limit: number, offset: number) {
  const leaderboard = [];

  for (let i = 0; i < limit; i++) {
    const rank = offset + i + 1;
    // Generate scores in 0-1000 range (recalibrated)
    const score = Math.max(0, Math.min(1000, 1000 - rank * 2 + Math.floor(Math.random() * 50)));
    const tier = getTier(score);

    leaderboard.push({
      rank,
      address: `0x${rank.toString(16).padStart(4, '0')}${'0'.repeat(36)}`,
      score,
      tier,
    });
  }

  // Sort by score descending to ensure proper ordering
  leaderboard.sort((a, b) => b.score - a.score);

  // Re-assign ranks after sorting
  leaderboard.forEach((user, index) => {
    user.rank = offset + index + 1;
  });

  return {
    leaderboard,
    pagination: {
      limit,
      offset,
      hasMore: offset + limit < 1000,
      total: 10000,
    },
  };
}

function getTier(score: number): string {
  // Recalibrated tier thresholds (0-1000 scale)
  if (score >= 951) return 'LEGEND';      // Top 1%
  if (score >= 851) return 'BASED';       // Top 5% (95th-99th)
  if (score >= 651) return 'BUILDER';     // 75th-95th
  if (score >= 351) return 'RESIDENT';    // 40th-75th
  return 'TOURIST';                       // Bottom 40% (0-350)
}
