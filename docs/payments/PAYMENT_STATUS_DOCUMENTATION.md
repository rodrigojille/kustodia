# Payment Status System Documentation

## Overview
This document defines the standardized payment status flow across the entire Kustodia application, ensuring consistency between frontend displays, backend processing, and database states.

## Payment Status Flow

### 1. **pending** ⏳
- **Label**: "Pendiente"
- **Description**: Payment created but not yet funded
- **Backend Status**: `pending`
- **User Action**: User needs to deposit funds
- **Automation**: No automation

### 2. **funded** 💰
- **Label**: "Financiado"
- **Description**: Payment has been funded but escrow not yet created
- **Backend Status**: `funded`
- **User Action**: None (automatic progression)
- **Automation**: ✅ Auto-detected deposits, automatic escrow creation

### 3. **escrowed** 🔒
- **Label**: "En custodia"
- **Description**: Escrow created and active, funds in custody
- **Backend Status**: `escrowed`
- **User Action**: Can raise disputes during custody period
- **Automation**: ✅ Automatic custody management and timeline updates

### 4. **completed** 🎉
- **Label**: "Completado"
- **Description**: Payment fully processed and sent to recipient
- **Backend Status**: `completed`
- **User Action**: None (final state)
- **Automation**: ✅ Automatic SPEI processing and completion

### 5. **in_dispute** ⚠️
- **Label**: "En disputa"
- **Description**: Payment is under dispute review
- **Backend Status**: `in_dispute`
- **User Action**: Wait for admin resolution
- **Automation**: No automation (manual admin review)

### 6. **cancelled** ❌
- **Label**: "Cancelado"
- **Description**: Payment cancelled or refunded
- **Backend Status**: `cancelled`
- **User Action**: None (final state)
- **Automation**: No automation

## Status Mapping Across Components

### Frontend Components Using Status System:
1. **PaymentDetailClient.tsx** - Individual payment details
2. **PaymentsTable.tsx** - Payment list with filters
3. **FintechDashboardCards.tsx** - Dashboard overview cards
4. **PaymentTimeline.tsx** - Event timeline display

### Configuration File:
- **Location**: `frontend/src/config/paymentStatuses.ts`
- **Purpose**: Centralized status configuration with colors, icons, and labels

## Legacy Status Migration

### Deprecated Statuses:
- `processing` → `pending`
- `paid` → `funded`
- `requested` → `pending`
- `active` → `escrowed`
- `en_custodia` → `escrowed`
- `in_progress` → `escrowed`
- `refunded` → `cancelled`

## Database Schema

### Payment Table Status Values:
```sql
-- Current valid statuses
'pending', 'funded', 'escrowed', 'completed', 'in_dispute', 'cancelled'

-- Legacy statuses (still in DB but mapped to new values)
'processing', 'paid', 'requested', 'active', 'en_custodia', 'in_progress', 'refunded'
```

## Automation Integration

### Automated Statuses:
- `funded` - Auto-detected deposits trigger escrow creation
- `escrowed` - Auto-managed custody periods and timeline updates
- `completed` - Auto-processed SPEI payments and final completion

### Automation Badges:
- Green "Auto" badge displayed for automated statuses
- Indicates system-driven processes vs. manual actions

## Dispute System Integration

### Dispute-Eligible Statuses:
- `funded` - Can raise dispute before escrow creation
- `escrowed` - Can raise dispute during custody period
- `in_dispute` - Already in dispute, can reapply if dismissed

### Dispute Resolution:
- **Approved**: Payment reverted to buyer
- **Dismissed**: Payment continues normal flow
- **Reapply**: User can submit new dispute if previously dismissed

## Implementation Notes

### Frontend Status Display:
```typescript
// Use centralized config
import { getStatusConfig } from '../config/paymentStatuses';

const statusConfig = getStatusConfig(payment.status);
const display = {
  label: statusConfig.spanish,
  color: statusConfig.textClass,
  icon: statusConfig.icon
};
```

### Backend Status Transitions:
```typescript
// Valid transitions
pending → funded → escrowed → completed
escrowed → in_dispute → escrowed (if dismissed)
any_status → cancelled
```

## Testing Guidelines

### Status Consistency Tests:
1. Verify all frontend components use same status mapping
2. Check database status values align with frontend displays
3. Test automation badges appear for correct statuses
4. Validate dispute system works with escrowed payments

### Migration Tests:
1. Legacy status values correctly mapped to new system
2. Existing payments display correct status labels
3. No broken status displays in any component

## Future Considerations

### Extensibility:
- New statuses can be added to central config
- Icon and color schemes maintained consistently
- Automation badges configurable per status

### Monitoring:
- Track usage of legacy vs. new status values
- Monitor automation badge effectiveness
- Collect user feedback on status clarity

---
**Last Updated**: 2025-07-05
**Version**: 1.0
**Status**: ✅ Implemented and Tested
