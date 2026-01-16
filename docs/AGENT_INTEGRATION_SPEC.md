# Agent Integration Technical Specification
## The Base Standard - Web3 AI Agent Architecture

**Version:** 1.0.0  
**Date:** January 2026  
**Status:** Implementation Ready

---

## Executive Summary

This specification outlines the integration of Web3 AI Agent capabilities into The Base Standard reputation system. It provides detailed technical requirements, implementation patterns, and integration points for:

1. **IPFS Storage** - Decentralized metadata storage
2. **Chainlink Integration** - Autonomous score updates
3. **Farcaster Frames** - Social interaction layer
4. **On-Chain NFTs** - Generative reputation badges

---

## 1. IPFS Storage Integration

### 1.1 Architecture Overview

```
User Action → API Route → IPFS Storage → Pinata Pinning → CID Returned → Database Update
```

### 1.2 Implementation Files

- `src/lib/storage/ipfs.ts` - Core IPFS functions
- `src/lib/storage/gateway.ts` - URL resolution utilities
- `src/app/api/storage/ipfs/route.ts` - API endpoints

### 1.3 Environment Variables

```bash
PINATA_JWT_TOKEN=your_pinata_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
```

### 1.4 API Endpoints

#### POST `/api/storage/ipfs/reputation`
Store reputation metadata on IPFS.

**Request:**
```json
{
  "address": "0x...",
  "score": 850,
  "tier": "BASED",
  "breakdown": {
    "tenure": 300,
    "economic": 400,
    "social": 150
  }
}
```

**Response:**
```json
{
  "success": true,
  "cid": "bafy...",
  "ipfsUrl": "ipfs://bafy...",
  "gatewayUrl": "https://gateway.pinata.cloud/ipfs/bafy..."
}
```

### 1.5 Integration Points

1. **Reputation Score Updates**
   - Store snapshot on IPFS when score changes
   - Link CID in database for historical tracking

2. **User Profiles**
   - Store Farcaster handles, ENS names, linked wallets
   - Update profile metadata on IPFS

3. **Achievement Badges**
   - Store badge images and metadata
   - Reference IPFS CID in NFT metadata

---

## 2. Chainlink Integration

### 2.1 Architecture Overview

```
Chainlink Automation → checkUpkeep() → performUpkeep() → Batch Score Update → On-Chain Update
```

### 2.2 Smart Contract Enhancements

**File:** `foundry/src/ReputationRegistry.sol`

```solidity
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

contract ReputationRegistry is AutomationCompatibleInterface {
    address[] public pendingUpdates;
    mapping(address => bool) public needsUpdate;
    
    function checkUpkeep(bytes calldata) 
        external 
        view 
        override 
        returns (bool upkeepNeeded, bytes memory performData) 
    {
        upkeepNeeded = pendingUpdates.length > 0;
        performData = abi.encode(pendingUpdates);
    }
    
    function performUpkeep(bytes calldata performData) external override {
        address[] memory addresses = abi.decode(performData, (address[]));
        batchUpdateScores(addresses);
        delete pendingUpdates;
    }
}
```

### 2.3 TypeScript Integration

**File:** `src/lib/chainlink/data-feeds.ts`

- `getBasePrice()` - Fetch Base/USD price
- `getETHPrice()` - Fetch ETH/USD price
- `calculateEconomicActivityScore()` - Score based on transaction value

### 2.4 Environment Variables

```bash
CHAINLINK_FUNCTIONS_ROUTER=0x...
CHAINLINK_AUTOMATION_REGISTRY=0x...
```

### 2.5 Integration Points

1. **Autonomous Score Updates**
   - Chainlink Automation checks for pending updates
   - Batch updates scores on-chain (gas efficient)

2. **Economic Activity Scoring**
   - Use Chainlink Data Feeds for USD value calculation
   - Higher value transactions = more reputation points

3. **Custom Data Queries**
   - Chainlink Functions for off-chain data (Zora API, Farcaster API)
   - Verify user activity without centralized backend

---

## 3. Farcaster Frames Integration

### 3.1 Architecture Overview

```
Farcaster Feed → Frame Meta Tags → Dynamic Image Generation → User Interaction → Transaction/Redirect
```

