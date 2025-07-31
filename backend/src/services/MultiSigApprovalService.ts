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
  type: 'payment' | 'release' | 'dispute' | 'withdrawal' | 'WITHDRAWAL';
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
      // Mock implementation - would query database
      const approvals: ApprovalRequest[] = [];

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
   * Get upcoming payments in escrow that will require multi-sig approval when released
   */
  async getUpcomingMultiSigPayments(): Promise<any[]> {
    try {
      // Query payments that are escrowed and would require multi-sig approval
      const result = await this.db.query(`
        SELECT 
          p.id,
          p.amount,
          p.currency,
          p.description,
          p.payer_email,
          p.recipient_email,
          p.created_at,
          e.id as escrow_id,
          e.custody_end,
          e.release_amount
        FROM payment p
        INNER JOIN escrow e ON p.id = e.payment_id
        WHERE p.status = 'escrowed'
          AND e.status IN ('active', 'funded')
          AND e.custody_end > NOW()
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
            status: 'upcoming',
            requiresMultiSig: true,
            walletType: walletConfig.type,
            targetWallet: walletConfig.address,
            requiredSignatures: walletConfig.requiredSignatures,
            createdAt: new Date(row.created_at)
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
    try {
      // Mock implementation - would update database
      logger.info('Approving multi-sig transaction', {
        transactionId,
        signerAddress
      });

      // Return mock approved request
      const approvalRequest: ApprovalRequest = {
        id: transactionId,
        transactionId: transactionId,
        paymentId: 'mock_payment',
        walletAddress: '0x1234567890123456789012345678901234567890',
        amount: '1000',
        amountUsd: 50,
        recipientAddress: '0x0987654321098765432109876543210987654321',
        type: 'payment',
        status: 'approved',
        requiredSignatures: 2,
        currentSignatures: 1,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdBy: signerAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
        signatures: [],
        metadata: { approvedBy: signerAddress }
      };

      return approvalRequest;

    } catch (error) {
      logger.error('Failed to approve multi-sig transaction', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId,
        signerAddress
      });
      throw error;
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
