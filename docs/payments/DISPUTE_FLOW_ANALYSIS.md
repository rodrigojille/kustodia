# Dispute Creation Flow Analysis - Payment 85

## Current State (Before Dispute)
```
Payment 85:
├─ Status: "escrowed" 
├─ Escrow ID: 73
├─ Amount: $1000.00
└─ Dispute Status: Ready ✅

Escrow 73:
├─ Status: "active"
├─ Dispute Status: "none"
├─ Custody End: 2025-07-06T02:10:33.000Z
├─ Custody Amount: $1000.00
└─ Release Amount: $0.00
```

## Step-by-Step Dispute Creation Process

### 1. Frontend Dispute Modal Submission
**User Action**: Fill dispute form with:
- Reason: e.g., "Product not delivered"
- Details: e.g., "Seller hasn't shipped the item after 5 days"
- Evidence: Optional file upload

**API Call**: `POST /api/disputes/escrow/73`

### 2. Backend Processing (`raiseDispute` function)

#### Step 2.1: Validation
```javascript
// Validates required fields
if (!reason || !details) {
  return res.status(400).json({ error: "Reason and details are required." });
}
```

#### Step 2.2: Smart Contract Call
```javascript
// Calls blockchain contract
const tx = await contractInstance.raiseDispute(
  escrow.smart_contract_escrow_id,
  { from: platformWallet }
);
contractTxHash = tx.hash; // e.g., "0xabc123..."
```

#### Step 2.3: Create Dispute Entity
```javascript
const dispute = disputeRepo.create({
  escrow: escrow,                           // Links to Escrow ID 73
  raisedBy: user,                          // Current user
  reason: "Product not delivered",
  details: "Seller hasn't shipped...",
  evidence_url: "/uploads/evidence/file.jpg" || null,
  status: "pending",                       // Initial dispute status
  contract_dispute_raised_tx: contractTxHash
});
```

#### Step 2.4: Update Escrow Entity
```javascript
escrow.dispute_status = "pending";         // Was "none"
escrow.dispute_reason = "Product not delivered";
escrow.dispute_details = "Seller hasn't shipped...";
escrow.dispute_evidence = "/uploads/evidence/file.jpg";
escrow.dispute_history = [
  ...existing_history,
  {
    action: "raised",
    by: userId,
    reason: "Product not delivered",
    details: "Seller hasn't shipped...",
    evidence: "/uploads/evidence/file.jpg",
    at: new Date()
  }
];
```

#### Step 2.5: Create PaymentEvent
```javascript
paymentEventRepo.save({
  paymentId: 85,
  type: 'dispute_raised',
  description: 'Disputa levantada por el usuario. Motivo: Product not delivered'
});
```

## Resulting State (After Dispute Creation)

### Database Changes:
```sql
-- New Dispute Record
INSERT INTO dispute (
  escrow_id = 73,
  raised_by = [user_id],
  reason = 'Product not delivered',
  details = 'Seller hasn\'t shipped...',
  evidence_url = '/uploads/evidence/file.jpg',
  status = 'pending',
  contract_dispute_raised_tx = '0xabc123...'
);

-- Updated Escrow Record
UPDATE escrow SET 
  dispute_status = 'pending',
  dispute_reason = 'Product not delivered',
  dispute_details = 'Seller hasn\'t shipped...',
  dispute_evidence = '/uploads/evidence/file.jpg',
  dispute_history = [...updated_array]
WHERE id = 73;

-- New Payment Event
INSERT INTO payment_event (
  payment_id = 85,
  type = 'dispute_raised',
  description = 'Disputa levantada por el usuario...'
);
```

### Frontend Display Changes:

#### Payment Detail Page:
- **Status Badge**: Changes from "🔒 En custodia" to "⚠️ En disputa"
- **New Button**: "Ver Disputa" or "Dispute Timeline" appears
- **Status Color**: Purple → Red

#### Dashboard Cards:
- **"En custodia" count**: Decreases by 1
- **"En disputa" count**: Increases by 1

#### Payments Table:
- **Payment 85 Status**: Shows "⚠️ En disputa" badge
- **No Automation**: Badge disappears (disputes are manual)

## Available Actions After Dispute Creation

### For User (Payer):
- ✅ View dispute timeline
- ✅ Upload additional evidence
- ❌ Cannot raise another dispute (already pending)
- ❌ Cannot cancel payment (in dispute)

### For Admin:
- ✅ View dispute details and evidence
- ✅ Resolve dispute (approve/dismiss)
- ✅ Add admin notes
- ✅ View full timeline

### For System:
- ❌ Automation paused (no auto-release)
- ❌ Custody period effectively frozen
- ✅ Timeline tracking continues

## Dispute Resolution Scenarios

### Scenario A: Admin Approves Dispute
```javascript
// Payment reverted to buyer
escrow.dispute_status = "resolved";
escrow.status = "reverted";
payment.status = "cancelled"; // Or similar
// Funds returned to payer
```

### Scenario B: Admin Dismisses Dispute
```javascript
// Payment continues normal flow
escrow.dispute_status = "dismissed";
dispute.status = "dismissed";
// Payment can proceed to completion
```

### Scenario C: User Reapplies (if dismissed)
```javascript
// Can raise new dispute if previous was dismissed
// Same process repeats
```

## Testing Verification Points

### After Creating Dispute:
1. ✅ Check payment shows "En disputa" status
2. ✅ Verify dispute timeline is accessible
3. ✅ Confirm dashboard counts updated
4. ✅ Test admin dispute resolution interface
5. ✅ Validate evidence upload works
6. ✅ Check automation badges disappear

### Database Verification:
```sql
-- Verify dispute created
SELECT * FROM dispute WHERE escrow_id = 73;

-- Verify escrow updated
SELECT dispute_status, dispute_reason FROM escrow WHERE id = 73;

-- Verify payment event logged
SELECT * FROM payment_event WHERE payment_id = 85 AND type = 'dispute_raised';
```

## Potential Issues to Watch

### Smart Contract Integration:
- ⚠️ Mock transaction hash used ("MOCK_RESOLVE_TX_HASH")
- ⚠️ Platform wallet configuration required
- ⚠️ Contract instance must be properly initialized

### Frontend Integration:
- ⚠️ Dispute modal form validation
- ⚠️ File upload size limits
- ⚠️ Timeline display formatting
- ⚠️ Status update reactivity

---

**Ready to Execute**: Payment 85 is perfectly positioned for dispute testing with all systems aligned and documented.
