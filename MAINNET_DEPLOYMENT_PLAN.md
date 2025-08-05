# 🚀 **KUSTODIA MAINNET DEPLOYMENT PLAN**

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### ✅ **Prerequisites**
- [ ] **CLABE Issue Resolved** - Confirm Juno CLABE generation working
- [ ] **Mainnet Wallet Funded** - Ensure sufficient ETH/ARB for gas fees
- [ ] **Production Database Ready** - Heroku PostgreSQL configured
- [ ] **Domain SSL Certificates** - Verify HTTPS working
- [ ] **API Keys Validated** - Test all third-party integrations

---

## 🏗️ **DEPLOYMENT ARCHITECTURE**

### **Frontend**: Netlify
- **Repository**: Connected to main branch
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Domain**: `kustodia.mx` (production)

### **Backend**: Heroku
- **App Name**: `kustodia-backend-f991a7cb1824`
- **Database**: Heroku PostgreSQL
- **Domain**: `kustodia-backend-f991a7cb1824.herokuapp.com`

---

## 🔧 **ENVIRONMENT VARIABLES UPDATE PLAN**

### 🎯 **HEROKU (Backend) - Environment Variables to Update**

#### **1. Database Configuration**
```bash
# Switch from local to production database
DATABASE_URL=postgres://uchthfr0mvdlnac0:p7986abf93c3b7a0360729b52aec53ae7f0f5cf4af3244cd002a26a7670f566a@c7s7nzkb1hf97-cluster-czn5k6tjg7-ca-east-1-do.amazonaws.com:5432/d6qtm8crafubei
```

#### **2. Blockchain Configuration (MAINNET)**
```bash
# CRITICAL: Update to Arbitrum One mainnet
ETH_RPC_URL=https://arb1.arbitrum.io/rpc
ARBITRUM_SEPOLIA_RPC_URL=https://arb1.arbitrum.io/rpc

# MAINNET CONTRACT ADDRESSES (TO BE DEPLOYED)
UNIVERSAL_ASSET_CONTRACT_ADDRESS=<MAINNET_CONTRACT_ADDRESS>
MXNB_CONTRACT_ADDRESS=<MAINNET_MXNB_CONTRACT_ADDRESS>
ESCROW3_CONTRACT_ADDRESS=<MAINNET_ESCROW_CONTRACT_ADDRESS>

# PRODUCTION WALLET KEYS (SECURE)
ESCROW_PRIVATE_KEY=<PRODUCTION_ESCROW_PRIVATE_KEY>
KUSTODIA_PRIVATE_KEY=<PRODUCTION_KUSTODIA_PRIVATE_KEY>
```

#### **3. Multi-Sig Configuration (MAINNET)**
```bash
# PRODUCTION MULTI-SIG ADMIN WALLETS
MULTISIG_ADMIN_1_ADDRESS=<PRODUCTION_ADMIN_1_ADDRESS>
MULTISIG_ADMIN_2_ADDRESS=<PRODUCTION_ADMIN_2_ADDRESS>
MULTISIG_ADMIN_1_PRIVATE_KEY=<PRODUCTION_ADMIN_1_PRIVATE_KEY>
MULTISIG_ADMIN_2_PRIVATE_KEY=<PRODUCTION_ADMIN_2_PRIVATE_KEY>
```

#### **4. Juno API Configuration (PRODUCTION)**
```bash
# PRODUCTION JUNO CREDENTIALS
JUNO_CLIENT_API_KEY=<PRODUCTION_JUNO_API_KEY>
JUNO_CLIENT_SECRET=<PRODUCTION_JUNO_CLIENT_SECRET>
JUNO_WALLET=<PRODUCTION_JUNO_WALLET_ADDRESS>

# Remove staging/test variables
# JUNO_STAGE_API_KEY (remove)
# JUNO_STAGE_API_SECRET (remove)
```

#### **5. Frontend URL Configuration**
```bash
# Update to production frontend URL
FRONTEND_URL=https://kustodia.mx
```

#### **6. Security & JWT**
```bash
# Generate new production JWT secret
JWT_SECRET=<NEW_PRODUCTION_JWT_SECRET_256_BITS>
```

---

### 🌐 **NETLIFY (Frontend) - Environment Variables to Update**

#### **1. API Configuration**
```bash
# Point to production Heroku backend
NEXT_PUBLIC_API_BASE=https://kustodia-backend-f991a7cb1824.herokuapp.com
NEXT_PUBLIC_API_URL=https://kustodia-backend-f991a7cb1824.herokuapp.com
BACKEND_URL=https://kustodia-backend-f991a7cb1824.herokuapp.com
```

#### **2. Blockchain Configuration (MAINNET)**
```bash
# CRITICAL: Update to Arbitrum One mainnet
NEXT_PUBLIC_CHAIN_ID=eip155:42161
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL=https://arb1.arbitrum.io/rpc

# MAINNET CONTRACT ADDRESSES
NEXT_PUBLIC_MXNB_CONTRACT_ADDRESS=<MAINNET_MXNB_CONTRACT_ADDRESS>
NEXT_PUBLIC_ESCROW3_CONTRACT_ADDRESS=<MAINNET_ESCROW_CONTRACT_ADDRESS>
```

#### **3. Portal SDK (PRODUCTION)**
```bash
# PRODUCTION PORTAL CREDENTIALS
NEXT_PUBLIC_PORTAL_API_KEY=<PRODUCTION_PORTAL_API_KEY>
NEXT_PUBLIC_PORTAL_CLIENT_ID=<PRODUCTION_PORTAL_CLIENT_ID>
```

