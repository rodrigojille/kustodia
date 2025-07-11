# Dispute Resolution & Payout Analysis

## Current State Analysis

### ✅ **What Works Currently**

#### 1. **Admin Dispute Resolution** (`adminResolveDispute`)
```javascript
// Two resolution types available:
if (resolution === "approved") {
  escrow.dispute_status = "resolved";
  escrow.status = "reverted";           // 🔑 KEY: Sets to "reverted"
  dispute.status = "resolved";
}
else if (resolution === "dismissed") {
  escrow.dispute_status = "dismissed";
  dispute.status = "dismissed";         // Payment can continue normally
}
```

#### 2. **Smart Contract Dispute Functions** (KustodiaEscrow2_0.sol)
```solidity
// Available contract functions:
function dispute(uint256 escrowId, string memory reason) external onlyBridge
function resolveDispute(uint256 escrowId, bool inFavorOfSeller) external onlyBridge

// Events emitted:
event EscrowDisputed(uint256 indexed escrowId, address by, string reason);
event EscrowDisputeResolved(uint256 indexed escrowId, bool inFavorOfSeller);

// Resolution logic:
if (inFavorOfSeller) {
    e.status = EscrowStatus.Funded;     // Can proceed to release
} else {
    e.status = EscrowStatus.Cancelled;
    // Refund to platformWallet (not payer!)
    require(IERC20(e.token).transfer(platformWallet, e.amount), "Refund failed");
}
```

#### 3. **SPEI Payout Infrastructure** (From payoutService.ts)
```javascript
// Functions available for MXN payouts:
- redeemMXNbForMXN(amount, payout_clabe, recipient_legal_name);
- sendMxnPayout(amount, payout_clabe, recipient_legal_name);
- releaseEscrowAndPayout(escrowId);
```

## ❌ **Current Gaps & Issues**

### 1. **No Automatic Refund to Buyer**
**Problem**: When admin resolves dispute in favor of buyer:
- ✅ Escrow status changes to "reverted"
- ❌ **NO automatic SPEI payout to buyer**
- ❌ Payment status remains unchanged
- ❌ No refund mechanism triggered

### 2. **Smart Contract Refund Goes to Platform**
**Problem**: Contract sends refunds to `platformWallet`, not to original payer
```solidity
// Current refund logic:
require(IERC20(e.token).transfer(platformWallet, e.amount), "Refund failed");
//                                ^^^^^^^^^^^^^^ Should be buyer's address!
```

### 3. **Hash Generation Issues**
**Problem**: Currently using mock hashes
```javascript
contractTxHash = "MOCK_RESOLVE_TX_HASH";
```

## 🔧 **Required Fixes**

### 1. **Create Refund Payout Service**
```javascript
// New function needed:
export async function refundPaymentToBuyer(paymentId: number) {
  // 1. Get payment and buyer details
  // 2. Get buyer's CLABE from payment.payer_clabe
  // 3. Use sendMxnPayout() to send refund to buyer
  // 4. Update payment status to "refunded" or "cancelled"
  // 5. Record payment events
}
```

### 2. **Update Admin Resolution to Trigger Refund**
```javascript
// In adminResolveDispute, when resolution === "approved":
if (resolution === "approved") {
  escrow.dispute_status = "resolved";
  escrow.status = "reverted";
  
  // 🔑 NEW: Trigger refund to buyer
  await refundPaymentToBuyer(escrow.payment.id);
  
  // Update payment status
  payment.status = "refunded";
  await paymentRepo.save(payment);
}
```

### 3. **Generate Real Transaction Hashes**
```javascript
// Option 1: Generate UUID-based hash
import { v4 as uuidv4 } from 'uuid';
contractTxHash = `dispute_${uuidv4()}`.replace(/-/g, '');

// Option 2: Use actual contract call if available
const tx = await contractInstance.resolveDispute(escrowId, resolution === "dismissed");
contractTxHash = tx.hash;
```

### 4. **Fix Smart Contract Refund Address**
```solidity
// In resolveDispute function:
if (!inFavorOfSeller) {
    e.status = EscrowStatus.Cancelled;
    // 🔑 FIX: Send to payer, not platformWallet
    require(IERC20(e.token).transfer(e.payer, e.amount), "Refund failed");
}
```

## 🛠️ **Implementation Plan**

### Step 1: Create Refund Service
```javascript
// File: backend/src/services/refundService.ts
export async function processDisputeRefund(paymentId: number) {
  const payment = await getPaymentWithBuyer(paymentId);
  const buyerClabe = payment.payer_clabe; // Buyer's bank account
  const amount = Number(payment.amount);
  
  // Use existing Juno payout infrastructure
  const refundResult = await sendMxnPayout(
    amount,
    buyerClabe,
    payment.payer_email
  );
  
  // Update statuses
  payment.status = "refunded";
  escrow.status = "refunded";
  
  // Record events
  await recordPaymentEvent(payment, 'dispute_refund_initiated', 'Refund to buyer initiated');
}
```

### Step 2: Update Dispute Controller
```javascript
// In adminResolveDispute:
if (resolution === "approved") {
  // Existing logic...
  
  // NEW: Process refund
  try {
    await processDisputeRefund(escrow.payment.id);
    await recordPaymentEvent(payment, 'dispute_refund_completed', 'Buyer refund successful');
  } catch (error) {
    await recordPaymentEvent(payment, 'dispute_refund_failed', `Refund failed: ${error.message}`);
  }
}
```

### Step 3: Update Frontend Status Mapping
```javascript
// Add new status to paymentStatuses.ts:
refunded: {
  label: 'Reembolsado',
  color: 'text-orange-600',
  bgColor: 'bg-orange-50',
  icon: '🔄'
}
```

## 🧪 **Testing Strategy**

### Test Case 1: Dispute Approved (Buyer Wins)
1. ✅ Create dispute on Payment 85
2. ✅ Admin resolves in favor of buyer
3. ✅ Verify refund SPEI is triggered
4. ✅ Check payment status becomes "refunded"
5. ✅ Verify buyer receives money

### Test Case 2: Dispute Dismissed (Seller Wins)
1. ✅ Create dispute
2. ✅ Admin dismisses dispute
3. ✅ Verify payment continues normal flow
4. ✅ Check escrow can be released to seller

## 🎯 **Answer to Your Questions**

### Q1: Can admin cancel payment and trigger SPEI payout to buyer?
**A: Yes, but needs implementation**
- ✅ Admin can resolve dispute in buyer's favor
- ❌ Currently NO automatic SPEI payout (needs to be built)
- ✅ Can reuse existing `sendMxnPayout()` infrastructure

### Q2: Can we generate our own hash?
**A: Yes, multiple options**
- ✅ UUID-based: `dispute_${uuidv4()}`
- ✅ Timestamp-based: `dispute_${Date.now()}_${escrowId}`
- ✅ Crypto hash: `crypto.createHash('sha256').update(data).digest('hex')`

### Q3: Does escrow contract have dispute events?
**A: Yes! ✅**
- ✅ `EscrowDisputed(escrowId, by, reason)`
- ✅ `EscrowDisputeResolved(escrowId, inFavorOfSeller)`
- ✅ Contract has full dispute lifecycle support

---

## 🚀 **Next Steps**

1. **Implement refund service** for buyer payouts
2. **Update admin resolution** to trigger refunds
3. **Generate real transaction hashes**
4. **Test end-to-end** dispute → resolution → refund flow
5. **Fix smart contract** refund address (optional)

**Ready to implement the missing refund functionality?**
