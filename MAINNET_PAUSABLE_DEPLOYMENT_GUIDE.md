# Kustodia V2 Pausable Contracts - Mainnet Deployment Guide

## 🎯 Overview

This guide covers the deployment of **pausable and upgradeable** versions of Kustodia's smart contracts to Arbitrum mainnet. These contracts include emergency pause functionality and role-based access control for enhanced security.

## 📋 Contracts to Deploy

### 1. KustodiaEscrow2_0Pausable
- **Type**: Upgradeable UUPS Proxy + Pausable
- **Features**: 
  - Bridge-wallet-only escrow for modular payment flows
  - Emergency pause/unpause functionality
  - Role-based pauser management
  - Multi-CLABE ready, vertical-specific escrows
  - ERC20 token support

### 2. UniversalAssetNFTPausable  
- **Type**: Upgradeable UUPS Proxy + Pausable
- **Features**:
  - Universal Asset Provenance NFT System
  - Emergency pause/unpause functionality
  - Role-based access control with pauser role
  - Supports vehicles, real estate, machinery, high-value assets

## 🔧 Pre-Deployment Setup

### 1. Environment Variables
Create a `.env` file with the following variables:

```bash
# Required for deployment
MAINNET_PRIVATE_KEY=your_mainnet_private_key_here
ARBITRUM_MAINNET_RPC_URL=https://arb1.arbitrum.io/rpc

# Optional for contract verification
ARBISCAN_API_KEY=your_arbiscan_api_key_here

# MXNB token integration
MXNB_TOKEN_ADDRESS=0xf197ffc28c23e0309b5559e7a166f2c6164c80aa
```

### 2. Wallet Configuration
- **Mainnet Wallet**: `0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F`
- **Target Network**: Arbitrum Mainnet (Chain ID: 42161)
- **Minimum Balance**: 0.05 ETH (recommended: 0.1 ETH)

### 3. Role Assignments
Both contracts will be deployed with the following roles:
- **Admin Role**: `0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F`
- **Pauser Role**: `0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F`
- **Bridge Wallet** (Escrow): `0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F`
- **Platform Wallet** (Escrow): `0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F`

## 🚀 Deployment Steps

### Step 1: Pre-Deployment Validation
```bash
cd contracts
npx hardhat run scripts/preDeploymentChecklist.js --network arbitrum-mainnet
```

This will check:
- ✅ Network connectivity and chain ID
- ✅ Wallet balance and address validation
- ✅ Contract compilation (pausable versions)
- ✅ Environment variables
- ✅ Gas estimation with proxy overhead

### Step 2: Compile Contracts
```bash
npx hardhat compile
```

Ensure both pausable contracts compile successfully:
- `KustodiaEscrow2_0Pausable.sol`
- `UniversalAssetNFTPausable.sol`

### Step 3: Deploy to Mainnet
```bash
npx hardhat run scripts/deployMainnetPausable.js --network arbitrum-mainnet
```

The deployment script will:
1. Deploy implementation contracts
2. Deploy UUPS proxy contracts
3. Initialize contracts with proper roles
4. Verify contracts on Arbiscan
5. Generate deployment summary
6. Create `.env.mainnet.pausable` template

### Step 4: Post-Deployment Verification

#### Verify Contract Deployment
Check that contracts are deployed and verified on Arbiscan:
- Implementation contracts should be verified automatically
- Proxy contracts should show proper initialization

#### Verify Role Assignments
The deployment script will automatically verify:
- Admin roles are assigned correctly
- Pauser roles are assigned correctly
- Bridge wallet has proper permissions
- Contracts are not paused initially

#### Test Pause Functionality
After deployment, test the pause functionality:
```bash
# This will be included in the deployment script
# Contracts should be deployed in unpaused state
# Admin should be able to pause/unpause
```

## 📊 Estimated Costs

### Gas Estimates
- **Escrow Implementation**: ~3,500,000 gas
- **NFT Implementation**: ~3,000,000 gas
- **Proxy Deployments**: ~1,000,000 gas (2 proxies)
- **Initialization**: ~500,000 gas
- **Total**: ~8,000,000 gas

### ETH Cost (at 0.5 gwei)
- **Total Cost**: ~0.004 ETH
- **With Safety Margin**: ~0.01 ETH
- **Recommended Balance**: 0.1 ETH

