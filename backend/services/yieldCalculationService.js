const { Pool } = require('pg');
const cron = require('node-cron');
const EtherFuseService = require('./etherfuseService');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const etherFuse = new EtherFuseService();

/**
 * Yield Calculation Service
 * Handles daily yield calculations and earnings updates
 */
class YieldCalculationService {
  
  constructor() {
    this.isRunning = false;
    this.lastRunDate = null;
  }

  /**
   * Initialize the service and set up cron jobs
   */
  init() {
    console.log('🔄 Initializing Yield Calculation Service...');
    
    // Run daily at 2 AM Mexico time (UTC-6)
    cron.schedule('0 2 * * *', () => {
      this.calculateDailyYields();
    }, {
      timezone: "America/Mexico_City"
    });
    
    // Health check every hour
    cron.schedule('0 * * * *', () => {
      this.healthCheck();
    });
    
    console.log('✅ Yield calculation cron jobs scheduled');
  }

  /**
   * Calculate daily yields for all active yield activations
   */
  async calculateDailyYields() {
    if (this.isRunning) {
      console.log('⏭️ Yield calculation already running, skipping...');
      return;
    }

    const startTime = new Date();
    this.isRunning = true;
    
    console.log(`🚀 Starting daily yield calculation at ${startTime.toISOString()}`);
    
    const client = await pool.connect();
    
    try {
      // Get all active yield activations
      const activeYields = await client.query(`
        SELECT ya.*, p.amount as payment_amount, p.status as payment_status
        FROM yield_activations ya
        JOIN payment p ON ya.payment_id = p.id
        WHERE ya.status = 'active' 
        AND p.status IN ('approved', 'funded', 'completed')
        ORDER BY ya.activated_at
      `);
      
      console.log(`📊 Found ${activeYields.rows.length} active yield activations`);
      
      // Get current CETES rate
      const rateResult = await etherFuse.getCurrentRate();
      const currentRate = rateResult.success ? rateResult.annual_rate : 0.072; // 7.2% fallback
      
      console.log(`📈 Using annual rate: ${(currentRate * 100).toFixed(2)}%`);
      
      let processed = 0;
      let errors = 0;
      
      for (const yieldActivation of activeYields.rows) {
        try {
          await this.processYieldActivation(client, yieldActivation, currentRate);
          processed++;
        } catch (error) {
          console.error(`❌ Error processing yield activation ${yieldActivation.id}:`, error);
          errors++;
        }
      }
      
      const endTime = new Date();
      const duration = endTime - startTime;
      
      console.log(`✅ Daily yield calculation completed:`);
      console.log(`   📊 Processed: ${processed} activations`);
      console.log(`   ❌ Errors: ${errors} activations`);
      console.log(`   ⏱️ Duration: ${duration}ms`);
      
      this.lastRunDate = endTime;
      
    } catch (error) {
      console.error('❌ Error in daily yield calculation:', error);
    } finally {
      client.release();
      this.isRunning = false;
    }
  }

  /**
   * Process individual yield activation
   */
  async processYieldActivation(client, yieldActivation, annualRate) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Check if we already calculated today's yield
    const existingCalculation = await client.query(`
      SELECT * FROM yield_earnings 
      WHERE yield_activation_id = $1 AND earning_date = $2
    `, [yieldActivation.id, today]);
    
    if (existingCalculation.rows.length > 0) {
      // Already calculated for today
      return;
    }
    
    // Get last calculation to determine starting point
    const lastCalculation = await client.query(`
      SELECT * FROM yield_earnings 
      WHERE yield_activation_id = $1 
      ORDER BY earning_date DESC 
      LIMIT 1
    `, [yieldActivation.id]);
    
    const principal = parseFloat(yieldActivation.principal_amount);
    let previousTotal = 0;
    
    if (lastCalculation.rows.length > 0) {
      previousTotal = parseFloat(lastCalculation.rows[0].cumulative_total);
    }
    
    // Calculate daily compound interest
    const dailyRate = annualRate / 365;
    const currentBalance = principal + previousTotal;
    const dailyEarnings = currentBalance * dailyRate;
    const newCumulativeTotal = previousTotal + dailyEarnings;
    
    // Only record if earnings are above minimum threshold ($1 MXN)
    const minimumThreshold = 1.0;
    
