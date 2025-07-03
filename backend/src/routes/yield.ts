import express, { Router, Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { YieldController } from '../controllers/yieldController';

// NOTE: These services will also need to be migrated to TypeScript
const YieldCalculationService = require('../../services/yieldCalculationService');
const EtherFuseService = require('../../services/etherfuseService');

// Initialize services
const yieldCalcService = new YieldCalculationService();
const etherFuseService = new EtherFuseService();
yieldCalcService.init();

/**
 * Authentication middleware (to be implemented based on existing auth)
 * This should extract user email from JWT token or session
 */
const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
  // TODO: Implement based on existing Kustodia authentication
  // For now, assuming userEmail is passed in request body
  
  const authHeader = req.headers.authorization;
  const userEmail = req.headers['x-user-email'] as string; // Temporary for testing
  
  if (!userEmail) {
    res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
    return;
  }
  
  (req as any).userEmail = userEmail;
  next();
};


export const createYieldRoutes = (dataSource: DataSource): Router => {
  const router: Router = express.Router();

  /**
   * Yield Generation Routes
   */

  // Activate yield generation for a payment
  router.post('/payments/:id/activate-yield', authenticateUser, YieldController.activateYield(dataSource));

  // Get current yield status for a payment
  router.get('/payments/:id/yield-status', authenticateUser, YieldController.getYieldStatus(dataSource));

  // Get yield earnings history for a payment
  router.get('/payments/:id/yield-history', authenticateUser, YieldController.getYieldHistory(dataSource));

  // EtherFuse webhook endpoint (no auth required - signature verified in controller)
  router.post('/etherfuse/webhook', YieldController.handleWebhook(dataSource));

  /**
   * Admin/Internal Routes (require admin authentication)
   */

  // Manual yield calculation trigger (admin only)
  router.post('/admin/calculate-yields', (req: Request, res: Response): void => {
    // TODO: Add admin authentication
    yieldCalcService.manualCalculation();
    res.json({ success: true, message: 'Manual calculation triggered' });
  });

  // Service health check
  router.get('/admin/health', async (req: Request, res: Response): Promise<void> => {
    try {
      await yieldCalcService.healthCheck();
      res.json({ 
        success: true, 
        message: 'Yield service is healthy',
        last_run: yieldCalcService.lastRunDate
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Health check failed' 
      });
    }
  });

  // EtherFuse health check
  router.get('/admin/etherfuse/health', async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await etherFuseService.healthCheck();
      res.json({ 
        success: true, 
        message: 'EtherFuse service is healthy',
        health
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Health check failed' 
      });
    }
  });

  // Get current CETES rate
  router.get('/admin/cetes-rate', async (req: Request, res: Response): Promise<void> => {
    try {
      const rate = await etherFuseService.getCurrentRate();
      res.json({ 
        success: true, 
        rate
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get CETES rate' 
      });
    }
  });

  // Get yield statistics (admin only)
  router.get('/admin/stats', async (req: Request, res: Response): Promise<void> => {
    try {
      // Use the injected dataSource instead of creating a new Pool
      const stats = await dataSource.query(`
        SELECT 
          COUNT(*) as total_activations,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_activations,
          SUM(principal_amount) as total_invested,
          AVG(principal_amount) as avg_investment
        FROM yield_activations
      `);

      const earnings = await dataSource.query(`
        SELECT 
          SUM(cumulative_total) as total_earnings,
          COUNT(DISTINCT yield_activation_id) as earning_activations,
          AVG(annual_rate) as avg_rate
        FROM yield_earnings 
        WHERE earning_date = CURRENT_DATE - INTERVAL '1 day'
      `);

      res.json({
        success: true,
        stats: {
          activations: stats[0],
          earnings: earnings[0]
        }
      });

    } catch (error) {
      console.error('Error getting yield stats:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get statistics' 
      });
    }
  });
  
  return router;
};
