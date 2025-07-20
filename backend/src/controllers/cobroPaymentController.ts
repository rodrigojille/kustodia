import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import AppDataSource from '../ormconfig';
import { Payment } from '../entity/Payment';
import { User } from '../entity/User';
import { CommissionService } from '../services/CommissionService';
import { validateCobroPayment } from '../validation/cobroValidation';

export class CobroPaymentController {
  private paymentRepo: Repository<Payment>;
  private userRepo: Repository<User>;
  private commissionService: CommissionService;

  constructor() {
    this.paymentRepo = AppDataSource.getRepository(Payment);
    this.userRepo = AppDataSource.getRepository(User);
    this.commissionService = new CommissionService();
  }

  /**
   * Create a new cobro inteligente payment request
   */
  async createCobroPayment(req: Request, res: Response): Promise<void> {
    try {
      // Get authenticated user (broker)
      const tokenUser = (req as any).user;
      if (!tokenUser || !tokenUser.email) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      // Validate request data
      const validation = await validateCobroPayment(req.body);
      
      if (!validation.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
        return;
      }
      
      const validatedData = validation.data;
      
      const {
        payment_amount,
        payment_description,
        buyer_email,
        seller_email,
        broker_email,
        total_commission_percentage,
        commission_recipients,
        custody_percent = 100,
        custody_period = 30,
        operation_type,
        release_conditions,
        transaction_category = 'inmobiliaria',
        // Automotive fields
        vehicle_brand,
        vehicle_model,
        vehicle_year,
        vehicle_vin,
        vehicle_mileage,
        vehicle_condition,
        transaction_subtype
      } = validatedData;

      // Validate broker email matches authenticated user
      if (broker_email !== tokenUser.email) {
        res.status(403).json({ error: 'Broker email must match authenticated user' });
        return;
      }

      // Validate all participants exist and are verified
      const buyer = await this.userRepo.findOne({ where: { email: buyer_email } });
      if (!buyer || !buyer.email_verified) {
        res.status(400).json({ error: 'Buyer is not a verified Kustodia user' });
        return;
      }

      const seller = await this.userRepo.findOne({ where: { email: seller_email } });
      if (!seller || !seller.email_verified) {
        res.status(400).json({ error: 'Seller is not a verified Kustodia user' });
        return;
      }

      const broker = await this.userRepo.findOne({ where: { email: broker_email } });
      if (!broker || !broker.email_verified) {
        res.status(400).json({ error: 'Broker is not a verified Kustodia user' });
        return;
      }

      // Validate commission recipients exist and are verified
      for (const recipient of commission_recipients) {
        const recipientUser = await this.userRepo.findOne({ where: { email: recipient.broker_email } });
        if (!recipientUser || !recipientUser.email_verified) {
          res.status(400).json({ 
            error: `Commission recipient ${recipient.broker_email} is not a verified Kustodia user` 
          });
          return;
        }
      }

      // Calculate commission breakdown
      const commissionBreakdown = this.commissionService.calculateCommissions(
        payment_amount,
        total_commission_percentage,
        commission_recipients
      );

      // Create payment record
      const payment = this.paymentRepo.create({
        // Basic payment fields
        user: broker,
        seller: seller,
        recipient_email: seller_email,
        payer_email: buyer_email,
        amount: payment_amount,
        currency: 'MXN',
        description: payment_description,
        payment_type: 'cobro_inteligente',
        status: 'requested',
        
        // Use existing fields instead of duplicates
        operation_type,
        vertical_type: transaction_category, // Use existing vertical_type
        commission_beneficiary_email: broker_email, // Use existing commission field
        commission_percent: total_commission_percentage, // Use existing commission field
        commission_amount: commissionBreakdown.total_commission, // Use existing commission field
        initiator_type: 'payee',
        release_conditions,
        
        // Product-specific fields
        transaction_subtype,
        vehicle_brand,
        vehicle_model,
        vehicle_year: vehicle_year ? parseInt(vehicle_year.toString()) : undefined,
        vehicle_vin,
        vehicle_mileage: vehicle_mileage ? parseInt(vehicle_mileage.toString()) : undefined,
        vehicle_condition,
        
        // Default approval states
        payer_approval: false,
        payee_approval: false
      });

      const savedPayment = await this.paymentRepo.save(payment);

      // Create commission recipients
      await this.commissionService.createCommissionRecipients(
        savedPayment.id,
        commissionBreakdown.recipients
      );

      // Create in-app notifications
      try {
        const { createPaymentNotifications } = await import('../services/paymentNotificationIntegration');
        await createPaymentNotifications(savedPayment.id, 'payment_created');
      } catch (error) {
        console.error('Error creating in-app notifications:', error);
      }

      // Send email notifications
      try {
        const { sendPaymentEventNotification } = require('../utils/paymentNotificationService');
        const recipients = [
          { email: buyer_email, role: 'buyer' },
          { email: seller_email, role: 'seller' },
          { email: broker_email, role: 'broker' }
        ];
        await sendPaymentEventNotification({
          eventType: 'cobro_payment_created',
          paymentId: savedPayment.id.toString(),
          paymentDetails: savedPayment,
          recipients,
          commissionBeneficiaryEmail: commission_recipients[0]?.broker_email
        });
      } catch (error) {
        console.error('Error sending email notifications:', error);
      }

      res.json({ 
        success: true, 
        payment: savedPayment,
        commission_breakdown: commissionBreakdown
      });

    } catch (error) {
      console.error('Error creating cobro payment:', error);
      res.status(500).json({ 
        error: 'Error creating cobro payment', 
        details: error instanceof Error ? error.message : error 
      });
    }
  }

