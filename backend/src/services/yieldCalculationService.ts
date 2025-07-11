import AppDataSource from '../ormconfig';
import * as cron from 'node-cron';
import { EtherFuseService } from './etherfuseService';
import { QueryRunner } from 'typeorm';

const etherFuse = new EtherFuseService();

/**
 * Yield Calculation Service
 * Handles daily yield calculations and earnings updates
 */
export class YieldCalculationService {
  private isRunning: boolean = false;
  private _lastRunDate: Date | null = null;

  public get lastRunDate(): Date | null {
    return this._lastRunDate;
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

    try {
      const activeYields = await AppDataSource.query(`
        SELECT ya.*, p.amount as payment_amount, p.status as payment_status
        FROM yield_activations ya
        JOIN payment p ON ya.payment_id = p.id
        WHERE ya.status = 'active' 
        AND p.status IN ('approved', 'funded', 'completed')
        ORDER BY ya.activated_at
      `);

      console.log(`📊 Found ${activeYields.length} active yield activations`);

      const rateResult = await etherFuse.getCurrentRate();
      const currentRate = (rateResult.success && rateResult.data) ? rateResult.data.annual_rate : 0.072;
      console.log(`📈 Using annual rate: ${(currentRate * 100).toFixed(2)}%`);

      let processed = 0;
      let errors = 0;

      for (const yieldActivation of activeYields) {
        try {
          await this.processYieldActivation(yieldActivation, currentRate);
          processed++;
        } catch (error) {
          console.error(`❌ Error processing yield activation ${yieldActivation.id}:`, error);
          errors++;
        }
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      console.log(`✅ Daily yield calculation completed:`);
      console.log(`   📊 Processed: ${processed} activations`);
      console.log(`   ❌ Errors: ${errors} activations`);
      console.log(`   ⏱️ Duration: ${duration}ms`);
      this._lastRunDate = endTime;

    } catch (error) {
      console.error('❌ Error in daily yield calculation:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Manually trigger the daily yield calculation.
   */
  async manualCalculation() {
    console.log('⚡ Manually triggering yield calculation...');
    await this.calculateDailyYields();
  }

  /**
   * Process individual yield activation
   */
  private async processYieldActivation(yieldActivation: any, annualRate: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      const existingCalculation = await queryRunner.query(
        'SELECT * FROM yield_earnings WHERE yield_activation_id = $1 AND earning_date = $2',
        [yieldActivation.id, today]
      );

      if (existingCalculation.length > 0) return; // Already calculated

      const lastCalculation = await queryRunner.query(
        'SELECT * FROM yield_earnings WHERE yield_activation_id = $1 ORDER BY earning_date DESC LIMIT 1',
        [yieldActivation.id]
      );

      const principal = parseFloat(yieldActivation.principal_amount);
      let previousTotal = lastCalculation.length > 0 ? parseFloat(lastCalculation[0].cumulative_total) : 0;

      const dailyRate = annualRate / 365;
      const currentBalance = principal + previousTotal;
      const dailyEarnings = currentBalance * dailyRate;
      const newCumulativeTotal = previousTotal + dailyEarnings;

      await queryRunner.query(
        `INSERT INTO yield_earnings 
         (yield_activation_id, payment_id, earning_date, daily_amount, cumulative_total, annual_rate, calculation_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          yieldActivation.id, yieldActivation.payment_id, today,
          Math.round(dailyEarnings * 100) / 100,
          Math.round(newCumulativeTotal * 100) / 100,
          annualRate, 'compound_daily'
        ]
      );

      console.log(`💰 Payment ${yieldActivation.payment_id}: +$${dailyEarnings.toFixed(2)} (Total: $${newCumulativeTotal.toFixed(2)})`);

    } catch (error) {
        console.error(`Error during processing activation ${yieldActivation.id}:`, error);
        // No rollback needed for this read/insert operation unless part of a larger transaction
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck() {
    try {
      await AppDataSource.query('SELECT 1');
      const etherFuseHealth = await etherFuse.getCurrentRate(); // Using this as a proxy for health
      console.log(`💚 Yield service health: DB ✓, EtherFuse ${etherFuseHealth.success ? '✓' : '❌'}, Last run: ${this.lastRunDate || 'Never'}`);
    } catch (error) {
      console.error('❤️‍🩹 Yield service health check failed:', error);
    }
  }
}
