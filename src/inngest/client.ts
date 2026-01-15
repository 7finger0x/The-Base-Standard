import { Inngest } from 'inngest';

/**
 * Inngest client for sending events
 * 
 * This client is used to send events that trigger Inngest functions.
 * Use this in your API routes, server actions, or server components.
 * 
 * @example
 * ```ts
 * import { inngestClient } from '@/inngest/client';
 * 
 * await inngestClient.send({
 *   name: 'reputation/calculate',
 *   data: { walletAddress: '0x...' }
 * });
 * ```
 */
export const inngestClient = new Inngest({
  id: 'the-base-standard',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
