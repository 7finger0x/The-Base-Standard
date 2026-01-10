import { NextResponse } from 'next/server';

const PONDER_URL = process.env.PONDER_URL || 'http://localhost:42069';

export async function GET(request: Request) {
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
      return NextResponse.json(data);
    }
  } catch (error) {
    console.log('Ponder not available, using mock data');
  }

  // Fallback mock leaderboard
  const mockLeaderboard = generateMockLeaderboard(limit, offset);
  return NextResponse.json(mockLeaderboard);
}

function generateMockLeaderboard(limit: number, offset: number) {
  const tiers = ['BASED', 'Gold', 'Silver', 'Bronze', 'Novice'];
  const leaderboard = [];

  for (let i = 0; i < limit; i++) {
    const rank = offset + i + 1;
    const score = Math.max(0, 1200 - rank * 10 + Math.floor(Math.random() * 50));
    const tier = score >= 1000 ? 'BASED' : score >= 850 ? 'Gold' : score >= 500 ? 'Silver' : score >= 100 ? 'Bronze' : 'Novice';
    
    leaderboard.push({
      rank,
      address: `0x${rank.toString(16).padStart(4, '0')}${'0'.repeat(36)}`,
      score,
      tier,
    });
  }

  return {
    leaderboard,
    pagination: {
      limit,
      offset,
      hasMore: offset + limit < 1000,
    },
  };
}
