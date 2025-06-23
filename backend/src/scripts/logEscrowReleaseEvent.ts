export {};
// CLABE/SPEI Flow - Logs PaymentEvent for escrow and payment after a manual blockchain release
import ormconfig from '../ormconfig';
import { PaymentEvent } from '../entity/PaymentEvent';
import { Escrow } from '../entity/Escrow';
import { Payment } from '../entity/Payment';

async function main() {
  await ormconfig.initialize();
  const escrowId = 59; // DB escrow ID
  const paymentId = 71; // Payment ID
  const paymentEventRepo = ormconfig.getRepository(PaymentEvent);

  // Add event for escrow release
  await paymentEventRepo.save(paymentEventRepo.create({
    paymentId,
    type: 'escrow_released',
    description: 'Escrow liberado y fondos liberados on-chain.'
  }));

  // Add event for payout initiated (optional, if you want to reflect payout start)
  await paymentEventRepo.save(paymentEventRepo.create({
    paymentId,
    type: 'payout_initiated',
    description: 'Payout iniciado tras liberación de fondos.'
  }));

  console.log('PaymentEvents for escrow release and payout logged for escrow', escrowId, 'and payment', paymentId);
  process.exit(0);
}

main().catch(console.error);
