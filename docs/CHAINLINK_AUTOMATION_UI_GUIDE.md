# Chainlink Automation UI Registration Guide

## Quick Start: Register ReputationRegistry Upkeep

This guide walks through registering your `ReputationRegistry` contract with Chainlink Automation using the web UI.

## Prerequisites

- ✅ Deployed `ReputationRegistry` contract on Base
- ✅ Contract has `automationRegistry` set (via `setAutomationRegistry()`)
- ✅ LINK tokens in your wallet (minimum 5-10 LINK recommended)
- ✅ Wallet connected to Base network

## Step-by-Step Registration

### Step 1: Access Chainlink Automation

1. Navigate to [automation.chain.link](https://automation.chain.link/)
2. Click **"Connect Wallet"** in the top right
3. Select your wallet (MetaMask, Coinbase Wallet, etc.)
4. **Important**: Ensure you're connected to **Base Mainnet** (Chain ID: 8453)
   - If on wrong network, switch in your wallet

### Step 2: Start Registration

1. Click **"Register new Upkeep"** button
2. You'll see the trigger selection page

### Step 3: Select Trigger Type

You'll see three options:

#### ⏰ Time-based
- **Use for**: Scheduled executions at fixed intervals
- **Not recommended** for ReputationRegistry (we use custom logic)

#### ✅ Custom logic (SELECT THIS)
- **Use for**: Contracts implementing `AutomationCompatibleInterface`
- **This is what ReputationRegistry uses**
- The contract's `checkUpkeep()` function determines when upkeep is needed
- The contract's `performUpkeep()` function executes the upkeep

#### 📋 Log trigger
- **Use for**: Event-based triggers
- **Not needed** for ReputationRegistry

**Action**: Select **"Custom logic"** and click **"Next"**

### Step 4: Configure Upkeep

Fill in the registration form:

#### Target Contract Address
```
Your ReputationRegistry contract address
Example: 0x1234567890123456789012345678901234567890
```

#### Upkeep Name
```
ReputationRegistry Score Updates
```
*(This is for your reference in the dashboard)*

#### Gas Limit
```
500000
```
**Recommendations**:
- **Small batches** (1-5 addresses): `200000`
- **Medium batches** (5-20 addresses): `500000` ✅ Recommended
- **Large batches** (20+ addresses): `1000000`

#### Starting Balance
```
5 LINK (minimum)
10-20 LINK (recommended for production)
```
**Note**: This LINK is transferred to the upkeep contract and used to pay for executions.

#### Check Data
```
0x
```
*(Leave empty - no additional data needed)*

#### Admin Address
```
Your wallet address (or multisig for production)
```
This address can:
- Cancel the upkeep
- Update gas limit
- Withdraw unused LINK
- Update admin/payee addresses

#### Payee Address (Optional)
```
Leave as admin address (or specify different address)
```
Address that receives refunds for unused gas.

### Step 5: Review and Submit

1. **Double-check**:
   - ✅ Contract address is correct
   - ✅ Gas limit is sufficient
   - ✅ You have enough LINK in wallet
   - ✅ Network is Base Mainnet

2. Click **"Register Upkeep"**

3. **Approve transaction** in your wallet:
   - Transaction includes:
     - Upkeep registration fee (~0.1 LINK)
     - Starting balance transfer (5-20 LINK)
   - Confirm gas fee

4. **Wait for confirmation** (usually 1-2 minutes)

### Step 6: Verify Registration

After transaction confirms:

1. You'll be redirected to your upkeep dashboard
2. Verify the upkeep shows:
   - ✅ Status: **Active**
   - ✅ Balance: Your starting balance
   - ✅ Target: Your contract address
   - ✅ Gas Limit: Your configured limit

3. **Save your Upkeep ID** - You'll need this for monitoring

### Step 7: Add Additional Funds (Optional)

If you want more balance:

1. Navigate to your upkeep in the dashboard
2. Click **"Add Funds"** or **"Fund Upkeep"**
3. Enter LINK amount
4. Approve transaction

## Understanding Your Upkeep

### How It Works

1. **Your contract** calls `markForUpdate(address)` when scores need updating
2. **Chainlink Automation** periodically calls `checkUpkeep()` on your contract
3. If `checkUpkeep()` returns `true` (addresses pending), Automation calls `performUpkeep()`
4. `performUpkeep()` clears the pending updates array
5. Your off-chain service reads the updates and calculates new scores
6. Your service calls `batchUpdateScores()` with the new scores

### Monitoring

Monitor your upkeep on the Chainlink Automation dashboard:

- **Balance**: LINK remaining for executions
- **Last Execution**: When upkeep last ran
- **Execution History**: View all past executions
- **Status**: Active, Paused, or Cancelled

### Cost Breakdown

- **Registration**: ~0.1 LINK (one-time)
- **Starting Balance**: 5-20 LINK (your choice)
- **Per Execution**: ~0.001-0.01 LINK (depends on gas price)
- **Check Calls**: Free (simulation only)

## Troubleshooting

### "Upkeep Not Executing"

1. **Check Balance**: Ensure upkeep has LINK balance
2. **Verify `checkUpkeep()`**: Should return `true` when addresses are pending
3. **Check Gas Limit**: May be too low for your batch size
4. **Verify Registry**: Ensure `automationRegistry` is set correctly

### "Unauthorized Upkeep Error"

- Ensure `automationRegistry` is set to the Chainlink Automation Registry address
- Verify the caller is the registered automation registry

### "Insufficient Balance"

- Add more LINK to the upkeep balance
- Monitor balance and set up alerts

## Next Steps

After registration:

1. ✅ Test with a single address: `markForUpdate(0x...)`
2. ✅ Monitor first execution in dashboard
3. ✅ Verify `performUpkeep()` clears pending updates
4. ✅ Set up monitoring/alerts for low balance
5. ✅ Configure automatic funding (if needed)

## Support

- [Chainlink Automation Docs](https://docs.chain.link/chainlink-automation)
- [Chainlink Discord](https://discord.gg/chainlink)
- [Chainlink Automation Forum](https://forum.chain.link/)

---

**Last Updated**: January 2026  
**Contract**: ReputationRegistry.sol  
**Network**: Base Mainnet (Chain ID: 8453)
