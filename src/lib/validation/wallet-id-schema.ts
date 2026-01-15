import 'server-only';

import { z } from 'zod';

/**
 * Wallet ID validation schema
 * Validates UUID format for wallet IDs
 */
export const walletIdSchema = z.string().uuid('Invalid wallet ID format');
