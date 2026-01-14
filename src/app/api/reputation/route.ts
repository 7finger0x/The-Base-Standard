import { NextResponse } from 'next/server';
import { Errors, success, error } from '@/lib/api-utils';
import { isServiceConfigured, PONDER_URL } from '@/lib/env';
import { dbService } from '@/lib/database-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  // Validate address parameter
  if (!address) {
    return NextResponse.json(
      error(Errors.WALLET_REQUIRED()),
      { status: 400 }
    );
  }

  // Validate wallet address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      error(Errors.WALLET_INVALID()),
      { status: 400 }
    );
  }

  try {
    // Check if Ponder service is configured and healthy
    if (isServiceConfigured('ponder')) {
      try {
        const ponderResponse = await fetch(`${PONDER_URL}/api/reputation/${address.toLowerCase()}`, {
          next: { revalidate: 5 }, // Cache for 5 seconds
        });

        if (ponderResponse.ok) {
          const data = await ponderResponse.json();
          return NextResponse.json(success(data));
        }
      } catch (error) {
        console.warn('Ponder service unavailable:', error);
      }
    }

    // Fallback to database lookup
    try {
      const user = await dbService.getUserByAddress(address);
      if (user) {
        const rankData = await dbService.getUserRank(address);
        
        return NextResponse.json(success({
          address: user.address,
          totalScore: user.score,
          tier: user.tier,
          rank: rankData?.rank,
          totalUsers: rankData?.totalUsers,
          lastUpdated: user.lastUpdated.toISOString(),
        }));
      }
    } catch (dbError) {
      console.warn('Database lookup failed:', dbError);
    }

    // Final fallback to mock data
    const mockScore = generateMockScore(address);
    return NextResponse.json(success(mockScore));

  } catch (err) {
    console.error('Reputation API error:', err);
    return NextResponse.json(
      error(Errors.INTERNAL_SERVER_ERROR()),
      { status: 500 }
    );
  }
}

function generateMockScore(address: string) {
  // Generate deterministic mock data based on address
  const hash = address.toLowerCase().split('').reduce((a, b) => {
    return a + b.charCodeAt(0);
  }, 0);

  const baseScore = (hash % 400) + 100; // 100-499
  const zoraScore = (hash % 300) + 50;   // 50-349
  const timelyScore = (hash % 200) + 50; // 50-249 (avoid 0 for balanced scores)
  const totalScore = baseScore + zoraScore + timelyScore;

  const tier = getTier(totalScore);

  // Generate mock first tx date (between 100-500 days ago)
  const daysAgo = (hash % 400) + 100;
  const firstTxDate = new Date();
  firstTxDate.setDate(firstTxDate.getDate() - daysAgo);

  return {
    address,
    totalScore,
    tier,
    breakdown: {
      baseTenure: {
        score: baseScore,
        days: daysAgo,
        firstTx: firstTxDate.toISOString().split('T')[0],
      },
      zoraMints: {
        score: zoraScore,
        count: Math.floor(zoraScore / 10),
        earlyMints: Math.floor(zoraScore / 25),
      },
      timeliness: {
        score: timelyScore,
        earlyAdopterCount: Math.floor(timelyScore / 100),
      },
    },
    linkedWallets: [],
    lastUpdated: new Date().toISOString(),
  };
}

function getTier(score: number): string {
  if (score >= 1000) return 'BASED';
  if (score >= 850) return 'Gold';
  if (score >= 500) return 'Silver';
  if (score >= 100) return 'Bronze';
  return 'Novice';
}
