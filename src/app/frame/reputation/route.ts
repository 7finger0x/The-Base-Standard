/**
 * Farcaster Frame API Route for Reputation Display
 * 
 * Generates dynamic images showing user reputation scores
 * that can be displayed in Farcaster feeds.
 */

import { NextRequest, NextResponse } from 'next/server';
import satori from 'satori';
import { calculateReputationScore } from '@/lib/scoring';
import { getTierFromScore } from '@/lib/utils';
import React from 'react';

function getTierColor(tier: string): string {
  switch (tier) {
    case 'LEGEND':
      return '#FFD700'; // Gold
    case 'BASED':
      return '#00FFFF'; // Cyan
    case 'BUILDER':
      return '#FF6B6B'; // Red
    case 'RESIDENT':
      return '#4ECDC4'; // Teal
    case 'TOURIST':
      return '#95A5A6'; // Gray
    default:
      return '#FFFFFF';
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return new NextResponse('Address parameter required', { status: 400 });
    }

    // Fetch reputation data
    let reputation;
    try {
      reputation = await calculateReputationScore(address);
    } catch (error) {
      // Fallback to mock data if calculation fails
      reputation = {
        totalScore: 0,
        tier: 'TOURIST',
        multiplier: 1.0,
        breakdown: {
          tenure: 0,
          economic: 0,
          social: 0,
        },
      };
    }

    const tier = reputation.tier || getTierFromScore(reputation.totalScore);
    const color = getTierColor(tier);

    // Generate SVG using Satori with React elements
    const svg = await satori(
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#1a1a1a',
            padding: '40px',
            fontFamily: 'Inter, sans-serif',
          },
        },
        React.createElement(
          'div',
          {
            style: {
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#fff',
              marginBottom: '20px',
            },
          },
          'The Base Standard'
        ),
        React.createElement(
          'div',
          {
            style: {
              fontSize: '72px',
              fontWeight: 'bold',
              color: color,
              marginBottom: '10px',
            },
          },
          tier
        ),
        React.createElement(
          'div',
          {
            style: {
              fontSize: '36px',
              color: '#888',
              marginBottom: '30px',
            },
          },
          `Score: ${reputation.totalScore.toLocaleString()}`
        ),
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              gap: '20px',
              fontSize: '24px',
              color: '#aaa',
            },
          },
          React.createElement('div', null, `Tenure: ${reputation.breakdown.tenure}`),
          React.createElement('div', null, `Economic: ${reputation.breakdown.economic}`),
          React.createElement('div', null, `Social: ${reputation.breakdown.social}`)
        )
      ),
      {
        width: 1200,
        height: 630,
        fonts: [],
      }
    );

    // Convert SVG to PNG (you'll need to install @resvg/resvg-js or similar)
    // For now, return SVG
    // Use cache tags for revalidation when scores update
    const response = new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
        // Cache tag for revalidation
        'Cache-Tag': `reputation-${address.toLowerCase()}`,
      },
    });
    
    return response;
  } catch (error) {
    console.error('Frame generation error:', error);
    return new NextResponse('Error generating frame', { status: 500 });
  }
}
