import { Router } from 'express';
import { 
  getControlRoomDashboard,
  manualEscrowRecovery,
  manualRollback,
  getOperationDetails,
  runSafetyMonitor,
  retryBridgeTransfer,
  retryJunoWithdrawal,
  retryMxnbRedemption
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

// New recovery actions for additional failure types
router.post('/retry-bridge/:paymentId', authenticateJWT, retryBridgeTransfer);
router.post('/retry-withdrawal/:paymentId', authenticateJWT, retryJunoWithdrawal);
router.post('/retry-redemption/:paymentId', authenticateJWT, retryMxnbRedemption);

// Safety monitor
router.post('/safety-monitor', authenticateJWT, runSafetyMonitor);

export default router;
