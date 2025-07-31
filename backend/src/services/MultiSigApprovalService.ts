import { ethers } from 'ethers';
import logger from '../utils/logger';
import { Pool } from 'pg';

export interface ApprovalRequest {
  id: string;
  paymentId: string;
  transactionHash?: string;
  transactionId?: string; // Alias for backward compatibility
  walletAddress: string;
  amount: string;
  amountUsd?: number;
  recipientAddress?: string;
  recipient?: string; // Frontend expects this field
  type: 'payment' | 'release' | 'dispute' | 'withdrawal' | 'WITHDRAWAL';
  transactionType?: string; // Frontend expects this field
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requiredSignatures: number;
  currentSignatures: number;
  expiresAt: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  transactionData?: any;
  signatures: Signature[];
  metadata?: any;
}

export interface Signature {
  id: string;
  signerAddress: string;
  signature: string;
  messageHash: string;
  signedAt: Date;
  isValid: boolean;
  type: 'approval' | 'rejection';
  metadata?: any;
}

export interface WalletConfig {
  id: string;
  address: string;
  type: 'high_value' | 'enterprise' | 'emergency';
  requiredSignatures: number;
  totalOwners: number;
  thresholdMinUsd: number;
  thresholdMaxUsd?: number;
  isActive: boolean;
  owners: WalletOwner[];
}

export interface WalletOwner {
  address: string;
  name?: string;
  email?: string;
  isActive: boolean;
}

export interface TransactionStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalExpired: number;
  averageApprovalTime: number;
  totalVolume: number;
  totalVolumeUsd: number;
}

export class MultiSigApprovalService {
  private provider: ethers.JsonRpcProvider;
  private db: Pool;
  private walletConfigs: Map<string, WalletConfig> = new Map();

