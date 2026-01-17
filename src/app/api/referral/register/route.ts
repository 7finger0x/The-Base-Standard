import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAX_REFERRALS = 10;
const POINTS_PER_REFERRAL = 10;

/**
 * POST /api/referral/register
 * Registers a new referral when someone uses a referral code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, newUserAddress } = body;

    if (!referralCode || !newUserAddress) {
      return NextResponse.json(
        { error: 'Referral code and new user address are required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual database logic:
    // 1. Find the referrer by their referral code
    // 2. Check if they haven't exceeded MAX_REFERRALS
    // 3. Check if newUserAddress hasn't been referred before
    // 4. Create referral record
    // 5. Award POINTS_PER_REFERRAL to referrer

    // For now, returning success response
    return NextResponse.json({
      success: true,
      message: `Referral registered! Referrer will receive ${POINTS_PER_REFERRAL} points.`,
      pointsAwarded: POINTS_PER_REFERRAL,
    });
  } catch (error) {
    console.error('Error registering referral:', error);
    return NextResponse.json(
      { error: 'Failed to register referral' },
      { status: 500 }
    );
  }
}
