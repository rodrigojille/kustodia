import { ethers } from 'ethers';
import axios from 'axios';
import { getCurrentNetworkConfig } from '../utils/networkConfig';

// Transaction types that can be routed
export type TransactionType = 
  | 'escrow_creation'
  | 'escrow_funding' 
  | 'escrow_release'
  | 'bridge_withdrawal'
  | 'user_transfer'
  | 'juno_redemption';

// Transaction routing result
export interface TransactionRoute {
  type: 'single_sig' | 'multi_sig';
  wallet: string;
  threshold?: number;
  reason: string;
  requiresApproval: boolean;
}

// Transaction request input
export interface TransactionRequest {
  amount: number;           // Amount in MXN
  type: TransactionType;
  paymentId?: number;
  fromAddress?: string;
  toAddress?: string;
  description?: string;
}

// Multi-sig wallet configurations
interface MultiSigWallet {
  address: string;
  threshold: number;
  owners: string[];
  description: string;
}

/**
 * TransactionRouterService
 * 
 * Determines whether transactions should use single-sig (bridge wallet) 
 * or multi-sig wallets based on transaction value and type.
 * 
 * This service maintains backward compatibility with existing automation
 * while adding security layers for high-value transactions.
 */
export class TransactionRouterService {
  
  // Transaction thresholds in USD (configurable via environment)
  private readonly THRESHOLDS = {
    STANDARD_LIMIT: 100,      // Below this: always single-sig
    HIGH_VALUE_LIMIT: parseInt(process.env.MULTISIG_HIGH_VALUE_THRESHOLD || '1000'),
    ENTERPRISE_LIMIT: parseInt(process.env.MULTISIG_ENTERPRISE_THRESHOLD || '10000'),
    DAILY_LIMIT: parseInt(process.env.MULTISIG_DAILY_LIMIT || '50000'),
  };

  // Multi-sig wallet configurations (populated from environment variables)
  private readonly WALLET_CONFIG = {
    // Single-sig bridge wallet (current system)
    BRIDGE_WALLET: {
      address: getCurrentNetworkConfig().bridgeWallet,
      type: 'single-sig' as const,
      threshold: 1,
    },
    
    // High-value multi-sig wallet (2-of-3)
    HIGH_VALUE_MULTISIG: {
      address: process.env.HIGH_VALUE_MULTISIG_ADDRESS || '',
      type: 'multi-sig' as const,
      threshold: parseInt(process.env.HIGH_VALUE_MULTISIG_THRESHOLD || '2'),
      totalSigners: 3,
      owners: process.env.HIGH_VALUE_MULTISIG_OWNERS?.split(',').map(addr => addr.trim()) || [],
    },
    
    // Enterprise multi-sig wallet (3-of-5)
    ENTERPRISE_MULTISIG: {
      address: process.env.ENTERPRISE_MULTISIG_ADDRESS || '',
      type: 'multi-sig' as const,
      threshold: parseInt(process.env.ENTERPRISE_MULTISIG_THRESHOLD || '3'),
      totalSigners: 5,
      owners: process.env.ENTERPRISE_MULTISIG_OWNERS?.split(',').map(addr => addr.trim()) || [],
    },
  };

  constructor() {
    console.log('[TransactionRouter] Initializing with thresholds:', this.THRESHOLDS);
    console.log('[TransactionRouter] Bridge wallet:', this.WALLET_CONFIG.BRIDGE_WALLET.address);
    console.log('[TransactionRouter] Multi-sig wallets configured:', {
      highValue: this.WALLET_CONFIG.HIGH_VALUE_MULTISIG.address || 'not configured',
      enterprise: this.WALLET_CONFIG.ENTERPRISE_MULTISIG.address || 'not configured'
    });
  }

  /**
   * Routes a transaction to the appropriate wallet based on value and type
   */
  async routeTransaction(request: TransactionRequest): Promise<TransactionRoute> {
    try {
      console.log(`[TransactionRouter] Routing transaction:`, {
        amount: request.amount,
        type: request.type,
        paymentId: request.paymentId
      });

      // Convert MXN to USD for threshold comparison
      const usdValue = await this.convertMXNToUSD(request.amount);
      console.log(`[TransactionRouter] USD value: $${usdValue.toFixed(2)}`);

      // Determine routing based on USD value
      const route = this.determineRoute(usdValue, request.type);
      
      console.log(`[TransactionRouter] Route determined:`, route);
      return route;

    } catch (error) {
      console.error('[TransactionRouter] Error routing transaction:', error);
      
      // Fallback to bridge wallet on error to maintain system functionality
      return {
        type: 'single_sig',
        wallet: this.WALLET_CONFIG.BRIDGE_WALLET.address,
        reason: 'Fallback due to routing error',
        requiresApproval: false
      };
    }
  }

