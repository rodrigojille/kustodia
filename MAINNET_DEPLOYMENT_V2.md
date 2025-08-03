# 🚀 KUSTODIA MAINNET DEPLOYMENT V2
## Smart Contracts + Payment Automation System

**Deployment Date:** August 3, 2025  
**Version:** v2.0.0  
**Status:** READY FOR DEPLOYMENT  

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ **FINAL TESTS COMPLETED**
- [x] **Payment 148**: $5,000 split payment (50/50) - SUCCESS
- [x] **Payment 149**: $30,000 multi-sig payment - SUCCESS  
- [x] **Payment 150**: $5,000 cobro inteligente - SUCCESS
- [x] **Cobro Inteligente Tracker**: Fixed and functional
- [x] **Bridge Wallet Monitoring**: Implemented and tested
- [x] **Email Notifications**: Personalized with full names
- [x] **Database Migrations**: All applied successfully

### ✅ **SYSTEM READINESS**
- [x] **Automation Service**: Running and tested
- [x] **Multi-sig Workflow**: Validated with $30K test
- [x] **Dual Approval Tracking**: Unified across payment types
- [x] **Smart Contract Integration**: Escrow creation/funding tested
- [x] **Juno API Integration**: Mock deposits successful
- [x] **Notification System**: SendGrid configured and tested

---

## 🔧 MAINNET DEPLOYMENT STEPS

### **PHASE 1: SMART CONTRACTS DEPLOYMENT**

#### **1.1 Deploy EscrowV2 Contract**
```bash
# Navigate to contracts directory
cd contracts

# Deploy to Arbitrum Mainnet
npx hardhat run scripts/deploy-escrow-v2.js --network arbitrum-mainnet

# Verify contract on Arbiscan
npx hardhat verify --network arbitrum-mainnet <CONTRACT_ADDRESS>
```

#### **1.2 Deploy NFT Contract (if applicable)**
```bash
# Deploy NFT contract for tokenized assets
npx hardhat run scripts/deploy-nft.js --network arbitrum-mainnet

# Verify NFT contract
npx hardhat verify --network arbitrum-mainnet <NFT_CONTRACT_ADDRESS>
```

#### **1.3 Update Contract Addresses**
Update the following files with new mainnet contract addresses:
- `backend/src/config/contracts.ts`
- `frontend/src/config/contracts.ts`
- `backend/src/services/SmartContractService.ts`

### **PHASE 2: ENVIRONMENT MIGRATION**

#### **2.1 Backend Environment Variables**
Update `.env.production`:
```env
# Database
DATABASE_URL=postgresql://[MAINNET_DB_URL]

# Juno API (Production)
JUNO_API_URL=https://api.juno.finance
JUNO_API_KEY=[PRODUCTION_API_KEY]
JUNO_API_SECRET=[PRODUCTION_SECRET]

# Blockchain
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
PRIVATE_KEY=[MAINNET_PRIVATE_KEY]
ESCROW_CONTRACT_ADDRESS=[NEW_V2_CONTRACT_ADDRESS]

# Email
SENDGRID_API_KEY=[PRODUCTION_SENDGRID_KEY]

# Security
JWT_SECRET=[PRODUCTION_JWT_SECRET]
ENCRYPTION_KEY=[PRODUCTION_ENCRYPTION_KEY]
```

#### **2.2 Frontend Environment Variables**
Update `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://api.kustodia.mx
NEXT_PUBLIC_ARBITRUM_RPC=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_ESCROW_CONTRACT=[NEW_V2_CONTRACT_ADDRESS]
NEXT_PUBLIC_CHAIN_ID=42161
```

### **PHASE 3: DATABASE MIGRATION**

#### **3.1 Production Database Setup**
```bash
# Run all pending migrations
npm run migration:run

# Verify all tables and indexes
npm run migration:show
```

#### **3.2 Data Validation**
- Verify all payment types are supported
- Confirm commission structures are correct
- Validate user permissions and roles

