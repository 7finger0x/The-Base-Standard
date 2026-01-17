import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAX_REFERRALS = 10;
const POINTS_PER_REFERRAL = 10;

/**
 * GET /api/referral/stats
 * Returns referral statistics for a given address
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Generate a unique referral code from the address
    // Using last 8 characters of address for simplicity
    const referralCode = generateReferralCode(address);

    // TODO: Fetch actual referral data from database
    // For now, returning mock data
    const totalReferrals = 0; // Would come from database
    const pointsEarned = totalReferrals * POINTS_PER_REFERRAL;

    return NextResponse.json({
      referralCode,
      totalReferrals,
      pointsEarned,
      maxReferrals: MAX_REFERRALS,
      pointsPerReferral: POINTS_PER_REFERRAL,
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral stats' },
      { status: 500 }
    );
  }
}

/**
 * Generates a unique referral code from an Ethereum address
 */
function generateReferralCode(address: string): string {
  // Take last 8 characters and make uppercase
  return address.slice(-8).toUpperCase();
}
