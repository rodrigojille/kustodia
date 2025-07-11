import ormconfig from '../ormconfig';
import { Payment } from '../entity/Payment';
import { Escrow } from '../entity/Escrow';
import { User } from '../entity/User';
import { JunoTransaction } from '../entity/JunoTransaction';
// Note: Using mock sendMxnPayout for now - integrate with actual Juno service later
const sendMxnPayout = async (amount: number, clabe: string, name: string) => {
  console.log(`🔄 [MOCK PAYOUT] Would send $${amount} to CLABE ${clabe} for ${name}`);
  return { tx_hash: `mock_payout_${Date.now()}`, success: true };
};
import { recordPaymentEvent } from '../utils/paymentEvent';
import { v4 as uuidv4 } from 'uuid';

/**
 * Processes a dispute refund to the buyer when admin resolves dispute in buyer's favor
 * @param paymentId The ID of the payment to refund
 * @returns Promise<{success: boolean, txHash: string, amount: number}>
 */
export async function processDisputeRefund(paymentId: number) {
  const paymentRepo = ormconfig.getRepository(Payment);
  const escrowRepo = ormconfig.getRepository(Escrow);
  const userRepo = ormconfig.getRepository(User);
  const junoTxRepo = ormconfig.getRepository(JunoTransaction);

  console.log(`🔄 [DISPUTE REFUND] Starting refund process for payment ${paymentId}`);

  // 1. Get payment with all necessary details
  const payment = await paymentRepo.findOne({ 
    where: { id: paymentId },
    relations: ['user', 'escrow']
  });
  
  if (!payment) {
    throw new Error(`Payment ${paymentId} not found`);
  }

  const escrow = payment.escrow;
  if (!escrow) {
    throw new Error(`No escrow found for payment ${paymentId}`);
  }

  // 2. Get buyer details (payer)
  const buyerEmail = payment.payer_email;
  if (!buyerEmail) {
    throw new Error(`No buyer email found for payment ${paymentId}`);
  }

  // Get buyer's CLABE from payment record or user record
  let buyerClabe = payment.payer_clabe;
  if (!buyerClabe) {
    // Try to get from user record if linked
    const buyer = await userRepo.findOne({ where: { email: buyerEmail } });
    buyerClabe = buyer?.payout_clabe;
  }

  if (!buyerClabe) {
    throw new Error(`No CLABE found for buyer ${buyerEmail} in payment ${paymentId}`);
  }

  // 3. Calculate refund amount (full custody amount)
  const refundAmount = Number(escrow.custody_amount);
  if (refundAmount <= 0) {
    throw new Error(`Invalid refund amount: ${refundAmount} for payment ${paymentId}`);
  }

  // 4. Generate transaction hash for tracking
  const refundTxHash = `refund_${uuidv4().replace(/-/g, '')}`;

  console.log(`💰 [DISPUTE REFUND] Processing $${refundAmount} refund to CLABE ${buyerClabe}`);

  try {
    // 5. Record refund initiation
    await recordPaymentEvent(payment, 'dispute_refund_initiated', 
      `Refund of $${refundAmount} initiated to buyer ${buyerEmail} (CLABE: ${buyerClabe})`);

    // 6. Execute SPEI payout using existing Juno infrastructure
    const payoutResult = await sendMxnPayout(
      refundAmount,
      buyerClabe,
      buyerEmail  // Use email as recipient name if no full name available
    );

    console.log(`✅ [DISPUTE REFUND] Juno payout successful:`, payoutResult);

    // 7. Create JunoTransaction record for tracking
    const junoTx = junoTxRepo.create({
      type: 'refund',
      amount: refundAmount,
      status: 'completed',
      tx_hash: payoutResult.tx_hash || refundTxHash,
      reference: `dispute-refund-${paymentId}`
    });
    await junoTxRepo.save(junoTx);

    // 8. Update payment and escrow statuses
    payment.status = 'refunded';
    escrow.status = 'refunded';
    escrow.release_amount = 0; // No longer releasing to seller
    escrow.custody_amount = 0; // Refunded to buyer
    
    await paymentRepo.save(payment);
    await escrowRepo.save(escrow);

    // 9. Record successful refund
    await recordPaymentEvent(payment, 'dispute_refund_completed', 
      `Refund successful. TX: ${payoutResult.tx_hash || refundTxHash}`);

    console.log(`🎉 [DISPUTE REFUND] Completed successfully for payment ${paymentId}`);

    return {
      success: true,
      txHash: payoutResult.tx_hash || refundTxHash,
      amount: refundAmount,
      clabe: buyerClabe,
      beneficiary: buyerEmail
    };

  } catch (error: any) {
    console.error(`❌ [DISPUTE REFUND] Failed for payment ${paymentId}:`, error);
    
    // Record failure
    await recordPaymentEvent(payment, 'dispute_refund_failed', 
      `Refund failed: ${error?.message || error}`);

    throw new Error(`Dispute refund failed: ${error?.message || error}`);
  }
}

/**
 * Checks if a payment is eligible for dispute refund
 * @param paymentId The payment ID to check
 * @returns Promise<{eligible: boolean, reason?: string}>
 */
export async function checkRefundEligibility(paymentId: number) {
  const paymentRepo = ormconfig.getRepository(Payment);
  
  const payment = await paymentRepo.findOne({ 
    where: { id: paymentId },
    relations: ['escrow']
  });

  if (!payment) {
    return { eligible: false, reason: 'Payment not found' };
  }

  if (!payment.escrow) {
    return { eligible: false, reason: 'No escrow associated with payment' };
  }

  if (payment.status === 'refunded') {
    return { eligible: false, reason: 'Payment already refunded' };
  }

  if (payment.status === 'completed') {
    return { eligible: false, reason: 'Payment already completed' };
  }

  if (!payment.payer_email && !payment.payer_clabe) {
    return { eligible: false, reason: 'No buyer information available for refund' };
  }

  if (Number(payment.escrow.custody_amount) <= 0) {
    return { eligible: false, reason: 'No funds in custody to refund' };
  }

  return { eligible: true };
}
