# 🚀 KUSTODIA WEB3 PAYMENT & WALLET TRACKER FLOW DOCUMENTATION

## 📋 Complete "Iniciar Pago Web3" Architecture Flow

### **OVERVIEW**
When a user clicks "Iniciar Pago Web3", Kustodia creates a complete Web3 escrow payment with on-chain transactions and provides a wallet tracker URL for real-time monitoring.

---

## 🎯 **PHASE 1: FRONTEND INITIATION (PagoFormFull2.tsx)**

### **User Experience Flow:**
```
1. 👤 User fills form: recipient email, amount, description
2. 🔍 Portal SDK checks MXNB balance (real-time)
3. ✅ Balance validation with "Max" button functionality
4. ⚠️  Insufficient balance warning (if needed)
5. 🚀 Click "Iniciar Pago Web3" button
6. 📡 API call: POST /api/payments/initiate-web3
7. ✅ Success: Tracker URL generated
8. 🔗 Redirect to: /dashboard/pagos/{payment.id}
```

### **Frontend Validation & UX Features:**
- **Real-time balance display** with Portal SDK integration
- **"Max" button** to use all available balance
- **Spanish localization** for all user messages
- **Enhanced error handling** with specific user feedback
- **Loading states** and input validation
- **Refresh balance** functionality
- **Insufficient balance warnings** before submission

### **Key Frontend Code Points:**
```typescript
// Balance check before payment
await checkBalance();
const requiredAmount = parseFloat(amount);
const currentBalance = parseFloat(balance || '0');

if (currentBalance < requiredAmount) {
  throw new Error(`Saldo insuficiente. Tienes ${balance} MXNB pero necesitas ${amount} MXNB para este pago.`);
}

// Success: Generate wallet tracker URL
setTrackerUrl(`/dashboard/pagos/${data.payment.id}`);
```

---

## 🏗️ **PHASE 2: BACKEND PAYMENT CREATION (paymentController.ts)**

### **Backend Architecture Flow:**
```
1. 🔐 JWT Authentication & User Validation
2. 📧 Recipient Lookup & Wallet Address Verification
3. 🔑 Portal Share Validation (for transaction signing)
4. 💾 Database Record Creation (Payment + Escrow)
5. ⛓️  On-Chain Escrow Creation (createV3Escrow)
6. 💰 On-Chain Escrow Funding (fundV3Escrow)
7. 📊 Status Updates & Event Logging
8. 📨 Notification System Activation
9. ✅ Return Payment Object with ID
```

### **Database Records Created:**
- **Payment Record**: `status: "authorizing" → "funding" → "in_custody"`
- **Escrow Record**: `status: "pending_creation" → "pending_funding" → "funded"`
- **Payment Events**: Detailed audit trail for every step
- **Notifications**: Email/system notifications to both parties

### **On-Chain Integration:**
```typescript
// 1. Create Escrow Smart Contract
const { escrowId, txHash: creationTxHash } = await createV3Escrow({
    payerAddress: payer.wallet_address,
    recipientAddress: recipient.wallet_address,
    amount: paymentAmount.toString(),
});

// 2. Fund Escrow with Portal MPC Signing
const { txHash: fundingTxHash } = await fundV3Escrow({
    funderAddress: payer.wallet_address,
    escrowId: escrowId,
    amount: paymentAmount.toString(),
    userPortalShare: payer.portal_share, // Portal MPC signing
});
```

### **Error Handling & Rollback:**
- **Structured error responses** for frontend display
- **Automatic rollback** on transaction failures
- **Payment status updates** to "failed" with detailed logging
- **Event tracking** for audit trails

---

## 📊 **PHASE 3: WALLET TRACKER SYSTEM**

### **Tracker URL Generation:**
After successful payment creation, the frontend receives:
```json
{
  "message": "Web3 payment created and funded successfully.",
  "payment": {
    "id": 123,
    "status": "in_custody",
    "escrow": {
      "smart_contract_escrow_id": "0x...",
      "blockchain_tx_hash": "0x...",
      "status": "funded"
    }
  }
}
```

### **Wallet Tracker Features:**
The tracker URL `/dashboard/pagos/{payment.id}` provides:

1. **Real-time Payment Status**
   - Current escrow status
   - Transaction hashes and block confirmations
   - Payment timeline with events

2. **Blockchain Integration**
   - Direct links to Arbitrum Sepolia explorer
   - Transaction verification
   - Smart contract interaction history

3. **Security & Transparency**
   - Complete audit trail
   - Immutable on-chain records
   - Portal MPC signature verification

4. **User Experience**
   - Spanish localized interface
   - Mobile-responsive design
   - Real-time updates and notifications

---

## 🔧 **TECHNICAL CONFIGURATION**

### **Portal SDK Integration:**
- **Chain ID**: `eip155:421614` (Arbitrum Sepolia)
- **MXNB Contract**: `0x82B9e52b26A2954E113F94Ff26647754d5a4247D`
- **Portal API**: v1 (confirmed compatibility with Arbitrum)
- **Frontend SDK**: All balance/signing operations
- **Backend**: Business logic and escrow orchestration only

