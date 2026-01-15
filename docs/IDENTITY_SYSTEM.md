# Unified Web3 Identity System

**Version:** 1.0.0  
**Last Updated:** January 10, 2026

## Overview

The Unified Web3 Identity System implements the "Identity Graph" architecture, allowing users to aggregate multiple wallets and social accounts into a single persistent identity. This solves the identity fragmentation problem in Web3.

## Architecture: The Identity Graph

### Star Topology

```
        User (Hub)
         /  |  \
        /   |   \
   Wallet Wallet Account
   (EVM) (Solana) (Discord)
```

- **Hub (User)**: Abstract container representing the human owner
- **Spokes (Wallets/Accounts)**: Linked credentials (cryptographic or OAuth)

### Key Principles

1. **User-Centric Model**: User ID is the atomic unit, not wallet address
2. **Cryptographic Verification**: Every link requires proof (SIWE/EIP-712)
3. **Uniqueness Enforcement**: Database constraints prevent identity collisions
4. **Decoupled Auth**: Session represents user, not specific credential

## Database Schema

### User Model
- Central identity hub
- No authentication data
- Profile metadata (username, avatar, bio)
- Aggregated reputation score

### Wallet Model
- Cryptographic key pairs
- Supports multiple chains (EVM, Solana, Bitcoin, etc.)
- Primary wallet designation
- Verification timestamp

### Account Model
- OAuth provider connections
- Stores access/refresh tokens
- Provider-specific user data

### Session Model
- Database-backed sessions
- Tied to User ID, not wallet

### SIWENonce Model
- Nonce management for SIWE
- Prevents replay attacks
- Time-limited expiration

## Authentication Flow

### 1. Initial Wallet Connection

```
User connects wallet → System creates User + Wallet (primary)
```

### 2. Linking Additional Wallet

```
1. User requests nonce
2. User signs SIWE message with new wallet
3. Backend verifies signature
4. Backend checks uniqueness
5. Backend creates Wallet link
```

### 3. Linking Social Account

```
1. User initiates OAuth flow
2. Provider redirects with code
3. Backend exchanges code for tokens
4. Backend creates Account link
```

## API Endpoints

### GET /api/identity/nonce
Generate SIWE nonce for wallet linking.

**Query Parameters:**
- `address` (optional): Wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "nonce": "uuid-string"
  }
}
```

### POST /api/identity/link-wallet
Link a wallet using SIWE.

**Request Body:**
```json
{
  "address": "0x...",
  "chainType": "EVM",
  "siweMessage": "base-standard.xyz wants you to sign...",
  "signature": "0x...",
  "nonce": "uuid-string"
}
```

### GET /api/identity/me
Get current user's identity with all linked accounts.

**Query Parameters:**
- `address` (optional): Wallet address to lookup

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "username": "user123",
    "primaryWallet": {
      "address": "0x...",
      "chainType": "EVM"
    },
    "wallets": [...],
    "socialAccounts": [...]
  }
}
```

### DELETE /api/identity/wallets/[walletId]
Unlink a wallet from user identity.

### PUT /api/identity/wallets/[walletId]/primary
Set a wallet as primary.

## Security Features

### SIWE (Sign-In with Ethereum)
- EIP-4361 compliant
- Nonce-based replay protection
- Domain and chain ID validation
- Expiration time checks

### Uniqueness Constraints
- Wallet address + chain type must be unique globally
- Social account (provider + providerAccountId) must be unique
- Prevents identity collisions

### Conflict Resolution
- If wallet already linked, return error
- User can choose to recover account
- Requires re-authentication

## Usage Examples

### Link Wallet (Frontend)

```typescript
import { useLinkWallet } from '@/hooks/useIdentity';

function LinkWalletButton() {
  const { mutate: linkWallet, isPending } = useLinkWallet();
  
  const handleLink = async () => {
    // User switches to new wallet in extension
    const newAddress = '0x...'; // From wallet extension
    
    await linkWallet(newAddress);
  };
  
  return (
    <button onClick={handleLink} disabled={isPending}>
      Link Wallet
    </button>
  );
}
```

### Get Identity

```typescript
import { useIdentity } from '@/hooks/useIdentity';

function ProfilePage() {
  const { data: identity, isLoading } = useIdentity();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{identity?.displayName || identity?.username}</h1>
      <p>Score: {identity?.score}</p>
      <p>Tier: {identity?.tier}</p>
      
      <h2>Linked Wallets</h2>
      {identity?.wallets.map(wallet => (
        <div key={wallet.id}>
          {wallet.address} {wallet.isPrimary && '(Primary)'}
        </div>
      ))}
    </div>
  );
}
```

## Integration with Reputation System

The identity system aggregates reputation across all linked wallets:

```typescript
// When calculating reputation
const user = await IdentityService.getUserIdentity(userId);
const allWallets = user.wallets.map(w => w.address);

// Aggregate scores from all wallets
const totalScore = await aggregateScores(allWallets);
```

## Migration from Legacy System

### Legacy Model
- User = Wallet Address
- Single address per user
- No social linking

### New Model
- User = Persistent ID
- Multiple wallets per user
- Social account linking
- Aggregated reputation

### Migration Path
1. Create User for each existing address
2. Set address as primary wallet
3. Migrate reputation scores
4. Enable multi-wallet linking

## Future Enhancements

### Planned Features
- [ ] NextAuth.js integration for OAuth
- [ ] Solana wallet support
- [ ] Embedded wallet generation
- [ ] Account recovery flows
- [ ] Identity verification badges

### Commercial Alternatives
- **Dynamic.xyz**: Drop-in widget solution
- **Privy**: Headless with embedded wallets

See implementation guide for custom vs commercial trade-offs.

---

**For implementation details, see:**
- `src/lib/identity/identity-service.ts`
- `src/lib/identity/siwe.ts`
- `prisma/schema.prisma` (User, Wallet, Account models)
