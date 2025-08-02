import { Router } from 'express';
import { 
  getControlRoomDashboard,
  manualEscrowRecovery,
  manualRollback,
  getOperationDetails,
  runSafetyMonitor
} from '../controllers/operationsControlRoomController';
import { authenticateJWT } from '../authenticateJWT';

const router = Router();

/**
 * Operations Control Room Routes
 * Provides manual intervention capabilities for failed payment operations
 * 
 * All routes require authentication and admin privileges
 */

// Dashboard overview
router.get('/dashboard', authenticateJWT, getControlRoomDashboard);

// Operation details
router.get('/operation/:paymentId', authenticateJWT, getOperationDetails);

// Manual interventions
router.post('/recover/:paymentId', authenticateJWT, manualEscrowRecovery);
router.post('/rollback/:paymentId', authenticateJWT, manualRollback);

// Safety monitor
router.post('/safety-monitor', authenticateJWT, runSafetyMonitor);

export default router;