### **Security Architecture:**
- **Passkey + Enclave Backup**: Portal share storage for MPC signing
- **JWT Authentication**: Secure API access
- **Multi-signature Escrow**: Smart contract protection
- **Audit Trail**: Complete payment event logging

---

## 🚦 **PAYMENT STATUS FLOW**

```
📝 authorizing → 💰 funding → 🏦 in_custody → ✅ completed
    ↓              ↓            ↓              ↓
  Created       On-Chain     Funds Held    Released
  Payment      Escrow       in Escrow     to Recipient
```

### **Status Definitions:**
- **authorizing**: Payment created, validating participants
- **funding**: On-chain escrow created, funding in progress
- **in_custody**: Funds secured in smart contract escrow
- **completed**: Payment released to recipient
- **failed**: Payment cancelled or transaction failed

---

## 🎯 **SUCCESS METRICS & MONITORING**

### **Key Performance Indicators:**
- **Payment Success Rate**: Transaction completion percentage
- **Average Processing Time**: End-to-end payment duration  
- **User Experience**: Error rates and user feedback
- **Security**: Failed transaction attempts and rollbacks

### **Monitoring & Alerts:**
- **Real-time transaction monitoring**
- **Balance validation accuracy**
- **Portal SDK integration health**
- **Smart contract interaction success**

---

## 🔮 **CRITICAL ISSUE & DEBUGGING PROGRESS**

❌ **CRITICAL ISSUE**: Portal SDK transactions are NOT executing on-chain despite UI showing success
✅ **FIXED**: Contract ABI and function signature issues
✅ **FIXED**: Contract address configuration (now uses environment variables)
✅ **WORKING**: Payment creation, escrow setup, and status tracking (UI/backend only)
🔧 **IN PROGRESS**: Comprehensive debugging added to Portal SDK transaction flow

## Critical Issue Identified (2025-07-08)

### Problem
- **Balance unchanged**: 1000 MXNB remains (should be 900 after 100 MXNB payment)
- **No Arbiscan transactions**: No on-chain activity detected
- **Transaction hash "undefined"**: Portal SDK not returning valid transaction hashes
- **UI shows success**: Frontend/backend flow works, but no blockchain interaction

### Root Cause
Portal SDK transactions (`portal.request()` calls) appear to be failing silently or not executing at all.

### Debugging Added
- Comprehensive console logging for token approval transaction
- Comprehensive console logging for escrow creation transaction
- Validation that Portal SDK responses are not null/undefined
- Explicit error handling for silent Portal SDK failures

### Contract Addresses Fixed
- Frontend now uses `NEXT_PUBLIC_ESCROW3_CONTRACT_ADDRESS` from environment
- Correct escrow contract: `0xeD766f75738C77179448A5BB98850358801B16e3`
- MXNB contract: `0x82B9e52b26A2954E113F94Ff26647754d5a4247D`

## Next Steps

1. **CRITICAL**: Test payment flow and review browser console output to identify Portal SDK failure point
2. **Debug Portal SDK**: Determine if issue is in token approval or escrow creation step
3. **Fix Portal Integration**: Ensure Portal SDK actually executes on-chain transactions
4. **Transaction Hash Extraction**: Extract real transaction hashes from Portal SDK responses
5. **End-to-End Validation**: Verify balance changes and Arbiscan transaction visibility

---

## 🎯 **PORTAL HACKATHON KIT BACKEND TRANSACTION PATTERN (2025-07-09)**

### **CRITICAL ARCHITECTURE DISCOVERY**
**❌ INCORRECT (Current Kustodia Implementation):**
```typescript
// Frontend directly calling Portal SDK for transactions (WRONG!)
const approvalTx = await portal.ethSendTransaction('eip155:421614', {
  to: MXNB_CONTRACT_ADDRESS,
  data: approveData,
  value: '0x0'
});
```

**✅ CORRECT (Portal Hackathon Kit Pattern):**
```typescript
// Backend handles transaction signing via Portal Enclave API
async transferAssets(
  clientApiKey: string,
  share: string,
  chain: string,
  to: string,
  amount: string,
  token: string
): Promise<SignTransactionResponse> {
  const response = await this.enclaveApi.post("/assets/send", {
    share, chain, to, amount, token, rpcUrl
  }, { headers: { Authorization: `Bearer ${clientApiKey}` } });
  return response.data;
}
```

### **Portal Hackathon Kit Analysis Summary**

#### **1. Chain Configuration (chains.ts)**
```typescript
export const CHAIN_CONFIGS: ChainConfig[] = [
  {
    id: "arbitrum-sepolia",
    name: "Arbitrum Sepolia",
    chainId: "eip155:421614",
    rpcUrl: "https://api.portalhq.io/rpc/v1/eip155/421614",
  },
];
```
- **Key Finding**: Uses **CAIP-2 format** (`eip155:421614`) for chain IDs
- **Key Finding**: Uses **Portal's official RPC endpoints**
- **Key Finding**: No custom host overrides, uses standard Portal infrastructure

