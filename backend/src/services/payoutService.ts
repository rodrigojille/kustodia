import ormconfig from '../ormconfig';
import { Payment } from '../entity/Payment';
import { Escrow } from '../entity/Escrow';
import { User } from '../entity/User';
import { JunoTransaction } from '../entity/JunoTransaction';
import { PaymentEvent } from '../entity/PaymentEvent';
import { sendJunoPayout } from '../utils/junoClient';
import { isValidReference, sanitizeReference } from '../utils/referenceValidation';
import { getJunoTxHashFromTimeline } from '../services/junoService';
import { releaseEscrow } from './escrowService'; // Import on-chain release function
import { sendPaymentEventNotification } from '../utils/paymentNotificationService';
import { createPaymentNotifications } from './paymentNotificationIntegration';
import { SPEIReceiptData } from './speiReceiptService';
import axios from 'axios';
import crypto from 'crypto';

/**
 * Releases escrow and pays out to the seller's CLABE using Juno.
 * @param escrowId The ID of the escrow to release
 */
export async function releaseEscrowAndPayout(escrowId: number) {
  const escrowRepo = ormconfig.getRepository(Escrow);
  const paymentRepo = ormconfig.getRepository(Payment);
  const userRepo = ormconfig.getRepository(User);
  const junoTxRepo = ormconfig.getRepository(JunoTransaction);

  // Fetch escrow, payment, and seller
  const escrow = await escrowRepo.findOne({ where: { id: escrowId }, relations: ['payment'] });
  if (!escrow) throw new Error('Escrow not found');
  const payment = await paymentRepo.findOne({ where: { id: escrow.payment.id }, relations: ['user'] });
  if (!payment) throw new Error('Payment not found');
  const seller = await userRepo.findOne({ where: { id: payment.user.id } });
  if (!seller || !seller.payout_clabe) throw new Error('Seller or CLABE not found');

  // 🔐 CRITICAL: Validate dual approval for Flow 2 payments
  if (payment.payment_type === 'nuevo_flujo') {
    if (!payment.payer_approval || !payment.payee_approval) {
      const missingApprovals = [];
      if (!payment.payer_approval) missingApprovals.push('payer');
      if (!payment.payee_approval) missingApprovals.push('payee');
      throw new Error(`Dual approval required: Missing ${missingApprovals.join(', ')} approval(s)`);
    }
    console.log(`[SECURITY] Dual approval validated for Payment ${payment.id}`);
  }

  // --- 0. Release from on-chain Escrow Contract ---
  let releaseTxHash: string;
  try {
    console.log(`[Payout] Releasing escrow ID ${escrow.smart_contract_escrow_id} from V2 contract...`);
    releaseTxHash = await releaseEscrow(Number(escrow.smart_contract_escrow_id));
    console.log(`[Payout] On-chain release successful for escrow ID ${escrow.smart_contract_escrow_id}. Tx: ${releaseTxHash}`);
    await logPaymentEvent(payment.id, 'onchain_release_success', `Escrow ${escrow.smart_contract_escrow_id} released from contract. Tx: ${releaseTxHash}`);
  } catch (onchainError) {
    console.error(`[Payout] CRITICAL: On-chain release failed for escrow ${escrow.smart_contract_escrow_id}:`, onchainError);
    await logPaymentEvent(payment.id, 'onchain_release_failed', `Failed to release escrow ${escrow.smart_contract_escrow_id} from contract.`);
    // Stop the process if on-chain release fails to prevent incorrect payouts
    throw new Error('On-chain escrow release failed.');
  }


  // Update escrow status to prevent double release
  escrow.status = 'released';
  escrow.release_tx_hash = releaseTxHash;
  await escrowRepo.save(escrow);
  console.log(`[Payout] Escrow ${escrow.id} status updated to 'released' with tx: ${releaseTxHash}`);

  // Prepare payout
  const totalAmount = Number(escrow.release_amount);
  const commissionAmount = payment.commission_amount ? Number(payment.commission_amount) : 0;
  const netSellerAmount = totalAmount - commissionAmount;
  const currency = payment.currency || 'MXN';
  const destination_clabe = seller.payout_clabe;

  // Validate and sanitize references
  let reference = `escrow-${escrow.id}`;
  let notesRef = payment.description || "Pago Kustodia";
  let numericRef = String(payment.id);

  if (!isValidReference(reference)) {
    reference = sanitizeReference(reference);
  }
  if (!isValidReference(notesRef)) {
    notesRef = sanitizeReference(notesRef);
  }
  if (!isValidReference(numericRef)) {
    numericRef = sanitizeReference(numericRef);
  }

  // If after sanitization any reference is empty, throw error
  if (!reference || !notesRef || !numericRef) {
    throw new Error('Reference, notesRef, or numericRef became empty after sanitization.');
  }

  // --- 1. Payout to Seller ---
  let sellerJunoResult, sellerJunoStatus = 'pending', sellerTxHash = undefined, sellerJunoReference = undefined;
  try {
    sellerJunoResult = await sendJunoPayout({
      amount: netSellerAmount,
      beneficiary: seller.full_name || seller.email || "Beneficiario Kustodia",
      clabe: seller.payout_clabe,
      notes_ref: notesRef,
      numeric_ref: numericRef,
      rfc: "XAXX010101000",
      origin_id: `kustodia_${payment.id}`
    });
    sellerJunoStatus = 'success';
    sellerJunoReference = sellerJunoResult?.id;
    sellerTxHash = sellerJunoReference ? await getJunoTxHashFromTimeline(sellerJunoReference) : undefined;
  } catch (err: any) {
    sellerJunoStatus = 'failed';
    sellerJunoResult = err?.response?.data || err?.message || err;
  }

  // Log Seller Juno transaction
  const sellerJunoTx = junoTxRepo.create({
    type: 'payout',
    reference: (sellerJunoReference ?? reference) ?? undefined,
    amount: netSellerAmount,
    status: sellerJunoStatus,
    tx_hash: sellerTxHash ?? undefined,
  });
  await junoTxRepo.save(sellerJunoTx);

  // --- 2. Payout to Commission Beneficiary (if any) ---
  let commissionJunoTx = null;
  let commissionJunoResult = null;
  let commissionJunoStatus = null;
  let commissionTxHash = null;
  let commissionJunoReference = null;

  if (
    commissionAmount > 0 &&
    payment.commission_beneficiary_email &&
    payment.commission_beneficiary_email.trim() !== ''
  ) {
    // Find commission beneficiary user by email
    const commissionUser = await userRepo.findOne({ where: { email: payment.commission_beneficiary_email } });
    if (!commissionUser || !commissionUser.payout_clabe) {
      throw new Error('Commission beneficiary or CLABE not found');
    }
    try {
      commissionJunoResult = await sendJunoPayout({
        amount: commissionAmount,
        beneficiary: commissionUser.full_name || commissionUser.email || "Beneficiario Comisión",
        clabe: commissionUser.payout_clabe,
        notes_ref: `Comisión Kustodia - ${notesRef}`,
        numeric_ref: numericRef,
        rfc: "XAXX010101000",
        origin_id: `kustodia_commission_${payment.id}`
      });
      commissionJunoStatus = 'success';
      commissionJunoReference = commissionJunoResult?.id;
      commissionTxHash = commissionJunoReference ? await getJunoTxHashFromTimeline(commissionJunoReference) : undefined;
    } catch (err: any) {
      commissionJunoStatus = 'failed';
      commissionJunoResult = err?.response?.data || err?.message || err;
    }
    // Log Commission Juno transaction
    commissionJunoTx = junoTxRepo.create({
      type: 'commission_payout',
      reference: (commissionJunoReference ?? reference) ?? undefined,
      amount: commissionAmount,
      status: commissionJunoStatus,
      tx_hash: commissionTxHash ?? undefined,
    });
    await junoTxRepo.save(commissionJunoTx);
  }

  // Update escrow/payment status if both payouts succeeded (or only seller if no commission)
  const allSuccess = sellerJunoStatus === 'success' && (commissionAmount === 0 || commissionJunoStatus === 'success');
  if (allSuccess) {
    escrow.status = 'released';
    payment.status = 'paid';
    await escrowRepo.save(escrow);
    await paymentRepo.save(payment);

    // Send SPEI completion notification with receipt
    try {
      // Get original buyer information from payment (user field represents the buyer)
      const buyer = payment.user;
      
      const speiReceiptData: SPEIReceiptData = {
        transactionId: sellerJunoReference || `PAY-${payment.id}-${Date.now()}`,
        junoTransactionId: sellerJunoReference,
        amount: netSellerAmount,
        currency: currency.toUpperCase(),
        status: 'SUCCEEDED',
        createdAt: new Date(),
        
        paymentId: payment.id,
        paymentDescription: payment.description,
        escrowId: escrow.id,
        
        recipientName: seller.full_name || seller.email,
        recipientEmail: seller.email,
        bankAccountId: payment.payout_juno_bank_account_id,
        clabe: seller.payout_clabe,
        
        senderName: 'Kustodia',
        senderInfo: 'Plataforma de Pagos Seguros',
        
        reference: payment.reference || `KUSTODIA-${payment.id}`,
        concept: payment.description || 'Pago de custodia liberada',
        speiReference: `KUS${payment.id.toString().padStart(6, '0')}`,
        
        // Original deposit information (buyer's bank → Nvio flow)
        originalSenderName: buyer?.full_name || buyer?.email || 'Comprador',
        custodyProvider: 'Kustodia',
        paymentProcessor: 'Nvio Pagos México',
        originalDepositAmount: payment.amount ? Number(payment.amount) : netSellerAmount,
        
        originalAmount: Number(payment.amount),
        commissionAmount: commissionAmount,
        netAmount: netSellerAmount
      };

      await sendPaymentEventNotification({
        eventType: 'spei_transfer_completed',
        paymentId: payment.id.toString(),
        paymentDetails: {
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          description: payment.description,
          netAmount: netSellerAmount,
          commissionAmount: commissionAmount
        },
        recipients: [{
          email: seller.email,
          role: 'seller'
        }],
        includeSPEIReceipt: true,
        speiReceiptData,
        junoTransactionId: sellerJunoReference
      });

      console.log(`[Payout] SPEI receipt notification sent to ${seller.email}`);
    } catch (notificationError) {
      console.error('[Payout] Failed to send SPEI receipt notification:', notificationError);
      // Don't fail the payout if notification fails
    }
  }

  return {
    escrow,
    payment,
    seller,
    sellerJunoTx,
    sellerJunoResult,
    commissionJunoTx,
    commissionJunoResult
  };
}


