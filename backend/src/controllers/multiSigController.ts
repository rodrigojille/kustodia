import { Request, Response } from 'express';
import { multiSigApprovalService } from '../services/MultiSigApprovalService';

export class MultiSigController {
  constructor() {
    // Using singleton instance, no need to store as instance variable
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

      const pendingApprovals = await multiSigApprovalService.getPendingApprovals(wallet_address);
      
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

      const approvalDetails = await multiSigApprovalService.getTransactionDetails(approvalId);
      
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

      const transactionDetails = await multiSigApprovalService.getTransactionDetails(approvalId);
      const signatures = transactionDetails?.signatures || [];

      // For now, use approveTransaction as submitSignature equivalent
      const success = await multiSigApprovalService.approveTransaction(
        approvalId,
        wallet_address
      );

      if (success) {
        // Get updated approval details
        const preApproved = await multiSigApprovalService.getPreApprovedTransactions();
        
        res.json({
          success: true,
          message: 'Signature submitted successfully',
          data: preApproved
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

      const result = await multiSigApprovalService.executeTransaction(approvalId, 'admin');
      
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

      // Create approval request using proposeTransaction
      const approvalRequest = await multiSigApprovalService.proposeTransaction({
        paymentId: paymentId.toString(),
        amount: 0, // Amount will be set from payment data
        amountUsd: 0, // USD amount will be calculated
        type: 'payment',
        createdBy: 'admin',
        description: `Multi-sig approval request for payment ${paymentId}`
      });
      
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

      // Check if amount requires multi-sig (using threshold logic)
      const amountUsd = parseFloat(amount as string) * 0.06; // Approximate MXN to USD
      const requiresMultiSig = amountUsd >= 1000; // $1000 USD threshold
      
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
   * Get signature history for an approval request
   */
  getSignatureHistory = async (req: Request, res: Response) => {
    try {
      const { approvalId } = req.params;
      
      if (!approvalId || isNaN(parseInt(approvalId))) {
        return res.status(400).json({ 
          error: 'Valid approval ID required' 
        });
      }

      const signatureHistory = await multiSigApprovalService.getSignatureHistory(approvalId);
      
      res.json({
        success: true,
        data: signatureHistory
      });
    } catch (error) {
      console.error('Error getting signature history:', error);
      res.status(500).json({ 
        error: 'Failed to get signature history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get approval timeline for a payment
   */
  getApprovalTimeline = async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      
      if (!paymentId || isNaN(parseInt(paymentId))) {
        return res.status(400).json({ 
          error: 'Valid payment ID required' 
        });
      }

      const timeline = await multiSigApprovalService.getApprovalTimeline(paymentId);
      
      res.json({
        success: true,
        data: timeline
      });
    } catch (error) {
      console.error('Error getting approval timeline:', error);
      res.status(500).json({ 
        error: 'Failed to get approval timeline',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Create Safe transaction for wallet signing
   */
  createSafeTransaction = async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;
      
      if (!transactionId || isNaN(parseInt(transactionId))) {
        return res.status(400).json({ 
          error: 'Valid transaction ID required' 
        });
      }

      const safeTransaction = await multiSigApprovalService.createSafeTransactionForSigning(transactionId);
      
      res.json({
        success: true,
        data: safeTransaction
      });
    } catch (error) {
      console.error('Error creating Safe transaction:', error);
      res.status(500).json({ 
        error: 'Failed to create Safe transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
