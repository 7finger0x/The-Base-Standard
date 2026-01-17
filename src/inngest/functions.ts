import { Inngest } from 'inngest';
import { MetricsCollector } from '@/lib/scoring/metrics-collector';
import { PVCFramework } from '@/lib/scoring/pvc-framework';
import { prisma } from '@/lib/db';

// Create a client to send and receive events
// This is used by the serve() function in the API route
export const inngest = new Inngest({
  id: 'the-base-standard',
  signingKey: process.env.INNGEST_SIGNING_KEY,
});

// Hello World function example
export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '1s');
    return { message: `Hello ${event.data.email || 'World'}!` };
  }
);

// Calculate reputation score function
export const calculateReputationScore = inngest.createFunction(
  { id: 'calculate-reputation-score' },
  { event: 'reputation/calculate' },
  async ({ event, step }) => {
    const { walletAddress } = event.data;

    // Step 1: Fetch on-chain data using MetricsCollector
    const metrics = await step.run('fetch-onchain-data', async () => {
      try {
        return await MetricsCollector.collectMetrics(walletAddress);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        throw new Error(`Failed to fetch metrics for ${walletAddress}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Step 2: Calculate score using PVC Framework
    const scoreResult = await step.run('calculate-score', async () => {
      try {
        const result = PVCFramework.calculateScore(metrics);

        return {
          totalScore: result.totalScore,
          tier: result.tier,
          breakdown: result.breakdown,
        };
      } catch (error) {
        console.error('Error calculating score:', error);
        throw new Error(`Failed to calculate score: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Step 3: Update database with new score
    await step.run('update-database', async () => {
      try {
        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { address: walletAddress.toLowerCase() },
        });

        // Create or update user with new score
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              totalScore: scoreResult.totalScore,
              tier: scoreResult.tier,
              lastScoreUpdate: new Date(),
            },
          });

          // Log the score change
          await prisma.reputationLog.create({
            data: {
              userId: user.id,
              oldScore: user.totalScore || 0,
              newScore: scoreResult.totalScore,
              reason: 'Scheduled background calculation',
            },
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              address: walletAddress.toLowerCase(),
              totalScore: scoreResult.totalScore,
              tier: scoreResult.tier,
              lastScoreUpdate: new Date(),
            },
          });

          // Log initial score
          await prisma.reputationLog.create({
            data: {
              userId: user.id,
              oldScore: 0,
              newScore: scoreResult.totalScore,
              reason: 'Initial score calculation',
            },
          });
        }

        return { success: true, userId: user.id };
      } catch (error) {
        console.error('Error updating database:', error);
        throw new Error(`Failed to update database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    return {
      walletAddress,
      score: scoreResult,
      calculatedAt: new Date().toISOString(),
    };
  }
);
