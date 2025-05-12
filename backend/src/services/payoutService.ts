import ormconfig from '../ormconfig';
import { Payment } from '../entity/Payment';
import { Escrow } from '../entity/Escrow';
import { User } from '../entity/User';
import { JunoTransaction } from '../entity/JunoTransaction';
import { sendJunoPayout } from '../utils/junoClient';
import { isValidReference, sanitizeReference } from '../utils/referenceValidation';

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

  // Call Juno
  let junoResult, junoStatus = 'pending', tx_hash = undefined;
  try {
    junoResult = await sendJunoPayout({
      amount,
      beneficiary: seller.full_name || seller.email || "Beneficiario Kustodia",
      clabe: seller.payout_clabe,
      notes_ref: notesRef,
      numeric_ref: numericRef,
      rfc: "XAXX010101000",
      origin_id: `kustodia_${payment.id}`
    });
    junoStatus = 'success';
    tx_hash = junoResult?.id || undefined;
  } catch (err: any) {
    junoStatus = 'failed';
    junoResult = err?.response?.data || err?.message || err;
  }

  // Log Juno transaction
  const junoTx = junoTxRepo.create({
    type: 'payout',
    reference,
    amount,
    status: junoStatus,
    tx_hash,
  });
  await junoTxRepo.save(junoTx);

  // Update escrow/payment status if payout succeeded
  if (junoStatus === 'success') {
    escrow.status = 'released';
    payment.status = 'paid';
    await escrowRepo.save(escrow);
    await paymentRepo.save(payment);
  }

  return { escrow, payment, seller, junoTx, junoResult };
}
