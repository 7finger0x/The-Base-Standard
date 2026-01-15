/**
 * Identity Module
 * 
 * Unified Web3 identity aggregation system
 * Supports multi-wallet and social account linking
 */

export { IdentityService } from './identity-service';
export { 
  parseSIWEMessage,
  generateSIWEMessage,
  verifySIWESignature,
  validateSIWEMessage,
  type SIWEMessage,
} from './siwe';
