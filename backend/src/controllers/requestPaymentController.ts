import { Request, Response } from "express";
import ormconfig from "../ormconfig";
import { Payment } from "../entity/Payment";

export const requestPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      payer_email,
      amount,
      currency = 'MXN',
      description,
      commission_percent,
      commission_amount,
      commission_beneficiary_name,
      commission_beneficiary_email
    } = req.body;

    // The requesting user is the recipient (payee)
    const tokenUser = (req as any).user;
    if (!tokenUser || !tokenUser.email) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    if (!payer_email || !amount) {
      res.status(400).json({ error: 'Faltan datos obligatorios.' });
      return;
    }

    // Validate payer
    const userRepo = ormconfig.getRepository('User');
    const payer = await userRepo.findOne({ where: { email: payer_email } });
    if (!payer || !payer.email_verified) {
      res.status(400).json({ error: 'El pagador no es un usuario verificado de Kustodia.' });
      return;
    }

    // Validate commission beneficiary if provided
    if (commission_beneficiary_email) {
      const commissioner = await userRepo.findOne({ where: { email: commission_beneficiary_email } });
      if (!commissioner || !commissioner.email_verified) {
        res.status(400).json({ error: 'El beneficiario de la comisión no es un usuario verificado de Kustodia.' });
        return;
      }
    }

    const paymentRepo = ormconfig.getRepository(Payment);
    let beneficiaryClabe: string | undefined = undefined;
    if (commission_beneficiary_email) {
      const beneficiaryUser = await userRepo.findOne({ where: { email: commission_beneficiary_email } });
      if (!beneficiaryUser || !beneficiaryUser.payout_clabe) {
        res.status(400).json({ error: 'El beneficiario de comisión debe estar registrado y tener CLABE de retiro' });
        return;
      }
      beneficiaryClabe = beneficiaryUser.payout_clabe;
    }
    const payment = paymentRepo.create({
      recipient_email: tokenUser.email,
      payer_email, // <--- ensure payer_email is saved
      amount,
      currency,
      description,
      commission_percent,
      commission_amount,
      commission_beneficiary_name,
      commission_beneficiary_email,
      commission_beneficiary_clabe: beneficiaryClabe,
      status: 'requested'
    });
    await paymentRepo.save(payment);

    // Notificación por email a pagador, vendedor y beneficiario de comisión (si existe)
    const { sendPaymentEventNotification } = require('../utils/paymentNotificationService');
    const recipients = [
      { email: payer_email, role: 'payer' },
      { email: tokenUser.email, role: 'seller' }
    ];
    await sendPaymentEventNotification({
      eventType: 'payment_created',
      paymentId: payment.id.toString(),
      paymentDetails: payment,
      recipients,
      commissionBeneficiaryEmail: commission_beneficiary_email || undefined
    });

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ error: 'Error al solicitar pago', details: err instanceof Error ? err.message : err });
  }
};
