import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
// NOTE: This service will also need to be migrated to TypeScript
import { EtherFuseService } from '../services/etherfuseService';

const etherFuse = new EtherFuseService();

export class YieldController {

  /**
   * Activate yield generation for a payment
   * POST /api/payments/:id/activate-yield
   */
  static async activateYield(req: Request, res: Response): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const { id: paymentId } = req.params;
      const { userEmail } = req.body; // From authentication middleware
      
      console.log(`🚀 Activating yield for payment ${paymentId} by ${userEmail}`);
      
      const paymentQuery = await queryRunner.query(`
        SELECT p.*, u.email as user_email
        FROM payment p 
        JOIN "user" u ON p.user_id = u.id 
        WHERE p.id = $1 AND u.email = $2
      `, [paymentId, userEmail]);
      
      if (paymentQuery.length === 0) {
        res.status(404).json({ 
          success: false, 
          error: 'Payment not found or unauthorized' 
        });
        return;
      }
      
      const payment = paymentQuery[0];
      
      if (payment.status !== 'approved' && payment.status !== 'funded') {
        res.status(400).json({ 
          success: false, 
          error: 'Payment must be approved or funded to activate yield' 
        });
        return;
      }
      
      const existingYield = await queryRunner.query(`
        SELECT * FROM yield_activations 
        WHERE payment_id = $1 AND status = 'active'
      `, [paymentId]);
      
      if (existingYield.length > 0) {
        res.status(400).json({ 
          success: false, 
          error: 'Yield already activated for this payment' 
        });
        return;
      }
      
      let etherFuseCustomerQuery = await queryRunner.query(`
        SELECT * FROM etherfuse_customers WHERE user_email = $1
      `, [userEmail]);
      
      let etherFuseCustomer;
      if (etherFuseCustomerQuery.length === 0) {
        const customerResult = await etherFuse.createCustomer({
          email: userEmail,
          firstName: payment.payer_name?.split(' ')[0] || 'Unknown',
          lastName: payment.payer_name?.split(' ').slice(1).join(' ') || 'User',
          phone: payment.payer_phone || '',
        });
        
        if (!customerResult.success || !customerResult.data) {
          await queryRunner.rollbackTransaction();
          res.status(400).json({ 
            success: false, 
            error: `EtherFuse customer creation failed: ${customerResult.error}` 
          });
          return;
        }
        
        await queryRunner.query(`
          INSERT INTO etherfuse_customers (user_email, etherfuse_customer_id, kyc_status, etherfuse_onboarded_at)
          VALUES ($1, $2, $3, $4)
        `, [userEmail, customerResult.data.customer_id, customerResult.data.status, new Date()]);
        
        etherFuseCustomer = { etherfuse_customer_id: customerResult.data.customer_id };
      } else {
        etherFuseCustomer = etherFuseCustomerQuery[0];
      }
      
      const orderResult = await etherFuse.createCetesOrder({
        customerId: etherFuseCustomer.etherfuse_customer_id,
        amount: payment.amount,
        paymentId: paymentId
      });
      
      if (!orderResult.success || !orderResult.data) {
        await queryRunner.rollbackTransaction();
        res.status(400).json({ 
          success: false, 
          error: `CETES order creation failed: ${orderResult.error}` 
        });
        return;
      }
      
