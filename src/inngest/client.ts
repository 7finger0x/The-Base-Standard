// Inngest integration - disabled until inngest package is installed
// Uncomment when ready to use Inngest
// import { Inngest } from 'inngest';

/**
 * Inngest client for sending events
 * 
 * This is a placeholder until the inngest package is installed.
 * To enable:
 * 1. Install: npm install inngest
 * 2. Uncomment the import and implementation below
 * 3. Set INNGEST_SIGNING_KEY environment variable
 */

// Placeholder export
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const inngestClient = null as unknown as any;

// Uncomment when ready:
// export const inngestClient = new Inngest({
//   id: 'the-base-standard',
//   signingKey: process.env.INNGEST_SIGNING_KEY,
// });

/**
 * Send an event to Inngest
 */
export async function sendInngestEvent(event: { name: string; data: unknown }) {
  // Placeholder - no-op until inngest is installed
  console.warn('Inngest not configured. Event not sent:', event);
  return Promise.resolve();
  
  // Uncomment when ready:
  // return inngestClient.send(event);
}
