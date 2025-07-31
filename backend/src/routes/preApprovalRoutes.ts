import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { PreApprovalService } from '../services/PreApprovalService';
import { authenticateJWT, AuthenticatedRequest } from '../authenticateJWT';

export default function createPreApprovalRoutes(pool: Pool): Router {
  const router = Router();
  const preApprovalService = new PreApprovalService(pool);

  // Middleware to validate admin role
  const validateAdminRole = (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).user?.role;
    
    if (userRole !== 'admin') {
      res.status(403).json({ error: 'Admin role required' });
      return;
    }
    
    next();
  };

  // Create a pre-approval request for a payment
  router.post('/create', authenticateJWT, validateAdminRole, async (req: Request, res: Response): Promise<void> => {
    try {
      const { paymentId } = req.body;

      if (!paymentId) {
        res.status(400).json({ success: false, error: 'Payment ID is required' });
        return;
      }

      const preApproval = await preApprovalService.createPreApproval(paymentId);
      
      res.json({
        success: true,
        data: {
          id: preApproval.id,
          paymentId: preApproval.payment_id,
          status: preApproval.status,
          amount: preApproval.amount,
          createdAt: preApproval.created_at,
          expiresAt: preApproval.expires_at
        }
      });
    } catch (error) {
      console.error('Error creating pre-approval:', error);
      res.status(500).json({ success: false, error: 'Failed to create pre-approval' });
    }
  });

  // Submit a signature for a pre-approval
  router.post('/signature', authenticateJWT, validateAdminRole, async (req: Request, res: Response): Promise<void> => {
    try {
      const { preApprovalId, signerAddress, signature } = req.body;

      if (!preApprovalId || !signerAddress || !signature) {
        res.status(400).json({ success: false, error: 'Pre-approval ID, signer address, and signature are required' });
        return;
      }

      const result = await preApprovalService.submitSignature(preApprovalId, signerAddress, signature);
      
      res.json({
        success: true,
        data: {
          isReady: result.isReady,
          message: result.isReady ? 'Pre-approval is ready for execution' : 'Signature added successfully'
        }
      });
    } catch (error) {
      console.error('Error submitting signature:', error);
      res.status(500).json({ success: false, error: 'Failed to submit signature' });
    }
  });

  // List all pre-approvals
  router.get('/list', authenticateJWT, validateAdminRole, async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const preApprovals = await preApprovalService.getAllPreApprovals(limit);
      
      res.json({
        success: true,
        data: preApprovals
      });
    } catch (error) {
      console.error('Error listing pre-approvals:', error);
      res.status(500).json({ success: false, error: 'Failed to list pre-approvals' });
    }
  });

  // Get pre-approvals ready for execution
  router.get('/ready', authenticateJWT, validateAdminRole, async (req: Request, res: Response): Promise<void> => {
    try {
      const readyPreApprovals = await preApprovalService.getReadyPreApprovals();
      
      res.json({
        success: true,
        data: readyPreApprovals
      });
    } catch (error) {
      console.error('Error getting ready pre-approvals:', error);
      res.status(500).json({ success: false, error: 'Failed to get ready pre-approvals' });
    }
  });

  // Execute a pre-approved transaction
  router.post('/execute', authenticateJWT, validateAdminRole, async (req: Request, res: Response): Promise<void> => {
    try {
      const { preApprovalId } = req.body;

      if (!preApprovalId) {
        res.status(400).json({ success: false, error: 'Pre-approval ID is required' });
        return;
      }

      const result = await preApprovalService.executePreApproval(preApprovalId);
      
      if (!result.success) {
        res.status(400).json({ success: false, error: result.error });
        return;
      }

      res.json({
        success: true,
        data: {
          txHash: result.txHash,
          message: 'Transaction executed successfully'
        }
      });
    } catch (error) {
      console.error('Error executing pre-approval:', error);
      res.status(500).json({ success: false, error: 'Failed to execute pre-approval' });
    }
  });

  // Cleanup expired pre-approvals
  router.post('/cleanup', authenticateJWT, validateAdminRole, async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await preApprovalService.cleanupExpiredPreApprovals();
      
      res.json({
        success: true,
        data: {
          expiredCount: result,
          message: `Cleaned up ${result} expired pre-approvals`
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired pre-approvals:', error);
      res.status(500).json({ success: false, error: 'Failed to cleanup expired pre-approvals' });
    }
  });

  return router;
}
