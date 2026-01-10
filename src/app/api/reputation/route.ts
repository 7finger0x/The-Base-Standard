import { NextResponse } from 'next/server';

const PONDER_URL = process.env.PONDER_URL || 'http://localhost:42069';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  try {
    // Try to fetch from Ponder indexer
    const ponderResponse = await fetch(`${PONDER_URL}/api/reputation/${address}`, {
      next: { revalidate: 5 }, // Cache for 5 seconds
    });

    if (ponderResponse.ok) {
      const data = await ponderResponse.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.log('Ponder not available, using mock data');
  }

  // Fallback to mock data if Ponder is not running
  const mockScore = generateMockScore(address);
  return NextResponse.json(mockScore);
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
