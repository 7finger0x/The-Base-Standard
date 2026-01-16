# Chainlink Automation Setup Guide

## Overview

The ReputationRegistry contract implements Chainlink Automation to enable autonomous score updates. This guide walks through setting up and registering the contract with Chainlink Automation.

## Prerequisites

1. Deployed `ReputationRegistry` contract on Base
2. Chainlink Automation Registry address for Base network
3. LINK tokens for automation upkeep payments

## Base Network Chainlink Addresses

### Base Mainnet
- **Automation Registry**: `0x03eFb0cC5e3C0b0B0C0C0C0C0C0C0C0C0C0C0C0C0` (Update with actual address)
- **Link Token**: `0x88A23f8B0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0` (Update with actual address)

### Base Sepolia (Testnet)
- **Automation Registry**: `0x03eFb0cC5e3C0b0B0C0C0C0C0C0C0C0C0C0C0C0C0` (Update with actual address)
- **Link Token**: `0x88A23f8B0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0` (Update with actual address)

**Note**: Update these addresses with the actual Chainlink Automation Registry addresses for Base network.

## Step 1: Deploy Contract

```bash
cd foundry
forge script script/Deploy.s.sol \
  --rpc-url $BASE_RPC_URL \
  --broadcast \
  --verify \
  --private-key $PRIVATE_KEY
```

Or set the automation registry during deployment:

```bash
CHAINLINK_AUTOMATION_REGISTRY=0x... forge script script/Deploy.s.sol \
  --rpc-url $BASE_RPC_URL \
  --broadcast \
  --verify \
  --private-key $PRIVATE_KEY
```

## Step 2: Set Automation Registry (if not set during deployment)

```bash
cast send $REGISTRY_ADDRESS \
  "setAutomationRegistry(address)" \
  0x...AUTOMATION_REGISTRY_ADDRESS \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Step 3: Register Upkeep with Chainlink Automation

### Option A: Using Chainlink Automation UI (Recommended)

#### Step 3.1: Navigate to Chainlink Automation

1. Go to [Chainlink Automation App](https://automation.chain.link/)
2. Connect your wallet (ensure it's connected to Base network)
3. Click **"Register new Upkeep"** button

#### Step 3.2: Select Trigger Type

You'll see three trigger options:

- **Time-based**: For scheduled executions (not recommended for ReputationRegistry)
- **Custom logic**: ✅ **SELECT THIS** - For contracts implementing `AutomationCompatibleInterface`
- **Log trigger**: For event-based triggers (not needed for ReputationRegistry)

**Select "Custom logic"** since `ReputationRegistry` implements:
- `checkUpkeep(bytes calldata checkData)` - Determines when upkeep is needed
- `performUpkeep(bytes calldata performData)` - Executes the upkeep

Click **"Next"** to proceed.

#### Step 3.3: Configure Upkeep Details

Fill in the following information:

1. **Target Contract Address**
   - Enter your deployed `ReputationRegistry` contract address
   - Example: `0x1234567890123456789012345678901234567890`

2. **Upkeep Name**
   - Enter: `ReputationRegistry Score Updates`
   - This is for your reference in the dashboard

3. **Gas Limit**
   - Recommended: `500000` (500k gas)
   - Adjust based on your batch size:
     - Small batches (1-5 addresses): `200000`
     - Medium batches (5-20 addresses): `500000`
     - Large batches (20+ addresses): `1000000`

4. **Starting Balance (LINK)**
   - Minimum: `5 LINK` (recommended for testing)
   - Production: `10-20 LINK` (ensures sufficient balance)
   - This balance will be deducted for each upkeep execution

5. **Check Data**
   - Leave empty: `0x` (no additional data needed)
   - The contract's `checkUpkeep()` will determine eligibility

6. **Admin Address**
   - Your wallet address (or a multisig for production)
   - This address can cancel/update the upkeep

7. **Payee Address** (Optional)
   - Leave as admin address if not specified
   - Address that receives refunds for unused gas

#### Step 3.4: Review and Confirm

1. Review all settings
2. Ensure you have sufficient LINK in your wallet
3. Click **"Register Upkeep"**
4. Approve the transaction in your wallet
5. Wait for confirmation

#### Step 3.5: Fund the Upkeep

After registration:

1. Navigate to your upkeep in the dashboard
2. Click **"Add Funds"** or **"Fund Upkeep"**
3. Enter the amount of LINK to add (recommend 5-10 LINK minimum)
4. Approve the transaction

**Note**: The upkeep balance is separate from your wallet balance. LINK must be transferred to the upkeep contract.

### Option B: Using Chainlink Automation Registry Contract (Advanced)

For programmatic registration, use the Automation Registry contract directly:

```solidity
// Register upkeep programmatically
IAutomationRegistry registry = IAutomationRegistry(AUTOMATION_REGISTRY_ADDRESS);