  /**
   * Get cobro payment details with commission breakdown
   */
  async getCobroPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentId = parseInt(req.params.id);
      
      const payment = await this.paymentRepo.findOne({
        where: { id: paymentId },
        relations: ['user', 'seller', 'escrow']
      });

      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      // Only allow access to payment participants
      const tokenUser = (req as any).user;
      const userEmail = tokenUser?.email;
      
      if (payment.payment_type !== 'cobro_inteligente') {
        res.status(400).json({ error: 'Not a cobro inteligente payment' });
        return;
      }

      if (![payment.payer_email, payment.recipient_email, payment.commission_beneficiary_email].includes(userEmail)) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Get commission recipients
      const commissionRecipients = await this.commissionService.getCommissionRecipients(paymentId);
      
      // Get commission stats
      const commissionStats = await this.commissionService.getCommissionStats(paymentId);

      res.json({
        payment,
        commission_recipients: commissionRecipients,
        commission_stats: commissionStats
      });

    } catch (error) {
      console.error('Error getting cobro payment:', error);
      res.status(500).json({ 
        error: 'Error getting cobro payment', 
        details: error instanceof Error ? error.message : error 
      });
    }
  }

  /**
   * Approve cobro payment (buyer approval)
   */
  async approveCobroPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentId = parseInt(req.params.id);
      const tokenUser = (req as any).user;
      
      if (!tokenUser || !tokenUser.email) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const payment = await this.paymentRepo.findOne({
        where: { id: paymentId }
      });

      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      if (payment.payment_type !== 'cobro_inteligente') {
        res.status(400).json({ error: 'Not a cobro inteligente payment' });
        return;
      }

      // Only buyer can approve
      if (payment.payer_email !== tokenUser.email) {
        res.status(403).json({ error: 'Only the buyer can approve this payment' });
        return;
      }

      if (payment.payer_approval) {
        res.status(400).json({ error: 'Payment already approved by buyer' });
        return;
      }

      // Update approval status
      payment.payer_approval = true;
      payment.payer_approval_timestamp = new Date();
      payment.status = 'approved';

      const updatedPayment = await this.paymentRepo.save(payment);

      // Send notifications
      try {
        const { sendPaymentEventNotification } = require('../utils/paymentNotificationService');
        const recipients = [
          { email: payment.recipient_email!, role: 'seller' },
          { email: payment.commission_beneficiary_email!, role: 'broker' }
        ];
        await sendPaymentEventNotification({
          eventType: 'cobro_payment_approved',
          paymentId: paymentId.toString(),
          paymentDetails: updatedPayment,
          recipients
        });
      } catch (error) {
        console.error('Error sending approval notifications:', error);
      }

      res.json({ 
        success: true, 
        payment: updatedPayment 
      });

    } catch (error) {
      console.error('Error approving cobro payment:', error);
      res.status(500).json({ 
        error: 'Error approving cobro payment', 
        details: error instanceof Error ? error.message : error 
      });
    }
  }

  /**
   * Release cobro payment with commission distribution
   */
  async releaseCobroPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentId = parseInt(req.params.id);
      const tokenUser = (req as any).user;
      
      if (!tokenUser || !tokenUser.email) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const payment = await this.paymentRepo.findOne({
        where: { id: paymentId }
      });

      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      if (payment.payment_type !== 'cobro_inteligente') {
        res.status(400).json({ error: 'Not a cobro inteligente payment' });
        return;
      }

      // Only seller can release
      if (payment.recipient_email !== tokenUser.email) {
        res.status(403).json({ error: 'Only the seller can release this payment' });
        return;
      }

      if (!payment.payer_approval) {
        res.status(400).json({ error: 'Payment must be approved by buyer first' });
        return;
      }

      if (payment.status === 'released') {
        res.status(400).json({ error: 'Payment already released' });
        return;
      }

      // Update payment status
      payment.payee_approval = true;
      payment.payee_approval_timestamp = new Date();
      payment.status = 'released';

      const updatedPayment = await this.paymentRepo.save(payment);

      // Process commission payments
      await this.commissionService.processCommissionPayments(paymentId);

      // Send notifications
      try {
        const { sendPaymentEventNotification } = require('../utils/paymentNotificationService');
        const recipients = [
          { email: payment.payer_email!, role: 'buyer' },
          { email: payment.commission_beneficiary_email!, role: 'broker' }
        ];
        await sendPaymentEventNotification({
          eventType: 'cobro_payment_released',
          paymentId: paymentId.toString(),
          paymentDetails: updatedPayment,
          recipients
        });
      } catch (error) {
        console.error('Error sending release notifications:', error);
      }

      res.json({ 
        success: true, 
        payment: updatedPayment 
      });

    } catch (error) {
      console.error('Error releasing cobro payment:', error);
      res.status(500).json({ 
        error: 'Error releasing cobro payment', 
        details: error instanceof Error ? error.message : error 
      });
    }
  }
}

// Create controller instance
const cobroController = new CobroPaymentController();

// Export individual methods for route binding
export const createCobroPayment = cobroController.createCobroPayment.bind(cobroController);
export const getCobroPayment = cobroController.getCobroPayment.bind(cobroController);
export const approveCobroPayment = cobroController.approveCobroPayment.bind(cobroController);
export const releaseCobroPayment = cobroController.releaseCobroPayment.bind(cobroController);
