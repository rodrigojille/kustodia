import { Pool } from 'pg';
import AppDataSource from '../ormconfig';

export interface PreApprovalRequest {
  id: number;
  payment_id: number;
  wallet_address: string;
  required_signatures: number;
  current_signatures: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  amount: number;
  recipient_address: string;
  transaction_hash?: string;
  expires_at: Date;
  created_at: Date;
  metadata?: any;
}

export class PreApprovalService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new pre-approval request for a high-value payment
   * Uses existing multisig_approval_requests table structure
   */
  async createPreApproval(paymentId: number): Promise<PreApprovalRequest> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get payment details
      const paymentResult = await client.query(
        'SELECT * FROM payment WHERE id = $1',
        [paymentId]
      );

      if (paymentResult.rows.length === 0) {
        throw new Error('Payment not found');
      }

      const payment = paymentResult.rows[0];
      
      // Check if payment requires multi-sig approval
      const amountUSD = payment.currency === 'MXN' ? payment.amount / 20 : payment.amount;
      const threshold = parseFloat(process.env.MULTISIG_THRESHOLD_USD || '1000');
      
      if (amountUSD < threshold) {
        throw new Error('Payment amount does not require multi-sig approval');
      }

      // Check if pre-approval already exists
      const existingResult = await client.query(
        'SELECT * FROM multisig_approval_requests WHERE payment_id = $1 AND status IN ($2, $3)',
        [paymentId, 'pending', 'approved']
      );

      if (existingResult.rows.length > 0) {
        throw new Error('Pre-approval already exists for this payment');
      }

      // Get multi-sig wallet configuration
      const walletAddress = process.env.HIGH_VALUE_MULTISIG_ADDRESS || '0x1234567890123456789012345678901234567890';
      const recipientAddress = payment.recipient_address || process.env.JUNO_WALLET;
      
      // Set expiration (24 hours from now)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Insert pre-approval request using existing schema
      const insertResult = await client.query(`
        INSERT INTO multisig_approval_requests (
          payment_id, wallet_address, required_signatures, amount, amount_usd,
          recipient_address, approval_type, expires_at, created_by, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        paymentId,
        walletAddress,
        2, // Default 2 signatures required
        payment.amount,
        amountUSD,
        recipientAddress,
        'payment',
        expiresAt,
        'pre_approval_service',
        JSON.stringify({
          type: 'pre_approval',
          currency: payment.currency,
          description: payment.description,
          createdAt: new Date().toISOString()
        })
      ]);

      const preApproval = insertResult.rows[0];

      // Payment status remains unchanged - multisig approval is tracked separately
      // Funds remain in their current state (likely 'escrowed')

      await client.query('COMMIT');
      return preApproval;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Submit a signature for a pre-approval request
   */
  async submitSignature(preApprovalId: number, signerAddress: string, signature: string): Promise<{ isReady: boolean }> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if signature already exists
      const existingSignature = await client.query(
        'SELECT * FROM multisig_signatures WHERE approval_request_id = $1 AND signer_address = $2',
        [preApprovalId, signerAddress]
      );

      if (existingSignature.rows.length > 0) {
        throw new Error('Signature already submitted by this signer');
      }

      // Insert signature
      await client.query(`
        INSERT INTO multisig_signatures (
          approval_request_id, signer_address, signature, message_hash, signature_type
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        preApprovalId,
        signerAddress,
        signature,
        '0x' + '0'.repeat(64), // Placeholder hash
        'approval'
      ]);

      // Update signature count
      const signatureCount = await client.query(
        'SELECT COUNT(*) as count FROM multisig_signatures WHERE approval_request_id = $1',
        [preApprovalId]
      );

      const currentSignatures = parseInt(signatureCount.rows[0].count);

      // Get required signatures
      const approvalResult = await client.query(
        'SELECT required_signatures FROM multisig_approval_requests WHERE id = $1',
        [preApprovalId]
      );

      const requiredSignatures = approvalResult.rows[0].required_signatures;
      const isReady = currentSignatures >= requiredSignatures;

      // Update approval status if ready
      if (isReady) {
        await client.query(
          'UPDATE multisig_approval_requests SET status = $1, current_signatures = $2 WHERE id = $3',
          ['approved', currentSignatures, preApprovalId]
        );
      } else {
        await client.query(
          'UPDATE multisig_approval_requests SET current_signatures = $1 WHERE id = $2',
          [currentSignatures, preApprovalId]
        );
      }

      await client.query('COMMIT');
      return { isReady };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all pre-approval requests
   */
  async getAllPreApprovals(limit: number = 50): Promise<any[]> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          mar.*,
          p.payer_email,
          p.recipient_email,
          p.description as payment_description,
          p.amount as payment_amount,
          p.currency as payment_currency,
          p.status as payment_status,
          p.multisig_required,
          p.multisig_status,
          p.routing_decision,
          p.routing_reason,
          p.created_at as payment_created_at,
          p.updated_at as payment_updated_at,
          e.id as escrow_id,
          e.custody_end as released_at,
          e.custody_amount,
          e.release_amount,
          e.status as escrow_status,
          e.dispute_status,
          e.created_at as escrow_created_at
        FROM multisig_approval_requests mar
        JOIN payment p ON mar.payment_id = p.id
        LEFT JOIN escrow e ON p.escrow_id = e.id
        WHERE mar.status IN ('pending', 'approved')
        ORDER BY mar.created_at DESC
        LIMIT $1
      `, [limit]);

      return result.rows;

    } finally {
      client.release();
    }
  }

  /**
   * Get signature details for approval requests
   */
  async getSignatureDetails(approvalRequestIds: number[]): Promise<any[]> {
    if (approvalRequestIds.length === 0) return [];
    
    const client = await this.pool.connect();
    
    try {
      const placeholders = approvalRequestIds.map((_, i) => `$${i + 1}`).join(',');
      const result = await client.query(`
        SELECT 
          ms.approval_request_id,
          ms.signer_address,
          ms.signature,
          ms.signed_at,
          ms.is_valid,
          ms.signature_type
        FROM multisig_signatures ms
        WHERE ms.approval_request_id IN (${placeholders})
        ORDER BY ms.approval_request_id, ms.signed_at ASC
      `, approvalRequestIds);

      return result.rows;

    } finally {
      client.release();
    }
  }

  /**
   * Get ready pre-approvals for execution
   */
  async getReadyPreApprovals(): Promise<any[]> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          mar.*,
          p.payer_email,
          p.recipient_email,
          e.custody_end as released_at
        FROM multisig_approval_requests mar
        JOIN payment p ON mar.payment_id = p.id
        LEFT JOIN escrow e ON p.escrow_id = e.id
        WHERE mar.status = 'approved' 
          AND mar.expires_at > NOW()
          AND (e.custody_end IS NULL OR e.custody_end <= NOW())
        ORDER BY mar.created_at ASC
      `);

      return result.rows;

    } finally {
      client.release();
    }
  }

  /**
   * Execute a pre-approved transaction
   */
  async executePreApproval(preApprovalId: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get pre-approval details
      const approvalResult = await client.query(
        'SELECT * FROM multisig_approval_requests WHERE id = $1',
        [preApprovalId]
      );

      if (approvalResult.rows.length === 0) {
        throw new Error('Pre-approval not found');
      }

      const approval = approvalResult.rows[0];

      if (approval.status !== 'approved') {
        throw new Error('Pre-approval is not ready for execution');
      }

      // Simulate transaction execution (replace with actual Gnosis Safe execution)
      const txHash = '0x' + Math.random().toString(16).substring(2, 66).padStart(64, '0');

      // Update approval status
      await client.query(
        'UPDATE multisig_approval_requests SET status = $1, transaction_hash = $2, updated_at = NOW() WHERE id = $3',
        ['executed', txHash, preApprovalId]
      );

      // Update payment status
      await client.query(
        'UPDATE payment SET status = $1 WHERE id = $2',
        ['completed', approval.payment_id]
      );

      await client.query('COMMIT');
      return { success: true, txHash };

    } catch (error: any) {
      await client.query('ROLLBACK');
      return { success: false, error: error.message };
    } finally {
      client.release();
    }
  }

  /**
   * Cleanup expired pre-approvals
   */
  async cleanupExpiredPreApprovals(): Promise<number> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(`
        UPDATE multisig_approval_requests 
        SET status = 'expired' 
        WHERE status = 'pending' 
          AND expires_at < NOW()
      `);

      return result.rowCount || 0;

    } finally {
      client.release();
    }
  }
}