    if (newCumulativeTotal >= minimumThreshold || lastCalculation.rows.length > 0) {
      // Insert today's calculation
      await client.query(`
        INSERT INTO yield_earnings 
        (yield_activation_id, payment_id, earning_date, daily_amount, cumulative_total, annual_rate, calculation_method)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        yieldActivation.id,
        yieldActivation.payment_id,
        today,
        Math.round(dailyEarnings * 100) / 100, // Round to 2 decimals
        Math.round(newCumulativeTotal * 100) / 100,
        annualRate,
        'compound_daily'
      ]);
      
      console.log(`💰 Payment ${yieldActivation.payment_id}: +$${dailyEarnings.toFixed(2)} (Total: $${newCumulativeTotal.toFixed(2)})`);
    }
    
    // Sync with EtherFuse if order exists
    if (yieldActivation.etherfuse_order_id) {
      try {
        const orderStatus = await etherFuse.getOrderStatus(yieldActivation.etherfuse_order_id);
        if (orderStatus.success && orderStatus.earnings) {
          console.log(`🔄 EtherFuse sync: Order ${yieldActivation.etherfuse_order_id} has $${orderStatus.earnings} earnings`);
        }
      } catch (error) {
        console.warn(`⚠️ Could not sync with EtherFuse for order ${yieldActivation.etherfuse_order_id}`);
      }
    }
  }

  /**
   * Calculate yield for escrow completion (final payout)
   */
  async calculateFinalPayout(paymentId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get yield activation
      const yieldQuery = await client.query(`
        SELECT ya.*, ye.cumulative_total
        FROM yield_activations ya
        LEFT JOIN yield_earnings ye ON ya.id = ye.yield_activation_id
        WHERE ya.payment_id = $1 AND ya.status = 'active'
        ORDER BY ye.earning_date DESC
        LIMIT 1
      `, [paymentId]);
      
      if (yieldQuery.rows.length === 0) {
        return { success: false, message: 'No active yield for this payment' };
      }
      
      const yieldData = yieldQuery.rows[0];
      const totalEarnings = parseFloat(yieldData.cumulative_total || 0);
      
      if (totalEarnings < 1.0) {
        // Below minimum threshold, no payout
        return { 
          success: true, 
          total_earnings: 0,
          payer_amount: 0,
          platform_amount: 0,
          message: 'Earnings below minimum threshold' 
        };
      }
      
      // Calculate 80/20 split
      const payerAmount = Math.round(totalEarnings * 0.8 * 100) / 100;
      const platformAmount = Math.round(totalEarnings * 0.2 * 100) / 100;
      
      // Record payout
      const payoutResult = await client.query(`
        INSERT INTO yield_payouts 
        (yield_activation_id, payment_id, total_yield_earned, payer_amount, platform_amount, payout_type, payout_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        yieldData.id,
        paymentId,
        totalEarnings,
        payerAmount,
        platformAmount,
        'escrow_completion',
        'pending'
      ]);
      
      // Mark yield activation as completed
      await client.query(`
        UPDATE yield_activations 
        SET status = 'completed', deactivated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [yieldData.id]);
      
      // Redeem from EtherFuse if order exists
      if (yieldData.etherfuse_order_id) {
        try {
          const redeemResult = await etherFuse.redeemOrder(yieldData.etherfuse_order_id);
          if (redeemResult.success) {
            await client.query(`
              UPDATE yield_payouts 
              SET etherfuse_withdrawal_id = $1, payout_status = 'completed', payout_completed_at = CURRENT_TIMESTAMP
              WHERE id = $2
            `, [redeemResult.redemption_id, payoutResult.rows[0].id]);
          }
        } catch (error) {
          console.warn('⚠️ EtherFuse redemption failed, manual processing required');
        }
      }
      
      await client.query('COMMIT');
      
      console.log(`💰 Final payout calculated for payment ${paymentId}: $${totalEarnings} (Payer: $${payerAmount}, Platform: $${platformAmount})`);
      
      return {
        success: true,
        total_earnings: totalEarnings,
        payer_amount: payerAmount,
        platform_amount: platformAmount,
        payout_id: payoutResult.rows[0].id
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error calculating final payout:', error);
      return { success: false, error: error.message };
    } finally {
      client.release();
    }
  }

  /**
   * Handle dispute scenarios (all yield to payer + platform)
   */
  async handleDisputePayout(paymentId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const yieldQuery = await client.query(`
        SELECT ya.*, ye.cumulative_total
        FROM yield_activations ya
        LEFT JOIN yield_earnings ye ON ya.id = ye.yield_activation_id
        WHERE ya.payment_id = $1 AND ya.status = 'active'
        ORDER BY ye.earning_date DESC
        LIMIT 1
      `, [paymentId]);
      
      if (yieldQuery.rows.length === 0) {
        return { success: false, message: 'No active yield for this payment' };
      }
      
      const yieldData = yieldQuery.rows[0];
      const totalEarnings = parseFloat(yieldData.cumulative_total || 0);
      
      // In disputes: 80% to payer, 20% to platform (same as normal)
      const payerAmount = Math.round(totalEarnings * 0.8 * 100) / 100;
      const platformAmount = Math.round(totalEarnings * 0.2 * 100) / 100;
      
      await client.query(`
        INSERT INTO yield_payouts 
        (yield_activation_id, payment_id, total_yield_earned, payer_amount, platform_amount, payout_type, payout_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        yieldData.id,
        paymentId,
        totalEarnings,
        payerAmount,
        platformAmount,
        'dispute_resolution',
        'completed'
      ]);
      
      await client.query(`
        UPDATE yield_activations 
        SET status = 'completed', deactivated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [yieldData.id]);
      
      await client.query('COMMIT');
      
      console.log(`⚖️ Dispute payout completed for payment ${paymentId}: $${totalEarnings}`);
      
      return {
        success: true,
        total_earnings: totalEarnings,
        payer_amount: payerAmount,
        platform_amount: platformAmount
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error handling dispute payout:', error);
      return { success: false, error: error.message };
    } finally {
      client.release();
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck() {
    try {
      // Check database connection
      await pool.query('SELECT 1');
      
      // Check EtherFuse API
      const etherFuseHealth = await etherFuse.healthCheck();
      
      console.log(`💚 Yield service health: DB ✓, EtherFuse ${etherFuseHealth.success ? '✓' : '❌'}, Last run: ${this.lastRunDate || 'Never'}`);
      
    } catch (error) {
      console.error('❤️‍🩹 Yield service health check failed:', error);
    }
  }

  /**
   * Manual calculation trigger (for testing/debugging)
   */
  async manualCalculation() {
    console.log('🔧 Manual yield calculation triggered');
    await this.calculateDailyYields();
  }
}

module.exports = YieldCalculationService;
