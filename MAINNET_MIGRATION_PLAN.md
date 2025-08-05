# 🚀 KUSTODIA MAINNET MIGRATION PLAN
**Date:** August 3, 2025  
**Status:** READY FOR CONTROLLED ROLLOUT

## 🎯 OBJECTIVE
Safely migrate from Arbitrum testnet to mainnet with zero downtime and full rollback capability.

---

## 📋 PHASE 1: PREPARATION & TESTING (CURRENT)

### ✅ COMPLETED
- [x] Smart contracts deployed to Arbitrum mainnet
- [x] Contracts verified on Arbiscan
- [x] Emergency pause functionality tested
- [x] Role-based access control configured

### 🔄 MAINNET CONTRACT ADDRESSES
```bash
# Arbitrum Mainnet - PRODUCTION
ESCROW_V2_PAUSABLE_ADDRESS=0x82fE581F39B1701b6E7Bd0247AFD2aF08ce04c40
NFT_COMPACT_ADDRESS=0x00AcCA0E565b11749d5316512135D75bf9e971bd
ASSET_MANAGEMENT_LIB=0xB712d770eedcfa4D6647fE4545CC9020A612adA4
```

### 🧪 CURRENT TESTNET ADDRESSES (BACKUP)
```bash
# Arbitrum Sepolia - TESTNET (PRESERVE)
ESCROW_ADDRESS=0x[testnet_escrow_address]
NFT_ADDRESS=0x[testnet_nft_address]
```

---

## 📋 PHASE 2: CONTROLLED ENVIRONMENT SETUP

### 🎯 STRATEGY: DUAL ENVIRONMENT APPROACH
1. **Keep testnet running** (fallback safety)
2. **Create mainnet staging environment**
3. **Gradual migration with rollback capability**

### 🔧 ENVIRONMENT CONFIGURATION

#### **A. Backend Environment Variables**
```bash
# Create new environment files
.env.mainnet          # Production mainnet config
.env.testnet          # Preserve current testnet config
.env.local            # Local development (points to testnet initially)
```

#### **B. Database Strategy**
```bash
# Option 1: Separate Databases (RECOMMENDED)
kustodia_testnet      # Keep existing data safe
kustodia_mainnet      # New production database

# Option 2: Single Database with Environment Flags
environment_flag      # 'testnet' | 'mainnet' column in transactions
```

#### **C. Juno Configuration**
```bash
# Current: Testnet Juno
juno_testnet_config   # Preserve existing setup

# New: Mainnet Juno  
juno_mainnet_config   # New production configuration
```

---

## 📋 PHASE 3: CONTROLLED TESTING PLAN

### 🧪 TEST SCENARIOS (MAINNET STAGING)

#### Phase 1: Smart Contract Deployment ✅ COMPLETE

### ✅ DEPLOYED CONTRACTS
- **EscrowV2 Pausable**: 0x82fE581F39B1701b6E7Bd0247AFD2aF08ce04c40
- **NFT Compact**: 0x00AcCA0E565b11749d5316512135D75bf9e971bd
- **AssetManagement Library**: 0xB712d770eedcfa4D6647fE4545CC9020A612adA4

### ✅ VALIDATION RESULTS (9/9 PASSED)
- ✅ Escrow Not Paused
- ✅ NFT Not Paused  
- ✅ Owner Has Pauser Role
- ✅ Admin Role Assigned
- ✅ Pauser Role Assigned
- ✅ Kustodia Role Assigned
- ✅ Escrow Integration (KUSTODIA_ROLE confirmed)
- ✅ Library Deployed (2,868 bytes)
- ✅ Arbitrum Mainnet Confirmed (Chain ID: 42161)

### ✅ ACTUAL COSTS
- **Total Gas Used**: ~0.0007 ETH
- **Remaining Balance**: ~0.0096 ETH
- **Status**: All contracts verified on Arbiscan

#### **Test 1: Contract Interaction**
- [ ] Deploy test NFT asset
- [ ] Create test escrow transaction
- [ ] Verify event emissions
- [ ] Test pause/unpause functionality

#### **Test 1: Mainnet Testing Protocol - AFTERNOON (1:00 PM - 4:00 PM)**
- [ ] **Test 1**: Create small NFT asset ($10 value) - 1:00 PM
- [ ] **Test 2**: Small escrow transaction ($50) - 1:30 PM
- [ ] **Test 3**: Medium transaction ($500) - 2:00 PM
- [ ] **Test 4**: Test pause functionality (emergency drill) - 2:30 PM
- [ ] **Test 5**: Multi-sig approval workflow - 3:00 PM
- [ ] **Test 6**: Bridge wallet monitoring - 3:30 PM
- [ ] **Final validation**: Run full validation script - 4:00 PM

#### **Test 2: Payment Flow**
- [ ] Small MXNB transaction ($10 USD equivalent)
- [ ] Verify escrow custody
- [ ] Test release mechanism
- [ ] Validate commission splits

