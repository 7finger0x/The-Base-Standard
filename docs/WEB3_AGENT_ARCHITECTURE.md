# Web3 AI Agent Architecture for The Base Standard

**Project:** The Base Standard  
**Purpose:** On-chain reputation scoring & identity aggregation for Base L2  
**Document Type:** Technical Architecture Reference

---

## Overview

This document outlines how Web3 AI Agent architecture patterns can be integrated into The Base Standard reputation system. It provides a blueprint for building autonomous, decentralized features that enhance the reputation protocol.

---

## 1. Storage Architecture: Agent Memory for Reputation Data

### 1.1 Tier 1: Hot Memory (IPFS & Pinning)

**Use Case:** Storing dynamic reputation metadata, user avatars, and real-time score visualizations.

**Implementation for The Base Standard:**

```typescript
// src/lib/storage/ipfs.ts
import { PinataSDK } from '@pinata/sdk';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT_TOKEN,
  pinataGateway: process.env.PINATA_GATEWAY_URL,
});

/**
 * Store reputation metadata on IPFS
 * Used for: User profiles, score history snapshots, achievement badges
 */
export async function storeReputationMetadata(
  metadata: {
    address: string;
    score: number;
    tier: string;
    timestamp: number;
    linkedWallets: string[];
  }
): Promise<string> {
  const options = {
    pinataMetadata: {
      name: `reputation-${metadata.address}-${metadata.timestamp}`,
    },
    pinataOptions: {
      cidVersion: 1,
    },
  };

  const result = await pinata.upload.public.json(metadata, options);
  return result.IpfsHash; // Returns CID like: ipfs://bafy...
}

/**
 * Store dynamic NFT image for reputation tier
 * Used for: Generating on-demand reputation NFTs
 */
export async function storeReputationImage(
  imageBuffer: Buffer,
  address: string
): Promise<string> {
  const options = {
    pinataMetadata: {
      name: `reputation-nft-${address}`,
    },
  };

  const result = await pinata.upload.public.file(imageBuffer, options);
  return result.IpfsHash;
}
```

**Gateway Resolution:**

```typescript
// src/lib/storage/gateway.ts
/**
 * Resolves IPFS URI to HTTP gateway URL
 * Bridge between decentralized storage and browser
 */
export function resolveIPFSUrl(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    // Use dedicated Pinata gateway for performance
    return `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${cid}`;
  }
  if (uri.startsWith('ar://')) {
    const txId = uri.replace('ar://', '');
    return `https://arweave.net/${txId}`;
  }
  return uri; // Already HTTP URL
}
```

**Integration Points:**
- Store user profile metadata (Farcaster handles, ENS names, linked wallets)
- Cache reputation score snapshots for historical tracking
- Store achievement badge images and metadata

---

### 1.2 Tier 2: Deep Storage (Arweave)

**Use Case:** Immutable reputation history, audit logs, and governance records.

**Implementation:**

```typescript
// src/lib/storage/arweave.ts
import Arweave from 'arweave';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

/**
 * Store immutable reputation audit log
 * One-time payment, guaranteed 200+ year storage
 */
export async function storeReputationAuditLog(
  log: {
    address: string;
    oldScore: number;
    newScore: number;
    reason: string;
    timestamp: number;
    transactionHash: string;
  }
): Promise<string> {
  const wallet = JSON.parse(process.env.ARWEAVE_WALLET!);
  const transaction = await arweave.createTransaction(
    {
      data: JSON.stringify(log),
    },
    wallet
  );

  transaction.addTag('App-Name', 'BaseStandard');
  transaction.addTag('Type', 'ReputationAudit');
  transaction.addTag('Address', log.address);

  await arweave.transactions.sign(transaction, wallet);
  await arweave.transactions.post(transaction);

  return transaction.id; // Returns: ar://txId
}
```

**Use Cases for The Base Standard:**
- Store complete reputation calculation history (immutable)
- Archive governance decisions about tier thresholds
- Store historical leaderboard snapshots

---

## 2. Perception & Action: Chainlink Integration

### 2.1 Data Feeds: Real-Time Reputation Metrics

**Use Case:** On-chain reputation scores need to react to external events (e.g., "Did user mint on Zora in last 24h?").

**Implementation:**

```solidity
// foundry/src/ReputationRegistry.sol (enhancement)
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract ReputationRegistry {
    // Chainlink Data Feed for Base/USD (for economic activity scoring)
    AggregatorV3Interface internal baseUsdFeed;
    
    // Chainlink Functions for custom data queries
    address public chainlinkFunctionsRouter;
    
    /**
     * Check if user has recent Zora activity (via Chainlink Functions)
     * This enables the agent to "perceive" off-chain events
     */
    function checkZoraActivity(address user) external returns (bool) {
        // Chainlink Functions would query Zora API
        // Returns true if user minted in last 24h
    }
}
```

**TypeScript Integration:**

```typescript
// src/lib/chainlink/data-feeds.ts
import { Contract } from 'viem';
import { base } from 'viem/chains';

