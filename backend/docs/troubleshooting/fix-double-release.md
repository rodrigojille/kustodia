# Fix for Double Release Issue

## Problem Summary
The double release of escrow 9 happened because:
1. Manual release via approval controller doesn't update escrow status to 'released'
2. Automation finds escrow still 'active' and tries to release again
3. Both attempts fail because escrow 9 was never funded with MXNB tokens

## Required Fixes

### 1. Update payoutService.ts - Add escrow status update after release

In `releaseEscrowAndPayout` function, after line 54 (successful on-chain release), add:

```typescript
// Update escrow status to prevent double release
escrow.status = 'released';
escrow.release_tx_hash = releaseTxHash;
await escrowRepo.save(escrow);

console.log(`[Payout] Escrow ${escrow.id} status updated to 'released' with tx: ${releaseTxHash}`);
```

### 2. Update PaymentAutomationService.ts - Add release check

In `releaseExpiredCustodies` function, modify the query to exclude already released escrows:

```typescript
const expiredEscrows = await escrowRepo.find({
  where: [
    {
      status: In(['funded', 'active']), // Only funded or active, not released
      release_tx_hash: IsNull(), // No existing release transaction
      custody_end: LessThan(now),
      payment: {
        payment_type: Not('nuevo_flujo')
      }
    },
    {
      status: In(['funded', 'active']), // Only funded or active, not released
      release_tx_hash: IsNull(), // No existing release transaction
      payment: {
        payment_type: 'nuevo_flujo',
        payer_approval: true,
        payee_approval: true
      }
    }
  ],
  relations: ['payment']
});
```

### 3. Fix Escrow Funding Issue

The escrow 9 was never funded with MXNB tokens. Check:

1. In `createEscrow` function in escrowService.ts, ensure `fundEscrow` is called
2. Check bridge wallet MXNB balance
3. Verify token allowance is set for escrow contract

### 4. Update Database for Payment 112

Run this SQL to fix the current state:

```sql
-- Update escrow 99 to released status to prevent further attempts
UPDATE escrow 
SET status = 'released', 
    release_tx_hash = '0x...' -- Add actual tx hash if available
WHERE id = 99;

-- Update payment status if needed
UPDATE payment 
SET status = 'custody_released' 
WHERE id = 112;
```

## Testing Steps

1. Check escrow 9 funding status on blockchain
2. Fund escrow 9 if needed
3. Update escrow status in database
4. Apply code fixes to prevent future double releases
5. Test with a new payment to ensure proper flow
