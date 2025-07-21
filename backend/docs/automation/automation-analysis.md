# Kustodia Payment Automation Services Analysis

## Overview
The PaymentAutomationService runs three main cron jobs that handle the entire payment lifecycle:

### 1. **processNewDeposits** (Every minute)
- Detects SPEI deposits in Juno
- Matches deposits to pending payments
- Triggers the payment automation flow
- Creates escrow and funds it with MXNB tokens

### 2. **releaseExpiredCustodies** (Every 10 minutes)
- Releases escrows based on:
  - Traditional payments: Past custody deadline
  - Nuevo flujo: Dual approval (immediate release)
- **ISSUE**: Does not check if escrow was already released

### 3. **processPendingPayouts** (Every 2 minutes)
- Processes payouts for released escrows
- Redeems MXNB to MXN via Juno
- Sends SPEI to seller's bank account

## The Double Release Problem

### Root Cause
1. **Manual Release Path**: When both parties approve in the UI, the approval controller immediately calls `releaseEscrowAndPayout()` which:
   - Releases the escrow on-chain
   - Updates payment status to 'custody_released'
   - BUT does NOT update escrow status to 'released'

2. **Automated Release Path**: The `releaseExpiredCustodies()` cron job finds:
   - Escrow still marked as 'active' (not 'released')
   - Payment has dual approval
   - Tries to release again → Double release

### Why Escrow 99 vs 9?
- Database escrow ID: 99
- Smart contract escrow ID: 9
- The automation correctly uses smart_contract_escrow_id (9) for blockchain calls
- The error "trying to release escrow 99" might be from logging that shows the database ID

## Payment Flow for Payment 112

1. **Deposit Detection** ✓
   - SPEI deposit matched
   - Payment status: pending → funded

2. **Escrow Creation** ✓
   - Smart contract escrow ID 9 created
   - BUT escrow not funded with MXNB tokens

3. **Dual Approval** ✓
   - Both payer and payee approved
   - Manual release triggered

4. **Release Attempt** ✗
   - First attempt failed: "Not funded" error
   - Escrow 9 has no MXNB tokens deposited

5. **Double Release** ✗
   - Automation tried to release again
   - Same "Not funded" error

## Key Issues to Fix

### 1. Prevent Double Release
- Update escrow status to 'released' after successful manual release
- Add check in automation to skip already released escrows

### 2. Fix Escrow Funding
- Ensure `fundEscrow()` is called after escrow creation
- Check bridge wallet has sufficient MXNB balance
- Verify token allowance is set correctly

### 3. Add Safety Checks
- Check escrow funding status before release
- Add idempotency to release operations
- Better error handling and logging

## Recommended Fixes

### Fix 1: Update releaseEscrowAndPayout in payoutService.ts
```typescript
// After successful release
escrow.status = 'released';
escrow.release_tx_hash = releaseTxHash;
await escrowRepo.save(escrow);
```

### Fix 2: Update releaseExpiredCustodies in PaymentAutomationService.ts
```typescript
// Add check for already released escrows
const expiredEscrows = await escrowRepo.find({
  where: [
    {
      status: In(['funded', 'active']), // Not 'released'
      release_tx_hash: IsNull(), // No release transaction
      // ... rest of conditions
    }
  ]
});
```

### Fix 3: Ensure escrow funding in createEscrow
```typescript
// In escrowService.ts after createEscrow transaction
const fundTx = await fundEscrow(escrowId);
if (!fundTx) {
  throw new Error('Failed to fund escrow');
}
```
