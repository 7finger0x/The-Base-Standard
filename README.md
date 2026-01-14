# The Base Standard

On-chain reputation scoring across Base and Zora networks - establishing the standard for Base L2 credibility.

## Features

- **Multi-Wallet Identity**: Link multiple wallets to aggregate your reputation score
- **Cross-Chain Scoring**: Aggregates activity from Base and Zora networks
- **Timeliness Rewards**: Bonus points for early NFT mints (< 24h)
- **EIP-712 Secure Linking**: Cryptographically secure wallet linking

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Web3**: OnchainKit, wagmi v2, viem
- **Contracts**: Foundry (Solidity 0.8.23)
- **Data Layer**: Ponder (optional, for indexing)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run Foundry tests
npm run foundry:test
```

## Tier System

| Tier   | Min Score | Description          |
|--------|-----------|----------------------|
| Novice | 0         | Just getting started |
| Bronze | 100       | Active participant   |
| Silver | 500       | Established presence |
| Gold   | 850       | Power user           |
| BASED  | 1000      | OG Status            |

## Score Calculation

```
Total Score = Base Tenure + Zora Mints + Timeliness Bonus

- Base Tenure: Days since first transaction on Base
- Zora Mints: Number of NFTs minted on Zora
- Timeliness: Bonus for minting within 24h of collection launch
```

## Smart Contract

The `ReputationRegistry` contract handles:
- Multi-wallet linking via EIP-712 signatures
- Score storage and tier calculation
- Batch score updates (for agent)

Deploy:
```bash
cd foundry
forge script script/Deploy.s.sol --broadcast --verify
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_BASE_RPC_URL`
- `NEXT_PUBLIC_REGISTRY_ADDRESS`
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`

## License

MIT
