import { Router, Request, Response, NextFunction } from 'express';
import { MultiSigApprovalService } from '../services/MultiSigApprovalService';
import logger from '../utils/logger';
import { authenticateJWT } from '../authenticateJWT';

const router = Router();
const multiSigService = new MultiSigApprovalService();

// Middleware to validate admin access (for transaction operations)
const validateAdminAccess = (req: Request, res: Response, next: NextFunction): void => {
  const userAddress = (req as any).user?.wallet_address || req.body.address || req.query.address;
  
  if (!userAddress) {
    res.status(401).json({ error: 'Address required for admin access' });
    return;
  }
  
  const adminAddresses = [
    process.env.MULTISIG_ADMIN_1,
    process.env.MULTISIG_ADMIN_2,
    process.env.MULTISIG_ADMIN_3,
    process.env.MULTISIG_EMERGENCY_ADMIN
  ].filter(Boolean);
  
  if (!adminAddresses.includes(userAddress)) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  
  next();
};

// Middleware to validate admin role (for dashboard viewing)
const validateAdminRole = (req: Request, res: Response, next: NextFunction): void => {
  const userRole = (req as any).user?.role;
  
  if (userRole !== 'admin') {
    res.status(403).json({ error: 'Admin role required' });
    return;
  }
  
  next();
};

/**
 * POST /api/multisig/propose
 * Create a new multi-sig transaction proposal
 */