## 🔒 Security Features

### Pausable Functionality
- **Emergency Pause**: Authorized pausers can pause contracts in emergencies
- **Role-Based Control**: Only `PAUSER_ROLE` holders can pause/unpause
- **State Protection**: All state-changing functions respect pause state
- **Granular Control**: Each contract can be paused independently

### Upgradeable Architecture
- **UUPS Pattern**: Upgrade logic is in implementation contract
- **Admin Control**: Only admin can authorize upgrades
- **Initialization**: Proper initialization prevents implementation hijacking
- **Storage Safety**: Upgrades maintain storage layout compatibility

### Access Control
- **Role Hierarchy**: Admin can grant/revoke pauser roles
- **Bridge Restrictions**: Escrow functions restricted to bridge wallet
- **Multi-Role Support**: Contracts support multiple role holders

## 📝 Post-Deployment Actions

### 1. Update Backend Configuration
Update your backend environment with new contract addresses:
```bash
# Add to your backend .env
ESCROW_CONTRACT_ADDRESS=0x... # From deployment output
NFT_CONTRACT_ADDRESS=0x...    # From deployment output
```

### 2. Update Frontend Configuration
Update frontend contract addresses and ABIs:
- Copy new contract addresses from deployment output
- Update ABI files with pausable contract ABIs
- Test pause state detection in UI

### 3. Integration Testing
- Test normal escrow creation and release
- Test NFT minting and transfers
- Test pause/unpause functionality
- Verify role-based access control
- Test upgrade functionality (on testnet first)

### 4. Monitoring Setup
- Monitor contract pause states
- Set up alerts for pause events
- Monitor role changes
- Track upgrade events

## 🚨 Emergency Procedures

### Pausing Contracts
If emergency pause is needed:
```bash
# Using ethers.js or web3
await escrowContract.pause(); // Must be called by PAUSER_ROLE
await nftContract.pause();    // Must be called by PAUSER_ROLE
```

### Unpausing Contracts
When safe to resume:
```bash
await escrowContract.unpause(); // Must be called by PAUSER_ROLE
await nftContract.unpause();    // Must be called by PAUSER_ROLE
```

### Role Management
- **Add Pauser**: `grantRole(PAUSER_ROLE, newPauserAddress)`
- **Remove Pauser**: `revokeRole(PAUSER_ROLE, pauserAddress)`
- **Transfer Admin**: `grantRole(DEFAULT_ADMIN_ROLE, newAdminAddress)`

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Wallet funded with sufficient ETH
- [ ] Contracts compiled successfully
- [ ] Pre-deployment checklist passed
- [ ] Network configuration verified

### During Deployment
- [ ] Implementation contracts deployed
- [ ] Proxy contracts deployed
- [ ] Contracts initialized properly
- [ ] Role assignments verified
- [ ] Contracts verified on Arbiscan

### Post-Deployment
- [ ] Contract addresses recorded
- [ ] Backend configuration updated
- [ ] Frontend configuration updated
- [ ] Pause functionality tested
- [ ] Role management tested
- [ ] Integration tests passed
- [ ] Monitoring setup complete

## 🔗 Important Links

- **Arbitrum Mainnet Explorer**: https://arbiscan.io/
- **Arbitrum Mainnet RPC**: https://arb1.arbitrum.io/rpc
- **Chain ID**: 42161
- **Gas Price**: Check current rates on Arbiscan

## 📞 Support

If you encounter issues during deployment:
1. Check the deployment logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure sufficient ETH balance for gas fees
4. Confirm network connectivity to Arbitrum mainnet
5. Review contract compilation for any errors

## 🎉 Success Criteria

Deployment is successful when:
- ✅ Both contracts deployed and verified on Arbiscan
- ✅ All roles assigned correctly
- ✅ Contracts are unpaused and functional
- ✅ Backend can interact with contracts
- ✅ Frontend displays contract information
- ✅ Pause/unpause functionality works
- ✅ Integration tests pass

---

**Ready for Mainnet Deployment!** 🚀

This guide ensures a secure, pausable, and upgradeable deployment of Kustodia's smart contracts with comprehensive emergency controls and role-based security.