  constructor() {
    // Initialize provider
    const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Initialize database connection
    this.db = new Pool({
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.initializeWalletConfigs();

    logger.info('MultiSigApprovalService initialized with database integration');
  }

  private async initializeWalletConfigs(): Promise<void> {
    try {
      // Mock wallet configurations for now - would come from database
      const mockConfigs: WalletConfig[] = [
        {
          id: 'high-value-wallet',
          address: '0x1234567890123456789012345678901234567890',
          type: 'high_value',
          requiredSignatures: 2,
          totalOwners: 3,
          thresholdMinUsd: 1000,
          thresholdMaxUsd: 10000,
          isActive: true,
          owners: [
            { address: '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b', name: 'Admin 1', isActive: true },
            { address: '0x486B88Ca87533294FB45247387169f081f3102ff', name: 'Admin 2', isActive: true },
            { address: '0x742d35Cc6634C0532925a3b8D0c6964b0c6964b0', name: 'Admin 3', isActive: true }
          ]
        },
        {
          id: 'enterprise-wallet',
          address: '0x2345678901234567890123456789012345678901',
          type: 'enterprise',
          requiredSignatures: 3,
          totalOwners: 5,
          thresholdMinUsd: 10000,
          isActive: true,
          owners: []
        }
      ];

      for (const config of mockConfigs) {
        this.walletConfigs.set(config.address, config);
      }

      logger.info('Wallet configurations loaded', {
        count: this.walletConfigs.size,
        configs: Array.from(this.walletConfigs.values()).map(c => ({
          address: c.address,
          type: c.type,
          thresholdMinUsd: c.thresholdMinUsd,
          thresholdMaxUsd: c.thresholdMaxUsd
        }))
      });

    } catch (error) {
      logger.error('Failed to initialize wallet configurations', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Determine which wallet to use based on USD amount
   */
  private determineWalletForAmount(amountUsd: number): WalletConfig | null {
    const configs = Array.from(this.walletConfigs.values())
      .filter(config => config.isActive)
      .sort((a, b) => a.thresholdMinUsd - b.thresholdMinUsd);

    for (const config of configs) {
      if (amountUsd >= config.thresholdMinUsd && 
          (!config.thresholdMaxUsd || amountUsd <= config.thresholdMaxUsd)) {
        return config;
      }
    }

    return null;
  }

  /**
   * Propose a new multi-sig transaction
   */
  async proposeTransaction(params: {
    paymentId: string;
    amount: string | number; // Accept both for compatibility
    amountUsd: number;
    recipientAddress?: string; // Optional, can use 'to' instead
    type: 'payment' | 'release' | 'dispute' | 'withdrawal' | 'WITHDRAWAL';
    createdBy: string;
    description?: string;
    metadata?: any;
    to?: string; // Alias for recipientAddress
    value?: string; // ETH value for transaction (optional)
    data?: string; // Transaction data (optional)
  }): Promise<ApprovalRequest> {
    try {
      // Determine appropriate wallet
      const walletConfig = this.determineWalletForAmount(params.amountUsd);
      if (!walletConfig) {
        throw new Error(`No suitable wallet configuration found for amount: $${params.amountUsd}`);
      }

      // Set expiration (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const transactionData = {
        to: params.recipientAddress,
        value: params.amount,
        data: '0x',
        description: params.description
      };

      const metadata = {
        ...params.metadata,
        walletType: walletConfig.type,
        proposedAt: new Date().toISOString()
      };

      // Create approval request (would be saved to database)
      const transactionId = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const approvalRequest: ApprovalRequest = {
        id: transactionId,
        transactionId: transactionId, // Backward compatibility
        paymentId: params.paymentId,
        walletAddress: walletConfig.address,
        amount: params.amount.toString(), // Ensure string
        amountUsd: params.amountUsd,
        recipientAddress: params.recipientAddress || params.to || '',
        type: params.type,
        status: 'pending',
        requiredSignatures: walletConfig.requiredSignatures,
        currentSignatures: 0,
        expiresAt,
        createdBy: params.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        transactionData,
        signatures: [],
        metadata
      };

      logger.info('Multi-sig transaction proposed', {
        id: approvalRequest.id,
        paymentId: params.paymentId,
        amount: params.amount,
        amountUsd: params.amountUsd,
        walletAddress: walletConfig.address,
        walletType: walletConfig.type,
        requiredSignatures: walletConfig.requiredSignatures
      });

      return approvalRequest;

    } catch (error) {
      logger.error('Failed to propose multi-sig transaction', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params
      });
      throw error;
    }
  }

  /**
   * Get transaction details by ID
   */
  async getTransactionDetails(transactionId: string): Promise<ApprovalRequest | null> {
    try {
      // Mock implementation - would query database
      logger.info('Getting transaction details', { transactionId });
      return null;

    } catch (error) {
      logger.error('Failed to get transaction details', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId
      });
      throw error;
    }
  }

  /**
   * Get transaction statistics for the last 30 days
   */
  async getTransactionStatistics(): Promise<TransactionStats> {
    try {
      // Mock implementation - would query database
      const stats: TransactionStats = {
        totalPending: 0,
        totalApproved: 0,
        totalRejected: 0,
        totalExpired: 0,
        averageApprovalTime: 0,
        totalVolume: 0,
        totalVolumeUsd: 0
      };

      logger.info('Transaction statistics retrieved', stats);
      return stats;

    } catch (error) {
      logger.error('Failed to get transaction statistics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get wallet configuration
   */
  async getWalletConfiguration(): Promise<WalletConfig[]> {
    return Array.from(this.walletConfigs.values());
  }

  /**
   * Get pending approval requests, optionally filtered by wallet address
   */
  async getPendingApprovals(walletAddress?: string): Promise<ApprovalRequest[]> {
    try {
      // Query pending approval requests with payment and escrow details
      const query = `
        SELECT 
          mar.id,
          mar.payment_id,
          mar.transaction_hash,
          mar.wallet_address,
          mar.required_signatures,
          mar.current_signatures,
          mar.status,
          mar.approval_type,
          mar.amount,
          mar.amount_usd,
          mar.recipient_address,
          mar.transaction_data,
          mar.expires_at,
          mar.created_at,
          mar.updated_at,
          mar.created_by,
          mar.metadata,
          p.payment_type,
          p.description,
          p.recipient_email,
          p.payer_email,
          p.currency,
          p.status as payment_status,
          p.vertical_type,
          p.operation_type,
          e.custody_amount,
          e.custody_percent,
          e.release_amount,
          e.custody_end,
          e.status as escrow_status,
          e.smart_contract_escrow_id,
          e.blockchain_tx_hash as escrow_tx_hash
        FROM multisig_approval_requests mar
        JOIN payment p ON mar.payment_id = p.id
        LEFT JOIN escrow e ON p.escrow_id = e.id
        WHERE mar.status = 'pending' 
          AND mar.expires_at > NOW()
          AND e.custody_end <= NOW()  -- Only show when escrow custody has actually ended
          ${walletAddress ? 'AND mar.wallet_address = $1' : ''}
        ORDER BY mar.created_at DESC
      `;
      
      const params = walletAddress ? [walletAddress] : [];
      const result = await this.db.query(query, params);
      
      const approvals: ApprovalRequest[] = result.rows.map(row => ({
        id: row.id.toString(),
        paymentId: row.payment_id.toString(),
        transactionId: row.payment_id.toString(),
        walletAddress: row.wallet_address,
        amount: row.amount.toString(),
        amountUsd: row.amount_usd ? parseFloat(row.amount_usd) : parseFloat(row.amount) / 20,
        type: row.approval_type || 'payment',
        // Use payment_type for more accurate transaction type instead of approval_type
        transactionType: row.payment_type || row.approval_type || 'payment',
        recipient: row.recipient_address,
        status: row.status,
        requiredSignatures: row.required_signatures,
        currentSignatures: row.current_signatures,
        expiresAt: new Date(row.expires_at),
        createdBy: row.created_by || row.payer_email,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        transactionData: row.transaction_data,
        signatures: [], // Will be populated separately if needed
        metadata: {
          ...row.metadata,
          paymentDetails: {
            description: row.description,
            recipientEmail: row.recipient_email,
            payerEmail: row.payer_email,
            currency: row.currency,
            paymentStatus: row.payment_status,
            verticalType: row.vertical_type,
            operationType: row.operation_type
          },
          escrowDetails: row.custody_amount ? {
            custodyAmount: row.custody_amount,
            custodyPercent: row.custody_percent,
            releaseAmount: row.release_amount,
            custodyEnd: row.custody_end,
            escrowStatus: row.escrow_status,
            smartContractEscrowId: row.smart_contract_escrow_id,
            escrowTxHash: row.escrow_tx_hash
          } : null
        }
      }));

      logger.info('Pending approvals retrieved', {
        count: approvals.length,
        walletAddress: walletAddress || 'all'
      });

      return approvals;

    } catch (error) {
      logger.error('Failed to get pending approvals', {
        error: error instanceof Error ? error.message : 'Unknown error',
        walletAddress
      });
      throw error;
    }
  }

  /**
   * Get pre-approved transactions (fully signed, ready for execution)
   */
  async getPreApprovedTransactions(): Promise<ApprovalRequest[]> {
    try {
      const query = `
        SELECT 
          mar.id,
          mar.payment_id,
          mar.transaction_hash,
          mar.wallet_address,
          mar.required_signatures,
          mar.current_signatures,
          mar.status,
          mar.approval_type,
          mar.amount,
          mar.amount_usd,
          mar.recipient_address,
          mar.transaction_data,
          mar.expires_at,
          mar.created_at,
          mar.updated_at,
          mar.created_by,
          mar.metadata,
          p.payment_type,
          p.description,
          p.recipient_email,
          p.payer_email,
          p.currency,
          p.status as payment_status,
          p.vertical_type,
          p.operation_type,
          e.custody_amount,
          e.custody_percent,
          e.release_amount,
          e.custody_end,
          e.status as escrow_status,
          e.smart_contract_escrow_id,
          e.blockchain_tx_hash as escrow_tx_hash
        FROM multisig_approval_requests mar
        JOIN payment p ON mar.payment_id = p.id
        LEFT JOIN escrow e ON p.escrow_id = e.id
        WHERE mar.current_signatures >= mar.required_signatures
          AND p.status = 'escrowed'
          AND mar.expires_at > NOW()
        ORDER BY mar.updated_at DESC
      `;

      const result = await this.db.query(query);
      
      const approvals: ApprovalRequest[] = result.rows.map(row => ({
        id: row.id.toString(),
        paymentId: row.payment_id.toString(),
        transactionId: row.payment_id.toString(),
        walletAddress: row.wallet_address,
        amount: row.amount.toString(),
        amountUsd: row.amount_usd ? parseFloat(row.amount_usd) : parseFloat(row.amount) / 20,
        type: row.approval_type || 'payment',
        transactionType: row.payment_type || row.approval_type || 'payment',
        recipient: row.recipient_address,
        status: 'approved', // Override status since these are fully signed
        requiredSignatures: row.required_signatures,
        currentSignatures: row.current_signatures,
        expiresAt: new Date(row.expires_at),
        createdBy: row.created_by || row.payer_email,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        transactionData: row.transaction_data,
        signatures: [],
        metadata: {
          ...row.metadata,
          paymentDetails: {
            description: row.description,
            recipientEmail: row.recipient_email,
            payerEmail: row.payer_email,
            currency: row.currency,
            paymentStatus: row.payment_status,
            verticalType: row.vertical_type,
            operationType: row.operation_type
          },
          escrowDetails: row.custody_amount ? {
            custodyAmount: row.custody_amount,
            custodyPercent: row.custody_percent,
            releaseAmount: row.release_amount,
            custodyEnd: row.custody_end,
            escrowStatus: row.escrow_status,
            smartContractEscrowId: row.smart_contract_escrow_id,
            escrowTxHash: row.escrow_tx_hash
          } : null
        }
      }));

      logger.info('Pre-approved transactions retrieved', {
        count: approvals.length
      });

      return approvals;
    } catch (error) {
      logger.error('Failed to get pre-approved transactions', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get upcoming payments in escrow that will require multi-sig approval when released
   */
  async getUpcomingMultiSigPayments(): Promise<any[]> {
    try {
      // Query payments that are escrowed and would require multi-sig approval
      // but don't already have a pre-approval request
      const result = await this.db.query(`
        SELECT 
          p.id,
          p.amount,
          p.currency,
          p.description,
          p.payer_email,
          p.recipient_email,
          p.status as payment_status,
          p.multisig_required,
          p.multisig_status,
          p.multisig_approval_id,
          p.routing_decision,
          p.routing_reason,
          p.created_at,
          p.updated_at,
          e.id as escrow_id,
          e.custody_end,
          e.release_amount,
          e.custody_amount,
          e.status as escrow_status,
          e.dispute_status,
          mar.id as multisig_request_id,
          mar.status as multisig_status,
          mar.current_signatures,
          mar.required_signatures as multisig_required_signatures,
          mar.created_at as multisig_created_at
        FROM payment p
        INNER JOIN escrow e ON p.id = e.payment_id
        LEFT JOIN multisig_approval_requests mar ON p.id = mar.payment_id
        WHERE p.status = 'escrowed'
          AND e.status IN ('active', 'funded')
          AND e.custody_end > NOW()
          AND (
            -- Include payments without multisig requests (will be created when custody ends)
            mar.id IS NULL 
            -- OR payments with multisig requests but custody period hasn't ended yet
            OR (mar.id IS NOT NULL AND mar.status = 'pending' AND e.custody_end > NOW())
          )
        ORDER BY e.custody_end ASC
      `);

      const upcomingPayments = [];

      for (const row of result.rows) {
        const amount = parseFloat(row.amount);
        const amountUsd = amount / 20; // Rough MXN to USD conversion
        
        // Check if this amount would require multi-sig
        const walletConfig = this.determineWalletForAmount(amountUsd);
        
        if (walletConfig) {
          const escrowEndTime = new Date(row.custody_end);
          const now = new Date();
          const hoursUntilRelease = Math.max(0, Math.floor((escrowEndTime.getTime() - now.getTime()) / (1000 * 60 * 60)));
          
          upcomingPayments.push({
            paymentId: row.id,
            amount: amount,
            amountUsd: amountUsd,
            currency: row.currency || 'MXN',
            description: row.description,
            payerEmail: row.payer_email,
            payeeEmail: row.recipient_email,
            escrowId: row.escrow_id,
            escrowEndTime: escrowEndTime,
            hoursUntilRelease,
            status: row.multisig_request_id ? 'pre-approval-created' : 'upcoming',
            requiresMultiSig: true,
            walletType: walletConfig.type,
            targetWallet: walletConfig.address,
            requiredSignatures: walletConfig.requiredSignatures,
            createdAt: new Date(row.created_at),
            // Include multisig request info as flat fields (matching frontend interface)
            multisigRequestId: row.multisig_request_id || null,
            multisigStatus: row.multisig_status || null,
            currentSignatures: row.current_signatures || 0,
            multisigRequiredSignatures: row.multisig_required_signatures || walletConfig.requiredSignatures,
            multisigCreatedAt: row.multisig_created_at ? new Date(row.multisig_created_at) : null
          });
        }
      }

      logger.info('Found upcoming multi-sig payments', {
        count: upcomingPayments.length,
        totalValue: upcomingPayments.reduce((sum, p) => sum + p.amountUsd, 0)
      });

      return upcomingPayments;

    } catch (error) {
      logger.error('Failed to get upcoming multi-sig payments', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  /**
   * Execute a multi-sig transaction after sufficient approvals
   */
  async executeTransaction(transactionId: string, executorAddress: string): Promise<string> {
    try {
      // Mock implementation - would validate approvals and execute transaction
      logger.info('Executing multi-sig transaction', {
        transactionId,
        executorAddress
      });

      // Return mock transaction hash
      return `0x${Math.random().toString(16).substr(2, 64)}`;

    } catch (error) {
      logger.error('Failed to execute multi-sig transaction', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId,
        executorAddress
      });
      throw error;
    }
  }

  /**
   * Approve a multi-sig transaction
   */
  async approveTransaction(transactionId: string, signerAddress: string, signature?: string): Promise<ApprovalRequest> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      logger.info('Approving multi-sig transaction', {
        transactionId,
        signerAddress
      });

      // Get the multisig approval request
      const approvalResult = await client.query(
        'SELECT * FROM multisig_approval_requests WHERE id = $1',
        [parseInt(transactionId)]
      );

      if (approvalResult.rows.length === 0) {
        throw new Error('Multisig approval request not found');
      }

      const approval = approvalResult.rows[0];

      // Check if already signed by this address
      const existingSignature = await client.query(
        'SELECT id FROM multisig_signatures WHERE approval_request_id = $1 AND signer_address = $2',
        [parseInt(transactionId), signerAddress]
      );

      if (existingSignature.rows.length > 0) {
        throw new Error('Already signed by this address');
      }

      // Add signature if provided
      if (signature) {
        await client.query(`
          INSERT INTO multisig_signatures (approval_request_id, signer_address, signature)
          VALUES ($1, $2, $3)
        `, [parseInt(transactionId), signerAddress, signature]);
      }

      // Update signature count
      await client.query(`
        UPDATE multisig_approval_requests 
        SET current_signatures = current_signatures + 1
        WHERE id = $1
      `, [parseInt(transactionId)]);

      // Get updated approval request
      const updatedResult = await client.query(
        'SELECT * FROM multisig_approval_requests WHERE id = $1',
        [parseInt(transactionId)]
      );

      const updatedApproval = updatedResult.rows[0];
      
      // Check if threshold reached
      if (updatedApproval.current_signatures >= updatedApproval.required_signatures) {
        // Mark as approved
        await client.query(
          'UPDATE multisig_approval_requests SET status = $1 WHERE id = $2',
          ['approved', parseInt(transactionId)]
        );

        // Update payment status
        await client.query(
          'UPDATE payment SET multisig_status = $1 WHERE multisig_approval_id = $2',
          ['approved', parseInt(transactionId)]
        );
        
        updatedApproval.status = 'approved';
      }

      await client.query('COMMIT');

      // Return the approval request in the expected format
      const approvalRequest: ApprovalRequest = {
        id: updatedApproval.id.toString(),
        transactionId: updatedApproval.id.toString(),
        paymentId: updatedApproval.payment_id.toString(),
        walletAddress: signerAddress,
        amount: updatedApproval.transaction_data?.amount || '0',
        amountUsd: parseFloat(updatedApproval.transaction_data?.amount || '0'),
        recipientAddress: updatedApproval.transaction_data?.recipient || '',
        type: 'payment',
        status: updatedApproval.status,
        requiredSignatures: updatedApproval.required_signatures,
        currentSignatures: updatedApproval.current_signatures,
        expiresAt: updatedApproval.expires_at,
        createdBy: signerAddress,
        createdAt: updatedApproval.created_at,
        updatedAt: new Date(),
        signatures: [],
        metadata: { approvedBy: signerAddress }
      };

      return approvalRequest;

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to approve multi-sig transaction', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId,
        signerAddress
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Reject a multi-sig transaction
   */
  async rejectTransaction(transactionId: string, signerAddress: string, reason?: string): Promise<ApprovalRequest> {
    try {
      // Mock implementation - would update database
      logger.info('Rejecting multi-sig transaction', {
        transactionId,
        signerAddress,
        reason
      });

      // Return mock rejected request
      const approvalRequest: ApprovalRequest = {
        id: transactionId,
        transactionId: transactionId,
        paymentId: 'mock_payment',
        walletAddress: '0x1234567890123456789012345678901234567890',
        amount: '1000',
        amountUsd: 50,
        recipientAddress: '0x0987654321098765432109876543210987654321',
        type: 'payment',
        status: 'rejected',
        requiredSignatures: 2,
        currentSignatures: 0,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdBy: signerAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
        signatures: [],
        metadata: { rejectedBy: signerAddress, reason }
      };

      return approvalRequest;

    } catch (error) {
      logger.error('Failed to reject multi-sig transaction', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId,
        signerAddress
      });
      throw error;
    }
  }

  /**
   * Get pending transactions (alias for getPendingApprovals)
   */
  async getPendingTransactions(walletAddress?: string): Promise<ApprovalRequest[]> {
    return this.getPendingApprovals(walletAddress);
  }

  /**
   * Get approval requests with filtering options
   */
  async getApprovalRequests(options?: {
    status?: string;
    walletAddress?: string;
    paymentId?: string;
    limit?: number;
  }): Promise<ApprovalRequest[]> {
    try {
      // Mock implementation - would query database with filters
      logger.info('Getting approval requests', options);
      return [];

    } catch (error) {
      logger.error('Failed to get approval requests', {
        error: error instanceof Error ? error.message : 'Unknown error',
        options
      });
      throw error;
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    database: boolean;
    provider: boolean;
    walletConfigs: number;
    lastError?: string;
  }> {
    let health = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      database: false,
      provider: false,
      walletConfigs: this.walletConfigs.size,
      lastError: undefined as string | undefined
    };

    try {
      // Test database connection
      await this.db.query('SELECT 1');
      health.database = true;
    } catch (error) {
      health.database = false;
      health.lastError = `Database: ${error instanceof Error ? error.message : 'Unknown error'}`;
      health.status = 'unhealthy';
    }

    try {
      // Test provider connection
      await this.provider.getBlockNumber();
      health.provider = true;
    } catch (error) {
      health.provider = false;
      if (!health.lastError) {
        health.lastError = `Provider: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
      if (health.status === 'healthy') {
        health.status = 'degraded';
      }
    }

    return health;
  }
}

// Export singleton instance
export const multiSigApprovalService = new MultiSigApprovalService();