#### **Test 3: Emergency Procedures**
- [ ] Test contract pause
- [ ] Verify transaction blocking
- [ ] Test contract unpause
- [ ] Validate normal operations resume

#### **Test 4: Integration Testing**
- [ ] Frontend → Backend → Blockchain flow
- [ ] Email notifications
- [ ] Database consistency
- [ ] API response validation

---

## 📋 PHASE 4: GRADUAL ROLLOUT STRATEGY

### 🎯 ROLLOUT APPROACH: CANARY DEPLOYMENT

#### **Stage 1: Internal Testing (1-2 days)**
- **Scope**: Development team only
- **Transactions**: Test transactions with small amounts
- **Monitoring**: Full logging and monitoring
- **Rollback**: Immediate if any issues

#### **Stage 2: Beta Users (3-5 days)**
- **Scope**: 5-10 trusted users
- **Transactions**: Real but small transactions ($100-500)
- **Monitoring**: Enhanced monitoring and user feedback
- **Rollback**: Quick rollback capability maintained

#### **Stage 3: Limited Production (1 week)**
- **Scope**: 25% of new transactions
- **Transactions**: All transaction sizes
- **Monitoring**: Full production monitoring
- **Rollback**: Controlled rollback with user notification

#### **Stage 4: Full Production**
- **Scope**: 100% of transactions
- **Monitoring**: Standard production monitoring
- **Testnet**: Maintained as development environment

---

## 📋 PHASE 5: TECHNICAL IMPLEMENTATION

### 🔧 BACKEND CHANGES REQUIRED

#### Phase 2: Environment Configuration - AUGUST 4, 2025 🚀

**PRIORITY: HIGH - READY FOR IMPLEMENTATION**

#### **1. Environment Configuration**
```typescript
// config/environment.ts
export const config = {
  network: process.env.BLOCKCHAIN_NETWORK || 'testnet', // 'testnet' | 'mainnet'
  contracts: {
    escrow: process.env.ESCROW_ADDRESS,
    nft: process.env.NFT_ADDRESS,
  },
  rpc: {
    testnet: process.env.ARBITRUM_TESTNET_RPC_URL,
    mainnet: process.env.ARBITRUM_MAINNET_RPC_URL,
  }
}
```

#### **Backend Environment Update - MORNING (9:00 AM)**
- **Switch to mainnet environment**:
  ```powershell
  .\scripts\switch-environment.ps1 mainnet
  ```
- **Update environment variables**:
  - `ESCROW_V2_PAUSABLE_ADDRESS=0x82fE581F39B1701b6E7Bd0247AFD2aF08ce04c40`
  - `NFT_COMPACT_ADDRESS=0x00AcCA0E565b11749d5316512135D75bf9e971bd`
  - `ASSET_MANAGEMENT_LIB=0xB712d770eedcfa4D6647fE4545CC9020A612adA4`
- **Verify backend builds successfully**
- **Test API connectivity to mainnet contracts**
- **Confirm database migrations are applied**

#### **2. Database Migration Strategy**
```sql
-- Add environment tracking
ALTER TABLE payments ADD COLUMN blockchain_network VARCHAR(20) DEFAULT 'testnet';
ALTER TABLE escrows ADD COLUMN blockchain_network VARCHAR(20) DEFAULT 'testnet';

-- Create indexes for performance
CREATE INDEX idx_payments_network ON payments(blockchain_network);
CREATE INDEX idx_escrows_network ON escrows(blockchain_network);
```

