import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { Errors, success, error } from '@/lib/api-utils';
import { dbService } from '@/lib/database-service';
import { RequestLogger } from '@/lib/request-logger';
import { addCorsHeaders } from '@/lib/cors';
import { z } from 'zod';

const updateScoreSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address format'),
  score: z.number().min(0).max(1000), // Recalibrated to 0-1000 scale
  category: z.string().min(1),
  points: z.number(),
  multiplier: z.number().min(0).max(10).optional().default(1.0),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Require API key authentication
  const authResponse = requireApiKey(request);
  if (authResponse) {
    RequestLogger.logSecurityEvent({
      type: 'invalid_input',
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      details: { reason: 'missing_api_key' },
    });
    addCorsHeaders(authResponse as NextResponse, request.headers.get('origin'));
    RequestLogger.logRequest(request, 401, Date.now() - startTime);
    return authResponse;
  }

  try {
    const body = await request.json();
    const validated = updateScoreSchema.parse(body);

    // Update user score
    const user = await dbService.updateUserScore({
      address: validated.address.toLowerCase(),
      score: validated.score,
      tier: calculateTier(validated.score),
      category: validated.category,
      points: validated.points,
      multiplier: validated.multiplier,
      metadata: validated.metadata,
    });

    const response = NextResponse.json(success({
      address: user.address,
      score: user.score,
      tier: user.tier,
      lastUpdated: user.lastUpdated,
    }));

    addCorsHeaders(response, request.headers.get('origin'));
    RequestLogger.logRequest(request, 200, Date.now() - startTime);
    return response;

  } catch (err) {
    if (err instanceof z.ZodError) {
      const response = NextResponse.json(
        error(Errors.VALIDATION_ERROR(err.issues)),
        { status: 422 }
      );
      addCorsHeaders(response, request.headers.get('origin'));
      RequestLogger.logRequest(request, 422, Date.now() - startTime);
      return response;
    }

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

function calculateTier(score: number): string {
  // Recalibrated tier thresholds (0-1000 scale)
  if (score >= 951) return 'LEGEND';      // Top 1%
  if (score >= 851) return 'BASED';       // Top 5% (95th-99th)
  if (score >= 651) return 'BUILDER';     // 75th-95th
  if (score >= 351) return 'RESIDENT';    // 40th-75th
  return 'TOURIST';                       // Bottom 40% (0-350)
}
