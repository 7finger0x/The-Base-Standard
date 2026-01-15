import { Inngest } from 'inngest';

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

// Example: Calculate reputation score function
export const calculateReputationScore = inngest.createFunction(
  { id: 'calculate-reputation-score' },
  { event: 'reputation/calculate' },
  async ({ event, step }) => {
    const { walletAddress } = event.data;

    // Step 1: Fetch on-chain data
    const onChainData = await step.run('fetch-onchain-data', async () => {
      // TODO: Implement actual data fetching logic
      return {
        baseTenure: 0,
        zoraMints: 0,
        earlyAdopter: false,
      };
    });

    // Step 2: Calculate score
    const score = await step.run('calculate-score', async () => {
      // TODO: Implement actual scoring logic
      return {
        totalScore: 0,
        breakdown: {},
      };
    });

    // Step 3: Update database
    await step.run('update-database', async () => {
      // TODO: Implement database update logic
      return { success: true };
    });

    return {
      walletAddress,
      score,
      calculatedAt: new Date().toISOString(),
    };
  }
);
