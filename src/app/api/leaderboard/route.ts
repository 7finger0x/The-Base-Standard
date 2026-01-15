import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RequestLogger } from '@/lib/request-logger';
import { addCorsHeaders } from '@/lib/cors';

const PONDER_URL = process.env.PONDER_URL || 'http://localhost:42069';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

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
    success: true,
    data: {
      leaderboard,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < 1000,
        total: 10000,
      },
    },
    timestamp: new Date().toISOString(),
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
