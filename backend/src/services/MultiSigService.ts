import { Pool } from 'pg';
import { ethers } from 'ethers';
import { GnosisSafeService } from './GnosisSafeService';
import AppDataSource from '../ormconfig';

export interface MultiSigApprovalRequest {
  id: number;
  payment_id: number;
  wallet_config_id: number;
  required_signatures: number;
  current_signatures: number;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  transaction_data: any;
  created_at: Date;
  expires_at: Date;
}

export interface MultiSigSignature {
  id: number;
  approval_request_id: number;
  signer_address: string;
  signature: string;
  signed_at: Date;
}

export interface WalletConfig {
  id: number;
  wallet_name: string;
  threshold: number;
  total_owners: number;
  contract_address?: string;
  is_active: boolean;
}

export class MultiSigService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Check if a payment requires multi-sig approval based on amount and configuration
   */
  async requiresMultiSigApproval(paymentAmount: number, currency: string = 'MXN'): Promise<boolean> {
    try {
      // Convert to USD for threshold comparison (assuming 1 USD = 20 MXN for now)
      const usdAmount = currency === 'MXN' ? paymentAmount / 20 : paymentAmount;
      
      // Check if amount exceeds multi-sig threshold (typically $1,000 USD)
      const threshold = process.env.MULTISIG_THRESHOLD_USD ? parseFloat(process.env.MULTISIG_THRESHOLD_USD) : 1000;
      
      return usdAmount >= threshold;
    } catch (error) {
      console.error('Error checking multi-sig requirement:', error);
      return false;
    }
  }

  /**
   * Create a new multi-sig approval request for a payment
   */
  async createApprovalRequest(paymentId: number, walletConfigName: string = 'high_value'): Promise<MultiSigApprovalRequest> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get wallet configuration
      const walletConfigResult = await client.query(
        'SELECT * FROM multisig_wallet_config WHERE wallet_name = $1 AND is_active = true',
        [walletConfigName]
      );

      if (walletConfigResult.rows.length === 0) {
        throw new Error(`No active wallet configuration found for: ${walletConfigName}`);
      }

      const walletConfig = walletConfigResult.rows[0];

      // Get payment details
      const paymentResult = await client.query(
        'SELECT * FROM payment WHERE id = $1',
        [paymentId]
      );

      if (paymentResult.rows.length === 0) {
        throw new Error(`Payment not found: ${paymentId}`);
      }

      const payment = paymentResult.rows[0];

      // Create approval request
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

      const approvalResult = await client.query(`
        INSERT INTO multisig_approval_requests 
        (payment_id, wallet_config_id, required_signatures, current_signatures, status, transaction_data, expires_at)
        VALUES ($1, $2, $3, 0, 'pending', $4, $5)
        RETURNING *
      `, [
        paymentId,
        walletConfig.id,
        walletConfig.threshold,
        JSON.stringify({
          amount: payment.amount,
          currency: payment.currency,
          recipient: payment.recipient_email,
          description: payment.description
        }),
        expiresAt
      ]);

      // Update payment status
      await client.query(
        'UPDATE payment SET multisig_required = true, multisig_status = $1, multisig_approval_id = $2 WHERE id = $3',
        ['pending', approvalResult.rows[0].id, paymentId]
      );

      await client.query('COMMIT');
      
      return approvalResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Submit a signature for an approval request
   */
  async submitSignature(approvalRequestId: number, signerAddress: string, signature: string): Promise<boolean> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Verify signer is authorized
      const ownerCheck = await client.query(`
        SELECT mwo.* FROM multisig_wallet_owners mwo
        JOIN multisig_approval_requests mar ON mar.wallet_config_id = mwo.wallet_config_id
        WHERE mar.id = $1 AND mwo.owner_address = $2 AND mwo.is_active = true
      `, [approvalRequestId, signerAddress]);

      if (ownerCheck.rows.length === 0) {
        throw new Error('Unauthorized signer');
      }

      // Check if already signed
      const existingSignature = await client.query(
        'SELECT id FROM multisig_signatures WHERE approval_request_id = $1 AND signer_address = $2',
        [approvalRequestId, signerAddress]
      );

      if (existingSignature.rows.length > 0) {
        throw new Error('Already signed by this address');
      }

      // Add signature
      await client.query(`
        INSERT INTO multisig_signatures (approval_request_id, signer_address, signature)
        VALUES ($1, $2, $3)
      `, [approvalRequestId, signerAddress, signature]);

      // Update signature count
      await client.query(`
        UPDATE multisig_approval_requests 
        SET current_signatures = current_signatures + 1
        WHERE id = $1
      `, [approvalRequestId]);

      // Check if threshold reached
      const approvalResult = await client.query(
        'SELECT * FROM multisig_approval_requests WHERE id = $1',
        [approvalRequestId]
      );

      const approval = approvalResult.rows[0];
      
      if (approval.current_signatures >= approval.required_signatures) {
        // Mark as approved
        await client.query(
          'UPDATE multisig_approval_requests SET status = $1 WHERE id = $2',
          ['approved', approvalRequestId]
        );

        // Update payment status
        await client.query(
          'UPDATE payment SET multisig_status = $1 WHERE multisig_approval_id = $2',
          ['approved', approvalRequestId]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get pending approval requests for a wallet owner
   */
  async getPendingApprovals(ownerAddress: string): Promise<MultiSigApprovalRequest[]> {
    try {
      const result = await this.pool.query(`
        SELECT DISTINCT mar.*, p.amount, p.currency, p.recipient_email, p.description
        FROM multisig_approval_requests mar
        JOIN multisig_wallet_owners mwo ON mar.wallet_config_id = mwo.wallet_config_id
        JOIN payment p ON mar.payment_id = p.id
        WHERE mwo.owner_address = $1 
        AND mar.status = 'pending'
        AND mar.expires_at > NOW()
        AND mwo.is_active = true
        ORDER BY mar.created_at DESC
      `, [ownerAddress]);

      return result.rows;
    } catch (error) {
      console.error('Error getting pending approvals:', error);
      return [];
    }
  }

  /**
   * Get approval request details with signatures
   */
  async getApprovalDetails(approvalRequestId: number): Promise<any> {
    try {
      const approvalResult = await this.pool.query(`
        SELECT mar.*, p.amount, p.currency, p.recipient_email, p.description,
               mwc.wallet_name, mwc.threshold, mwc.total_owners
        FROM multisig_approval_requests mar
        JOIN payment p ON mar.payment_id = p.id
        JOIN multisig_wallet_config mwc ON mar.wallet_config_id = mwc.id
        WHERE mar.id = $1
      `, [approvalRequestId]);

      if (approvalResult.rows.length === 0) {
        return null;
      }

      const approval = approvalResult.rows[0];

      // Get signatures
      const signaturesResult = await this.pool.query(`
        SELECT ms.*, mwo.owner_name
        FROM multisig_signatures ms
        JOIN multisig_wallet_owners mwo ON ms.signer_address = mwo.owner_address
        WHERE ms.approval_request_id = $1
        ORDER BY ms.signed_at ASC
      `, [approvalRequestId]);

      approval.signatures = signaturesResult.rows;

      return approval;
    } catch (error) {
      console.error('Error getting approval details:', error);
      return null;
    }
  }

  /**
   * Get approval requests by payment ID
   */
  async getApprovalsByPaymentId(paymentId: number) {
    const result = await AppDataSource.query(
      'SELECT * FROM multisig_approval_requests WHERE payment_id = $1 ORDER BY created_at DESC',
      [paymentId]
    );
    return result;
  }

  /**
   * Get signatures by approval ID
   */
  async getSignaturesByApprovalId(approvalId: number) {
    const result = await AppDataSource.query(
      'SELECT * FROM multisig_signatures WHERE approval_request_id = $1 ORDER BY created_at DESC',
      [approvalId]
    );
    return result;
  }

  /**
   * Execute an approved multi-sig transaction
   */
  async executeApprovedTransaction(approvalId: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // Get approval details
      const approvalResult = await AppDataSource.query(
        'SELECT * FROM multisig_approval_requests WHERE id = $1',
        [approvalId]
      );
      
      if (approvalResult.length === 0) {
        return { success: false, error: 'Approval request not found' };
      }
      
      const approval = approvalResult[0];
      
      // Get signatures
      const signaturesResult = await AppDataSource.query(
        'SELECT * FROM multisig_signatures WHERE approval_request_id = $1 AND status = $2',
        [approvalId, 'approved']
      );
      
      const signatures = signaturesResult;
      
      if (signatures.length < approval.required_signatures) {
        return { 
          success: false, 
          error: `Insufficient signatures: ${signatures.length}/${approval.required_signatures}` 
        };
      }
      
      // For now, simulate transaction execution
      // In production, this would use Gnosis Safe SDK
      const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      
      // Update approval status
      await AppDataSource.query(
        'UPDATE multisig_approval_requests SET status = $1, executed_at = NOW() WHERE id = $2',
        ['executed', approvalId]
      );
      
      // Log transaction execution
      await AppDataSource.query(`
        INSERT INTO multisig_transaction_logs 
        (approval_request_id, action, details, created_at)
        VALUES ($1, $2, $3, NOW())
      `, [
        approvalId,
        'executed',
        JSON.stringify({ 
          txHash,
          payment_id: approval.payment_id,
          amount: approval.amount,
          signatures_count: signatures.length
        })
      ]);
      
      return { success: true, txHash };
      
    } catch (error: any) {
      console.error('Error executing approved transaction:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute a multi-sig transaction
   */
  async executeTransaction(approvalId: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const approval = await this.getApprovalDetails(approvalId);
      
      if (!approval || approval.status !== 'approved') {
        throw new Error('Transaction not approved or not found');
      }

      // Log transaction execution
      await this.pool.query(`
        INSERT INTO multisig_transaction_log 
        (approval_request_id, action, details, created_at)
        VALUES ($1, $2, $3, NOW())
      `, [
        approvalId,
        'executed',
        JSON.stringify({ 
          payment_id: approval.payment_id,
          amount: approval.amount,
          signatures_count: approval.current_signatures
        })
      ]);

      // Update approval status
      await this.pool.query(
        'UPDATE multisig_approval_requests SET status = $1 WHERE id = $2',
        ['executed', approvalId]
      );

      // Update payment status
      await this.pool.query(
        'UPDATE payment SET multisig_status = $1 WHERE multisig_approval_id = $2',
        ['executed', approvalId]
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error executing transaction:', error);
      return { success: false, error: error.message };
    }
  }
}
