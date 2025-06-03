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
    const payment = paymentRepo.create({
      recipient_email: tokenUser.email,
      amount,
      currency,
      description,
      commission_percent,
      commission_amount,
      commission_beneficiary_name,
      commission_beneficiary_email,
      status: 'requested'
    });
    await paymentRepo.save(payment);
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ error: 'Error al solicitar pago', details: err instanceof Error ? err.message : err });
  }
};
