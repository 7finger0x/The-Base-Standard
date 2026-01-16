// Inngest integration - disabled until inngest package is installed
// Uncomment and install inngest package when ready to use
// import { serve } from 'inngest/next';
// import { inngest, helloWorld, calculateReputationScore } from '@/inngest/functions';

// export const { GET, POST, PUT } = serve({
//   client: inngest,
//   functions: [
//     helloWorld,
//     calculateReputationScore,
//     // Add all your Inngest functions here
//   ],
// });

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Inngest integration disabled' }, { status: 503 });
}

export async function POST() {
  return NextResponse.json({ message: 'Inngest integration disabled' }, { status: 503 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Inngest integration disabled' }, { status: 503 });
}
