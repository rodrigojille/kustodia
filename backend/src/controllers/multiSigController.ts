import { Request, Response } from 'express';
import { Pool } from 'pg';
import { MultiSigService } from '../services/MultiSigService';

export class MultiSigController {
  private multiSigService: MultiSigService;

  constructor(pool: Pool) {
    this.multiSigService = new MultiSigService(pool);
  }

  /**
   * Get pending approval requests for the authenticated user
   */
  getPendingApprovals = async (req: Request, res: Response) => {
    try {
      const { wallet_address } = req.user as any;
      
      if (!wallet_address) {
        return res.status(400).json({ 
          error: 'Wallet address required for multi-sig operations' 
        });
      }

      const pendingApprovals = await this.multiSigService.getPendingApprovals(wallet_address);
      
      res.json({
        success: true,
        data: pendingApprovals,
        count: pendingApprovals.length
      });
    } catch (error) {
      console.error('Error getting pending approvals:', error);
      res.status(500).json({ 
        error: 'Failed to get pending approvals',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get detailed information about a specific approval request
   */
  getApprovalDetails = async (req: Request, res: Response) => {
    try {
      const { approvalId } = req.params;
      
      if (!approvalId || isNaN(parseInt(approvalId))) {
        return res.status(400).json({ 
          error: 'Valid approval ID required' 
        });
      }

      const approvalDetails = await this.multiSigService.getApprovalDetails(parseInt(approvalId));
      
      if (!approvalDetails) {
        return res.status(404).json({ 
          error: 'Approval request not found' 
        });
      }

      res.json({
        success: true,
        data: approvalDetails
      });
    } catch (error) {
      console.error('Error getting approval details:', error);
      res.status(500).json({ 
        error: 'Failed to get approval details',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Submit a signature for an approval request
   */
  submitSignature = async (req: Request, res: Response) => {
    try {
      const { approvalId } = req.params;
      const { signature } = req.body;
      const { wallet_address } = req.user as any;
      
      if (!approvalId || isNaN(parseInt(approvalId))) {
        return res.status(400).json({ 
          error: 'Valid approval ID required' 
        });
      }

      if (!signature) {
        return res.status(400).json({ 
          error: 'Signature required' 
        });
      }

      if (!wallet_address) {
        return res.status(400).json({ 
          error: 'Wallet address required for signing' 
        });
      }

      const success = await this.multiSigService.submitSignature(
        parseInt(approvalId),
        wallet_address,
        signature
      );

      if (success) {
        // Get updated approval details
        const updatedApproval = await this.multiSigService.getApprovalDetails(parseInt(approvalId));
        
        res.json({
          success: true,
          message: 'Signature submitted successfully',
          data: updatedApproval
        });
      } else {
        res.status(400).json({ 
          error: 'Failed to submit signature' 
        });
      }
    } catch (error) {
      console.error('Error submitting signature:', error);
      res.status(500).json({ 
        error: 'Failed to submit signature',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Execute an approved multi-sig transaction
   */
  executeTransaction = async (req: Request, res: Response) => {
    try {
      const { approvalId } = req.params;
      const { role } = req.user as any;
      
      // Only admins can execute transactions
      if (role !== 'admin') {
        return res.status(403).json({ 
          error: 'Admin privileges required to execute transactions' 
        });
      }

      if (!approvalId || isNaN(parseInt(approvalId))) {
        return res.status(400).json({ 
          error: 'Valid approval ID required' 
        });
      }

      const result = await this.multiSigService.executeTransaction(parseInt(approvalId));
      
      res.json({
        success: true,
        message: result
      });
    } catch (error) {
      console.error('Error executing transaction:', error);
      res.status(500).json({ 
        error: 'Failed to execute transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Create a new multi-sig approval request for a payment
   */
  createApprovalRequest = async (req: Request, res: Response) => {
    try {
      const { paymentId, walletConfigName } = req.body;
      const { role } = req.user as any;
      
      // Only admins or system can create approval requests
      if (role !== 'admin' && role !== 'system') {
        return res.status(403).json({ 
          error: 'Admin privileges required to create approval requests' 
        });
      }

      if (!paymentId || isNaN(parseInt(paymentId))) {
        return res.status(400).json({ 
          error: 'Valid payment ID required' 
        });
      }

      const approvalRequest = await this.multiSigService.createApprovalRequest(
        parseInt(paymentId),
        walletConfigName || 'high_value'
      );
      
      res.json({
        success: true,
        message: 'Multi-sig approval request created',
        data: approvalRequest
      });
    } catch (error) {
      console.error('Error creating approval request:', error);
      res.status(500).json({ 
        error: 'Failed to create approval request',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Check if a payment amount requires multi-sig approval
   */
  checkMultiSigRequirement = async (req: Request, res: Response) => {
    try {
      const { amount, currency } = req.query;
      
      if (!amount || isNaN(parseFloat(amount as string))) {
        return res.status(400).json({ 
          error: 'Valid amount required' 
        });
      }

      const requiresMultiSig = await this.multiSigService.requiresMultiSigApproval(
        parseFloat(amount as string),
        currency as string || 'MXN'
      );
      
      res.json({
        success: true,
        requiresMultiSig,
        threshold: process.env.MULTISIG_THRESHOLD_USD || 1000
      });
    } catch (error) {
      console.error('Error checking multi-sig requirement:', error);
      res.status(500).json({ 
        error: 'Failed to check multi-sig requirement',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get multi-sig dashboard data for admins
   */
  getDashboardData = async (req: Request, res: Response) => {
    try {
      const { role } = req.user as any;
      
      if (role !== 'admin') {
        return res.status(403).json({ 
          error: 'Admin privileges required' 
        });
      }

      // This would be implemented to return dashboard statistics
      // For now, return a placeholder response
      res.json({
        success: true,
        data: {
          pendingApprovals: 0,
          totalApprovals: 0,
          executedTransactions: 0,
          walletConfigs: []
        }
      });
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      res.status(500).json({ 
        error: 'Failed to get dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
