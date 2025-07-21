import { Response } from 'express';
import { AuthenticatedRequest } from '../AuthenticatedRequest';
import AppDataSource from '../ormconfig';
import { Payment } from '../entity/Payment';
import { PaymentEvent } from '../entity/PaymentEvent';
import { Escrow } from '../entity/Escrow';
import { releaseEscrowAndPayout } from '../services/payoutService';
import { createNotification } from '../services/notificationService';
import { User } from '../entity/User';



/**
 * Handle payer approval for a payment
 */
export const approvePaymentPayer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email;

    if (!userEmail) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = await paymentRepo.findOne({
      where: { id: parseInt(id) },
      relations: ['escrow']
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    if (!payment.escrow) {
      res.status(400).json({ error: 'Payment has no associated escrow' });
      return;
    }

    // Check if user is the payer
    if (payment.payer_email !== userEmail) {
      res.status(403).json({ error: 'Only payer can approve this payment' });
      return;
    }

    // Check if payment is in correct status
    if (payment.status !== 'funded' && payment.status !== 'active' && payment.status !== 'escrowed') {
      res.status(400).json({ error: 'Payment cannot be approved in current status' });
      return;
    }

    // Update payer approval
    payment.payer_approval = true;
    payment.payer_approval_timestamp = new Date();
    await paymentRepo.save(payment);

    // Log approval event
    const eventRepo = AppDataSource.getRepository(PaymentEvent);
    const approvalEvent = eventRepo.create({
      payment,
      type: 'payer_approved',
      description: 'Pagador aprobó la liberación',
      created_at: new Date()
    });
    await eventRepo.save(approvalEvent);

    // Send notification to payee about payer approval
    const userRepo = AppDataSource.getRepository(User);
    const payeeUser = await userRepo.findOne({ where: { email: payment.recipient_email } });
    if (payeeUser) {
      await createNotification(
        payeeUser.id,
        `El comprador ha aprobado la liberación del pago #${payment.id}`,
        `/dashboard/payments/${payment.id}`,
        'info',
        payment.id,
        'payment'
      );
    }

    // Check if both parties have approved
    if (payment.payer_approval && payment.payee_approval) {
      console.log(`[APPROVAL] Both parties approved Payment ${id}, triggering release`);
      
      try {
        // Trigger escrow release and payout
        const releaseResult = await releaseEscrowAndPayout(payment.escrow.id);
        console.log(`[APPROVAL] Payment ${id} released successfully`);
        
        // Send success notifications to both parties
        const payerUser = await userRepo.findOne({ where: { email: payment.payer_email } });
        const payeeUser = await userRepo.findOne({ where: { email: payment.recipient_email } });
        
        if (payerUser) {
          await createNotification(
            payerUser.id,
            `¡Pago #${payment.id} liberado exitosamente! Los fondos están en camino al vendedor.`,
            `/dashboard/payments/${payment.id}`,
            'success',
            payment.id,
            'payment'
          );
        }
        if (payeeUser) {
          await createNotification(
            payeeUser.id,
            `¡Pago #${payment.id} liberado! Los fondos serán transferidos a tu cuenta bancaria.`,
            `/dashboard/payments/${payment.id}`,
            'success',
            payment.id,
            'payment'
          );
        }
        
        res.json({ 
          success: true, 
          message: 'Payment approved and released successfully',
          both_approved: true,
          release_triggered: true,
          payment_status: releaseResult.payment.status
        });
      } catch (releaseError) {
        console.error('[APPROVAL] Error releasing payment:', releaseError);
        res.json({ 
          success: true, 
          message: 'Payment approved, but release failed',
          both_approved: true,
          release_triggered: false,
          error: 'Release failed'
        });
      }
    } else {
      res.json({ 
        success: true, 
        message: 'Payer approval recorded, waiting for payee approval',
        both_approved: false
      });
    }

  } catch (error) {
    console.error('[APPROVAL PAYER ERROR]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Handle payee approval for a payment
 */
export const approvePaymentPayee = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email;

    if (!userEmail) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = await paymentRepo.findOne({
      where: { id: parseInt(id) },
      relations: ['escrow']
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    if (!payment.escrow) {
      res.status(400).json({ error: 'Payment has no associated escrow' });
      return;
    }

    // Check if user is the payee
    if (payment.recipient_email !== userEmail) {
      res.status(403).json({ error: 'Only payee can approve this payment' });
      return;
    }

    // Check if payment is in correct status
    if (payment.status !== 'funded' && payment.status !== 'active' && payment.status !== 'escrowed') {
      res.status(400).json({ error: 'Payment cannot be approved in current status' });
      return;
    }

    // Update payee approval
    payment.payee_approval = true;
    payment.payee_approval_timestamp = new Date();
    await paymentRepo.save(payment);

    // Log approval event
    const eventRepo = AppDataSource.getRepository(PaymentEvent);
    const approvalEvent = eventRepo.create({
      payment,
      type: 'payee_approved',
      description: 'Beneficiario aprobó la liberación',
      created_at: new Date()
    });
    await eventRepo.save(approvalEvent);

    // Send notification to payer about payee approval
    const userRepo = AppDataSource.getRepository(User);
    const payerUser = await userRepo.findOne({ where: { email: payment.payer_email } });
    if (payerUser) {
      await createNotification(
        payerUser.id,
        `El vendedor ha aprobado la liberación del pago #${payment.id}`,
        `/dashboard/payments/${payment.id}`,
        'info',
        payment.id,
        'payment'
      );
    }

    // Check if both parties have approved
    if (payment.payer_approval && payment.payee_approval) {
      console.log(`[APPROVAL] Both parties approved Payment ${id}, triggering release`);
      
      try {
        // Trigger escrow release and payout
        const releaseResult = await releaseEscrowAndPayout(payment.escrow.id);
        console.log(`[APPROVAL] Payment ${id} released successfully`);
        
        // Send success notifications to both parties
        const payerUser = await userRepo.findOne({ where: { email: payment.payer_email } });
        const payeeUser = await userRepo.findOne({ where: { email: payment.recipient_email } });
        
        if (payerUser) {
          await createNotification(
            payerUser.id,
            `¡Pago #${payment.id} liberado exitosamente! Los fondos están en camino al vendedor.`,
            `/dashboard/payments/${payment.id}`,
            'success',
            payment.id,
            'payment'
          );
        }
        if (payeeUser) {
          await createNotification(
            payeeUser.id,
            `¡Pago #${payment.id} liberado! Los fondos serán transferidos a tu cuenta bancaria.`,
            `/dashboard/payments/${payment.id}`,
            'success',
            payment.id,
            'payment'
          );
        }
        
        res.json({ 
          success: true, 
          message: 'Payment approved and released successfully',
          both_approved: true,
          release_triggered: true,
          payment_status: releaseResult.payment.status
        });
      } catch (releaseError) {
        console.error('[APPROVAL] Error releasing payment:', releaseError);
        res.json({ 
          success: true, 
          message: 'Payment approved, but release failed',
          both_approved: true,
          release_triggered: false,
          error: 'Release failed'
        });
      }
    } else {
      res.json({ 
        success: true, 
        message: 'Payee approval recorded, waiting for payer approval',
        both_approved: false
      });
    }

  } catch (error) {
    console.error('[APPROVAL PAYEE ERROR]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