router.post('/propose', authenticateJWT, validateAdminAccess, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      paymentId,
      to,
      value,
      data,
      amount,
      amountUsd,
      type,
      createdBy,
      metadata
    } = req.body;

    if (!to || !value) {
      res.status(400).json({ error: 'Missing required fields: to, value' });
      return;
    }

    const transactionId = await multiSigService.proposeTransaction({
      paymentId: paymentId ? paymentId.toString() : '',
      to,
      value,
      data: data || '0x',
      amount: amount || value,
      amountUsd: amountUsd || 0,
      type: type || 'TRANSFER',
      createdBy: createdBy || (req as any).user?.wallet_address,
      metadata: metadata || {}
    });

    logger.info(`Multi-sig transaction proposed: ${transactionId}`);
    res.json({ 
      success: true, 
      transactionId,
      message: 'Transaction proposal created successfully'
    });
  } catch (error) {
    logger.error('Error proposing multi-sig transaction:', error);
    res.status(500).json({ 
      error: 'Failed to propose transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/multisig/approve/:transactionId
 * Approve a multi-sig transaction
 */
router.post('/approve/:transactionId', authenticateJWT, validateAdminAccess, async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;
    const { signature } = req.body;
    const approverAddress = (req as any).user?.wallet_address;

    if (!signature) {
      res.status(400).json({ error: 'Signature required for approval' });
      return;
    }

    const result = await multiSigService.approveTransaction(
      transactionId,
      approverAddress,
      signature
    );

    logger.info(`Transaction ${transactionId} approved by ${approverAddress}`);
    res.json({
      success: true,
      message: 'Transaction approved successfully',
      transactionId: transactionId,
      status: result ? 'APPROVED' : 'PENDING'
    });
  } catch (error) {
    logger.error(`Error approving transaction ${req.params.transactionId}:`, error);
    res.status(500).json({
      error: 'Failed to approve transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/multisig/reject/:transactionId
 * Reject a multi-sig transaction
 */
router.post('/reject/:transactionId', authenticateJWT, validateAdminAccess, async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;
    const rejectorAddress = (req as any).user?.wallet_address;

    const result = await multiSigService.rejectTransaction(
      transactionId,
      rejectorAddress,
      reason || 'No reason provided'
    );

    logger.info(`Transaction ${transactionId} rejected by ${rejectorAddress}`);
    res.json({
      success: true,
      message: 'Transaction rejected successfully',
      transactionId: result?.transactionId || transactionId,
      status: result?.status || 'REJECTED'
    });
  } catch (error) {
    logger.error(`Error rejecting transaction ${req.params.transactionId}:`, error);
    res.status(500).json({
      error: 'Failed to reject transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/multisig/execute/:transactionId
 * Execute a multi-sig transaction
 */
router.post('/execute/:transactionId', authenticateJWT, validateAdminAccess, async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;
    const executorAddress = (req as any).user?.wallet_address;

    const result = await multiSigService.executeTransaction(transactionId, executorAddress);

    logger.info(`Transaction ${transactionId} executed by ${executorAddress}`);
    res.json({
      success: true,
      message: 'Transaction executed successfully',
      transactionId,
      status: 'EXECUTED',
      result: typeof result === 'string' ? { txHash: result } : result
    });
  } catch (error) {
    logger.error(`Error executing transaction ${req.params.transactionId}:`, error);
    res.status(500).json({
      error: 'Failed to execute transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/multisig/pending
 * Get all pending multi-sig transactions and upcoming payments requiring multi-sig
 */
router.get('/pending', authenticateJWT, validateAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const pendingApprovals = await multiSigService.getPendingApprovals();
    const upcomingPayments = await multiSigService.getUpcomingMultiSigPayments();
    const preApprovedTransactions = await multiSigService.getPreApprovedTransactions();
    
    res.json({
      success: true,
      pendingApprovals: pendingApprovals,
      upcomingPayments: upcomingPayments,
      preApprovedTransactions: preApprovedTransactions,
      counts: {
        pending: pendingApprovals.length,
        upcoming: upcomingPayments.length,
        preApproved: preApprovedTransactions.length
      }
    });
  } catch (error) {
    logger.error('Error fetching multisig dashboard data:', error);
    res.status(500).json({
      error: 'Failed to fetch multisig dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/multisig/requests
 * Get all multi-sig approval requests with optional filtering
 */
router.get('/requests', authenticateJWT, validateAdminAccess, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, limit = '50', offset = '0' } = req.query;
    
    const requests = await multiSigService.getApprovalRequests({
      status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | undefined
    });

    res.json({
      success: true,
      requests,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    logger.error('Error fetching approval requests:', error);
    res.status(500).json({
      error: 'Failed to fetch approval requests',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/multisig/requests/:transactionId
 * Get specific multi-sig transaction details
 */
router.get('/requests/:transactionId', authenticateJWT, validateAdminAccess, async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await multiSigService.getTransactionDetails(transactionId);
    
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    logger.error(`Error fetching transaction ${req.params.transactionId}:`, error);
    res.status(500).json({
      error: 'Failed to fetch transaction details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/multisig/statistics
 * Get multi-sig transaction statistics
 */
router.get('/statistics', authenticateJWT, validateAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await multiSigService.getTransactionStatistics();
    
    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    logger.error('Error fetching statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/multisig/config
 * Get multi-sig wallet configuration
 */
router.get('/config', authenticateJWT, validateAdminAccess, async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await multiSigService.getWalletConfiguration();
    
    res.json({
      success: true,
      configuration: config
    });
  } catch (error) {
    logger.error('Error fetching wallet configuration:', error);
    res.status(500).json({
      error: 'Failed to fetch wallet configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/multisig/upcoming
 * Get upcoming payments requiring multi-sig approval (read-only, no admin required)
 * This endpoint is for dashboard display purposes
 */
router.get('/upcoming', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const upcomingPayments = await multiSigService.getUpcomingMultiSigPayments();
    
    res.json({
      success: true,
      upcomingPayments: upcomingPayments,
      count: upcomingPayments.length
    });
  } catch (error) {
    logger.error('Error fetching upcoming multi-sig payments:', error);
    res.status(500).json({
      error: 'Failed to fetch upcoming payments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/multisig/wallet-config
 * Get wallet configuration (read-only, no admin required)
 * This endpoint is for frontend wallet configuration display
 */
router.get('/wallet-config', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await multiSigService.getWalletConfiguration();
    
    res.json({
      success: true,
      configuration: config
    });
  } catch (error) {
    logger.error('Error fetching wallet configuration:', error);
    res.status(500).json({
      error: 'Failed to fetch wallet configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
