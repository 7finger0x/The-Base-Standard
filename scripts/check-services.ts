/**
 * Check Service Configuration Status
 * 
 * Run with: npx tsx scripts/check-services.ts
 */

import { isServiceConfigured } from '../src/lib/env';

console.log('🔍 Checking Service Configuration...\n');

const services = [
  { name: 'IPFS (Pinata)', key: 'ipfs' as const },
  { name: 'Chainlink', key: 'chainlink' as const },
  { name: 'Ponder Indexer', key: 'ponder' as const },
  { name: 'CDP AgentKit', key: 'cdp' as const },
  { name: 'Farcaster', key: 'farcaster' as const },
];

let configuredCount = 0;

services.forEach(({ name, key }) => {
  const configured = isServiceConfigured(key);
  const status = configured ? '✅' : '❌';
  console.log(`${status} ${name}: ${configured ? 'Configured' : 'Not Configured'}`);
  if (configured) configuredCount++;
});

console.log(`\n📊 Summary: ${configuredCount}/${services.length} services configured\n`);

if (configuredCount === 0) {
  console.log('💡 Tip: See docs/ENV_VARIABLES_AGENT.md for setup instructions');
}
