import express, { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';

const router: Router = express.Router();

// Import controllers and services (will need to be converted to TypeScript)
// For now using require until they're converted
const YieldController = require('../../controllers/yieldController');
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
  
  (req.body as any).userEmail = userEmail;
  next();
};

/**
 * Yield Generation Routes
 */

// Activate yield generation for a payment
router.post('/payments/:id/activate-yield', authenticateUser, YieldController.activateYield);

// Get current yield status for a payment
router.get('/payments/:id/yield-status', authenticateUser, YieldController.getYieldStatus);

// Get yield earnings history for a payment
router.get('/payments/:id/yield-history', authenticateUser, YieldController.getYieldHistory);

// EtherFuse webhook endpoint (no auth required - signature verified in controller)
router.post('/etherfuse/webhook', YieldController.handleWebhook);

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
    const pool = new Pool({
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    });

    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_activations,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_activations,
        SUM(principal_amount) as total_invested,
        AVG(principal_amount) as avg_investment
      FROM yield_activations
    `);

    const earnings = await pool.query(`
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
        activations: stats.rows[0],
        earnings: earnings.rows[0]
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

export default router;
