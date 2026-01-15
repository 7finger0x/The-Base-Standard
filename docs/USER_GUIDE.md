# The Base Standard - User Guide

**Version:** 1.0.0  
**Last Updated:** January 10, 2026

## Welcome to The Base Standard

The Base Standard is an on-chain reputation system that quantifies your activity across Base L2, Zora, and Farcaster into a verifiable reputation score.

## Getting Started

### 1. Connect Your Wallet

1. Visit [base-standard.xyz](https://base-standard.xyz)
2. Click "Connect Wallet" or "Check My Score"
3. Select your wallet (Coinbase Wallet recommended)
4. Approve the connection

### 2. View Your Reputation Score

Once connected, you'll see:
- **Total Score**: Your overall reputation points
- **Tier**: Your current tier (Novice, Bronze, Silver, Gold, BASED)
- **Rank**: Your position on the leaderboard
- **Score Breakdown**: Detailed breakdown of how your score is calculated

## Understanding Your Score

### Score Components

Your reputation score (0-1000) is calculated from three main pillars:

#### 1. Capital Efficiency & Commitment (Max 400 points)
- **Metrics**: Liquidity duration (>30 days), lending utilization, and transaction volume.
- **How to improve**: Maintain liquidity positions for >30 days and increase volume.

#### 2. Ecosystem Diversity (Max 300 points)
- **Metrics**: Number of unique protocols used and interaction with vintage contracts.
- **How to improve**: Explore different protocols across the Base ecosystem (DEX, Lending, Gaming).

#### 3. Identity & Social Proof (Max 300 points)
- **Metrics**: Farcaster ID, OpenRank score, Coinbase verification, and wallet tenure.
- **How to improve**: Link your Farcaster account and verify with Coinbase.

### Tier System

| Tier | Score Range | Description |
|------|-------------|-------------|
| **TOURIST** | 0-350 | Low retention / one-time users |
| **RESIDENT** | 351-650 | Average active users |
| **BUILDER** | 651-850 | Power users with diversity |
| **BASED** | 851-950 | **Top 5% Elite** (Hard Gate) |
| **LEGEND** | 951-1000 | Ecosystem leaders (Top 1%) |

## Linking Multiple Wallets

You can link multiple wallets to aggregate your reputation score:

1. Click "Link Wallet" on your profile
2. Sign the EIP-712 message with the wallet you want to link
3. The secondary wallet's score will be added to your main wallet
4. Maximum 5 wallets can be linked per account

**Security**: Wallet linking uses cryptographic signatures (EIP-712) - your private keys never leave your wallet.

## Leaderboard

View the top users by reputation score:
- Navigate to the Leaderboard page
- See rankings, scores, and tiers
- Use pagination to browse through rankings
- Search for specific addresses

## Frequently Asked Questions

### How often is my score updated?
Scores are updated in real-time as new on-chain activity is detected. The indexer processes new transactions every few minutes.

### Can I lose points?
No, your score only increases. However, your rank may decrease as other users gain more points.

### What if my score seems incorrect?
- Check that all your wallets are linked
- Verify your on-chain activity is being indexed
- Contact support if you believe there's an error

### How do I improve my score?
1. **Stay Active**: Regular activity on Base maintains your tenure
2. **Mint on Zora**: Participate in NFT collections, especially early
3. **Link Wallets**: Aggregate scores from multiple wallets
4. **Be Early**: Early adoption bonuses for new collections

### Is my data private?
- Wallet addresses are public on-chain
- We only store aggregated reputation data
- No personal information is collected
- See our Privacy Policy for details

## Troubleshooting

### Wallet Won't Connect
- Ensure you're using a supported wallet (Coinbase Wallet, MetaMask)
- Check that you're on Base network (Chain ID: 8453)
- Try refreshing the page

### Score Not Showing
- Verify your wallet has on-chain activity
- Check that the indexer is running (see status page)
- Try disconnecting and reconnecting your wallet

### Leaderboard Not Loading
- Check your internet connection
- The leaderboard may be temporarily unavailable during updates
- Try refreshing the page

## Support

Need help? Contact us:
- **Discord**: [discord.gg/base-standard](https://discord.gg/base-standard)
- **Email**: support@base-standard.xyz
- **Twitter**: [@BaseStandard](https://twitter.com/BaseStandard)

## Terms & Privacy

- [Terms of Service](./TERMS.md)
- [Privacy Policy](./PRIVACY.md)

---

**Built on Base L2** 🔵
