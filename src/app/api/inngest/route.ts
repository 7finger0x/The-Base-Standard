import { serve } from 'inngest/next';
import { inngest, helloWorld, calculateReputationScore } from '@/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    calculateReputationScore,
    // Add all your Inngest functions here
  ],
});
