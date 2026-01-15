import 'server-only';

import { z } from 'zod';

/**
 * Shared Zod validation schemas for API routes
 * 
 * These schemas ensure consistent validation across all endpoints
 * and comply with project rules requiring Zod for runtime validation.
 */

/**
 * Ethereum address validation schema
 * Validates 0x-prefixed 40-character hexadecimal addresses
 */
export const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
  .transform((val) => val.toLowerCase() as `0x${string}`);

/**
 * Optional Ethereum address validation schema
 */
export const optionalAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
  .transform((val) => val.toLowerCase() as `0x${string}`)
  .optional();

/**
 * Pagination parameters schema
 */
export const paginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .default('100')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(1000)),
  offset: z
    .string()
    .optional()
    .default('0')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0)),
});

/**
 * Query parameters for reputation endpoint
 */
export const reputationQuerySchema = z.object({
  address: addressSchema,
});

/**
 * Query parameters for leaderboard endpoint
 */
export const leaderboardQuerySchema = paginationSchema;

/**
 * Query parameters for identity/me endpoint
 */
export const identityMeQuerySchema = z.object({
  address: optionalAddressSchema,
});

/**
 * Query parameters for identity/nonce endpoint
 */
export const identityNonceQuerySchema = z.object({
  address: optionalAddressSchema,
});

/**
 * Chain type enum schema
 */
export const chainTypeSchema = z.enum(['EVM', 'SOLANA', 'BITCOIN', 'COSMOS', 'FLOW']);

/**
 * SIWE signature schema
 */
export const siweSignatureSchema = z.object({
  address: addressSchema,
  chainType: chainTypeSchema.default('EVM'),
  siweMessage: z.string().min(1, 'SIWE message is required'),
  signature: z
    .string()
    .regex(/^0x[a-fA-F0-9]{130}$/, 'Invalid signature format'),
  nonce: z.string().min(1, 'Nonce is required'),
});
