import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import AppDataSource from '../ormconfig';
import { Payment } from '../entity/Payment';
import { User } from '../entity/User';
import { Escrow } from '../entity/Escrow';
import { CommissionService } from '../services/CommissionService';
import { validateCobroPayment } from '../validation/cobroValidation';
import { createJunoClabe } from '../services/junoService';
import { getPlatformCommissionPercent, calculatePlatformCommission, type PaymentFlowType } from '../utils/platformCommissionConfig';

export class CobroPaymentController {
  private paymentRepo: Repository<Payment>;
  private userRepo: Repository<User>;
  private escrowRepo: Repository<Escrow>;
  private commissionService: CommissionService;

  constructor() {
    this.paymentRepo = AppDataSource.getRepository(Payment);
    this.userRepo = AppDataSource.getRepository(User);
    this.escrowRepo = AppDataSource.getRepository(Escrow);
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

      // Validate commission recipients exist and are verified (only if there are recipients)
      if (commission_recipients && commission_recipients.length > 0) {
        for (const recipient of commission_recipients) {
          const recipientUser = await this.userRepo.findOne({ where: { email: recipient.broker_email } });
          if (!recipientUser || !recipientUser.email_verified) {
            res.status(400).json({ 
              error: `Commission recipient ${recipient.broker_email} is not a verified Kustodia user` 
            });
            return;
          }
        }
      }

      // Calculate platform commission
      const baseAmount = parseFloat(payment_amount.toString());
      const platformCommissionPercent = getPlatformCommissionPercent('cobro_inteligente');
      const platformCommissionBreakdown = calculatePlatformCommission(baseAmount, 'cobro_inteligente');
      const totalAmountToPay = platformCommissionBreakdown.totalAmountToPay;
      
      console.log(`[Platform Commission - Cobro] Commission: ${platformCommissionPercent}%, Amount: $${baseAmount}, Total to pay: $${totalAmountToPay}`);

      // Calculate commission breakdown
      const commissionBreakdown = this.commissionService.calculateCommissions(
        payment_amount,
        total_commission_percentage,
        commission_recipients
      );

      // Generate unique CLABE via Juno API for deposit
      let depositClabe: string;
      try {
        depositClabe = await createJunoClabe();
        console.log(`[Cobro Payment] Generated CLABE: ${depositClabe} for buyer ${buyer_email}`);
      } catch (error) {
        console.error('[Cobro Payment] Error generating CLABE:', error);
        res.status(500).json({ error: 'Error al generar CLABE para depósito' });
        return;
      }

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
        status: 'pending',
        
        // CLABE fields for deposit and payout
        deposit_clabe: depositClabe,
        payout_clabe: seller.payout_clabe,
        payout_juno_bank_account_id: seller.juno_bank_account_id,
        payer_clabe: buyer.deposit_clabe,
        reference: undefined, // Will be set by automation when deposit is detected
        
        // Use existing fields instead of duplicates
        operation_type,
        vertical_type: transaction_category, // Use existing vertical_type
        commission_beneficiary_email: broker_email, // Use existing commission field
        commission_percent: total_commission_percentage, // Use existing commission field
        commission_amount: commissionBreakdown.total_commission, // Use existing commission field
        commission_beneficiary_juno_bank_account_id: broker.juno_bank_account_id,
        commission_beneficiary_clabe: broker.payout_clabe,
        
        // Platform commission fields
        platform_commission_percent: platformCommissionPercent,
        platform_commission_amount: platformCommissionBreakdown.amount,
        platform_commission_beneficiary_email: 'platform@kustodia.mx',
        total_amount_to_pay: totalAmountToPay, // What user actually pays (base + platform commission)
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

      // Create escrow record if custody is specified
      let savedEscrow: any = null;
      console.log(`[CobroPayment] Debug - custody_percent: ${custody_percent}, custody_period: ${custody_period}`);
      if (custody_percent > 0 && custody_period > 0) {
        const custodyAmount = payment_amount * (custody_percent / 100);
        const releaseAmount = payment_amount - custodyAmount;
        const custodyEnd = new Date();
        custodyEnd.setDate(custodyEnd.getDate() + custody_period);

        try {
          const newEscrow = this.escrowRepo.create({
            payment: savedPayment,
            custody_percent: custody_percent,
            custody_amount: custodyAmount,
            release_amount: releaseAmount,
            custody_end: custodyEnd,
            status: 'pending'
          });

          savedEscrow = await this.escrowRepo.save(newEscrow);
          console.log(`[CobroPayment] Escrow created with ID ${savedEscrow.id} for payment ${savedPayment.id} with ${custody_percent}% custody for ${custody_period} days`);
          
          // Link the escrow back to the payment
          savedPayment.escrow = savedEscrow;
          await this.paymentRepo.save(savedPayment);
          console.log(`[CobroPayment] Payment ${savedPayment.id} linked to escrow ${savedEscrow.id}`);
        } catch (escrowError) {
          console.error(`[CobroPayment] Error creating escrow for payment ${savedPayment.id}:`, escrowError);
          throw escrowError;
        }
      }

      // Create commission recipients
      let savedCommissionRecipients: any[] = [];
      if (commission_recipients && commission_recipients.length > 0) {
        savedCommissionRecipients = await this.commissionService.createCommissionRecipients(
          savedPayment.id,
          commissionBreakdown.recipients
        );
      }

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
          { email: buyer_email, role: 'buyer', name: buyer.full_name || buyer.email.split('@')[0] },
          { email: seller_email, role: 'seller', name: seller.full_name || seller.email.split('@')[0] },
          { email: broker_email, role: 'broker', name: broker.full_name || broker.email.split('@')[0] }
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

      // Create structured response matching regular payment format
      const paymentResponse = {
        id: savedPayment.id,
        recipient_email: savedPayment.recipient_email,
        payer_email: savedPayment.payer_email,
        amount: savedPayment.amount,
        currency: savedPayment.currency,
        description: savedPayment.description,
        reference: savedPayment.reference,
        deposit_clabe: savedPayment.deposit_clabe,
        payout_clabe: savedPayment.payout_clabe,
        status: savedPayment.status,
        payment_type: savedPayment.payment_type,
        vertical_type: savedPayment.vertical_type,
        release_conditions: savedPayment.release_conditions,
        payer_approval: savedPayment.payer_approval,
        payee_approval: savedPayment.payee_approval,
        created_at: savedPayment.created_at,
        escrow_id: savedEscrow?.id // Include escrow_id if escrow was created
      };

      const escrowResponse = savedEscrow ? {
        id: savedEscrow.id,
        custody_percent: savedEscrow.custody_percent,
        custody_amount: savedEscrow.custody_amount,
        release_amount: savedEscrow.release_amount,
        status: savedEscrow.status,
        dispute_status: savedEscrow.dispute_status,
        custody_end: savedEscrow.custody_end,
        created_at: savedEscrow.created_at,
        payment_id: savedPayment.id
      } : null;

      res.json({ 
        success: true, 
        payment: paymentResponse,
        escrow: escrowResponse,
        commission_recipients: savedCommissionRecipients.map(cr => ({
          id: cr.id,
          broker_email: cr.broker_email,
          broker_name: cr.broker_name,
          broker_percentage: cr.broker_percentage,
          broker_amount: cr.broker_amount,
          paid: cr.paid
        })),
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