      const yieldActivation = await queryRunner.query(`
        INSERT INTO yield_activations 
        (payment_id, user_email, etherfuse_order_id, principal_amount, status, etherfuse_response)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        paymentId, 
        userEmail, 
        orderResult.data.order_id, 
        payment.amount, 
        'active', 
        JSON.stringify(orderResult.data.data)
      ]);
      
      await queryRunner.commitTransaction();
      
      console.log(`✅ Yield activated successfully for payment ${paymentId}`);
      
      res.json({
        success: true,
        message: 'Yield generation activated successfully',
        data: {
          yield_activation_id: yieldActivation[0].id,
          etherfuse_order_id: orderResult.data.order_id,
          principal_amount: payment.amount,
          activated_at: yieldActivation[0].activated_at
        }
      });
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error activating yield:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error activating yield' 
      });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get yield status for a payment
   * GET /api/payments/:id/yield-status
   */
  static async getYieldStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id: paymentId } = req.params;
      const { userEmail } = req.body; // From authentication middleware
      
      const yieldQuery = await AppDataSource.query(`
        SELECT ya.*, ye.cumulative_total as total_earnings, ye.earning_date as last_calculated
        FROM yield_activations ya
        LEFT JOIN yield_earnings ye ON ya.id = ye.yield_activation_id 
        WHERE ya.payment_id = $1 AND ya.user_email = $2 AND ya.status = 'active'
        ORDER BY ye.earning_date DESC
        LIMIT 1
      `, [paymentId, userEmail]);
      
      if (yieldQuery.length === 0) {
        res.json({
          success: true,
          yield_active: false,
          message: 'No active yield generation for this payment'
        });
        return;
      }
      
      const yieldData = yieldQuery[0];
      
      let currentEarnings = yieldData.total_earnings || 0;
      
      if (yieldData.etherfuse_order_id) {
        const orderStatus = await etherFuse.getOrderStatus(yieldData.etherfuse_order_id);
        if (orderStatus.success && orderStatus.data) {
          currentEarnings = orderStatus.data.earnings || currentEarnings;
        }
      }
      
      const daysSinceActivation = Math.floor(
        (new Date().getTime() - new Date(yieldData.activated_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const rateResult = await etherFuse.getCurrentRate();
      const currentRate = (rateResult.success && rateResult.data) ? rateResult.data.annual_rate : 0.072;
      
      res.json({
        success: true,
        yield_active: true,
        data: {
          activation_id: yieldData.id,
          etherfuse_order_id: yieldData.etherfuse_order_id,
          principal_amount: parseFloat(yieldData.principal_amount),
          current_earnings: Math.round(currentEarnings * 100) / 100,
          days_active: daysSinceActivation,
          annual_rate: currentRate,
          activated_at: yieldData.activated_at,
          last_calculated: yieldData.last_calculated,
          percentage_yield: Math.round((currentEarnings / yieldData.principal_amount) * 10000) / 100
        }
      });
      
    } catch (error) {
      console.error('❌ Error getting yield status:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error getting yield status' 
      });
    }
  }

  /**
   * Get yield earnings history
   * GET /api/payments/:id/yield-history
   */
  static async getYieldHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id: paymentId } = req.params;
      const { userEmail } = req.body;
      const { limit = 30 } = req.query;
      
      const historyQuery = await AppDataSource.query(`
        SELECT ye.*, ya.principal_amount
        FROM yield_earnings ye
        JOIN yield_activations ya ON ye.yield_activation_id = ya.id
        WHERE ye.payment_id = $1 AND ya.user_email = $2
        ORDER BY ye.earning_date DESC
        LIMIT $3
      `, [paymentId, userEmail, limit]);
      
      const history = historyQuery.map((row: any) => ({
        date: row.earning_date,
        daily_amount: parseFloat(row.daily_amount),
        cumulative_total: parseFloat(row.cumulative_total),
        annual_rate: parseFloat(row.annual_rate),
        percentage_gain: Math.round((row.cumulative_total / row.principal_amount) * 10000) / 100
      }));
      
      res.json({
        success: true,
        data: {
          earnings_history: history,
          total_days: history.length,
          total_earnings: history.length > 0 ? history[0].cumulative_total : 0
        }
      });
      
    } catch (error) {
      console.error('❌ Error getting yield history:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error getting yield history' 
      });
    }
  }

  /**
   * Handle EtherFuse webhooks
   * POST /api/etherfuse/webhook
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-etherfuse-signature'] as string;
      const payload = JSON.stringify(req.body);
      
      if (!etherFuse.verifyWebhookSignature(payload, signature)) {
        console.warn('⚠️ Invalid webhook signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
      
      const { event_type, data } = req.body;
      
      console.log(`📡 EtherFuse webhook received: ${event_type}`);
      
      switch (event_type) {
        case 'order.earnings_updated':
          await YieldController.handleEarningsUpdate(data);
          break;
        case 'order.completed':
          await YieldController.handleOrderCompletion(data);
          break;
        case 'customer.kyc_approved':
          await YieldController.handleKycApproval(data);
          break;
        default:
          console.log(`🤷 Unhandled webhook event: ${event_type}`);
      }
      
      res.json({ success: true, message: 'Webhook processed' });
      
    } catch (error) {
      console.error('❌ Error handling webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  /**
   * Handle earnings update from EtherFuse
   */
  static async handleEarningsUpdate(data: any) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const yieldQuery = await queryRunner.query(`
        SELECT * FROM yield_activations WHERE etherfuse_order_id = $1
      `, [data.order_id]);
      
      if (yieldQuery.length === 0) {
        console.warn(`⚠️ No yield activation found for order ${data.order_id}`);
        await queryRunner.rollbackTransaction();
        return;
      }
      
      const yieldActivation = yieldQuery[0];
      
      await queryRunner.query(`
        INSERT INTO yield_earnings 
        (yield_activation_id, payment_id, earning_date, daily_amount, cumulative_total, annual_rate, etherfuse_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (yield_activation_id, earning_date) 
        DO UPDATE SET 
          daily_amount = EXCLUDED.daily_amount,
          cumulative_total = EXCLUDED.cumulative_total,
          etherfuse_data = EXCLUDED.etherfuse_data,
          processed_at = CURRENT_TIMESTAMP
      `, [
        yieldActivation.id,
        yieldActivation.payment_id,
        data.date,
        data.daily_earnings,
        data.total_earnings,
        data.annual_rate,
        JSON.stringify(data)
      ]);
      
      await queryRunner.commitTransaction();
      console.log(`✅ Updated earnings for order ${data.order_id}`);
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error updating earnings:', error);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Handle order completion (when escrow is released)
   */
  static async handleOrderCompletion(data: any) {
    console.log(`✅ Order completed: ${data.order_id}`);
  }

  /**
   * Handle KYC approval
   */
  static async handleKycApproval(data: any) {
    try {
      await AppDataSource.query(`
        UPDATE etherfuse_customers 
        SET kyc_status = 'approved', etherfuse_onboarded_at = CURRENT_TIMESTAMP
        WHERE etherfuse_customer_id = $1
      `, [data.customer_id]);
      
      console.log(`✅ KYC approved for customer ${data.customer_id}`);
    } catch (error) {
      console.error('❌ Error updating KYC status:', error);
    }
  }
}
