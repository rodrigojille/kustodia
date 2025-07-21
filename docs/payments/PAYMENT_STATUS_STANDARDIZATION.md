# Kustodia Payment Status Standardization

## Overview

This document describes the unified payment status system implemented across Kustodia's frontend and backend components. The standardization ensures consistent labels, colors, icons, and behavior across all payment-related UI components.

## 📋 Table of Contents

- [Payment Status Configuration](#payment-status-configuration)
- [Standardized Components](#standardized-components)
- [Backend API Changes](#backend-api-changes)
- [Legacy Status Handling](#legacy-status-handling)
- [Automation Integration](#automation-integration)
- [Implementation Details](#implementation-details)

---

## 🎯 Payment Status Configuration

### Core Status Types

The system defines 6 standardized payment statuses:

| Status | Spanish Label | English Label | Icon | Color | Automation Badge |
|--------|---------------|---------------|------|-------|------------------|
| `requested` | Pagos creados | Requested | 📝 | Blue | No |
| `pending` | Pagos pendientes | Pending | ⏳ | Yellow | No |
| `paid` | Pagos activos | Paid | ✅ | Green | Yes |
| `completed` | Pagos completados | Completed | 🎉 | Purple | Yes |
| `in_dispute` | Pagos en disputa | In Dispute | ⚠️ | Red | No |
| `cancelled` | Pagos cancelados | Cancelled | ❌ | Gray | No |

### Configuration File

All status metadata is centralized in: `/kustodia-next/src/config/paymentStatuses.ts`

```typescript
export const PAYMENT_STATUSES = {
  requested: {
    key: 'requested',
    label: 'Creados',
    spanish: 'Pagos creados',
    icon: '📝',
    color: '#3b82f6', // blue-500
    bgClass: 'bg-blue-50 border-blue-200',
    textClass: 'bg-blue-100 text-blue-700',
    automationBadge: false
  },
  // ... other statuses
};
```

---

## 🎨 Standardized Components

### 1. Dashboard Cards (`FintechDashboardCards.tsx`)

**Before**: Hardcoded labels and colors
**After**: Uses unified status configuration

- ✅ Spanish labels from centralized config
- ✅ Consistent color scheme
- ✅ Automation badges for "paid" and "completed" statuses
- ✅ Proper status counting and filtering

### 2. Payments Table (`PaymentsTable.tsx`)

**Before**: Mixed English/Spanish labels, inconsistent styling
**After**: Fully standardized interface

- ✅ Spanish status labels in table rows
- ✅ Consistent status badge colors
- ✅ Unified filtering options
- ✅ CSV export with translated labels

### 3. Payments Chart (`PaymentsByStageChart.tsx`)

**Before**: Hardcoded colors and labels
**After**: Uses dynamic configuration

- ✅ Consistent chart colors matching dashboard
- ✅ Spanish labels in legend and tooltips
- ✅ Dynamic color assignment based on status config

### 4. Payments by Month Chart (`PaymentsByMonthChart.tsx`)

**Status**: No changes required (aggregates by month, not status)

---

## 🔧 Backend API Changes

### New Endpoint: `/api/payments`

Created dedicated endpoint for dashboard consumption:

**File**: `/backend/src/controllers/getAllPaymentsController.ts`
**Route**: `GET /api/payments`

**Features**:
- Returns all payments with essential fields
- Uses modern TypeORM DataSource API
- Ordered by creation date (newest first)
- Includes status, amount, currency, recipient info

**Response Format**:
```json
[
  {
    "id": 83,
    "amount": "1000.00",
    "currency": "MXN",
    "status": "active",
    "created_at": "2025-06-22T21:10:21.093Z",
    "recipient_email": "test-seller@kustodia.mx"
  }
]
```

---

## 🔄 Legacy Status Handling

### Legacy Status Mapping

The system handles deprecated/legacy statuses through automatic mapping:

```typescript
export const LEGACY_STATUS_MAP: Record<string, string> = {
  'processing': 'pending',    // Old processing → pending
  'funded': 'paid',          // Old funded → paid  
  'refunded': 'cancelled',   // Old refunded → cancelled
  'active': 'paid'           // Database active → paid
};
```

### Helper Functions

- `getStatusConfig(status)` - Returns unified config for any status
- `getStatusSpanish(status)` - Gets Spanish label with legacy mapping
- `hasAutomationBadge(status)` - Checks if status shows automation badge

### Legacy Payment Updates

**Script**: `/backend/src/scripts/updateLegacyPaymentStatuses.ts`

Updated specific production payments that were processed before automation:
- **Payment 71**: `paid` → `completed` ✅
- **Payment 73**: `paid` → `completed` ✅
- **Test payments**: Left unchanged (May 2025 test data)

---

## ⚙️ Automation Integration

### Payment Lifecycle Automation

The status standardization integrates with the full payment automation system:

1. **Payment Creation**: `requested` → `pending`
2. **SPEI Deposit Detected**: `pending` → `paid` (custody active)
3. **Custody Expired**: Automatic release triggered
4. **Final Payout Completed**: `paid` → `completed`

### Automation Badges

Components show **"🤖 Procesamiento automático activo"** badge for:
- **paid** status (custody period, automation monitoring)
- **completed** status (fully automated processing completed)

### Automation Service

**File**: `/backend/src/services/PaymentAutomationService.ts`

**Cron Jobs**:
- **Deposits**: Every 5 minutes
- **Custody Release**: Every 10 minutes  
- **Payouts**: Every 15 minutes
- **Blockchain Sync**: Every hour

---

## 🛠️ Implementation Details

### File Structure

```
Frontend:
├── /src/config/paymentStatuses.ts          # ✅ Central configuration
├── /src/components/FintechDashboardCards.tsx # ✅ Updated
├── /src/components/PaymentsTable.tsx        # ✅ Updated  
├── /src/components/PaymentsByStageChart.tsx # ✅ Updated
└── /src/components/PaymentsByMonthChart.tsx # ℹ️ No changes needed

Backend:
├── /src/controllers/getAllPaymentsController.ts # ✅ New endpoint
├── /src/routes/payment.ts                    # ✅ Added route
└── /src/scripts/updateLegacyPaymentStatuses.ts # ✅ Legacy update script
```

### Key Benefits

1. **Consistency**: All components use same labels, colors, and icons
2. **Maintainability**: Single source of truth for status metadata
3. **Localization**: Standardized Spanish labels throughout
4. **Automation**: Clear indication of automated vs manual processing
5. **Scalability**: Easy to add new statuses or modify existing ones

### Breaking Changes

❌ **None** - All changes are backward compatible through legacy status mapping.

---

## 🚀 Usage Examples

### Getting Status Information

```typescript
import { getStatusSpanish, getStatusConfig, hasAutomationBadge } from '@/config/paymentStatuses';

// Get Spanish label (handles legacy statuses)
const label = getStatusSpanish('active'); // Returns "Pagos activos"

// Get full status configuration
const config = getStatusConfig('paid'); 
// Returns: { spanish: "Pagos activos", color: "#10b981", automationBadge: true, ... }

// Check for automation badge
const showBadge = hasAutomationBadge('completed'); // Returns true
```

### Filtering Payments by Status

```typescript
import { PAYMENT_STATUSES } from '@/config/paymentStatuses';

// Get all available statuses for filtering
const filterOptions = Object.values(PAYMENT_STATUSES).map(status => ({
  value: status.key,
  label: status.spanish
}));
```

---

## 📊 Status Distribution

After standardization, the payment status distribution shows:

- **Pagos creados** (requested): New payment requests
- **Pagos pendientes** (pending): Waiting for SPEI deposits  
- **Pagos activos** (paid): In custody period (automation active)
- **Pagos completados** (completed): Fully processed and paid out
- **Pagos en disputa** (in_dispute): Under dispute resolution
- **Pagos cancelados** (cancelled): Cancelled or refunded

---

## 🔗 Related Documentation

- [Payment Automation System](./PAYMENT_AUTOMATION.md)
- [Backend API Reference](./API_REFERENCE.md)
- [Frontend Component Guide](./FRONTEND_COMPONENTS.md)

---

**Status**: ✅ **PRODUCTION READY**  
**Last Updated**: June 23, 2025  
**Version**: 1.0.0
