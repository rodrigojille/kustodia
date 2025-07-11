import { Request, Response } from 'express';
import AppDataSource from '../ormconfig';
import { Payment } from '../entity/Payment';

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const paymentRepo = AppDataSource.getRepository(Payment);
    
    // Get all payments with user relationships for proper payer/seller display
    const payments = await paymentRepo.find({
      relations: ['user', 'seller'],
      order: {
        created_at: 'DESC'
      }
    });

    // Transform the data to include all needed fields for the frontend
    const transformedPayments = payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      created_at: payment.created_at,
      recipient_email: payment.recipient_email,
      payer_email: payment.user?.email || payment.payer_email || null,
      description: payment.description || null,
      payment_type: payment.payment_type || 'traditional'
    }));

    res.json(transformedPayments);
  } catch (error: any) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payments',
      message: error.message 
    });
  }
};