### **PHASE 4: DEPLOYMENT EXECUTION**

#### **4.1 Backend Deployment**
```bash
# Build production backend
npm run build

# Deploy to production server
# (Specific commands depend on your hosting provider)
```

#### **4.2 Frontend Deployment**
```bash
# Build production frontend
npm run build

# Deploy to production CDN/hosting
# (Specific commands depend on your hosting provider)
```

#### **4.3 Automation Service**
```bash
# Start payment automation service
npm run start:automation

# Verify service is running
curl https://api.kustodia.mx/automation/status
```

---

## 🔍 POST-DEPLOYMENT VALIDATION

### **CRITICAL TESTS TO PERFORM**

#### **Test 1: Small Payment Flow**
- Create $100 MXN payment
- Verify SPEI deposit detection
- Confirm escrow creation with new V2 contract
- Validate email notifications
- Test dual approval workflow

#### **Test 2: Multi-sig Flow**  
- Create $10,000 MXN payment (above threshold)
- Verify multi-sig transaction creation
- Test admin approval workflow
- Confirm escrow execution

#### **Test 3: Cobro Inteligente**
- Create cobro inteligente payment
- Verify tracker functionality
- Test dual approval process
- Confirm commission distribution

### **MONITORING CHECKLIST**
- [ ] **Bridge Wallet Balance**: Monitor MXNB levels
- [ ] **Automation Service**: Verify 1-minute cycles
- [ ] **Smart Contract Events**: Monitor escrow creation
- [ ] **Email Delivery**: Verify SendGrid delivery rates
- [ ] **Database Performance**: Monitor query performance
- [ ] **API Response Times**: Verify < 2s response times

---

## 🚨 ROLLBACK PLAN

### **If Issues Arise:**

#### **Immediate Actions:**
1. **Stop Automation Service**
   ```bash
   pm2 stop payment-automation
   ```

2. **Revert to Previous Version**
   ```bash
   git checkout [PREVIOUS_STABLE_COMMIT]
   npm run build && npm run deploy
   ```

3. **Database Rollback** (if needed)
   ```bash
   npm run migration:revert
   ```

#### **Communication Plan:**
- Notify all stakeholders immediately
- Update status page with incident details
- Provide ETA for resolution

---

## 📊 SUCCESS METRICS

### **Day 1 Targets:**
- ✅ Zero critical errors
- ✅ All payment flows functional
- ✅ < 2 second API response times
- ✅ 99%+ email delivery rate
- ✅ Bridge wallet balance > 10K MXNB

### **Week 1 Targets:**
- ✅ Process minimum 10 payments successfully
- ✅ Multi-sig workflow tested with real transactions
- ✅ Zero security incidents
- ✅ User satisfaction > 95%

---

## 🔐 SECURITY CONSIDERATIONS

### **Pre-Deployment Security Audit:**
- [x] Smart contract security review completed
- [x] Private keys securely stored in production
- [x] API endpoints properly authenticated
- [x] Database access restricted
- [x] HTTPS enforced across all services

### **Ongoing Security Monitoring:**
- Monitor for unusual transaction patterns
- Track failed authentication attempts
- Verify smart contract interactions
- Regular security scans

---

## 📞 EMERGENCY CONTACTS

**Technical Team:**
- Lead Developer: [Your Contact]
- DevOps Engineer: [Contact]
- Security Lead: [Contact]

**Business Team:**
- Product Manager: [Contact]
- Customer Support: [Contact]

---

## 🎯 DEPLOYMENT AUTHORIZATION

**Final Approval Required From:**
- [ ] Technical Lead
- [ ] Product Manager  
- [ ] Security Team
- [ ] Business Owner

**Deployment Window:** August 3, 2025, 4:00 PM - 6:00 PM CST

---

**🚀 READY TO DEPLOY MAINNET V2!**

*All systems tested, validated, and ready for production deployment.*
