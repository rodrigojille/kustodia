import { Pool } from 'pg';
import { ethers } from 'ethers';
import logger from '../utils/logger';
import { createSafeClient } from '@safe-global/sdk-starter-kit';

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
  type: 'low_value' | 'high_value' | 'enterprise' | 'emergency';
  requiredSignatures: number;
  totalOwners: number;
  thresholdMinUsd: number;
  thresholdMaxUsd?: number;
  isActive: boolean;
  owners: WalletOwner[];
  privateKey?: string; // Private key for transaction execution
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
      const client = await this.db.connect();
      try {
        // Load wallet configurations from database
        const configResult = await client.query(`
          SELECT 
            mwc.*,
            array_agg(
              json_build_object(
                'address', mwo.owner_address,
                'name', mwo.owner_name,
                'email', mwo.owner_email,
                'isActive', mwo.is_active
              )
            ) FILTER (WHERE mwo.owner_address IS NOT NULL) as owners
          FROM multisig_wallet_config mwc
          LEFT JOIN multisig_wallet_owners mwo ON mwc.id = mwo.wallet_config_id
          WHERE mwc.is_active = true
          GROUP BY mwc.id, mwc.wallet_address, mwc.wallet_type, mwc.required_signatures, 
                   mwc.total_owners, mwc.threshold_min_usd, mwc.threshold_max_usd, mwc.is_active
        `);

        // Clear existing configurations
        this.walletConfigs.clear();

        // Process database results
        for (const row of configResult.rows) {
          const config: WalletConfig = {
            id: row.id.toString(),
            address: row.wallet_address,
            type: row.wallet_type,
            requiredSignatures: row.required_signatures,
            totalOwners: row.total_owners,
            thresholdMinUsd: parseFloat(row.threshold_min_usd),
            thresholdMaxUsd: row.threshold_max_usd ? parseFloat(row.threshold_max_usd) : undefined,
            isActive: row.is_active,
            owners: row.owners || [],
            privateKey: this.getPrivateKeyForWallet(row.wallet_address, row.wallet_type)
          };

          this.walletConfigs.set(config.address, config);
        }

        // If no configurations found in database, create default ones
        if (this.walletConfigs.size === 0) {
          logger.warn('No wallet configurations found in database, creating defaults');
          await this.createDefaultWalletConfigs(client);
        }

        logger.info('Wallet configurations loaded from database', {
          count: this.walletConfigs.size,
          configs: Array.from(this.walletConfigs.values()).map(c => ({
            address: c.address,
            type: c.type,
            thresholdMinUsd: c.thresholdMinUsd,
            thresholdMaxUsd: c.thresholdMaxUsd,
            requiredSignatures: c.requiredSignatures,
            totalOwners: c.totalOwners
          }))
        });

      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Failed to initialize wallet configurations', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fallback to basic configuration if database fails
      this.createFallbackConfigs();
    }
  }

  /**
   * Get private key for wallet from environment variables
   */
  private getPrivateKeyForWallet(walletAddress: string, walletType: string): string | undefined {
    // Map wallet addresses to their corresponding environment variable private keys
    const addressLower = walletAddress.toLowerCase();
    
    // Bridge wallet
    const bridgeWallet = process.env.ESCROW_BRIDGE_WALLET || '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b';
    if (addressLower === bridgeWallet.toLowerCase()) {
      return process.env.ESCROW_PRIVATE_KEY;
    }
    
    // Multi-sig owner wallets - map each address to its specific private key
    const multisigOwners: { [key: string]: string | undefined } = {
      '0xe120e428b2bb7e28b21d2634ad1d601c6cd6b33f': process.env.MULTISIG_OWNER_1_PRIVATE_KEY,
      '0x342fe8428e7eef4a1047b3ba4a9a1a8dcd42b3c7': process.env.MULTISIG_OWNER_2_PRIVATE_KEY,
      '0xc8d5563bf6df6c5e5f6dfc42beec1cc8598ac38f': process.env.MULTISIG_OWNER_3_PRIVATE_KEY
    };
    
    // Check if this address matches any of the multisig owners
    if (multisigOwners[addressLower]) {
      return multisigOwners[addressLower];
    }
    
    // For multisig wallet addresses themselves (not individual owners), use first owner's key for execution
    const highValueMultisig = process.env.HIGH_VALUE_MULTISIG_ADDRESS?.toLowerCase();
    const enterpriseMultisig = process.env.ENTERPRISE_MULTISIG_ADDRESS?.toLowerCase();
    
    // Database multi-sig wallet addresses (current active configuration)
    const dbHighValueMultisig = '0xe120e428b2bb7e28b21d2634ad1d601c6cd6b33f';
    const dbEnterpriseMultisig = '0x342fe8428e7eef4a1047b3ba4a9a1a8dcd42b3c7';
    
    if (addressLower === highValueMultisig || addressLower === enterpriseMultisig ||
        addressLower === dbHighValueMultisig || addressLower === dbEnterpriseMultisig) {
      // Use the first available owner's private key for execution
      return process.env.MULTISIG_OWNER_1_PRIVATE_KEY || process.env.ESCROW_PRIVATE_KEY;
    }
    
    console.warn(`[MultiSigApprovalService] No private key found for wallet: ${walletAddress} (type: ${walletType})`);
    return undefined;
  }

  /**
   * Create default wallet configurations in database
   */
  private async createDefaultWalletConfigs(client: any): Promise<void> {
    try {
      // Insert default standard wallet config (for amounts $0-$999)
      const standardResult = await client.query(`
        INSERT INTO multisig_wallet_config (
          wallet_address, wallet_type, required_signatures, total_owners,
          threshold_min_usd, threshold_max_usd, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (wallet_address) DO UPDATE SET
          wallet_type = EXCLUDED.wallet_type,
          required_signatures = EXCLUDED.required_signatures,
          total_owners = EXCLUDED.total_owners,
          threshold_min_usd = EXCLUDED.threshold_min_usd,
          threshold_max_usd = EXCLUDED.threshold_max_usd,
          is_active = EXCLUDED.is_active,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        process.env.ESCROW_BRIDGE_WALLET || '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b',
        'low_value',
        1, // Bridge wallet - single signature
        1, // Single owner (bridge wallet)
        0.00,
        999.99,
        true
      ]);

      // Insert default high-value wallet config
      const highValueResult = await client.query(`
        INSERT INTO multisig_wallet_config (
          wallet_address, wallet_type, required_signatures, total_owners,
          threshold_min_usd, threshold_max_usd, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (wallet_address) DO UPDATE SET
          wallet_type = EXCLUDED.wallet_type,
          required_signatures = EXCLUDED.required_signatures,
          total_owners = EXCLUDED.total_owners,
          threshold_min_usd = EXCLUDED.threshold_min_usd,
          threshold_max_usd = EXCLUDED.threshold_max_usd,
          is_active = EXCLUDED.is_active,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        process.env.HIGH_VALUE_MULTISIG_ADDRESS || '0xA8F1B1Bac8D3B1c5D28A7eD91fa01e96eDB6711c',
        'high_value',
        parseInt(process.env.HIGH_VALUE_MULTISIG_THRESHOLD || '2'),
        4, // Based on your env config showing 4 owners
        parseFloat(process.env.MULTISIG_HIGH_VALUE_THRESHOLD || '1000'),
        parseFloat(process.env.MULTISIG_ENTERPRISE_THRESHOLD || '10000') - 0.01,
        true
      ]);

      // Insert default enterprise wallet config
      const enterpriseResult = await client.query(`
        INSERT INTO multisig_wallet_config (
          wallet_address, wallet_type, required_signatures, total_owners,
          threshold_min_usd, threshold_max_usd, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (wallet_address) DO UPDATE SET
          wallet_type = EXCLUDED.wallet_type,
          required_signatures = EXCLUDED.required_signatures,
          total_owners = EXCLUDED.total_owners,
          threshold_min_usd = EXCLUDED.threshold_min_usd,
          threshold_max_usd = EXCLUDED.threshold_max_usd,
          is_active = EXCLUDED.is_active,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        process.env.ENTERPRISE_MULTISIG_ADDRESS || '0xA8F1B1Bac8D3B1c5D28A7eD91fa01e96eDB6711c',
        'enterprise',
        parseInt(process.env.ENTERPRISE_MULTISIG_THRESHOLD || '2'),
        4, // Based on your env config showing 4 owners
        parseFloat(process.env.MULTISIG_ENTERPRISE_THRESHOLD || '10000'),
        null,
        true
      ]);

      // Add owner for bridge wallet (standard transactions)
      const bridgeWallet = process.env.ESCROW_BRIDGE_WALLET || '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b';
      await client.query(`
        INSERT INTO multisig_wallet_owners (
          wallet_address, owner_address, owner_name, is_active
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (wallet_address, owner_address) DO UPDATE SET
          owner_name = EXCLUDED.owner_name,
          is_active = EXCLUDED.is_active,
          updated_at = CURRENT_TIMESTAMP
      `, [
        bridgeWallet,
        bridgeWallet,
        'Bridge Wallet',
        true
      ]);

      // Get multisig wallet owners from environment variables
      const ownerAddresses = (process.env.HIGH_VALUE_MULTISIG_OWNERS || '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b,0xE120E428b2bB7E28B21D2634ad1d601c6Cd6b33F,0x342Fe8428e7eEF4A1047B3ba4A9a1a8DCD42b3c7,0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F').split(',');
      const defaultOwners = ownerAddresses.map((address, index) => ({
        address: address.trim(),
        name: `Admin ${index + 1}`
      }));

      // Add owners for multisig wallets (high-value and enterprise)
      const multisigWallet = process.env.HIGH_VALUE_MULTISIG_ADDRESS || '0xA8F1B1Bac8D3B1c5D28A7eD91fa01e96eDB6711c';
      
      for (const owner of defaultOwners) {
        await client.query(`
          INSERT INTO multisig_wallet_owners (
            wallet_address, owner_address, owner_name, is_active
          ) VALUES ($1, $2, $3, $4)
          ON CONFLICT (wallet_address, owner_address) DO UPDATE SET
            owner_name = EXCLUDED.owner_name,
            is_active = EXCLUDED.is_active,
            updated_at = CURRENT_TIMESTAMP
        `, [
          multisigWallet,
          owner.address,
          owner.name,
          true
        ]);
      }

      // Reload configurations after creating defaults
      await this.initializeWalletConfigs();

      logger.info('Default wallet configurations created in database');

    } catch (error) {
      logger.error('Failed to create default wallet configurations', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create fallback configurations if database is unavailable
   */
  private createFallbackConfigs(): void {
    const walletAddress = process.env.HIGH_VALUE_MULTISIG_ADDRESS || '0xA8F1B1Bac8D3B1c5D28A7eD91fa01e96eDB6711c';
    const ownerAddresses = (process.env.HIGH_VALUE_MULTISIG_OWNERS || '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b,0xE120E428b2bB7E28B21D2634ad1d601c6Cd6b33F,0x342Fe8428e7eEF4A1047B3ba4A9a1a8DCD42b3c7,0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F').split(',');
    const owners = ownerAddresses.map((address, index) => ({
      address: address.trim(),
      name: `Admin ${index + 1}`,
      isActive: true
    }));

    const fallbackConfigs: WalletConfig[] = [
      {
        id: 'fallback-high-value',
        address: walletAddress,
        type: 'high_value',
        requiredSignatures: parseInt(process.env.HIGH_VALUE_MULTISIG_THRESHOLD || '2'),
        totalOwners: owners.length,
        thresholdMinUsd: parseFloat(process.env.MULTISIG_HIGH_VALUE_THRESHOLD || '1000'),
        thresholdMaxUsd: parseFloat(process.env.MULTISIG_ENTERPRISE_THRESHOLD || '10000') - 0.01,
        isActive: true,
        owners: owners
      },
      {
        id: 'fallback-enterprise',
        address: process.env.ENTERPRISE_MULTISIG_ADDRESS || walletAddress,
        type: 'enterprise',
        requiredSignatures: parseInt(process.env.ENTERPRISE_MULTISIG_THRESHOLD || '2'),
        totalOwners: owners.length,
        thresholdMinUsd: parseFloat(process.env.MULTISIG_ENTERPRISE_THRESHOLD || '10000'),
        thresholdMaxUsd: undefined,
        isActive: true,
        owners: owners
      }
    ];

    for (const config of fallbackConfigs) {
      this.walletConfigs.set(config.address, config);
    }

    logger.warn('Using fallback wallet configurations due to database error');
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

      // Save approval request to database
      const client = await this.db.connect();
      try {
        await client.query('BEGIN');

        const insertResult = await client.query(`
          INSERT INTO multisig_approval_requests (
            payment_id, wallet_address, required_signatures, current_signatures,
            status, approval_type, amount, amount_usd, recipient_address,
            transaction_data, expires_at, created_by, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *
        `, [
          parseInt(params.paymentId),
          walletConfig.address,
          walletConfig.requiredSignatures,
          0, // current_signatures
          'pending',
          params.type,
          params.amount.toString(),
          params.amountUsd,
          params.recipientAddress || params.to || null,
          JSON.stringify(transactionData),
          expiresAt,
          params.createdBy,
          JSON.stringify(metadata)
        ]);

        const dbRecord = insertResult.rows[0];

        // Update payment table with multi-sig approval reference
        await client.query(
          'UPDATE payment SET multisig_approval_id = $1, multisig_status = $2 WHERE id = $3',
          [dbRecord.id, 'pending', parseInt(params.paymentId)]
        );

        await client.query('COMMIT');

        const approvalRequest: ApprovalRequest = {
          id: dbRecord.id.toString(),
          transactionId: dbRecord.id.toString(), // Backward compatibility
          paymentId: params.paymentId,
          walletAddress: walletConfig.address,
          amount: params.amount.toString(),
          amountUsd: params.amountUsd,
          recipientAddress: params.recipientAddress || params.to || '',
          recipient: params.recipientAddress || params.to || '', // Frontend expects this
          type: params.type,
          transactionType: params.type, // Frontend expects this
          status: 'pending',
          requiredSignatures: walletConfig.requiredSignatures,
          currentSignatures: 0,
          expiresAt,
          createdBy: params.createdBy,
          createdAt: dbRecord.created_at,
          updatedAt: dbRecord.updated_at,
          transactionData,
          signatures: [],
          metadata
        };

        logger.info('Multi-sig transaction proposed and saved to database', {
          id: approvalRequest.id,
          paymentId: params.paymentId,
          amount: params.amount,
          amountUsd: params.amountUsd,
          walletAddress: walletConfig.address,
          walletType: walletConfig.type,
          requiredSignatures: walletConfig.requiredSignatures
        });

        return approvalRequest;

      } catch (dbError) {
        await client.query('ROLLBACK');
        logger.error('Database error in proposeTransaction', {
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
          params
        });
        throw dbError;
      } finally {
        client.release();
      }

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
      const client = await this.db.connect();
      try {
        const result = await client.query(`
          SELECT mar.*, 
                 array_agg(
                   json_build_object(
                     'id', ms.id,
                     'signerAddress', ms.signer_address,
                     'signature', ms.signature,
                     'messageHash', ms.message_hash,
                     'signedAt', ms.signed_at,
                     'isValid', ms.is_valid,
                     'type', ms.signature_type,
                     'metadata', ms.metadata
                   )
                 ) FILTER (WHERE ms.id IS NOT NULL) as signatures
          FROM multisig_approval_requests mar
          LEFT JOIN multisig_signatures ms ON mar.id = ms.approval_request_id
          WHERE mar.id = $1
          GROUP BY mar.id
        `, [parseInt(transactionId)]);

        if (result.rows.length === 0) {
          logger.info('Transaction not found', { transactionId });
          return null;
        }

        const dbRecord = result.rows[0];
        const approvalRequest: ApprovalRequest = {
          id: dbRecord.id.toString(),
          transactionId: dbRecord.id.toString(),
          paymentId: dbRecord.payment_id.toString(),
          walletAddress: dbRecord.wallet_address,
          amount: dbRecord.amount,
          amountUsd: parseFloat(dbRecord.amount_usd || '0'),
          recipientAddress: dbRecord.recipient_address || '',
          recipient: dbRecord.recipient_address || '',
          type: dbRecord.approval_type,
          transactionType: dbRecord.approval_type,
          status: dbRecord.status,
          requiredSignatures: dbRecord.required_signatures,
          currentSignatures: dbRecord.current_signatures,
          expiresAt: dbRecord.expires_at,
          createdBy: dbRecord.created_by || '',
          createdAt: dbRecord.created_at,
          updatedAt: dbRecord.updated_at,
          transactionData: dbRecord.transaction_data,
          signatures: dbRecord.signatures || [],
          metadata: dbRecord.metadata
        };

        logger.info('Transaction details retrieved', { transactionId });
        return approvalRequest;

      } finally {
        client.release();
      }
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
      const client = await this.db.connect();
      try {
        // Get counts by status for last 30 days
        const statusResult = await client.query(`
          SELECT 
            status,
            COUNT(*) as count,
            SUM(CAST(amount AS DECIMAL)) as volume,
            SUM(amount_usd) as volume_usd
          FROM multisig_approval_requests 
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY status
        `);

        // Get average approval time
        const avgTimeResult = await client.query(`
          SELECT 
            AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_approval_seconds
          FROM multisig_approval_requests 
          WHERE status IN ('approved', 'rejected') 
            AND created_at >= NOW() - INTERVAL '30 days'
        `);

        logger.info('Statistics query results', {
          statusRows: statusResult.rows,
          avgTimeRows: avgTimeResult.rows
        });

        const stats: TransactionStats = {
          totalPending: 0,
          totalApproved: 0,
          totalRejected: 0,
          totalExpired: 0,
          averageApprovalTime: 0,
          totalVolume: 0,
          totalVolumeUsd: 0
        };

        // Process status counts
        statusResult.rows.forEach(row => {
          const count = parseInt(row.count);
          const volume = parseFloat(row.volume || '0');
          const volumeUsd = parseFloat(row.volume_usd || '0');

          switch (row.status) {
            case 'pending':
              stats.totalPending = count;
              break;
            case 'approved':
            case 'executed':
            case 'completed':
              stats.totalApproved += count;
              break;
            case 'rejected':
              stats.totalRejected = count;
              break;
            case 'expired':
              stats.totalExpired = count;
              break;
          }

          stats.totalVolume += volume;
          stats.totalVolumeUsd += volumeUsd;
        });

        // Set average approval time (convert from seconds to hours)
        if (avgTimeResult.rows[0]?.avg_approval_seconds) {
          stats.averageApprovalTime = parseFloat(avgTimeResult.rows[0].avg_approval_seconds) / 3600;
        }

        logger.info('Transaction statistics retrieved from database', stats);
        return stats;

      } finally {
        client.release();
      }
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
        const currency = row.currency || 'MXN';
        
        // Convert to USD for threshold check
        const amountUsd = currency === 'MXN' ? amount / 20 : amount;
        
        // Check if this amount would require multi-sig
        const walletConfig = this.determineWalletForAmount(amountUsd);
        
        if (walletConfig) {
          const escrowEndTime = new Date(row.custody_end);
          const hoursUntilRelease = Math.max(0, Math.floor((escrowEndTime.getTime() - Date.now()) / (1000 * 60 * 60)));
          
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
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      logger.info('Executing multi-sig transaction', {
        transactionId,
        executorAddress
      });

      // Get the approval request details
      const approvalResult = await client.query(
        'SELECT * FROM multisig_approval_requests WHERE id = $1',
        [parseInt(transactionId)]
      );

      if (approvalResult.rows.length === 0) {
        throw new Error('Approval request not found');
      }

      const approval = approvalResult.rows[0];
      
      // Verify the transaction is approved
      if (approval.status !== 'approved') {
        throw new Error('Transaction not approved for execution');
      }

      // Verify sufficient signatures
      if (approval.current_signatures < approval.required_signatures) {
        await client.query('ROLLBACK');
        throw new Error(`Insufficient signatures: ${approval.current_signatures}/${approval.required_signatures}`);
      }

      // Multi-sig approval complete - now execute via bridge wallet
      const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL;
      if (!rpcUrl) {
        throw new Error('ARBITRUM_SEPOLIA_RPC_URL environment variable not set');
      }

      logger.info('Executing approved multi-sig transaction via bridge wallet', {
        transactionId,
        executorAddress,
        approvalType: approval.approval_type,
        approvalStatus: approval.status,
        requiredSignatures: approval.required_signatures,
        currentSignatures: approval.current_signatures
      });

      // Get bridge wallet private key for execution
      const bridgeWalletPrivateKey = process.env.BRIDGE_WALLET_PRIVATE_KEY;
      if (!bridgeWalletPrivateKey) {
        throw new Error('Bridge wallet private key not found in environment variables');
      }

      // Initialize provider and bridge wallet signer
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const bridgeWalletSigner = new ethers.Wallet(bridgeWalletPrivateKey, provider);

      // Execute based on approval type
      let txHash: string;
      
      if (approval.approval_type === 'release') {
        // Execute escrow release via bridge wallet
        const escrowContractAddress = process.env.ESCROW_CONTRACT_ADDRESS;
        if (!escrowContractAddress) {
          throw new Error('Escrow contract address not found in environment variables');
        }

        // Get escrow ID from transaction data or metadata
        const transactionData = approval.transaction_data || {};
        const escrowId = transactionData.escrowId || approval.metadata?.escrowId;
        
        if (!escrowId) {
          throw new Error('Escrow ID not found in approval transaction data');
        }

        // Create escrow contract instance
        const escrowAbi = [
          "function release(uint256 escrowId) external"
        ];
        const escrowContract = new ethers.Contract(escrowContractAddress, escrowAbi, bridgeWalletSigner);

        // Execute escrow release
        logger.info('Executing escrow release', { escrowId, bridgeWallet: bridgeWalletSigner.address });
        const tx = await escrowContract.release(escrowId);
        txHash = tx.hash;
        
        // Wait for confirmation
        await tx.wait();
        logger.info('Escrow release transaction confirmed', { txHash, escrowId });
        
      } else {
        // For other transaction types, execute generic transaction via bridge wallet
        const transactionData = approval.transaction_data || {};
        const tx = await bridgeWalletSigner.sendTransaction({
          to: transactionData.recipient || transactionData.to,
          value: transactionData.value || '0',
          data: transactionData.data || '0x'
        });
        
        txHash = tx.hash;
        await tx.wait();
        logger.info('Generic transaction confirmed', { txHash });
      }

      // Update approval request status
      await client.query(
        'UPDATE multisig_approval_requests SET status = $1, transaction_hash = $2, executed_at = NOW(), executed_by = $3, updated_at = NOW() WHERE id = $4',
        ['executed', txHash, bridgeWalletSigner.address, parseInt(transactionId)]
      );

      // Update payment status if this was a payment-related transaction
      if (approval.payment_id) {
        const statusUpdate = approval.approval_type === 'release' ? 'completed' : 'processing';
        await client.query(
          'UPDATE payment SET status = $1, multisig_status = $2 WHERE id = $3',
          [statusUpdate, 'executed', approval.payment_id]
        );
      }

      await client.query('COMMIT');
      
      logger.info('Multi-sig transaction executed successfully', {
        transactionId,
        txHash,
        executorAddress: bridgeWalletSigner.address,
        safeAddress: approval.wallet_address
      });

      return txHash;

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to execute multi-sig transaction', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId,
        executorAddress
      });
      throw error;
    } finally {
      client.release();
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
        // Generate message hash for the signature
        const messageHash = ethers.keccak256(
          ethers.toUtf8Bytes(`Approve multi-sig transaction: ${transactionId}`)
        );
        
        await client.query(`
          INSERT INTO multisig_signatures (
            approval_request_id, signer_address, signature, message_hash,
            signed_at, is_valid, signature_type, metadata
          ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7)
        `, [
          parseInt(transactionId),
          signerAddress,
          signature,
          messageHash,
          true,
          'approval',
          JSON.stringify({ approvedBy: signerAddress })
        ]);
        
        logger.info('Multi-sig signature added', {
          approvalId: transactionId,
          signerAddress,
          messageHash,
          signatureType: 'approval',
          signedAt: new Date().toISOString()
        });
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
        
        // Log the approval completion for audit trail
        logger.info('Multi-sig approval request completed', {
          approvalId: transactionId,
          paymentId: updatedApproval.payment_id,
          walletAddress: updatedApproval.wallet_address,
          amount: updatedApproval.amount,
          amountUsd: updatedApproval.amount_usd,
          requiredSignatures: updatedApproval.required_signatures,
          currentSignatures: updatedApproval.current_signatures,
          approvalType: updatedApproval.approval_type,
          finalApprover: signerAddress,
          completedAt: new Date().toISOString()
        });
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
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Update approval request status to rejected
      await client.query(
        'UPDATE multisig_approval_requests SET status = $1, updated_at = NOW() WHERE id = $2',
        ['rejected', parseInt(transactionId)]
      );

      // Add rejection signature record
      await client.query(`
        INSERT INTO multisig_signatures (
          approval_request_id, signer_address, signature, message_hash,
          signed_at, is_valid, signature_type, metadata
        ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7)
      `, [
        parseInt(transactionId),
        signerAddress,
        'REJECTION', // Placeholder signature for rejection
        'REJECTION_HASH', // Placeholder hash
        true,
        'rejection',
        JSON.stringify({ reason, rejectedBy: signerAddress })
      ]);

      // Update payment status
      await client.query(
        'UPDATE payment SET multisig_status = $1 WHERE multisig_approval_id = $2',
        ['rejected', parseInt(transactionId)]
      );

      // Get updated approval request
      const result = await client.query(
        'SELECT * FROM multisig_approval_requests WHERE id = $1',
        [parseInt(transactionId)]
      );

      const updatedApproval = result.rows[0];
      await client.query('COMMIT');

      const approvalRequest: ApprovalRequest = {
        id: updatedApproval.id.toString(),
        transactionId: updatedApproval.id.toString(),
        paymentId: updatedApproval.payment_id.toString(),
        walletAddress: updatedApproval.wallet_address,
        amount: updatedApproval.amount,
        amountUsd: parseFloat(updatedApproval.amount_usd || '0'),
        recipientAddress: updatedApproval.recipient_address || '',
        recipient: updatedApproval.recipient_address || '',
        type: updatedApproval.approval_type,
        transactionType: updatedApproval.approval_type,
        status: 'rejected',
        requiredSignatures: updatedApproval.required_signatures,
        currentSignatures: updatedApproval.current_signatures,
        expiresAt: updatedApproval.expires_at,
        createdBy: updatedApproval.created_by || '',
        createdAt: updatedApproval.created_at,
        updatedAt: new Date(),
        signatures: [],
        metadata: { rejectedBy: signerAddress, reason }
      };

      logger.info('Multi-sig transaction rejected', {
        transactionId,
        signerAddress,
        reason
      });

      return approvalRequest;

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to reject multi-sig transaction', {
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
   * Create a Safe transaction and return the hash for signing
   * This method prepares the transaction for wallet signature collection
   */
  async createSafeTransactionForSigning(transactionId: string): Promise<{
    safeTxHash: string;
    safeAddress: string;
    transactionData: any;
    requiredSignatures: number;
    currentSignatures: number;
  }> {
    const client = await this.db.connect();
    
    try {
      // Get the approval request details
      const approvalResult = await client.query(
        'SELECT * FROM multisig_approval_requests WHERE id = $1',
        [parseInt(transactionId)]
      );

      if (approvalResult.rows.length === 0) {
        throw new Error('Approval request not found');
      }

      const approval = approvalResult.rows[0];
      
      // Mock implementation for now - would use Safe SDK in production
      const mockSafeTxHash = ethers.keccak256(
        ethers.toUtf8Bytes(`Safe transaction ${transactionId} ${Date.now()}`)
      );

      logger.info('Mock Safe transaction created for signing', {
        transactionId,
        safeTxHash: mockSafeTxHash,
        safeAddress: approval.wallet_address
      });

      return {
        safeTxHash: mockSafeTxHash,
        safeAddress: approval.wallet_address,
        transactionData: approval.transaction_data || {},
        requiredSignatures: approval.required_signatures,
        currentSignatures: approval.current_signatures
      };

    } catch (error) {
      logger.error('Failed to create Safe transaction for signing', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId
      });
      throw error;
    } finally {
      client.release();
    }
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
    const client = await this.db.connect();
    
    try {
      let query = `
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
          mar.metadata
        FROM multisig_approval_requests mar
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;
      
      if (options?.status) {
        query += ` AND mar.status = $${paramIndex}`;
        params.push(options.status);
        paramIndex++;
      }
      
      if (options?.walletAddress) {
        query += ` AND mar.wallet_address = $${paramIndex}`;
        params.push(options.walletAddress);
        paramIndex++;
      }
      
      if (options?.paymentId) {
        query += ` AND mar.payment_id = $${paramIndex}`;
        params.push(parseInt(options.paymentId));
        paramIndex++;
      }
      
      query += ` ORDER BY mar.created_at DESC`;
      
      if (options?.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
      }
      
      const result = await client.query(query, params);
      
      const approvals: ApprovalRequest[] = result.rows.map(row => ({
        id: row.id.toString(),
        transactionId: row.id.toString(),
        paymentId: row.payment_id.toString(),
        walletAddress: row.wallet_address,
        amount: row.amount,
        amountUsd: parseFloat(row.amount_usd || '0'),
        recipientAddress: row.recipient_address || '',
        recipient: row.recipient_address || '',
        type: row.approval_type,
        transactionType: row.approval_type,
        status: row.status,
        requiredSignatures: row.required_signatures,
        currentSignatures: row.current_signatures,
        expiresAt: new Date(row.expires_at),
        createdBy: row.created_by || '',
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        signatures: [],
        metadata: row.metadata || {}
      }));
      
      logger.info('Getting approval requests', {
        options,
        count: approvals.length
      });
      
      return approvals;

    } catch (error) {
      logger.error('Failed to get approval requests', {
        error: error instanceof Error ? error.message : 'Unknown error',
        options
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get complete signature history for audit trail
   */
  async getSignatureHistory(approvalId?: string): Promise<any[]> {
    try {
      const client = await this.db.connect();
      
      let query = `
        SELECT 
          ms.id,
          ms.approval_request_id,
          ms.signer_address,
          ms.signature,
          ms.message_hash,
          ms.signed_at,
          ms.is_valid,
          ms.type,
          ms.metadata,
          mar.payment_id,
          mar.amount,
          mar.amount_usd,
          mar.status as approval_status,
          mar.type as transaction_type,
          mar.created_at as approval_created_at,
          wo.name as signer_name,
          wo.email as signer_email
        FROM multisig_signatures ms
        JOIN multisig_approval_requests mar ON ms.approval_request_id = mar.id
        LEFT JOIN wallet_owners wo ON ms.signer_address = wo.address
      `;
      
      const params: any[] = [];
      
      if (approvalId) {
        query += ' WHERE mar.id = $1';
        params.push(parseInt(approvalId));
      }
      
      query += ' ORDER BY ms.signed_at DESC';
      
      const result = await client.query(query, params);
      client.release();
      
      return result.rows.map(row => ({
        id: row.id,
        approvalId: row.approval_request_id,
        paymentId: row.payment_id,
        signerAddress: row.signer_address,
        signerName: row.signer_name || 'Unknown',
        signerEmail: row.signer_email,
        signature: row.signature,
        messageHash: row.message_hash,
        signedAt: row.signed_at,
        isValid: row.is_valid,
        type: row.type,
        amount: row.amount,
        amountUsd: row.amount_usd,
        approvalStatus: row.approval_status,
        transactionType: row.transaction_type,
        approvalCreatedAt: row.approval_created_at,
        metadata: row.metadata
      }));
      
    } catch (error: any) {
      logger.error('Failed to get signature history', {
        error: error.message,
        approvalId
      });
      return [];
    }
  }

  /**
   * Get approval timeline for a specific payment
   */
  async getApprovalTimeline(paymentId: string): Promise<any[]> {
    try {
      const client = await this.db.connect();
      
      const result = await client.query(`
        SELECT 
          'approval_created' as event_type,
          mar.created_at as timestamp,
          mar.created_by as actor,
          json_build_object(
            'approvalId', mar.id,
            'amount', mar.amount,
            'amountUsd', mar.amount_usd,
            'requiredSignatures', mar.required_signatures
          ) as data
        FROM multisig_approval_requests mar
        WHERE mar.payment_id = $1
        
        UNION ALL
        
        SELECT 
          'signature_added' as event_type,
          ms.signed_at as timestamp,
          ms.signer_address as actor,
          json_build_object(
            'approvalId', ms.approval_request_id,
            'signature', ms.signature,
            'type', ms.type,
            'signerName', wo.name
          ) as data
        FROM multisig_signatures ms
        JOIN multisig_approval_requests mar ON ms.approval_request_id = mar.id
        LEFT JOIN wallet_owners wo ON ms.signer_address = wo.address
        WHERE mar.payment_id = $1
        
        ORDER BY timestamp ASC
      `, [parseInt(paymentId)]);
      
      client.release();
      return result.rows;
      
    } catch (error: any) {
      logger.error('Failed to get approval timeline', {
        error: error.message,
        paymentId
      });
      return [];
    }
  }

  /**
   * Get approved/completed multi-sig transactions for traceability
   */
  async getApprovedTransactions(limit: number = 50, offset: number = 0): Promise<ApprovalRequest[]> {
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
          e.blockchain_tx_hash as escrow_tx_hash,
          -- Count signatures for this approval
          (
            SELECT COUNT(*) 
            FROM multisig_signatures ms 
            WHERE ms.approval_request_id = mar.id 
              AND ms.is_valid = true
          ) as signature_count
        FROM multisig_approval_requests mar
        LEFT JOIN payment p ON mar.payment_id = p.id
        LEFT JOIN escrow e ON p.escrow_id = e.id
        WHERE mar.status IN ('approved', 'executed', 'completed')
        ORDER BY mar.updated_at DESC
        LIMIT $1 OFFSET $2
      `;

      logger.info('Executing getApprovedTransactions query', {
        query: query.replace(/\s+/g, ' ').trim(),
        params: [limit, offset]
      });
      
      const result = await this.db.query(query, [limit, offset]);
      
      logger.info('Query result', {
        rowCount: result.rows.length,
        firstRow: result.rows[0] ? {
          id: result.rows[0].id,
          status: result.rows[0].status,
          payment_id: result.rows[0].payment_id
        } : null
      });
      
      const approvals: ApprovalRequest[] = await Promise.all(
        result.rows.map(async (row) => {
          // Get signatures for this approval
          const signaturesResult = await this.db.query(
            `SELECT 
               ms.id,
               ms.signer_address,
               ms.signature,
               ms.message_hash,
               ms.signed_at,
               ms.is_valid,
               ms.signature_type as type,
               ms.metadata,
               mwo.owner_name as signer_name,
               mwo.owner_email as signer_email
             FROM multisig_signatures ms
             LEFT JOIN multisig_wallet_owners mwo ON ms.signer_address = mwo.owner_address
             WHERE ms.approval_request_id = $1
               AND ms.is_valid = true
             ORDER BY ms.signed_at ASC`,
            [row.id]
          );

          const signatures: Signature[] = signaturesResult.rows.map(sigRow => ({
            id: sigRow.id.toString(),
            signerAddress: sigRow.signer_address,
            signature: sigRow.signature,
            messageHash: sigRow.message_hash,
            signedAt: new Date(sigRow.signed_at),
            isValid: sigRow.is_valid,
            type: sigRow.type as 'approval' | 'rejection',
            metadata: {
              ...sigRow.metadata,
              signerName: sigRow.signer_name,
              signerEmail: sigRow.signer_email
            }
          }));

          return {
            id: row.id.toString(),
            paymentId: row.payment_id.toString(),
            transactionId: row.payment_id.toString(),
            transactionHash: row.transaction_hash,
            walletAddress: row.wallet_address,
            amount: row.amount.toString(),
            amountUsd: row.amount_usd ? parseFloat(row.amount_usd) : parseFloat(row.amount) / 20,
            recipientAddress: row.recipient_address,
            recipient: row.recipient_address,
            type: row.approval_type || 'payment',
            transactionType: row.payment_type || row.approval_type || 'payment',
            status: row.status as 'pending' | 'approved' | 'rejected' | 'expired',
            requiredSignatures: row.required_signatures,
            currentSignatures: row.current_signatures,
            expiresAt: new Date(row.expires_at),
            createdBy: row.created_by || row.payer_email,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            transactionData: row.transaction_data,
            signatures: signatures,
            metadata: {
              ...row.metadata,
              executedAt: row.status === 'approved' || row.status === 'executed' ? new Date(row.updated_at) : null,
              signatureCount: signatures.length,
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
          };
        })
      );

      logger.info('Approved transactions retrieved for traceability', {
        count: approvals.length,
        limit,
        offset
      });

      return approvals;
    } catch (error) {
      logger.error('Failed to get approved transactions', {
        error: error instanceof Error ? error.message : 'Unknown error',
        limit,
        offset
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
    try {
      // Test database connection
      const client = await this.db.connect();
      await client.query('SELECT 1');
      client.release();
      
      // Test provider connection
      await this.provider.getBlockNumber();
      
      return {
        status: 'healthy',
        database: true,
        provider: true,
        walletConfigs: this.walletConfigs.size
      };
    } catch (error: any) {
      logger.error('Health check failed', { error: error.message });
      
      return {
        status: 'unhealthy',
        database: false,
        provider: false,
        walletConfigs: this.walletConfigs.size,
        lastError: error.message
      };
    }
  }

  /**
   * Execute a raw SQL query (for dashboard statistics)
   */
  async query(sql: string, params?: any[]): Promise<any> {
    const client = await this.db.connect();
    try {
      const result = await client.query(sql, params);
      return result;
    } finally {
      client.release();
    }
  }
}

// Export singleton instance
export const multiSigApprovalService = new MultiSigApprovalService();
