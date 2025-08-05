ure to# Kustodia V2 Mainnet Deployment Guide

## 🎯 Overview

This guide covers the step-by-step deployment of Kustodia V2 smart contracts to Arbitrum Mainnet using the new mainnet wallet: `0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F`

## 📋 Contracts to Deploy

### 1. KustodiaEscrow2_0 (Upgradeable)
- **Purpose**: Bridge-wallet-only escrow contract for modular payment flows
- **Features**: Multi-CLABE ready, vertical-specific escrows, ERC20 token support
- **Type**: UUPS Upgradeable Proxy
- **Bridge Wallet**: `0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F`
- **Platform Wallet**: `0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F`

### 2. UniversalAssetNFT
- **Purpose**: Universal Asset Provenance NFT System
- **Features**: Supports vehicles, real estate, machinery, and any high-value asset
- **Type**: Standard ERC721 with AccessControl
- **Admin Role**: `0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F`

## 🔧 Prerequisites

### 1. Environment Setup
Create/update your `.env` file with:

```bash
# Mainnet Private Key (for wallet 0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F)
MAINNET_PRIVATE_KEY=0x...

# Arbitrum Mainnet RPC
ARBITRUM_MAINNET_RPC_URL=https://arb1.arbitrum.io/rpc

# Optional: Arbiscan API Key for verification
ARBISCAN_API_KEY=your_arbiscan_api_key
```

### 2. Wallet Funding
- **Minimum Required**: 0.05 ETH
- **Recommended**: 0.1 ETH (for safety margin)
- **Network**: Arbitrum Mainnet
- **Address**: `0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F`

### 3. Dependencies
```bash
cd contracts
npm install
```

## 🚀 Deployment Steps

### Step 1: Pre-Deployment Checklist
Run the pre-deployment checklist to ensure everything is ready:

```bash
cd contracts
npx hardhat run scripts/preDeploymentChecklist.js --network arbitrum
```

This will check:
- ✅ Network connection (Arbitrum Mainnet)
- ✅ Wallet balance (minimum 0.05 ETH)
- ✅ Contract compilation
- ✅ Environment variables
- ✅ Gas estimation

### Step 2: Compile Contracts
```bash
npx hardhat compile
```

### Step 3: Deploy to Mainnet
```bash
npx hardhat run scripts/deployMainnet.js --network arbitrum
```

This will:
1. Deploy KustodiaEscrow2_0 as upgradeable proxy
2. Deploy UniversalAssetNFT
3. Verify deployment parameters
4. Save deployment data to `deployment-mainnet.json`
5. Generate environment template `.env.mainnet`

### Step 4: Verify Contracts on Arbiscan
```bash
npx hardhat run scripts/verifyMainnetContracts.js --network arbitrum
```

## 📊 Expected Deployment Results

After successful deployment, you'll get:

### Contract Addresses
```json
{
  "KustodiaEscrow2_0": {
    "proxy": "0x...",
    "implementation": "0x..."
  },
  "UniversalAssetNFT": {
    "address": "0x..."
  }
}
```

### Gas Costs (Estimated)
- **KustodiaEscrow2_0**: ~3,000,000 gas
- **UniversalAssetNFT**: ~2,500,000 gas
- **Total**: ~5,500,000 gas
- **Cost**: ~0.02-0.05 ETH (depending on gas price)

## 🔍 Post-Deployment Verification

### 1. Contract Verification on Arbiscan
- Escrow Proxy: `https://arbiscan.io/address/{proxy_address}`
- Escrow Implementation: `https://arbiscan.io/address/{implementation_address}`
- Universal Asset NFT: `https://arbiscan.io/address/{nft_address}`

### 2. Backend Integration
Update your backend environment variables:

```bash
# Add to backend/.env
KUSTODIA_ESCROW_CONTRACT_ADDRESS={escrow_proxy_address}
UNIVERSAL_ASSET_CONTRACT_ADDRESS={nft_address}
ARBITRUM_MAINNET_RPC_URL=https://arb1.arbitrum.io/rpc
MAINNET_CHAIN_ID=42161
```

### 3. Test Contract Interactions
```bash
# Test escrow contract
npx hardhat console --network arbitrum
> const escrow = await ethers.getContractAt("KustodiaEscrow2_0", "{proxy_address}")
> await escrow.bridgeWallet()

# Test NFT contract
> const nft = await ethers.getContractAt("UniversalAssetNFT", "{nft_address}")
> await nft.name()
```

## 🛡️ Security Considerations

### 1. Wallet Security
- ✅ Use hardware wallet for mainnet private key
- ✅ Store private key securely (never commit to git)
- ✅ Use environment variables for sensitive data

### 2. Contract Security
- ✅ Escrow contract uses bridge wallet restriction
- ✅ NFT contract uses role-based access control
- ✅ Upgradeable proxy uses UUPS pattern

### 3. Operational Security
- ✅ Verify all contract addresses before integration
- ✅ Test with small amounts first
- ✅ Monitor contract interactions

## 📝 Troubleshooting

### Common Issues

#### 1. "Insufficient funds for gas"
- **Solution**: Fund the wallet with more ETH
- **Check**: `npx hardhat run scripts/preDeploymentChecklist.js --network arbitrum`

#### 2. "Wrong network"
- **Solution**: Ensure you're connected to Arbitrum Mainnet (Chain ID: 42161)
- **Check**: Verify RPC URL in hardhat config

#### 3. "Contract verification failed"
- **Solution**: Wait a few minutes and retry verification
- **Alternative**: Manually verify on Arbiscan

#### 4. "Private key not found"
- **Solution**: Add `MAINNET_PRIVATE_KEY` to your `.env` file
- **Format**: Must be 64-character hex string starting with `0x`

### Getting Help
- Check deployment logs in `deployment-mainnet.json`
- Review transaction hashes on Arbiscan
- Verify contract addresses match expected values

## 🔄 Upgrade Path (Future)

### KustodiaEscrow2_0 Upgrades
Since the escrow contract is upgradeable:

```bash
# Deploy new implementation
npx hardhat run scripts/upgradeEscrow.js --network arbitrum

# Verify upgrade
npx hardhat verify --network arbitrum {new_implementation_address}
```

### UniversalAssetNFT
The NFT contract is not upgradeable. For major changes, deploy a new version and migrate data.

## 📊 Monitoring and Maintenance

### 1. Contract Monitoring
- Monitor contract interactions on Arbiscan
- Set up alerts for unusual activity
- Track gas usage and optimization opportunities

### 2. Regular Checks
- Verify contract balances
- Check role assignments
- Monitor upgrade events (for escrow contract)

### 3. Backup and Recovery
- Keep deployment data secure
- Backup private keys safely
- Document all contract addresses and configurations

---

## 🎉 Deployment Complete!

Once deployed successfully:

1. ✅ Update backend environment variables
2. ✅ Update frontend configuration
3. ✅ Test contract interactions
4. ✅ Monitor deployment
5. ✅ Document contract addresses

**Mainnet Wallet**: `0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F`
**Network**: Arbitrum Mainnet (Chain ID: 42161)
**Status**: Ready for production use

---

*Last updated: 2025-08-03*