#### **4. Analytics & Tracking (PRODUCTION)**
```bash
# PRODUCTION ANALYTICS IDS
NEXT_PUBLIC_GA_MEASUREMENT_ID=<PRODUCTION_GA_ID>
NEXT_PUBLIC_GTM_ID=<PRODUCTION_GTM_ID>
NEXT_PUBLIC_POSTHOG_KEY=phc_jtqrce5L7vbEXOTbKH2tif2ZlFVeVC0FRLjXhQzvUdy
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

#### **5. WalletConnect & IPFS**
```bash
# PRODUCTION CREDENTIALS
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<PRODUCTION_WALLETCONNECT_PROJECT_ID>
NEXT_PUBLIC_PINATA_API_KEY=<PRODUCTION_PINATA_API_KEY>
NEXT_PUBLIC_PINATA_SECRET_KEY=<PRODUCTION_PINATA_SECRET_KEY>
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

---

## 🔐 **SECURITY CHECKLIST**

### **Critical Security Updates**
- [ ] **Generate New JWT Secret** (256-bit random)
- [ ] **Deploy New Smart Contracts** on Arbitrum One mainnet
- [ ] **Create Production Multi-Sig Wallets** (new addresses)
- [ ] **Rotate All API Keys** (Juno, Portal, Pinata, etc.)
- [ ] **Update Database Credentials** (production PostgreSQL)
- [ ] **Enable HTTPS Everywhere** (force SSL)
- [ ] **Configure CORS** (allow only kustodia.mx)

---

## 📦 **DEPLOYMENT SEQUENCE**

### **Phase 1: Smart Contract Deployment**
1. **Deploy MXNB Token Contract** on Arbitrum One
2. **Deploy Escrow Contract** on Arbitrum One
3. **Deploy Universal Asset Contract** on Arbitrum One
4. **Verify Contracts** on Arbiscan
5. **Test Contract Interactions** with production wallets

### **Phase 2: Backend Deployment (Heroku)**
1. **Update Heroku Environment Variables** (all production values)
2. **Deploy Backend** to Heroku
3. **Run Database Migrations** (if any)
4. **Test API Endpoints** with production database
5. **Verify Multi-Sig Integration** working

### **Phase 3: Frontend Deployment (Netlify)**
1. **Update Netlify Environment Variables** (all production values)
2. **Deploy Frontend** to Netlify
3. **Test Frontend-Backend Integration**
4. **Verify Wallet Connections** (MetaMask, WalletConnect)
5. **Test Complete Payment Flow**

### **Phase 4: Post-Deployment Validation**
1. **End-to-End Payment Test** (small amount)
2. **Multi-Sig Approval Test** (admin wallets)
3. **CLABE Generation Test** (Juno integration)
4. **SPEI Payout Test** (bank integration)
5. **Analytics Tracking Test** (PostHog, GA4)

---

## 🚨 **ROLLBACK PLAN**

### **If Issues Arise:**
1. **Frontend Rollback**: Revert Netlify to previous deployment
2. **Backend Rollback**: Revert Heroku to previous release
3. **Database Rollback**: Restore from backup (if needed)
4. **DNS Rollback**: Point domain back to staging (if needed)

---

## 📊 **MONITORING & ALERTS**

### **Post-Deployment Monitoring**
- [ ] **Heroku Logs** - Monitor for errors
- [ ] **Database Performance** - Check query performance
- [ ] **API Response Times** - Monitor latency
- [ ] **Transaction Success Rate** - Monitor blockchain interactions
- [ ] **Multi-Sig Approvals** - Monitor approval flow
- [ ] **User Analytics** - Monitor user behavior

---

## 🎯 **SUCCESS CRITERIA**

### **Deployment is Successful When:**
- [ ] **Frontend loads** at kustodia.mx
- [ ] **Backend API responds** at Heroku URL
- [ ] **Database connections** working
- [ ] **Wallet connections** working (MetaMask)
- [ ] **Smart contracts** deployed and verified
- [ ] **Multi-sig approvals** working end-to-end
- [ ] **CLABE generation** working (Juno)
- [ ] **Payment flow** completes successfully
- [ ] **Analytics tracking** working
- [ ] **No console errors** in production

---

## 📝 **DEPLOYMENT COMMANDS**

### **Heroku Deployment**
```bash
# Set all environment variables
heroku config:set DATABASE_URL="<PRODUCTION_DATABASE_URL>" --app kustodia-backend-f991a7cb1824
heroku config:set ETH_RPC_URL="https://arb1.arbitrum.io/rpc" --app kustodia-backend-f991a7cb1824
heroku config:set FRONTEND_URL="https://kustodia.mx" --app kustodia-backend-f991a7cb1824
# ... (set all other variables)

# Deploy
git push heroku main
```

### **Netlify Deployment**
```bash
# Environment variables set via Netlify dashboard
# Automatic deployment on git push to main branch
```

---

## ⚠️ **CRITICAL NOTES**

1. **NEVER commit production private keys** to git
2. **Test all integrations** before going live
3. **Have rollback plan ready** in case of issues
4. **Monitor closely** for first 24 hours
5. **Keep staging environment** for future testing

---

**🎉 Ready for Mainnet Deployment once CLABE issue is resolved!**