/**
 * Logs a payment event for traceability
 */
async function logPaymentEvent(paymentId: number, type: string, description?: string) {
  const paymentEventRepo = ormconfig.getRepository(PaymentEvent);
  const event = paymentEventRepo.create({ paymentId, type, description });
  await paymentEventRepo.save(event);
}

/**
 * Redeems MXNB from Juno (crypto withdrawal to platform wallet), then triggers payout to seller.
 * Logs all actions as PaymentEvent.
 * @param escrowId The ID of the escrow to process
 * @param destAddress The platform wallet address to receive MXNB (from .env or config)
 */
/**
 * Redeems MXNB to MXN and pays out to the seller's bank account via Juno redemption API.
 * Logs all actions for traceability.
 * @param escrowId The ID of the escrow to process
 * @param amountMXNB The amount of MXNB to redeem (human, not base units)
 */
export async function redeemMXNBToMXNAndPayout(escrowId: number, amountMXNB: number) {
  const escrowRepo = ormconfig.getRepository(Escrow);
  const paymentRepo = ormconfig.getRepository(Payment);
  const userRepo = ormconfig.getRepository(User);
  const junoTxRepo = ormconfig.getRepository(JunoTransaction);

  // Fetch escrow, payment, and seller
  const escrow = await escrowRepo.findOne({ where: { id: escrowId }, relations: ['payment'] });
  if (!escrow) throw new Error('Escrow not found');
  const payment = await paymentRepo.findOne({ where: { id: escrow.payment.id }, relations: ['user'] });
  if (!payment) throw new Error('Payment not found');
  const seller = await userRepo.findOne({ where: { id: payment.user.id } });
  if (!seller || !seller.juno_bank_account_id) throw new Error('Seller or juno_bank_account_id not found. Please register the Juno bank account UUID for this user.');

  // 1. Initiate MXNB redemption (to MXN in seller's account)
  await logPaymentEvent(payment.id, 'redemption_initiated', `Initiating MXNB redemption to seller Juno bank account UUID: ${seller.juno_bank_account_id}`);

  // Prepare redemption body
  const bodyObj: any = {
    amount: amountMXNB, // Juno expects MXNB in human units
    destination_bank_account_id: seller.juno_bank_account_id,
    asset: 'mxn',
  };

  // Prepare headers/signature
  const JUNO_ENV = process.env.JUNO_ENV || 'stage';
  const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY! : process.env.JUNO_API_KEY!;
  const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET! : process.env.JUNO_API_SECRET!;
  const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
  const endpoint = '/mint_platform/v1/redemptions';
  const url = `${BASE_URL}${endpoint}`;
  const body = JSON.stringify(bodyObj);
  const nonce = Date.now().toString();
  const method = 'POST';
  const requestPath = endpoint;
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  };

  let redemptionResult, redemptionStatus = 'pending', redemptionReference = undefined;
  try {
    const response = await axios.post(url, bodyObj, { headers });
    redemptionResult = response.data;
    redemptionStatus = 'success';
    redemptionReference = redemptionResult?.payload?.id;
    await logPaymentEvent(payment.id, 'redemption_success', `MXNB redemption successful. Juno ref: ${redemptionReference}`);
  } catch (err: any) {
    redemptionStatus = 'failed';
    // Enhanced error logging for debugging
    const safeError = {
      responseData: err?.response?.data,
      message: err?.message,
      stack: err?.stack
    };
    redemptionResult = safeError;
    await logPaymentEvent(payment.id, 'redemption_failed', `MXNB redemption failed: ${JSON.stringify(safeError)}`);
    // Log failed JunoTransaction
    const junoTx = junoTxRepo.create({ type: 'redemption', reference: redemptionReference ?? undefined, amount: amountMXNB, status: redemptionStatus });
    await junoTxRepo.save(junoTx);
    console.error('Full Juno redemption error:', safeError);
    throw new Error('MXNB redemption failed: ' + JSON.stringify(safeError));
  }

  // Log successful JunoTransaction
  const junoTx = junoTxRepo.create({ type: 'redemption', reference: redemptionReference ?? undefined, amount: amountMXNB, status: redemptionStatus });
  await junoTxRepo.save(junoTx);

  // Update payment status to completed
  payment.status = 'completed';
  await paymentRepo.save(payment);

  console.log(`[Payout] MXNB redemption successful for payment ${payment.id}. Amount: ${amountMXNB} MXNB. Reference: ${redemptionReference}`);
  await logPaymentEvent(payment.id, 'redemption_success', `MXNB redemption successful. Amount: ${amountMXNB} MXNB. Reference: ${redemptionReference}`);
  
  // Create in-app payment completion notification
  try {
    await createPaymentNotifications(payment.id, 'payout_completed');
    console.log(`📧 Payment ${payment.id} MXNB redemption completed - in-app notifications sent`);
  } catch (notificationError) {
    console.error(`⚠️ Failed to send MXNB redemption completion in-app notifications for payment ${payment.id}:`, notificationError);
  }
  
  // Send email notification for MXNB redemption completion
  try {
    const recipients = [];
    if (payment.payer_email) {
      recipients.push({ email: payment.payer_email, role: 'payer' });
    }
    if (payment.recipient_email) {
      recipients.push({ email: payment.recipient_email, role: 'seller' });
    }
    
    if (recipients.length > 0) {
      await sendPaymentEventNotification({
        eventType: 'payout_completed',
        paymentId: payment.id.toString(),
        paymentDetails: {
          amount: payment.amount,
          description: payment.description,
          payer_email: payment.payer_email,
          recipient_email: payment.recipient_email
        },
        recipients
      });
    }
    console.log(`📧 Payment ${payment.id} MXNB redemption completed - email notifications sent`);
  } catch (emailError) {
    console.error(`⚠️ Failed to send MXNB redemption completion email notifications for payment ${payment.id}:`, emailError);
  }

  // Send SPEI completion notification with receipt for MXNB redemption
  try {
    // Get original buyer information from payment (user field represents the buyer)
    const buyer = payment.user;
    
    const speiReceiptData: SPEIReceiptData = {
      transactionId: redemptionReference || `MXNB-${payment.id}-${Date.now()}`,
      junoTransactionId: redemptionReference,
      amount: amountMXNB,
      currency: 'MXN',
      status: 'SUCCEEDED',
      createdAt: new Date(),
      
      paymentId: payment.id,
      paymentDescription: payment.description,
      escrowId: escrow.id,
      
      recipientName: seller.full_name || seller.email,
      recipientEmail: seller.email,
      bankAccountId: seller.juno_bank_account_id,
      clabe: seller.payout_clabe,
      
      senderName: 'Kustodia',
      senderInfo: 'Plataforma de Pagos Seguros - Redención MXNB',
      
      reference: payment.reference || `KUSTODIA-${payment.id}`,
      concept: payment.description || 'Redención MXNB a MXN',
      speiReference: `MXNB${payment.id.toString().padStart(6, '0')}`,
      
      // Original deposit information (buyer's bank → Nvio flow)
      originalSenderName: buyer?.full_name || buyer?.email || 'Comprador',
      custodyProvider: 'Kustodia',
      paymentProcessor: 'Nvio Pagos México',
      originalDepositAmount: payment.amount ? Number(payment.amount) : amountMXNB,
      
      originalAmount: amountMXNB,
      commissionAmount: 0, // No commission on MXNB redemption
      netAmount: amountMXNB
    };

    await sendPaymentEventNotification({
      eventType: 'spei_transfer_completed',
      paymentId: payment.id.toString(),
      paymentDetails: {
        amount: amountMXNB,
        currency: 'MXN',
        status: payment.status,
        description: payment.description || 'Redención MXNB'
      },
      recipients: [{
        email: seller.email,
        role: 'seller'
      }],
      includeSPEIReceipt: true,
      speiReceiptData,
      junoTransactionId: redemptionReference
    });

    console.log(`[Payout] MXNB redemption SPEI receipt sent to ${seller.email}`);
  } catch (notificationError) {
    console.error('[Payout] Failed to send MXNB redemption notification:', notificationError);
  }

  return { escrow, payment, redemptionResult };
}

