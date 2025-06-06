import { Request, Response } from "express";
import ormconfig from "../ormconfig";
import { Payment } from "../entity/Payment";
import { Escrow } from "../entity/Escrow";
import { PaymentEvent } from "../entity/PaymentEvent";

// Accept and process a payment request by ID (payer must be authenticated)
/**
 * Accepts a payment request as the designated payer, triggers escrow/payment logic,
 * updates status and timeline, and sends notifications. Ensures full traceability.
 *
 * @route POST /api/request-payments/:id/accept
 * @access Authenticated (payer only)
 */
export const createEscrowForPayment = async (payment: Payment): Promise<Escrow> => {
  const escrowRepo = ormconfig.getRepository(Escrow);
  // Se espera que payment tenga custody_percent y custody_period definidos
  const custodyPercent = Number(payment.commission_percent || 100); // fallback a 100 si no existe
  const custodyPeriod = Number((payment as any).custody_period || 1); // fallback a 1 día si no existe
  const custodyAmount = Number(payment.amount) * (custodyPercent / 100);
  const releaseAmount = Number(payment.amount) - custodyAmount;
  const escrow = escrowRepo.create({
    payment: payment,
    smart_contract_escrow_id: "", // Se setea después en el webhook
    custody_percent: custodyPercent,
    custody_amount: Math.trunc(custodyAmount),
    release_amount: Math.trunc(releaseAmount),
    status: "pending",
    dispute_status: "none",
    custody_end: new Date(Date.now() + custodyPeriod * 24 * 60 * 60 * 1000)
  });
  await escrowRepo.save(escrow);
  return escrow;
};

export const rejectPaymentRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentId = parseInt(req.params.id, 10);
    if (!paymentId) {
      res.status(400).json({ error: 'Invalid payment request ID' });
      return;
    }
    const tokenUser = (req as any).user;
    if (!tokenUser || !tokenUser.email) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    const paymentRepo = ormconfig.getRepository(Payment);
    const paymentEventRepo = ormconfig.getRepository(PaymentEvent);
    const payment = await paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) {
      res.status(404).json({ error: 'Payment request not found' });
      return;
    }
    if (payment.status !== 'requested') {
      res.status(400).json({ error: 'Payment request is not pending/available' });
      return;
    }
    if (payment.payer_email !== tokenUser.email) {
      res.status(403).json({ error: 'Only the designated payer can reject this request' });
      return;
    }
    payment.status = 'rejected';
    await paymentRepo.save(payment);
    // Evento de timeline: solicitud rechazada
    await paymentEventRepo.save(paymentEventRepo.create({
      paymentId: payment.id,
      type: 'request_rejected',
      description: 'Solicitud de cobro rechazada'
    }));
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ error: 'Error al rechazar la solicitud de pago', details: err instanceof Error ? err.message : err });
  }
};

export const acceptPaymentRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentId = parseInt(req.params.id, 10);
    if (!paymentId) {
      res.status(400).json({ error: 'Invalid payment request ID' });
      return;
    }
    const tokenUser = (req as any).user;
    if (!tokenUser || !tokenUser.email) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    const paymentRepo = ormconfig.getRepository(Payment);
    const paymentEventRepo = ormconfig.getRepository(PaymentEvent);
    const payment = await paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) {
      res.status(404).json({ error: 'Payment request not found' });
      return;
    }
    if (payment.status !== 'requested') {
      res.status(400).json({ error: 'Payment request is not pending/available' });
      return;
    }
    if (payment.payer_email !== tokenUser.email) {
      res.status(403).json({ error: 'Only the designated payer can accept this request' });
      return;
    }
    // --- Crear escrow simétrico a initiatePayment ---
    // Buscar y guardar la CLABE del pagador
    const userRepo = ormconfig.getRepository('User');
    const payerUser = await userRepo.findOne({ where: { email: tokenUser.email } });
    if (payerUser && payerUser.deposit_clabe) {
      payment.payer_clabe = payerUser.deposit_clabe;
    }
    const escrow = await createEscrowForPayment(payment);
    payment.status = 'pending';
    payment.escrow = escrow;
    await paymentRepo.save(payment);
    // Evento de timeline: solicitud aceptada
    await paymentEventRepo.save(paymentEventRepo.create({
      paymentId: payment.id,
      type: 'request_accepted',
      description: 'Solicitud de cobro aceptada'
    }));
    // Evento de timeline: custodia creada
    await paymentEventRepo.save(paymentEventRepo.create({
      paymentId: payment.id,
      type: 'escrow_created',
      description: '🔒 Custodia creada'
    }));
    res.json({ success: true, payment, escrow });
  } catch (err) {
    res.status(500).json({ error: 'Error al aceptar la solicitud de pago', details: err instanceof Error ? err.message : err });
  }
};