#### **3. Contract Service Updates**
```typescript
// services/contractService.ts
class ContractService {
  private getContractAddresses() {
    const network = config.network;
    return {
      escrow: network === 'mainnet' ? config.contracts.mainnet.escrow : config.contracts.testnet.escrow,
      nft: network === 'mainnet' ? config.contracts.mainnet.nft : config.contracts.testnet.nft,
    };
  }
}

### 🔧 FRONTEND CHANGES REQUIRED

#### **1. Environment Detection**
```typescript
// config/blockchain.ts
export const BLOCKCHAIN_CONFIG = {
  network: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK || 'testnet',
  contracts: {
    testnet: {
      escrow: '0x[testnet_escrow]',
      nft: '0x[testnet_nft]',
    },
    mainnet: {
      escrow: '0x82fE581F39B1701b6E7Bd0247AFD2aF08ce04c40',
      nft: '0x00AcCA0E565b11749d5316512135D75bf9e971bd',
    }
  }
};
```

#### **Frontend Configuration - MORNING (10:00 AM)**
- **Update contract addresses** in frontend config
- **Update ABI files** for compact NFT contract
- **Configure Arbitrum mainnet** network settings
- **Test MetaMask connectivity** to mainnet
- **Verify payment flow UI** works with new contracts
- **Test transaction signing** and submission

#### **2. Network Indicator**
```tsx
// components/NetworkIndicator.tsx
const NetworkIndicator = () => {
  const isMainnet = config.network === 'mainnet';
  return (
    <div className={`network-badge ${isMainnet ? 'mainnet' : 'testnet'}`}>
      {isMainnet ? '🟢 MAINNET' : '🟡 TESTNET'}
    </div>
  );
};
```

### 🔧 JUNO CONFIGURATION

#### **1. Mainnet Juno Setup**
```bash
# New Juno configuration for mainnet
juno_mainnet/
├── config.yaml           # Mainnet RPC endpoints
├── genesis.json          # Mainnet genesis
└── docker-compose.yml    # Mainnet services
```

#### **2. Dual Juno Setup**
```bash
# Run both environments
docker-compose -f juno-testnet.yml up -d    # Port 8080
docker-compose -f juno-mainnet.yml up -d    # Port 8081
```

---

## 📋 PHASE 6: MONITORING & SAFETY

### 🔍 MONITORING REQUIREMENTS

#### **1. Smart Contract Monitoring**
- [ ] Transaction success rates
- [ ] Gas usage patterns
- [ ] Contract pause events
- [ ] Role change events

#### **2. Application Monitoring**
- [ ] API response times
- [ ] Database query performance
- [ ] Error rates by environment
- [ ] User transaction patterns

#### **3. Financial Monitoring**
- [ ] MXNB token balances
- [ ] Escrow custody amounts
- [ ] Commission distribution accuracy
- [ ] Failed transaction recovery

### 🚨 EMERGENCY PROCEDURES

#### **1. Immediate Rollback Triggers**
- Smart contract exploit detected
- >5% transaction failure rate
- Critical bug in payment processing
- Regulatory compliance issue

#### **2. Rollback Process**
```bash
# 1. Pause mainnet contracts
npx hardhat run scripts/pauseContracts.js --network arbitrum-mainnet

# 2. Switch environment variables
cp .env.testnet .env.production

# 3. Restart services
docker-compose restart backend frontend

# 4. Notify users
# Send notification about temporary maintenance
```

#### **3. Recovery Process**
- Fix identified issues
- Test fixes on testnet
- Unpause mainnet contracts
- Resume mainnet operations

---

## 📋 PHASE 7: DEPLOYMENT CHECKLIST

### ✅ PRE-DEPLOYMENT
- [ ] Backup current testnet database
- [ ] Create mainnet environment files
- [ ] Deploy mainnet Juno setup
- [ ] Test all monitoring systems
- [ ] Prepare rollback scripts

### ✅ DEPLOYMENT
- [ ] Deploy backend with dual environment support
- [ ] Deploy frontend with network detection
- [ ] Configure load balancers for gradual rollout
- [ ] Enable monitoring and alerting
- [ ] Execute Stage 1 testing

### ✅ POST-DEPLOYMENT
- [ ] Monitor all systems for 24 hours
- [ ] Validate transaction accuracy
- [ ] Check user experience metrics
- [ ] Document any issues and resolutions
- [ ] Plan Stage 2 rollout

---

## 📋 RISK MITIGATION

### 🛡️ SAFETY MEASURES
1. **Dual Environment**: Keep testnet operational
2. **Gradual Rollout**: Limit exposure during testing
3. **Emergency Pause**: Smart contract pause capability
4. **Quick Rollback**: Automated rollback procedures
5. **Comprehensive Monitoring**: Real-time issue detection

### 💰 FINANCIAL SAFEGUARDS
1. **Small Test Amounts**: Start with minimal transactions
2. **Escrow Monitoring**: Real-time custody tracking
3. **Commission Validation**: Automated accuracy checks
4. **Balance Reconciliation**: Daily balance verification

---

## 📋 SUCCESS CRITERIA

### 🎯 STAGE COMPLETION METRICS
- **Stage 1**: 100% test transaction success
- **Stage 2**: >99% user satisfaction, <1% error rate
- **Stage 3**: >99.5% uptime, <0.5% transaction failures
- **Stage 4**: Full production stability

### 🏆 FINAL SUCCESS METRICS
- Zero data loss during migration
- <1 hour total downtime
- >99.9% transaction success rate
- Positive user feedback
- Successful emergency procedure tests

---

## 📅 TIMELINE

### **Week 1: Preparation**
- Days 1-2: Environment setup and configuration
- Days 3-4: Backend and frontend modifications
- Days 5-7: Testing and validation

### **Week 2: Controlled Rollout**
- Days 1-2: Stage 1 (Internal testing)
- Days 3-5: Stage 2 (Beta users)
- Days 6-7: Stage 3 preparation

### **Week 3: Production Migration**
- Days 1-7: Stage 3 (Limited production)
- Monitor and optimize

### **Week 4: Full Production**
- Days 1-3: Stage 4 (Full production)
- Days 4-7: Monitoring and optimization

---

## 🎯 NEXT IMMEDIATE STEPS

1. **Review and approve this plan**
2. **Create environment configuration files**
3. **Set up mainnet Juno infrastructure**
4. **Begin backend dual-environment implementation**
5. **Schedule Stage 1 testing window**

**STATUS: 📋 PLAN READY FOR APPROVAL AND EXECUTION**
