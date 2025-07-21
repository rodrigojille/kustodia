"use strict";
// Script to manually resolve a dispute as admin for a given escrow/payment
const ormconfig = require('../ormconfig').default;
const { Escrow } = require('../entity/Escrow');
const { Dispute } = require('../entity/Dispute');
const { Payment } = require('../entity/Payment');
const { PaymentEvent } = require('../entity/PaymentEvent');
/**
 * Usage: npx ts-node src/scripts/adminResolveDisputeManual.ts <escrowId> <paymentId> <adminNotes>
 * Example: npx ts-node src/scripts/adminResolveDisputeManual.ts 59 71 "Disputa resuelta a favor del vendedor. Payout completado."
 */
async function main() {
    const [, , escrowIdArg, paymentIdArg, ...adminNotesArr] = process.argv;
    if (!escrowIdArg || !paymentIdArg) {
        console.error('Usage: npx ts-node src/scripts/adminResolveDisputeManual.ts <escrowId> <paymentId> <adminNotes>');
        process.exit(1);
    }
    const escrowId = Number(escrowIdArg);
    const paymentId = Number(paymentIdArg);
    const adminNotes = adminNotesArr.join(' ') || '';
    await ormconfig.initialize();
    const escrowRepo = ormconfig.getRepository(Escrow);
    const disputeRepo = ormconfig.getRepository(Dispute);
    const paymentRepo = ormconfig.getRepository(Payment);
    const paymentEventRepo = ormconfig.getRepository(PaymentEvent);
    const escrow = await escrowRepo.findOne({ where: { id: escrowId }, relations: ['payment'] });
    if (!escrow) {
        console.error('Escrow not found');
        process.exit(1);
    }
    const dispute = await disputeRepo.findOne({ where: { escrow }, order: { created_at: 'DESC' } });
    if (!dispute) {
        console.error('No dispute found for this escrow');
        process.exit(1);
    }
    // Update statuses
    escrow.dispute_status = 'resolved';
    escrow.status = 'released';
    dispute.status = 'resolved';
    dispute.admin_notes = adminNotes;
    escrow.dispute_history = [
        ...(escrow.dispute_history || []),
        { action: 'approved', by: 'admin', notes: adminNotes, at: new Date() }
    ];
    // Update payment status
    const payment = await paymentRepo.findOne({ where: { id: paymentId } });
    if (payment) {
        payment.status = 'paid';
        await paymentRepo.save(payment);
    }
    // Log PaymentEvents
    await paymentEventRepo.save(paymentEventRepo.create({
        paymentId,
        type: 'dispute_resolved',
        description: `Disputa resuelta a favor del vendedor. Payout completado.`
    }));
    // Evento intermedio explícito en el timeline
    await paymentEventRepo.save(paymentEventRepo.create({
        paymentId,
        type: 'dispute_solved',
        description: 'La disputa fue resuelta por el admin. Se procederá con el pago al vendedor.'
    }));
    await paymentEventRepo.save(paymentEventRepo.create({
        paymentId,
        type: 'payout_completed',
        description: 'Pago liberado y enviado al vendedor tras resolución de disputa.'
    }));
    await disputeRepo.save(dispute);
    await escrowRepo.save(escrow);
    console.log('Dispute resolved and statuses updated for escrow', escrowId, 'and payment', paymentId);
    process.exit(0);
}
main().catch(console.error);