  /**
   * Determines the appropriate route based on USD value and transaction type
   */
  private determineRoute(usdValue: number, txType: TransactionType): TransactionRoute {
    
    // Always use single-sig for standard and low-value transactions
    if (usdValue < this.THRESHOLDS.HIGH_VALUE_LIMIT) {
      return {
        type: 'single_sig',
        wallet: this.WALLET_CONFIG.BRIDGE_WALLET.address,
        reason: `Low-value transaction ($${usdValue.toFixed(2)} < $${this.THRESHOLDS.HIGH_VALUE_LIMIT})`,
        requiresApproval: false
      };
    }

    // High-value transactions: 2-of-3 multi-sig
    if (usdValue < this.THRESHOLDS.ENTERPRISE_LIMIT) {
      const highValueWallet = this.WALLET_CONFIG.HIGH_VALUE_MULTISIG;
      
      // Fallback to bridge wallet if multi-sig not configured
      if (!highValueWallet.address) {
        console.warn('[TransactionRouter] High-value multi-sig not configured, using bridge wallet');
        return {
          type: 'single_sig',
          wallet: this.WALLET_CONFIG.BRIDGE_WALLET.address,
          reason: 'Multi-sig wallet not configured, using fallback',
          requiresApproval: false
        };
      }

      return {
        type: 'multi_sig',
        wallet: highValueWallet.address,
        threshold: highValueWallet.threshold,
        reason: `High-value transaction ($${usdValue.toFixed(2)}) requires ${highValueWallet.threshold}-of-${highValueWallet.owners.length || 3} approval`,
        requiresApproval: true
      };
    }

    // Enterprise transactions: 3-of-5 multi-sig
    const enterpriseWallet = this.WALLET_CONFIG.ENTERPRISE_MULTISIG;
    
    // Fallback to bridge wallet if multi-sig not configured
    if (!enterpriseWallet.address) {
      console.warn('[TransactionRouter] Enterprise multi-sig not configured, using bridge wallet');
      return {
        type: 'single_sig',
        wallet: this.WALLET_CONFIG.BRIDGE_WALLET.address,
        reason: 'Enterprise multi-sig wallet not configured, using fallback',
        requiresApproval: false
      };
    }

    return {
      type: 'multi_sig',
      wallet: enterpriseWallet.address,
      threshold: enterpriseWallet.threshold,
      reason: `Enterprise transaction ($${usdValue.toFixed(2)}) requires ${enterpriseWallet.threshold}-of-${enterpriseWallet.owners.length || 5} approval`,
      requiresApproval: true
    };
  }

  /**
   * Converts MXN to USD using a reliable exchange rate API
   * Falls back to a conservative estimate if API fails
   */
  private async convertMXNToUSD(mxnAmount: number): Promise<number> {
    try {
      // Try to get real-time exchange rate
      const response = await axios.get(
        'https://api.exchangerate-api.com/v4/latest/USD',
        { timeout: 5000 }
      );
      
      const mxnToUsdRate = 1 / response.data.rates.MXN;
      const usdValue = mxnAmount * mxnToUsdRate;
      
      console.log(`[TransactionRouter] Exchange rate: 1 USD = ${response.data.rates.MXN} MXN`);
      return usdValue;
      
    } catch (error) {
      console.warn('[TransactionRouter] Failed to get exchange rate, using fallback estimate:', error);
      
      // Fallback: Conservative estimate (1 USD = 18 MXN)
      // This ensures we err on the side of caution for security
      const fallbackRate = 1 / 18;
      return mxnAmount * fallbackRate;
    }
  }

  /**
   * Checks if multi-sig wallets are properly configured
   */
  public validateConfiguration(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!this.WALLET_CONFIG.BRIDGE_WALLET.address) {
      issues.push('BRIDGE_WALLET_ADDRESS not configured');
    }

    if (!this.WALLET_CONFIG.HIGH_VALUE_MULTISIG.address) {
      issues.push('HIGH_VALUE_MULTISIG_ADDRESS not configured');
    }

    if (!this.WALLET_CONFIG.ENTERPRISE_MULTISIG.address) {
      issues.push('ENTERPRISE_MULTISIG_ADDRESS not configured');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Gets current configuration for debugging/monitoring
   */
  public getConfiguration() {
    return {
      thresholds: this.THRESHOLDS,
      walletConfig: this.WALLET_CONFIG,
      validation: this.validateConfiguration()
    };
  }

  /**
   * Simulates routing for testing purposes
   */
  public async simulateRouting(amounts: number[]): Promise<Array<{amount: number, usd: number, route: TransactionRoute}>> {
    const results = [];
    
    for (const amount of amounts) {
      const usd = await this.convertMXNToUSD(amount);
      const route = await this.routeTransaction({
        amount,
        type: 'escrow_creation'
      });
      
      results.push({ amount, usd, route });
    }
    
    return results;
  }
}

// Export singleton instance
export const transactionRouter = new TransactionRouterService();