### 3.2 Implementation Files

- `src/app/frame/reputation/route.ts` - Image generation API
- `src/app/frame/reputation/page.tsx` - Frame meta tags
- `src/lib/frames/generator.ts` - Satori image generation utilities

### 3.3 Frame Structure

```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://basestandard.xyz/api/frame/reputation?address=0x..." />
<meta property="fc:frame:button:1" content="Check My Reputation" />
<meta property="fc:frame:button:1:action" content="link" />
<meta property="fc:frame:button:1:target" content="https://basestandard.xyz/my-reputation" />
<meta property="fc:frame:button:2" content="Mint Badge NFT" />
<meta property="fc:frame:button:2:action" content="tx" />
<meta property="fc:frame:button:2:target" content="https://basestandard.xyz/api/mint-badge" />
```

### 3.4 Image Generation

- **Library:** Satori (HTML/CSS to SVG)
- **Format:** 1200x630px (Farcaster standard)
- **Caching:** 60 seconds (s-maxage)
- **Content:** Dynamic reputation tier, score, breakdown

### 3.5 Integration Points

1. **Reputation Display**
   - Users share frame in Farcaster
   - Shows current reputation tier and score

2. **Transaction Buttons**
   - "Mint Badge NFT" - Direct on-chain minting
   - "Link Wallet" - EIP-712 signature flow

3. **Social Sharing**
   - Frame automatically updates when reputation changes
   - Viral sharing mechanism for growth

---

## 4. On-Chain NFT Badges

### 4.1 Architecture Overview

```
Reputation Score → Tier Calculation → SVG Generation → Base64 Encoding → NFT Metadata → Mint
```

### 4.2 Smart Contract

**File:** `foundry/src/ReputationBadge.sol`

```solidity
contract ReputationBadge is ERC721 {
    ReputationRegistry public registry;
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        address owner = ownerOf(tokenId);
        string memory svg = generateBadgeSVG(owner);
        string memory base64Svg = Base64.encode(bytes(svg));
        
        return string(abi.encodePacked(
            'data:application/json;base64,',
            Base64.encode(bytes(string(abi.encodePacked(
                '{"name":"Reputation Badge #',
                toString(tokenId),
                '","image":"data:image/svg+xml;base64,',
                base64Svg,
                '"}'
            ))))
        ));
    }
}
```

### 4.3 SVG Generation

- **Fully On-Chain:** No external dependencies
- **Dynamic:** Updates based on current reputation
- **Tier-Based Colors:** LEGEND (gold), BASED (cyan), etc.

### 4.4 Integration Points

1. **Automatic Minting**
   - Mint badge when user reaches new tier
   - Gas-efficient batch minting

2. **Dynamic Metadata**
   - SVG updates when reputation changes
   - No re-minting required

3. **Trading/Display**
   - Users can display badge in wallets
   - Tradeable on NFT marketplaces

---

## 5. Integration Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Restore package.json
- [ ] Install IPFS dependencies (`@pinata/sdk`)
- [ ] Install Satori for Frame generation
- [ ] Set up Pinata account and get JWT token
- [ ] Create IPFS storage utilities
- [ ] Create Chainlink data feed utilities

### Phase 2: IPFS Storage (Week 3-4)
- [ ] Implement `storeReputationMetadata()`
- [ ] Implement `storeFileOnIPFS()`
- [ ] Create API endpoints for IPFS operations
- [ ] Integrate with reputation score updates
- [ ] Add IPFS CID tracking to database schema

### Phase 3: Chainlink Integration (Week 5-6)
- [ ] Enhance ReputationRegistry contract with Automation
- [ ] Implement `checkUpkeep()` and `performUpkeep()`
- [ ] Deploy updated contract to Base
- [ ] Register with Chainlink Automation
- [ ] Test autonomous score updates

### Phase 4: Farcaster Frames (Week 7-8)
- [ ] Implement Frame image generation API
- [ ] Create Frame meta tags page
- [ ] Add transaction button handlers
- [ ] Test Frame rendering in Farcaster
- [ ] Deploy Frame to production