#### **2. Database Schema (db.ts, init-db.ts)**
```typescript
interface Schema {
  signingShares: {
    id: string;
    clientId: string;
    curve: "SECP256K1" | "ED25519";
    share: string;  // <-- CRITICAL: Stores MPC share
    createdAt: string;
  }[];
}
```
- **Key Finding**: Stores **MPC signing shares** in database
- **Key Finding**: Associates shares with **Portal client IDs**
- **Key Finding**: Supports multiple curves (SECP256K1, ED25519)

#### **3. Backend Transaction Flow (transfer.ts)**
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { clientId, curve, chain, to, amount, token } = req.body;
  
  // 1. Get signing share from database
  const signingShares = await getClientSigningShares(clientId);
  const share = signingShares.find((s) => s.curve === curve);
  
  // 2. Create session token
  const sessionToken = await portalClient.createClientSessionToken(clientId);
  
  // 3. Use Portal Enclave API for transaction
  const result = await portalClient.transferAssets(
    sessionToken.clientSessionToken,
    share.share,  // <-- MPC share from database
    chain,
    to,
    amount,
    token
  );
  
  return res.status(200).json(result);
}
```

#### **4. Portal Client Implementation (portal.ts)**
```typescript
export class PortalClient {
  private enclaveApi: AxiosInstance;
  
  constructor(config: PortalClientConfig) {
    this.enclaveApi = axios.create({
      baseURL: "https://mpc-client.portalhq.io/v1",
      headers: { "Content-Type": "application/json" }
    });
  }
  
  async transferAssets(
    clientApiKey: string,
    share: string,  // <-- MPC share
    chain: string,  // <-- CAIP-2 format
    to: string,
    amount: string,
    token: string
  ): Promise<SignTransactionResponse> {
    const response = await this.enclaveApi.post("/assets/send", {
      share, chain, to, amount, token, rpcUrl: getRpcUrlByChainId(chain)
    }, { headers: { Authorization: `Bearer ${clientApiKey}` } });
    return response.data;
  }
}
```

### **Correct Architecture Pattern**

#### **Frontend Responsibilities:**
- ✅ Portal SDK initialization and wallet management
- ✅ Balance checking and display (`portal.getBalances()`)
- ✅ User interface and form validation
- ✅ Chain switching and wallet connection
- ❌ **NO transaction signing or sending**

#### **Backend Responsibilities:**
- ✅ Store and manage MPC signing shares
- ✅ Create Portal client session tokens
- ✅ Call Portal Enclave API for transaction signing
- ✅ Handle business logic (escrow creation, DB updates)
- ✅ Return transaction hashes and results to frontend

#### **Portal Infrastructure:**
- **Custodian API**: `https://api.portalhq.io/api/v3/custodians`
- **Client API**: `https://api.portalhq.io/api/v3/clients`
- **Enclave API**: `https://mpc-client.portalhq.io/v1` ⭐ **KEY for transactions**
- **RPC Endpoints**: `https://api.portalhq.io/rpc/v1/eip155/{chainId}`

### **Required Kustodia Refactor Plan**

#### **Phase 1: Backend API Creation**
1. **Create `/api/portal/approve-token` endpoint**
   - Input: `{ amount, tokenAddress, spenderAddress }`
   - Uses Portal Enclave API for ERC-20 approval
   - Returns transaction hash

2. **Create `/api/portal/create-escrow` endpoint**
   - Input: escrow parameters
   - Uses Portal Enclave API for contract interaction
   - Returns transaction hash and escrow ID

#### **Phase 2: Frontend Refactor**
1. **Remove direct Portal SDK transaction calls**
2. **Replace with backend API calls**:
   ```typescript
   // OLD (incorrect)
   const tx = await portal.ethSendTransaction(...);
   
   // NEW (correct)
   const response = await fetch('/api/portal/approve-token', {
     method: 'POST',
     body: JSON.stringify({ amount, tokenAddress, spenderAddress })
   });
   ```

#### **Phase 3: Database Integration**
1. **Ensure Portal shares are stored properly** in user records
2. **Map Kustodia user IDs to Portal client IDs**
3. **Store signing shares with correct curve types**

### **Expected Benefits**
- ✅ **Reliable transaction execution** (no more null/undefined)
- ✅ **Proper error handling** from Portal Enclave API
- ✅ **Real transaction hashes** returned from backend
- ✅ **On-chain balance changes** and Arbiscan visibility
- ✅ **Secure MPC signing** server-side
- ✅ **Consistent with Portal best practices**

---

## 🔮 **FUTURE ENHANCEMENTS**

### **Planned Improvements:**
- **WebSocket real-time updates** for tracker pages
- **Push notifications** for mobile users
- **Advanced analytics** and payment insights
- **Multi-token support** beyond MXNB
- **Batch payment capabilities**

---

*Generated: 2025-07-08 | Version: 1.0 | Kustodia Web3 Payment System*
