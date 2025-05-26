import ormconfig from '../ormconfig';
import { Payment } from '../entity/Payment';
import { Escrow } from '../entity/Escrow';
import { User } from '../entity/User';
import { JunoTransaction } from '../entity/JunoTransaction';
import { redeemMXNbForMXN, getJunoTransactions, sendMxnPayout } from '../utils/junoClient';
import { isValidReference, sanitizeReference } from '../utils/referenceValidation';
import { recordPaymentEvent } from '../utils/paymentEvent';

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

  // Prepare payout
  const amount = Number(escrow.release_amount);
  const currency = payment.currency || 'MXN';
  // Use payout_clabe and seller.full_name for Juno redemption and payout
  const payout_clabe = seller.payout_clabe;
  if (!payout_clabe) throw new Error('Seller missing payout_clabe');
  const recipient_legal_name = seller.full_name || seller.email || 'Beneficiario Kustodia';

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

  // New Juno payout flow: MXNB redemption → poll → payout
  let junoResult, junoStatus, tx_hash;
  if (process.env.NODE_ENV === 'production') {
    // 1. Redeem MXNB for MXN
    let redemptionResult, redemptionStatus, redemptionTxId;
    try {
      redemptionResult = await redeemMXNbForMXN(amount, payout_clabe, recipient_legal_name);
      redemptionTxId = redemptionResult?.payload?.id;
      await recordPaymentEvent(payment, 'redemption_initiated', `Redención MXNB iniciada: ${redemptionTxId}`);
    } catch (err: any) {
      // Log the full error object and response data
      console.error('[RELEASE ESCROW REDEMPTION ERROR]', err, err?.response?.data);
      await recordPaymentEvent(payment, 'redemption_failed', 'Redención MXNB fallida: ' + (err?.response?.data?.error?.message || err?.message || err));
      throw new Error('Redención MXNB→MXN fallida: ' + (err?.response?.data?.error?.message || err?.message || err));
    }
    // 2. Poll for redemption completion
    let pollCount = 0, redemptionSucceeded = false;
    while (pollCount < 20) { // poll up to 20 times (e.g. 20s)
      const txs = await getJunoTransactions({ type: 'REDEMPTION', sort: 'createdAt,DESC', size: 10 });
      const found = txs?.payload?.content?.find((tx: any) => tx.id === redemptionTxId);
      if (found && found.summary_status === 'SUCCEEDED') {
        redemptionSucceeded = true;
        await recordPaymentEvent(payment, 'redemption_succeeded', `Redención MXNB completada: ${redemptionTxId}`);
        break;
      }
      await new Promise(res => setTimeout(res, 1000));
      pollCount++;
    }
    if (!redemptionSucceeded) {
      await recordPaymentEvent(payment, 'redemption_timeout', `Redención MXNB no confirmada después de polling: ${redemptionTxId}`);
      throw new Error('Redención MXNB→MXN no confirmada tras polling');
    }
    // 3. Payout MXN to bank account
    try {
      junoResult = await sendMxnPayout(amount, payout_clabe, recipient_legal_name);
      junoStatus = 'success';
      tx_hash = junoResult?.payload?.id || undefined;
      await recordPaymentEvent(payment, 'mxn_payout_initiated', `Payout MXN iniciado: ${tx_hash}`);
      await recordPaymentEvent(payment, 'mxn_payout_succeeded', `Payout MXN completado: ${tx_hash}`);
    } catch (err: any) {
      junoStatus = 'failed';
      // Log the full error object and response data
      console.error('[RELEASE ESCROW PAYOUT ERROR]', err, err?.response?.data);
      await recordPaymentEvent(payment, 'mxn_payout_failed', 'Payout MXN fallido: ' + (err?.response?.data?.error?.message || err?.message || err));
      junoResult = err?.response?.data || err?.message || err;
    }
  } else {
    // MOCK for testing/dev
    const custodyAmount = Number(escrow.custody_amount);
    // 1. Create a redemption transaction for custody_amount
    const redemptionTx = junoTxRepo.create({
      type: 'redemption',
      reference: payment.reference,
      amount: custodyAmount,
      status: 'success',
      tx_hash: 'MOCK-REDEMPTION-TX-CUSTODY',
    });
    await junoTxRepo.save(redemptionTx);
    // 2. Create a payout transaction for custody_amount
    junoResult = { id: 'MOCK-TX-HASH', mock: true };
    junoStatus = 'success';
    tx_hash = 'MOCK-TX-HASH-CUSTODY';
    const payoutTx = junoTxRepo.create({
      type: 'payout',
      reference: payment.reference,
      amount: custodyAmount,
      status: junoStatus,
      tx_hash,
    });
    await junoTxRepo.save(payoutTx);
  }

  // Log Juno transaction (only in production)
  if (process.env.NODE_ENV === 'production') {
    const junoTx = junoTxRepo.create({
      type: 'payout',
      reference,
      amount,
      status: junoStatus,
      tx_hash,
    });
    await junoTxRepo.save(junoTx);
  }

  // Debug: imprime el estado de junoStatus
  console.log('[DEBUG] junoStatus:', junoStatus);
  // Update escrow/payment status if payout succeeded
  if (junoStatus === 'success') {
    escrow.status = 'released';
    payment.status = 'paid';
    await escrowRepo.save(escrow);
    console.log(`[LOG] Escrow ${escrow.id} status after save:`, escrow.status);
    await paymentRepo.save(payment);
    console.log(`[LOG] Payment ${payment.id} status after save:`, payment.status);
    // Step 5: Record custody released event
    await recordPaymentEvent(payment, 'custody_released', 'Custodia liberada y pagada al vendedor');
    // Consulta directa en la base de datos
    const refreshedEscrow = await escrowRepo.findOne({ where: { id: escrow.id } });
    const refreshedPayment = await paymentRepo.findOne({ where: { id: payment.id } });
    console.log(`[DB] Escrow ${escrow.id} status in DB after save:`, refreshedEscrow?.status);
    console.log(`[DB] Payment ${payment.id} status in DB after save:`, refreshedPayment?.status);
  }

  return { escrow, payment, seller, junoResult };

}
