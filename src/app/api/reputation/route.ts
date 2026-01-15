import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Errors, success, error } from '@/lib/api-utils';
import { isServiceConfigured, PONDER_URL } from '@/lib/env';
import { dbService } from '@/lib/database-service';
import { RequestLogger } from '@/lib/request-logger';
import { addCorsHeaders } from '@/lib/cors';
import { calculateReputationScore } from '@/lib/scoring';
import { reputationQuerySchema } from '@/lib/validation/schemas';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let statusCode = 200;
  let errorObj: Error | undefined;
  const { searchParams } = new URL(request.url);

  // Validate query parameters with Zod
  const validationResult = reputationQuerySchema.safeParse({
    address: searchParams.get('address'),
  });

  if (!validationResult.success) {
    statusCode = 400;
    RequestLogger.logSecurityEvent({
      type: 'invalid_input',
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      details: { validationErrors: validationResult.error.issues },
    });
    const response = NextResponse.json(
      error(Errors.WALLET_REQUIRED()),
      { status: 400 }
    );
    addCorsHeaders(response, request.headers.get('origin'));
    RequestLogger.logRequest(request, statusCode, Date.now() - startTime);
    return response;
  }

  const { address } = validationResult.data;

  try {
    // Check if Ponder service is configured and healthy
    if (isServiceConfigured('ponder')) {
      try {
        const ponderResponse = await fetch(`${PONDER_URL}/api/reputation/${address}`, {
          next: { revalidate: 5 }, // Cache for 5 seconds
        });

        if (ponderResponse.ok) {
          const data = await ponderResponse.json();
          const response = NextResponse.json(success(data));
          addCorsHeaders(response, request.headers.get('origin'));
          RequestLogger.logRequest(request, 200, Date.now() - startTime);
          return response;
        }
      } catch (error) {
        RequestLogger.logWarning('Ponder service unavailable', {
          address: address,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Try PVC framework calculation (if enabled)
    const usePVC = process.env.ENABLE_PVC_SCORING === 'true';
    
    if (usePVC) {
      try {
        const pvcScore = await calculateReputationScore(address);
        const rankData = await dbService.getUserRank(address);
        
        const response = NextResponse.json(success({
          address: address,
          totalScore: pvcScore.totalScore,
          tier: pvcScore.tier,
          rank: rankData?.rank,
          totalUsers: rankData?.totalUsers,
          multiplier: pvcScore.multiplier,
          breakdown: {
            tenure: pvcScore.breakdown.tenure,
            economic: pvcScore.breakdown.economic,
            social: pvcScore.breakdown.social,
          },
          pillars: pvcScore.pillars,
          decayInfo: pvcScore.decayInfo,
          linkedWallets: [],
          lastUpdated: new Date().toISOString(),
          scoringModel: 'PVC', // Indicate PVC framework used
        }));
        addCorsHeaders(response, request.headers.get('origin'));
        RequestLogger.logRequest(request, 200, Date.now() - startTime);
        return response;
      } catch (pvcError) {
        RequestLogger.logWarning('PVC scoring failed, falling back to legacy', {
          address: address,
          error: pvcError instanceof Error ? pvcError.message : 'Unknown error',
        });
        // Fall through to legacy scoring
      }
    }

    // Fallback to database lookup (legacy linear model)
    try {
      const user = await dbService.getUserByAddress(address);
      if (user) {
        const rankData = await dbService.getUserRank(address);
        
        const response = NextResponse.json(success({
          address: user.address,
          totalScore: user.score,
          tier: user.tier,
          rank: rankData?.rank,
          totalUsers: rankData?.totalUsers,
          lastUpdated: user.lastUpdated.toISOString(),
          scoringModel: 'legacy', // Indicate legacy model used
        }));
        addCorsHeaders(response, request.headers.get('origin'));
        RequestLogger.logRequest(request, 200, Date.now() - startTime);
        return response;
      }
    } catch (dbError) {
      RequestLogger.logWarning('Database lookup failed', {
        address: address.toLowerCase(),
        error: dbError instanceof Error ? dbError.message : 'Unknown error',
      });
    }

    // Final fallback to mock data
    const mockScore = generateMockScore(address);
    const response = NextResponse.json(success({
      ...mockScore,
      scoringModel: 'mock',
    }));
    addCorsHeaders(response, request.headers.get('origin'));
    RequestLogger.logRequest(request, 200, Date.now() - startTime);
    return response;

  } catch (err) {
    errorObj = err instanceof Error ? err : new Error('Unknown error');
    statusCode = 500;
    RequestLogger.logError('Reputation API error', err, {
      address: address || 'unknown',
      path: request.nextUrl.pathname,
    });
    const response = NextResponse.json(
      error(Errors.INTERNAL_SERVER_ERROR()),
      { status: 500 }
    );
    addCorsHeaders(response, request.headers.get('origin'));
    RequestLogger.logRequest(request, statusCode, Date.now() - startTime, errorObj);
    return response;
  }
}

function generateMockScore(address: string) {
  // Generate deterministic mock data based on address (PVC format)
  const hash = address.split('').reduce((a, b) => {
    return a + b.charCodeAt(0);
  }, 0);

  // Generate pillar scores (0-1000 scale)
  const capitalScore = (hash % 400);     // 0-399 (max 400)
  const diversityScore = (hash % 300);   // 0-299 (max 300)
  const identityScore = (hash % 300);    // 0-299 (max 300)
  
  // Calculate base score (before multiplier)
  const baseScore = capitalScore + diversityScore + identityScore;
  const multiplier = 1.0 + ((hash % 70) / 100); // 1.0-1.7
  const totalScore = Math.min(1000, Math.round(baseScore * multiplier));

  const tier = getTier(totalScore);

  // Generate decay info (mock)
  const daysSinceLastActivity = (hash % 60); // 0-59 days
  const willDecay = daysSinceLastActivity > 30;
  const decayMultiplier = willDecay ? Math.max(0.5, 1.0 - ((daysSinceLastActivity - 30) / 10) * 0.05) : 1.0;

  return {
    address,
    totalScore,
    tier,
    multiplier: Math.round(multiplier * 100) / 100,
    breakdown: {
      tenure: Math.round(baseScore * 0.4),      // Estimate
      economic: capitalScore,
      social: identityScore,
    },
    pillars: {
      capital: capitalScore,
      diversity: diversityScore,
      identity: identityScore,
    },
    decayInfo: {
      daysSinceLastActivity,
      decayMultiplier: Math.round(decayMultiplier * 100) / 100,
      willDecay,
    },
    linkedWallets: [],
    lastUpdated: new Date().toISOString(),
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
