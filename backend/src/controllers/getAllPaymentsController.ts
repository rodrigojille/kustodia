import { Request, Response } from 'express';
import ormconfig from '../ormconfig';
import { Payment } from '../entity/Payment';

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const paymentRepo = ormconfig.getRepository(Payment);
    
    // Get all payments with basic information needed for dashboard
    const payments = await paymentRepo.find({
      select: ['id', 'amount', 'currency', 'status', 'created_at', 'recipient_email'],
      order: {
        created_at: 'DESC'
      }
    });

    res.json(payments);
  } catch (error: any) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payments',
      message: error.message 
    });
  }
};