### Phase 5: On-Chain NFTs (Week 9-10)
- [ ] Implement ReputationBadge contract
- [ ] Add SVG generation logic
- [ ] Deploy badge contract
- [ ] Create minting API endpoint
- [ ] Test dynamic metadata updates

---

## 6. Database Schema Updates

### 6.1 IPFS Metadata Tracking

```prisma
model ReputationSnapshot {
  id        String   @id @default(cuid())
  address   String
  score     Int
  tier      String
  ipfsCid   String?  // IPFS CID for metadata
  ipfsUrl   String?  // Full IPFS URL
  createdAt DateTime @default(now())
  
  @@index([address])
  @@index([createdAt])
}
```

### 6.2 Badge Tracking

```prisma
model ReputationBadge {
  id        String   @id @default(cuid())
  address   String
  tokenId   Int      @unique
  tier      String
  mintedAt  DateTime @default(now())
  
  @@index([address])
}
```

---

## 7. Security Considerations

### 7.1 IPFS Storage
- **API Keys:** Store Pinata JWT server-side only
- **Validation:** Validate all metadata before storing
- **Rate Limiting:** Implement rate limits on IPFS endpoints

### 7.2 Chainlink Automation
- **Access Control:** Only Chainlink Automation can call `performUpkeep()`
- **Gas Limits:** Set reasonable gas limits for batch updates
- **Error Handling:** Graceful degradation if Chainlink fails

### 7.3 Farcaster Frames
- **Input Validation:** Validate all user inputs
- **XSS Prevention:** Sanitize all dynamic content
- **Rate Limiting:** Prevent abuse of image generation

### 7.4 On-Chain NFTs
- **Reentrancy:** Use ReentrancyGuard for minting
- **Access Control:** Only authorized contracts can mint
- **Gas Optimization:** Batch operations where possible

---

## 8. Testing Strategy

### 8.1 Unit Tests
- IPFS storage functions
- Chainlink data feed utilities
- Frame image generation
- SVG badge generation

### 8.2 Integration Tests
- End-to-end IPFS storage flow
- Chainlink Automation simulation
- Frame rendering in test environment
- NFT minting and metadata retrieval

### 8.3 E2E Tests
- Complete reputation update → IPFS storage → Frame update flow
- Chainlink Automation → Score update → Badge mint flow

---

## 9. Cost Analysis

| Feature | Service | Estimated Monthly Cost |
|---------|---------|------------------------|
| IPFS Storage | Pinata | $20 (100GB) |
| Chainlink Automation | Chainlink | $30 (300 updates) |
| Chainlink Data Feeds | Chainlink | $0 (on-chain) |
| Farcaster Frames | Self-hosted | $0 (uses existing infra) |
| On-Chain NFTs | Base Gas | $10 (minting) |
| **Total** | | **~$60/month** |

---

## 10. Success Metrics

1. **IPFS Storage**
   - 1000+ reputation snapshots stored
   - <2s average storage time
   - 99.9% retrieval success rate

2. **Chainlink Automation**
   - 100+ autonomous score updates/day
   - <5min average update latency
   - 0 failed updates

3. **Farcaster Frames**
   - 100+ frame shares/week
   - <1s image generation time
   - 50%+ click-through rate

4. **On-Chain NFTs**
   - 500+ badges minted
   - 100% dynamic metadata accuracy
   - <$0.10 average mint cost

---

## 11. Dependencies

### 11.1 New NPM Packages

```json
{
  "@pinata/sdk": "^2.0.0",
  "satori": "^0.0.38",
  "@resvg/resvg-js": "^2.0.0"
}
```

### 11.2 Foundry Dependencies

```bash
forge install chainlink/contracts
```

---

## 12. Conclusion

This specification provides a complete blueprint for integrating Web3 AI Agent capabilities into The Base Standard. The implementation is modular, allowing for phased rollout and independent testing of each component.

**Next Steps:**
1. Review and approve this specification
2. Set up development environment (Pinata, Chainlink accounts)
3. Begin Phase 1 implementation
4. Iterate based on testing and feedback

---

**Document Owner:** Development Team  
**Last Updated:** January 2026  
**Status:** Ready for Implementation
