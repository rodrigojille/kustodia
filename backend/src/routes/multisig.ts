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
 * GET /api/multisig/approved
 * Get approved/completed multi-sig transactions for traceability
 */
router.get('/approved', authenticateJWT, validateAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = '50', offset = '0' } = req.query;
    
    const approvedTransactions = await multiSigService.getApprovedTransactions(
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      approvedTransactions,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: approvedTransactions.length
      }
    });
  } catch (error) {
    logger.error('Error fetching approved transactions:', error);
    res.status(500).json({
      error: 'Failed to fetch approved transactions',
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

/**
 * GET /api/multisig/signature-history/:approvalId
 * Get signature history for a specific approval request
 */
router.get('/signature-history/:approvalId', authenticateJWT, validateAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const { approvalId } = req.params;
    
    if (!approvalId || isNaN(parseInt(approvalId))) {
      res.status(400).json({ error: 'Valid approval ID required' });
      return;
    }

    const signatureHistory = await multiSigService.getSignatureHistory(approvalId);
    
    res.json({
      success: true,
      data: signatureHistory
    });
  } catch (error) {
    logger.error('Error getting signature history:', error);
    res.status(500).json({ 
      error: 'Failed to get signature history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/multisig/approval-timeline/:paymentId
 * Get approval timeline for a specific payment
 */
router.get('/approval-timeline/:paymentId', authenticateJWT, validateAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    
    if (!paymentId || isNaN(parseInt(paymentId))) {
      res.status(400).json({ error: 'Valid payment ID required' });
      return;
    }

    const timeline = await multiSigService.getApprovalTimeline(paymentId);
    
    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    logger.error('Error getting approval timeline:', error);
    res.status(500).json({ 
      error: 'Failed to get approval timeline',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/multisig/dashboard
 * Get multi-sig dashboard data for admins
 */
router.get('/dashboard', authenticateJWT, validateAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    // Get comprehensive dashboard statistics
    const pendingApprovals = await multiSigService.getPendingApprovals();
    const approvedTransactions = await multiSigService.getApprovedTransactions(20, 0); // Get latest 20 for dashboard
    const healthStatus = await multiSigService.getHealthStatus();
    
    // Get statistics from database
    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
        COUNT(*) FILTER (WHERE status = 'executed') as executed_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COUNT(*) as total_count,
        AVG(CASE WHEN status = 'executed' THEN 
          EXTRACT(EPOCH FROM (updated_at - created_at))/3600 
        END) as avg_execution_time_hours
      FROM multisig_approval_requests 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `;
    
    const statsResult = await multiSigService.query(statsQuery);
    const stats = statsResult.rows[0];
    
    // Get recent activity
    const recentActivityQuery = `
      SELECT 
        mar.id,
        mar.payment_id,
        mar.amount_usd,
        mar.status,
        mar.created_at,
        mar.updated_at,
        p.recipient_email,
        COUNT(ms.id) as signature_count
      FROM multisig_approval_requests mar
      LEFT JOIN payment p ON p.multisig_approval_id = mar.id
      LEFT JOIN multisig_signatures ms ON ms.approval_request_id = mar.id
      WHERE mar.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY mar.id, p.recipient_email
      ORDER BY mar.created_at DESC
      LIMIT 10
    `;
    
    const recentActivity = await multiSigService.query(recentActivityQuery);
    
    res.json({
      success: true,
      data: {
        statistics: {
          pendingApprovals: parseInt(stats.pending_count) || 0,
          approvedTransactions: parseInt(stats.approved_count) || 0,
          executedTransactions: parseInt(stats.executed_count) || 0,
          rejectedTransactions: parseInt(stats.rejected_count) || 0,
          totalTransactions: parseInt(stats.total_count) || 0,
          averageExecutionTimeHours: parseFloat(stats.avg_execution_time_hours) || 0
        },
        healthStatus: {
          status: healthStatus.status,
          database: healthStatus.database,
          provider: healthStatus.provider,
          walletConfigs: healthStatus.walletConfigs
        },
        recentActivity: recentActivity.rows,
        pendingApprovals: pendingApprovals,
        approvedTransactions: approvedTransactions
      }
    });
  } catch (error) {
    logger.error('Error getting dashboard data:', error);
    res.status(500).json({ 
      error: 'Failed to get dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/multisig/create-safe-transaction/:transactionId
 * Create Safe transaction for wallet signing
 */
router.get('/create-safe-transaction/:transactionId', authenticateJWT, validateAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;
    
    if (!transactionId || isNaN(parseInt(transactionId))) {
      res.status(400).json({ error: 'Valid transaction ID required' });
      return;
    }

    const safeTransaction = await multiSigService.createSafeTransactionForSigning(transactionId);
    
    res.json({
      success: true,
      data: safeTransaction
    });
  } catch (error) {
    logger.error('Error creating Safe transaction:', error);
    res.status(500).json({ 
      error: 'Failed to create Safe transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