/**
 * Read Chainlink Data Feed for Base/USD price
 * Used for: Economic activity scoring (higher value = more reputation)
 */
export async function getBasePrice(): Promise<number> {
  const feedAddress = '0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1'; // Base/USD on Base
  const feedAbi = [
    {
      inputs: [],
      name: 'latestRoundData',
      outputs: [
        { name: 'roundId', type: 'uint80' },
        { name: 'answer', type: 'int256' },
        { name: 'startedAt', type: 'uint256' },
        { name: 'updatedAt', type: 'uint256' },
        { name: 'answeredInRound', type: 'uint80' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  const data = await publicClient.readContract({
    address: feedAddress,
    abi: feedAbi,
    functionName: 'latestRoundData',
  });

  return Number(data[1]) / 1e8; // Chainlink uses 8 decimals
}
```

---

### 2.2 Chainlink Automation: Autonomous Score Updates

**Use Case:** Agent automatically updates reputation scores when conditions are met.

**Implementation:**

```solidity
// foundry/src/ReputationRegistry.sol (enhancement)
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

contract ReputationRegistry is AutomationCompatibleInterface {
    /**
     * Off-chain check: Should we update scores?
     * Runs every block, but only pays gas if action needed
     */
    function checkUpkeep(bytes calldata) 
        external 
        view 
        override 
        returns (bool upkeepNeeded, bytes memory performData) 
    {
        // Check if there are pending score updates
        address[] memory pendingUpdates = getPendingScoreUpdates();
        
        if (pendingUpdates.length > 0) {
            upkeepNeeded = true;
            performData = abi.encode(pendingUpdates);
        }
    }
    
    /**
     * On-chain action: Batch update scores
     * Only called when checkUpkeep returns true
     */
    function performUpkeep(bytes calldata performData) external override {
        address[] memory addresses = abi.decode(performData, (address[]));
        // Batch update scores (gas efficient)
        batchUpdateScores(addresses);
    }
}
```

**Benefits for The Base Standard:**
- Automatic score recalculation when new on-chain events occur
- Gas-efficient batch updates (only pays when needed)
- Decentralized execution (no single point of failure)

---

## 3. Generative Capabilities: On-Chain Reputation NFTs

### 3.1 Fully On-Chain SVG Reputation Badge

**Use Case:** Generate reputation tier badges directly in Solidity (no external dependencies).

**Implementation:**

```solidity
// foundry/src/ReputationBadge.sol
contract ReputationBadge {
    /**
     * Generate SVG badge based on reputation tier
     * Fully on-chain, no IPFS required
     */
    function generateBadgeSVG(address user) public view returns (string memory) {
        uint256 score = reputationRegistry.getScore(user);
        string memory tier = reputationRegistry.getTier(score);
        
        // Generate color based on tier
        string memory color = getTierColor(tier);
        string memory tierName = tier;
        
        // Construct SVG
        string memory svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
            '<rect width="400" height="400" fill="', color, '"/>',
            '<text x="200" y="150" font-family="Arial" font-size="48" fill="white" text-anchor="middle">',
            tierName,
            '</text>',
            '<text x="200" y="250" font-family="Arial" font-size="32" fill="white" text-anchor="middle">',
            toString(score),
            '</text>',
            '</svg>'
        ));
        
        return svg;
    }
    
    /**
     * Generate Base64-encoded data URI for NFT metadata
     */
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        address owner = ownerOf(tokenId);
        string memory svg = generateBadgeSVG(owner);
        
        // Encode SVG to Base64
        string memory base64Svg = Base64.encode(bytes(svg));
        
        // Construct metadata JSON
        string memory json = string(abi.encodePacked(
            '{"name":"Reputation Badge #',
            toString(tokenId),
            '","description":"On-chain reputation badge for The Base Standard","image":"data:image/svg+xml;base64,',
            base64Svg,
            '"}'
        ));
        
        return string(abi.encodePacked(
            'data:application/json;base64,',
            Base64.encode(bytes(json))
        ));
    }
    
    function getTierColor(string memory tier) internal pure returns (string memory) {
        if (keccak256(bytes(tier)) == keccak256(bytes("LEGEND"))) return "#FFD700";
        if (keccak256(bytes(tier)) == keccak256(bytes("BASED"))) return "#00FFFF";
        if (keccak256(bytes(tier)) == keccak256(bytes("BUILDER"))) return "#FF6B6B";
        if (keccak256(bytes(tier)) == keccak256(bytes("RESIDENT"))) return "#4ECDC4";
        return "#95A5A6"; // TOURIST
    }
}
```

**Frontend Integration:**

```typescript
// src/components/ReputationBadge.tsx
'use client';

import { useReadContract } from 'wagmi';
import { reputationBadgeAbi } from '@/abi/ReputationBadge.json';

export function ReputationBadge({ address }: { address: string }) {
  const { data: svgDataUri } = useReadContract({
    address: REPUTATION_BADGE_ADDRESS,
    abi: reputationBadgeAbi,
    functionName: 'tokenURI',
    args: [tokenId],
  });

  // SVG is embedded in metadata, no external fetch needed
  return <img src={extractImageFromMetadata(svgDataUri)} alt="Reputation Badge" />;
}
```

---

### 3.2 Generative Pipeline: p5.js Reputation Visualization

**Use Case:** Complex, interactive reputation visualizations stored on IPFS.

**Implementation:**

```typescript
// src/lib/generative/reputation-art.ts
/**
 * Generate p5.js script for reputation visualization
 * Stores script on IPFS, seed on-chain
 */
export async function generateReputationArt(
  address: string,
  score: number,
  tier: string
): Promise<{ scriptCid: string; seed: string }> {
  // Generate verifiable random seed using Chainlink VRF
  const seed = await generateVRFSeed(address);
  
  // Create p5.js script that uses score/tier as parameters
  const p5Script = `
    let score = ${score};
    let tier = "${tier}";
    let seed = ${seed};
    
    function setup() {
      createCanvas(800, 800);
      randomSeed(seed);
    }
    
    function draw() {
      background(20);
      // Generate art based on reputation score
      for (let i = 0; i < score / 10; i++) {
        fill(random(100, 255), random(100, 255), random(100, 255));
        ellipse(random(width), random(height), score / 5, score / 5);
      }
    }
  `;
  
  // Store script on IPFS
  const scriptCid = await storeReputationMetadata({
    type: 'p5-script',
    script: p5Script,
    address,
  });
  
  return { scriptCid, seed };
}
```

**On-Chain Storage:**

```solidity
// Store seed on-chain, script reference on IPFS
mapping(address => uint256) public reputationSeeds;
mapping(address => string) public reputationScriptCids;

function mintReputationNFT(address user) external {
    uint256 seed = generateVRFSeed(user);
    string memory scriptCid = getScriptCid(user);
    
    reputationSeeds[user] = seed;
    reputationScriptCids[user] = scriptCid;
    
    _mint(user, tokenId);
}
```

---

## 4. Interaction Layers: Farcaster Frames

### 4.1 Reputation Frame for The Base Standard

**Use Case:** Users can check their reputation directly in Farcaster feed.

**Implementation:**

```typescript
// src/app/frame/reputation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import satori from 'satori';
import { calculateReputationScore } from '@/lib/scoring';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address') || '0x...';
  
  // Fetch reputation data
  const reputation = await calculateReputationScore(address);
  
  // Generate dynamic image using Satori
  const svg = await satori(
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: '#1a1a1a',
      padding: '40px',
    }}>
      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: '20px',
      }}>
        The Base Standard
      </div>
      <div style={{
        fontSize: '72px',
        fontWeight: 'bold',
        color: getTierColor(reputation.tier),
        marginBottom: '10px',
      }}>
        {reputation.tier}
      </div>
      <div style={{
        fontSize: '36px',
        color: '#888',
      }}>
        Score: {reputation.totalScore}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [],
    }
  );
  
  // Convert SVG to PNG
  const png = await convertSVGToPNG(svg);
  
  return new NextResponse(png, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
```

**Frame Meta Tags:**

```typescript
// src/app/frame/reputation/page.tsx
export default function ReputationFrame() {
  return (
    <>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={`${BASE_URL}/api/frame/reputation?address=${address}`} />
        <meta property="fc:frame:button:1" content="Check My Reputation" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content={`${BASE_URL}/my-reputation`} />
        <meta property="fc:frame:button:2" content="Mint Badge NFT" />
        <meta property="fc:frame:button:2:action" content="tx" />
        <meta property="fc:frame:button:2:target" content={`${BASE_URL}/api/mint-badge?address=${address}`} />
      </head>
      <body>
        <h1>Your Reputation</h1>
      </body>
    </>
  );
}
```

---

## 5. Verification: zkML for Reputation Scoring

### 5.1 Zero-Knowledge Proof for Score Calculation

**Use Case:** Prove that reputation score was calculated correctly without revealing the algorithm.

**Implementation Concept:**

```typescript
// src/lib/zkml/reputation-proof.ts
/**
 * Generate ZK proof that score calculation is correct
 * Used for: Transparent, verifiable reputation without revealing weights
 */
export async function generateReputationProof(
  inputs: {
    baseTenure: number;
    zoraMints: number;
    timeliness: number;
    // ... other metrics
  },
  output: {
    totalScore: number;
    tier: string;
  }
): Promise<{
  proof: string;
  publicInputs: string[];
}> {
  // This would use a zkML framework like:
  // - EZKL (for PyTorch models)
  // - Risc Zero (for general computation)
  // - Giza (for ML model verification)
  
  // The proof certifies:
  // "I ran the reputation model on these inputs and got this output"
  // Without revealing the model weights or intermediate calculations
  
  return {
    proof: '0x...', // ZK proof
    publicInputs: [
      inputs.baseTenure.toString(),
      inputs.zoraMints.toString(),
      output.totalScore.toString(),
    ],
  };
}
```

**On-Chain Verification:**

```solidity
// foundry/src/ReputationVerifier.sol
contract ReputationVerifier {
    // ZK verifier contract (generated by zkML framework)
    IVerifier public verifier;
    
    /**
     * Verify reputation score without revealing calculation
     */
    function verifyReputationScore(
        uint256[] memory publicInputs,
        bytes memory proof
    ) external view returns (bool) {
        return verifier.verify(publicInputs, proof);
    }
}
```

**Benefits for The Base Standard:**
- Transparent scoring without revealing proprietary algorithms
- Users can verify their scores are calculated correctly
- Prevents manipulation while maintaining privacy

---

## 6. Integration Roadmap for The Base Standard

### Phase 1: Storage (Q1 2026)
- [ ] Integrate Pinata IPFS for reputation metadata
- [ ] Implement gateway resolver for IPFS URLs
- [ ] Store user profile data on IPFS

### Phase 2: Automation (Q2 2026)
- [ ] Integrate Chainlink Automation for score updates
- [ ] Set up Chainlink Data Feeds for economic activity
- [ ] Implement batch score update automation

### Phase 3: Generative (Q3 2026)
- [ ] Deploy on-chain SVG reputation badges
- [ ] Create p5.js generative art pipeline
- [ ] Mint reputation NFTs for users

### Phase 4: Interaction (Q4 2026)
- [ ] Build Farcaster Frame for reputation checking
- [ ] Integrate Frame transaction buttons
- [ ] Deploy Frame to Farcaster

### Phase 5: Verification (2027)
- [ ] Research zkML frameworks for reputation scoring
- [ ] Implement ZK proof generation
- [ ] Deploy on-chain verifier

---

## 7. Cost Analysis

### Storage Costs

| Service | Use Case | Cost Model | Estimated Monthly |
|---------|----------|------------|-------------------|
| Pinata IPFS | Hot memory (metadata) | $20/month (100GB) | $20 |
| Arweave | Deep storage (audit logs) | $5-8 per GB (one-time) | $50 (one-time) |
| Filecoin | Cold storage (archives) | $0.01 per GB/month | $10 |

### Automation Costs

| Service | Use Case | Cost Model | Estimated Monthly |
|---------|----------|------------|-------------------|
| Chainlink Automation | Score updates | ~$0.10 per upkeep | $30 (300 updates) |
| Chainlink Functions | Custom queries | $0.001 per request | $10 (10k requests) |
| Chainlink Data Feeds | Price data | Free (on-chain) | $0 |

### Total Estimated Monthly Cost: ~$70/month

---

## 8. Security Considerations

1. **IPFS Pinning:** Ensure Pinata API keys are stored securely (server-side only)
2. **Chainlink Automation:** Implement access controls for `performUpkeep`
3. **zkML Verification:** Use audited verifier contracts
4. **Farcaster Frames:** Validate all user inputs, prevent XSS
5. **Arweave Storage:** Verify transaction signatures before storing

---

## 9. Conclusion

The Web3 AI Agent architecture provides a comprehensive framework for building autonomous, decentralized features into The Base Standard. By integrating:

- **IPFS/Arweave** for decentralized storage
- **Chainlink** for perception and action
- **On-chain SVG** for generative capabilities
- **Farcaster Frames** for social interaction
- **zkML** for verifiable scoring

The Base Standard can evolve from a reputation system into a fully autonomous, trustless protocol that operates independently while maintaining transparency and security.

---

**Last Updated:** January 2026  
**Status:** Architecture Reference (Implementation Pending)
