# SPEI Receipt System Documentation

## Overview

The SPEI Receipt System automatically generates professional PDF receipts for SPEI transfers and attaches them to email notifications. This system integrates with the existing payout and notification services to provide compliance-ready transaction proof for users.

## Features

- **Professional PDF Receipts**: Beautiful, branded SPEI transfer receipts
- **Automatic Email Attachment**: Receipts are automatically attached to notification emails
- **Compliance Ready**: Includes all required information for financial compliance
- **Multi-language Support**: Spanish by default, extensible for other languages
- **Transaction Tracking**: Full traceability with Juno transaction IDs
- **Commission Breakdown**: Clear display of original amounts, commissions, and net amounts

## Architecture

### Core Components

1. **SPEIReceiptService** (`src/services/speiReceiptService.ts`)
   - Main service for generating receipts
   - Supports both HTML and PDF formats
   - Uses Puppeteer for PDF generation

2. **Enhanced PaymentNotificationService** (`src/utils/paymentNotificationService.ts`)
   - Extended to support SPEI receipt attachments
   - New event types: `spei_transfer_completed`, `spei_transfer_processing`

3. **Enhanced PayoutService** (`src/services/payoutService.ts`)
   - Integrated SPEI receipt generation in payout flows
   - Automatic notification sending with receipts

### Data Flow

```
Payout Completion → Receipt Generation → Email Notification → Receipt Attachment → User Receives Email with PDF
```

## Integration Points

### 1. Regular Payout Flow (`releaseEscrowAndPayout`)
- Triggers after successful Juno payout
- Generates receipt with commission breakdown
- Sends to seller/recipient

### 2. MXNB Redemption Flow (`redeemMXNBToMXNAndPayout`)
- Triggers after successful MXNB redemption
- Generates receipt for MXN transfer
- No commission deduction

### 3. Legacy Flow (`redeemAndPayout`)
- Maintains compatibility with existing systems
- Can be enhanced with receipt generation if needed

## Receipt Data Structure

```typescript
interface SPEIReceiptData {
  // Transaction Info
  transactionId: string;
  junoTransactionId?: string;
  amount: number;
  currency: string;
  status: 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  createdAt: Date;
  updatedAt?: Date;
  
  // Payment Info
  paymentId: number;
  paymentDescription?: string;
  escrowId?: number;
  
  // Recipient Info
  recipientName: string;
  recipientEmail: string;
  bankAccountId?: string;
  clabe?: string;
  
  // Sender Info (Platform)
  senderName: string;
  senderInfo: string;
  
  // Additional Details
  reference?: string;
  concept?: string;
  speiReference?: string;
  
  // Fees & Commissions
  originalAmount?: number;
  commissionAmount?: number;
  netAmount: number;
}
```

## Usage Examples

### Manual Receipt Generation

```typescript
import { SPEIReceiptService } from '../services/speiReceiptService';

// Generate from payment data
const receipt = await SPEIReceiptService.generateReceiptFromPayment(
  payment,
  user,
  junoTransactionId,
  { format: 'pdf' }
);

// Generate from raw data
const receiptData = { /* SPEIReceiptData */ };
const receipt = await SPEIReceiptService.generateReceipt(receiptData, { format: 'pdf' });
```

### Notification with Receipt

```typescript
import { sendPaymentEventNotification } from '../utils/paymentNotificationService';

await sendPaymentEventNotification({
  eventType: 'spei_transfer_completed',
  paymentId: payment.id.toString(),
  paymentDetails: { /* payment details */ },
  recipients: [{ email: user.email, role: 'seller' }],
  includeSPEIReceipt: true,
  speiReceiptData: receiptData,
  junoTransactionId: 'juno_tx_123'
});
```

## Configuration

### Environment Variables

- `JUNO_ENV`: Juno environment (stage/production)
- `JUNO_API_KEY`: Juno API key
- `JUNO_API_SECRET`: Juno API secret

### Dependencies

- `puppeteer`: PDF generation
- `date-fns`: Date formatting
- `@types/puppeteer`: TypeScript types

Install with:
```bash
npm install puppeteer date-fns @types/puppeteer
```

## File Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── speiReceiptService.ts      # Main receipt service
│   │   └── payoutService.ts           # Enhanced with receipt integration
│   ├── utils/
│   │   └── paymentNotificationService.ts  # Enhanced with attachments
│   └── entity/
│       ├── Payment.ts
│       ├── User.ts
│       └── JunoTransaction.ts
├── scripts/
│   └── testSPEIReceipt.js            # Test script
├── temp/
│   └── receipts/                     # Temporary receipt files
└── docs/
    └── SPEI_RECEIPT_SYSTEM.md        # This documentation
```

## Testing

### Run Test Script

```bash
# Build the project first
npm run build

# Run the test script
node scripts/testSPEIReceipt.js
```

This will generate sample HTML and PDF receipts in the `scripts/` directory.

### Manual Testing

1. Create a test payment
2. Process payout through `releaseEscrowAndPayout` or `redeemMXNBToMXNAndPayout`
3. Check email for receipt attachment
4. Verify receipt contains all required information

## Security Considerations

- **Temporary Files**: Receipt files are automatically cleaned up after email sending
- **Data Validation**: All receipt data is validated before generation
- **Error Handling**: Receipt generation failures don't block payout completion
- **File Permissions**: Temporary receipt directory has restricted access

## Compliance Features

- **Complete Transaction Details**: All SPEI-required information included
- **Audit Trail**: Receipt generation logged for traceability
- **Official Format**: Professional layout suitable for regulatory requirements
- **Unique References**: Each receipt has unique transaction and SPEI references
- **Timestamp Accuracy**: Precise creation and completion timestamps

## Troubleshooting

### Common Issues

1. **Puppeteer Installation Issues**
   ```bash
   # Install with specific Chromium
   npm install puppeteer --unsafe-perm=true --allow-root
   ```

2. **PDF Generation Fails**
   - Check Puppeteer dependencies
   - Verify system has sufficient memory
   - Check file system permissions

3. **Email Attachment Issues**
   - Verify email service configuration
   - Check file paths and permissions
   - Ensure temporary directory exists

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=spei-receipt:*
```

## Future Enhancements

- **QR Code Integration**: Add QR codes for receipt verification
- **Multi-language Support**: Support for English and other languages
- **Template Customization**: Allow custom receipt templates
- **Batch Processing**: Generate multiple receipts efficiently
- **Digital Signatures**: Add cryptographic signatures for enhanced security
- **Receipt History**: Store receipt history in database
- **Mobile Optimization**: Optimize receipt layout for mobile viewing

## API Reference

### SPEIReceiptService Methods

- `generateReceiptFromPayment(payment, user, junoTransactionId?, options?)`: Generate receipt from payment entities
- `generateReceipt(data, options?)`: Generate receipt from raw data
- `saveReceiptToFile(data, options?)`: Save receipt to temporary file
- `cleanupOldReceipts(maxAgeHours?)`: Clean up old temporary files

### PaymentNotificationService Extensions

- New event types: `spei_transfer_completed`, `spei_transfer_processing`
- New options: `includeSPEIReceipt`, `speiReceiptData`, `junoTransactionId`

## Support

For issues or questions regarding the SPEI Receipt System:

1. Check this documentation
2. Review the test script output
3. Check application logs for error details
4. Contact the development team with specific error messages

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Author**: Kustodia Development Team
