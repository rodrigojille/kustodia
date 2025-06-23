import { Router } from 'express';
import { triggerAutomation, getAutomationStatus } from '../controllers/automationController';

const router = Router();

/**
 * POST /api/automation/trigger
 * Manual trigger for automation processes
 * Body: { process: 'deposits' | 'custodies' | 'payouts' | 'sync' | 'all' }
 */
router.post('/trigger', async (req, res) => {
  await triggerAutomation(req, res);
});

/**
 * GET /api/automation/status
 * Get current automation status and schedule
 */
router.get('/status', async (req, res) => {
  await getAutomationStatus(req, res);
});

export default router;