// (legacy) Redeems MXNB from Juno (crypto withdrawal to platform wallet), then triggers payout to seller.
// Logs all actions as PaymentEvent.
// @param escrowId The ID of the escrow to process
// @param destAddress The platform wallet address to receive MXNB (from .env or config)
export async function redeemAndPayout(escrowId: number, destAddress: string) {
  const escrowRepo = ormconfig.getRepository(Escrow);
  const paymentRepo = ormconfig.getRepository(Payment);
  const junoTxRepo = ormconfig.getRepository(JunoTransaction);

  // Fetch escrow and payment
  const escrow = await escrowRepo.findOne({ where: { id: escrowId }, relations: ['payment'] });
  if (!escrow) throw new Error('Escrow not found');
  const payment = await paymentRepo.findOne({ where: { id: escrow.payment.id }, relations: ['user'] });
  if (!payment) throw new Error('Payment not found');

  // 1. Initiate MXNB withdrawal (redemption) from Juno
  const amount = Number(escrow.release_amount);
  const asset = 'MXNB';
  const blockchain = 'ARBITRUM';
  const address = destAddress;

  await logPaymentEvent(payment.id, 'redemption_initiated', `Initiating MXNB withdrawal to platform wallet: ${address}`);

  // Prepare withdrawal body
  const bodyObj: any = { amount, asset, blockchain, address };
  // Optionally add compliance if needed (future)

  // Prepare headers/signature (same as junoWithdrawOnchain.ts)
  const JUNO_ENV = process.env.JUNO_ENV || 'stage';
  const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY! : process.env.JUNO_API_KEY!;
  const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET! : process.env.JUNO_API_SECRET!;
  const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
  const endpoint = '/mint_platform/v1/withdrawals';
  const url = `${BASE_URL}${endpoint}`;
  const body = JSON.stringify(bodyObj);
  const nonce = Date.now().toString();
  const method = 'POST';
  const requestPath = endpoint;
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  };

  let redemptionResult, redemptionStatus = 'pending', redemptionReference = undefined;
  try {
    const response = await axios.post(url, bodyObj, { headers });
    redemptionResult = response.data;
    redemptionStatus = 'success';
    redemptionReference = redemptionResult?.id;
    await logPaymentEvent(payment.id, 'redemption_success', `MXNB withdrawal successful. Juno ref: ${redemptionReference}`);
  } catch (err: any) {
    redemptionStatus = 'failed';
    redemptionResult = err?.response?.data || err?.message || err;
    await logPaymentEvent(payment.id, 'redemption_failed', `MXNB withdrawal failed: ${JSON.stringify(redemptionResult)}`);
    // Log failed JunoTransaction
    const junoTx = junoTxRepo.create({ type: 'redemption', reference: redemptionReference, amount, status: redemptionStatus });
    await junoTxRepo.save(junoTx);
    throw new Error('MXNB withdrawal failed: ' + JSON.stringify(redemptionResult));
  }

  // Log successful JunoTransaction
  const junoTx = junoTxRepo.create({ type: 'redemption', reference: redemptionReference, amount, status: redemptionStatus });
  await junoTxRepo.save(junoTx);

  // 2. After redemption, trigger payout to seller
  await logPaymentEvent(payment.id, 'payout_initiated', 'Triggering payout to seller after redemption.');
  // Use existing payout logic
  // We assume releaseEscrowAndPayout logs its own events and status
  const payoutResult = await releaseEscrowAndPayout(escrowId);
  await logPaymentEvent(payment.id, 'payout_completed', 'Payout to seller completed.');

  return { escrow, payment, redemptionResult, payoutResult };
}