registry.registerUpkeep(
    address(REPUTATION_REGISTRY),  // Target contract
    500000,                         // Gas limit
    ADMIN_ADDRESS,                  // Admin address
    0x,                             // Check data (empty)
    5000000000000000000,            // Starting balance (5 LINK in wei)
    PAYEE_ADDRESS                   // Payee address (optional)
);
```

Or using `cast` CLI:

```bash
# First, approve LINK spending
cast send $LINK_TOKEN_ADDRESS \
  "approve(address,uint256)" \
  $AUTOMATION_REGISTRY \
  10000000000000000000 \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY

# Register upkeep
cast send $AUTOMATION_REGISTRY \
  "registerUpkeep(address,uint32,address,bytes,uint96,address)" \
  $REGISTRY_ADDRESS \
  500000 \
  $ADMIN_ADDRESS \
  0x \
  5000000000000000000 \
  $ADMIN_ADDRESS \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Step 4: Fund the Upkeep

After registration, fund the upkeep with LINK tokens:

```bash
cast send $LINK_TOKEN_ADDRESS \
  "transferAndCall(address,uint256,bytes)" \
  $AUTOMATION_REGISTRY \
  $LINK_AMOUNT \
  $(cast abi-encode "registerUpkeep(address,uint32,address,bytes,uint96,address)" \
    $REGISTRY_ADDRESS \
    500000 \
    $ADMIN_ADDRESS \
    0x \
    5000000000000000000 \
    $PAYEE_ADDRESS) \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Step 5: Mark Addresses for Update

When addresses need score updates, mark them:

```bash
# Single address
cast send $REGISTRY_ADDRESS \
  "markForUpdate(address)" \
  0x...USER_ADDRESS \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY

# Batch addresses
cast send $REGISTRY_ADDRESS \
  "batchMarkForUpdate(address[])" \
  "[0x...ADDR1,0x...ADDR2,0x...ADDR3]" \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Step 6: Verify Automation

### Check if upkeep is needed:

```bash
cast call $REGISTRY_ADDRESS \
  "checkUpkeep(bytes)" \
  0x \
  --rpc-url $BASE_RPC_URL
```

### View pending updates:

```bash
cast call $REGISTRY_ADDRESS \
  "getPendingUpdates()" \
  --rpc-url $BASE_RPC_URL
```

## Workflow

1. **Off-Chain Agent/Service** detects score changes
2. Calls `markForUpdate(address)` or `batchMarkForUpdate(address[])` on contract
3. **Chainlink Automation** periodically calls `checkUpkeep()`
4. If `checkUpkeep()` returns `true`, Automation calls `performUpkeep()`
5. `performUpkeep()` clears pending updates
6. **Off-Chain Service** reads `getPendingUpdates()` and calculates new scores
7. Off-Chain service calls `batchUpdateScores()` with new scores

## Testing Locally

Run the Foundry tests:

```bash
cd foundry
forge test --match-test "test_CheckUpkeep" -vvv
forge test --match-test "test_PerformUpkeep" -vvv
forge test --match-test "test_AutomationFlow" -vvv
```

## Monitoring

Monitor your upkeep on:
- [Chainlink Automation Dashboard](https://automation.chain.link/)
- Check upkeep balance and status
- View execution history

## Troubleshooting

### Upkeep Not Executing

1. Check LINK balance in upkeep
2. Verify `checkUpkeep()` returns `true`
3. Check gas limit is sufficient
4. Verify automation registry is set correctly

### Unauthorized Upkeep Error

- Ensure `automationRegistry` is set to the Chainlink Automation Registry address
- Verify the caller is the registered automation registry

### Gas Estimation Issues

- Increase gas limit in upkeep registration
- Optimize `performUpkeep()` function
- Consider batching fewer addresses per upkeep

## Security Considerations

1. **Access Control**: Only owner can mark addresses for update
2. **Registry Verification**: `performUpkeep()` verifies caller is the automation registry
3. **Rate Limiting**: Consider adding rate limits to prevent abuse
4. **Gas Limits**: Set appropriate gas limits to prevent DoS

## Cost Estimation

- **Registration**: ~0.1 LINK (one-time)
- **Upkeep Balance**: 5-10 LINK (recommended minimum)
- **Execution Cost**: ~0.001-0.01 LINK per execution (depends on gas price)
- **Check Cost**: Minimal (simulation only)

## Next Steps

After automation is set up:

1. Integrate with off-chain score calculation service
2. Set up monitoring and alerts
3. Configure automatic funding (if needed)
4. Test with small batches before full deployment
