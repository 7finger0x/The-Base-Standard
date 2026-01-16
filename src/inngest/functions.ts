// Inngest integration - disabled until inngest package is installed
// Uncomment when ready to use Inngest
// import { Inngest } from 'inngest';

// Create a client to send and receive events
// This is used by the serve() function in the API route
// export const inngest = new Inngest({
//   id: 'the-base-standard',
//   signingKey: process.env.INNGEST_SIGNING_KEY,
// });

// Placeholder exports to prevent build errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const inngest = null as unknown as { createFunction: () => unknown };

// Hello World function example
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const helloWorld = null as unknown as any;

// Example: Calculate reputation score function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const calculateReputationScore = null as unknown as any;
