# Environment Variables

**Last Updated**: 2025-01-10

## Required for Session Management

### NextAuth.js Configuration

```bash
# Required in production
NEXTAUTH_SECRET=your-secret-key-here  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000    # Development: http://localhost:3000
                                       # Production: https://yourdomain.com
```

**Generate Secret**:
```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

## All Environment Variables

### Database
```bash
DATABASE_URL=file:./dev.db  # SQLite for development
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname  # PostgreSQL for production
```

### NextAuth (NEW - Required)
```bash
NEXTAUTH_SECRET=change-me-in-production  # MUST be set in production
NEXTAUTH_URL=http://localhost:3000       # Your app URL
```

### Base Network
```bash
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_CHAIN_ID=8453  # Base Mainnet
```

### Contracts
```bash
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...  # ReputationRegistry contract address
```

### OnchainKit
```bash
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your-api-key
```

### Ponder Indexer (Optional)
```bash
PONDER_URL=http://localhost:42069
PONDER_RPC_URL_BASE=https://mainnet.base.org
PONDER_RPC_URL_ZORA=https://rpc.zora.energy
PONDER_DATABASE_URL=postgresql://...
```

### CDP AgentKit (Optional)
```bash
CDP_KEY_NAME=your-key-name
CDP_PRIVATE_KEY=your-private-key
```

### Farcaster (Optional)
```bash
NEXT_PUBLIC_FARCASTER_HUB_URL=https://hub.farcaster.xyz
```

### Admin API (Optional)
```bash
ADMIN_API_KEY=your-admin-api-key  # For admin endpoints
```

### Feature Flags
```bash
ENABLE_PVC_SCORING=true            # Enable PVC framework scoring
ENABLE_REQUEST_LOGGING=true        # Enable request logging
DOCKER_BUILD=false                 # Set to true for Docker builds
```

## Development Setup

1. Copy `.env.example` to `.env.local`
2. Fill in required variables
3. **Important**: Generate `NEXTAUTH_SECRET` for production

## Production Setup

1. Set all required variables
2. **Critical**: Set `NEXTAUTH_SECRET` to a secure random string
3. Set `NEXTAUTH_URL` to your production domain
4. Use PostgreSQL for `DATABASE_URL`
5. Set secure cookies (`Secure` flag) - NextAuth handles this automatically
