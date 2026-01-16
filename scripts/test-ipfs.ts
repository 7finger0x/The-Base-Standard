/**
 * Test IPFS Storage Integration
 * 
 * Run with: npx tsx scripts/test-ipfs.ts
 * 
 * Note: This script bypasses server-only restrictions for testing
 */

// Mock server-only for script execution
// Note: This script is not included in the build
// @ts-expect-error - NODE_ENV assignment for script execution only
process.env.NODE_ENV = 'test';

// Direct implementation for testing (bypasses server-only)
async function testIPFSStorage() {
  const pinataJwt = process.env.PINATA_JWT_TOKEN;
  
  if (!pinataJwt) {
    throw new Error('PINATA_JWT_TOKEN environment variable is required');
  }

  const testMetadata = {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    score: 850,
    tier: 'BASED',
    timestamp: Date.now(),
    linkedWallets: [],
    breakdown: {
      tenure: 300,
      economic: 400,
      social: 150,
    },
  };

  // Direct API call to Pinata (bypassing server-only module)
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${pinataJwt}`,
    },
    body: JSON.stringify({
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name: `reputation-${testMetadata.address}-${testMetadata.timestamp}`,
        keyvalues: {
          address: testMetadata.address,
          tier: testMetadata.tier,
          timestamp: testMetadata.timestamp.toString(),
        },
      },
      pinataContent: testMetadata,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to pin to IPFS: ${error}`);
  }

  const result = await response.json() as { IpfsHash: string };
  return result.IpfsHash;
}

function resolveIPFSUrl(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
    return `https://${gateway}/ipfs/${cid}`;
  }
  return uri;
}

async function test() {
  console.log('🧪 Testing IPFS Storage Integration...\n');

  try {
    const testMetadata = {
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      score: 850,
      tier: 'BASED',
      timestamp: Date.now(),
      linkedWallets: [],
      breakdown: {
        tenure: 300,
        economic: 400,
        social: 150,
      },
    };

    console.log('📤 Storing reputation metadata on IPFS...');
    const cid = await testIPFSStorage();
    
    console.log('✅ Successfully stored on IPFS!');
    console.log(`   CID: ${cid}`);
    console.log(`   IPFS URL: ipfs://${cid}`);
    
    const gatewayUrl = resolveIPFSUrl(`ipfs://${cid}`);
    console.log(`   Gateway URL: ${gatewayUrl}`);
    console.log('\n🔗 View metadata at:', gatewayUrl);
    
    // Test retrieval
    console.log('\n📥 Testing retrieval...');
    const response = await fetch(gatewayUrl);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Successfully retrieved from IPFS!');
      console.log('   Data:', JSON.stringify(data, null, 2));
    } else {
      console.log('⚠️  Could not retrieve (may take a moment to propagate)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    console.error('\n💡 Make sure you have set PINATA_JWT_TOKEN in .env.local');
    process.exit(1);
  }
}

test();
