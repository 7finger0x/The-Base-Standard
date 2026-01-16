/**
 * Verify Agent Features Setup
 * 
 * Run this after setting up environment variables to verify everything works.
 * 
 * Usage: npx tsx scripts/verify-agent-setup.ts
 */

import { isServiceConfigured } from '../src/lib/env';
import { resolveIPFSUrl } from '../src/lib/storage/gateway';

console.log('🔍 Verifying Agent Features Setup...\n');

// Check environment variables
console.log('📋 Environment Variables:');
const hasPinataToken = !!process.env.PINATA_JWT_TOKEN;
const hasBaseUrl = !!process.env.NEXT_PUBLIC_BASE_URL;
const hasGateway = !!process.env.NEXT_PUBLIC_PINATA_GATEWAY;

console.log(`   PINATA_JWT_TOKEN: ${hasPinataToken ? '✅ Set' : '❌ Missing'}`);
console.log(`   NEXT_PUBLIC_BASE_URL: ${hasBaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`   NEXT_PUBLIC_PINATA_GATEWAY: ${hasGateway ? '✅ Set' : '⚠️  Using default'}\n`);

// Check service configuration
console.log('🔧 Service Configuration:');
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
  console.log(`   ${status} ${name}`);
  if (configured) configuredCount++;
});

console.log(`\n📊 Summary: ${configuredCount}/${services.length} services configured\n`);

// Test gateway resolution
console.log('🌐 Gateway Resolution Test:');
try {
  const testCid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
  const ipfsUrl = `ipfs://${testCid}`;
  const gatewayUrl = resolveIPFSUrl(ipfsUrl);
  console.log(`   ✅ IPFS URL resolution works`);
  console.log(`   Example: ${ipfsUrl} → ${gatewayUrl}`);
} catch (error) {
  console.log(`   ❌ Gateway resolution failed: ${error}`);
}

// Final status
console.log('\n' + '='.repeat(50));
if (hasPinataToken && hasBaseUrl) {
  console.log('✅ Setup Complete! Ready to use agent features.');
  console.log('\n📝 Next Steps:');
  console.log('   1. Test IPFS: npx tsx scripts/test-ipfs.ts');
  console.log('   2. Start dev server: npm run dev');
  console.log('   3. Visit Frame: http://localhost:3000/frame/reputation?address=0x...');
} else {
  console.log('⚠️  Setup Incomplete');
  console.log('\n📝 Required Actions:');
  if (!hasPinataToken) {
    console.log('   - Add PINATA_JWT_TOKEN to .env.local');
    console.log('     Get token from: https://pinata.cloud/developers/api-keys');
  }
  if (!hasBaseUrl) {
    console.log('   - Add NEXT_PUBLIC_BASE_URL to .env.local');
    console.log('     Example: NEXT_PUBLIC_BASE_URL=http://localhost:3000');
  }
  console.log('\n💡 See docs/QUICK_START_AGENT.md for detailed instructions');
}
console.log('='.repeat(50) + '\n');
