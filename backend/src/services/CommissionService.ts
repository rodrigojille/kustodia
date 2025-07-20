import { Repository } from 'typeorm';
import AppDataSource from '../ormconfig';
import { CommissionRecipient } from '../entity/CommissionRecipient';
import { Payment } from '../entity/Payment';

export interface CommissionRecipientData {
  broker_email: string;
  broker_name?: string;
  broker_percentage: number;
}

export interface CommissionCalculation {
  net_amount: number;
  total_commission: number;
  recipients: (CommissionRecipientData & { broker_amount: number })[];
}

export class CommissionService {
  private commissionRepo: Repository<CommissionRecipient>;

  constructor() {
    this.commissionRepo = AppDataSource.getRepository(CommissionRecipient);
  }

  /**
   * Calculate commission amounts for all recipients
   */
  calculateCommissions(
    paymentAmount: number,
    totalCommissionPercentage: number,
    recipients: CommissionRecipientData[]
  ): CommissionCalculation {
    // Validate commission percentage
    if (totalCommissionPercentage < 0 || totalCommissionPercentage > 50) {
      throw new Error('Commission percentage must be between 0 and 50%');
    }

    // Calculate total commission amount
    const totalCommission = paymentAmount * (totalCommissionPercentage / 100);
    const netAmount = paymentAmount - totalCommission;

    // Validate recipient percentages sum to 100% or less
    const totalRecipientPercentage = recipients.reduce((sum, r) => sum + r.broker_percentage, 0);
    if (totalRecipientPercentage > 100) {
      throw new Error('Commission recipient percentages cannot exceed 100%');
    }

    // Calculate individual broker amounts
    const recipientAmounts = recipients.map(recipient => ({
      ...recipient,
      broker_amount: totalCommission * (recipient.broker_percentage / 100)
    }));

    return {
      net_amount: netAmount,
      total_commission: totalCommission,
      recipients: recipientAmounts
    };
  }

  /**
   * Create commission recipient records in database
   */
  async createCommissionRecipients(
    paymentId: number,
    recipients: (CommissionRecipientData & { broker_amount: number })[]
  ): Promise<CommissionRecipient[]> {
    const commissionRecipients = recipients.map(recipient => {
      const newRecipient = this.commissionRepo.create({
        payment_id: paymentId,
        broker_email: recipient.broker_email,
        broker_name: recipient.broker_name || undefined,
        broker_percentage: recipient.broker_percentage,
        broker_amount: recipient.broker_amount,
        paid: false,
        paid_at: undefined,
        payment_transaction_id: undefined
      });
      return newRecipient;
    });

    return await this.commissionRepo.save(commissionRecipients);
  }

  /**
   * Get commission recipients for a payment
   */
  async getCommissionRecipients(paymentId: number): Promise<CommissionRecipient[]> {
    return await this.commissionRepo.find({
      where: { payment_id: paymentId },
      order: { created_at: 'ASC' }
    });
  }

  /**
   * Mark commission as paid for a specific recipient
   */
  async markCommissionPaid(
    recipientId: string,
    transactionId: string
  ): Promise<CommissionRecipient> {
    const recipient = await this.commissionRepo.findOne({
      where: { id: recipientId }
    });

    if (!recipient) {
      throw new Error('Commission recipient not found');
    }

    recipient.paid = true;
    recipient.paid_at = new Date();
    recipient.payment_transaction_id = transactionId;

    return await this.commissionRepo.save(recipient);
  }

  /**
   * Process commission payments for all recipients of a payment
   */
  async processCommissionPayments(paymentId: number): Promise<void> {
    const recipients = await this.getCommissionRecipients(paymentId);
    
    for (const recipient of recipients) {
      if (!recipient.paid) {
        // Here you would integrate with your payment processor
        // For now, we'll just mark as paid with a placeholder transaction ID
        await this.markCommissionPaid(recipient.id, `commission_${Date.now()}`);
      }
    }
  }

  /**
   * Get commission statistics for a payment
   */
  async getCommissionStats(paymentId: number): Promise<{
    total_recipients: number;
    total_commission: number;
    paid_recipients: number;
    paid_amount: number;
    pending_amount: number;
  }> {
    const recipients = await this.getCommissionRecipients(paymentId);
    
    const totalRecipients = recipients.length;
    const totalCommission = recipients.reduce((sum, r) => sum + r.broker_amount, 0);
    const paidRecipients = recipients.filter(r => r.paid).length;
    const paidAmount = recipients.filter(r => r.paid).reduce((sum, r) => sum + r.broker_amount, 0);
    const pendingAmount = totalCommission - paidAmount;

    return {
      total_recipients: totalRecipients,
      total_commission: totalCommission,
      paid_recipients: paidRecipients,
      paid_amount: paidAmount,
      pending_amount: pendingAmount
    };
  }
}
