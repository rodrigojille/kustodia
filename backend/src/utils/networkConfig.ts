// Network Configuration Utility for Mainnet/Testnet Switching
// Provides centralized configuration for blockchain network parameters

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface NetworkConfig {
  rpcUrl: string;
  escrowV2Address: string;
  nftCompactAddress: string;
  mxnbTokenAddress: string;
  privateKey: string;
  bridgeWallet: string;
  platformWallet: string;
  junoWallet: string;
  explorerUrl: string;
  explorerApiKey: string;
  chainId: number;
  networkName: string;
  junoEnv: string;
  junoApiKey: string;
  // Multi-sig configuration
  highValueMultisigAddress: string;
  enterpriseMultisigAddress: string;
  multisigAdmin1: string;
}

export class NetworkConfigManager {
  private static instance: NetworkConfigManager;
  private currentNetwork: 'testnet' | 'mainnet';

  private constructor() {
    // Initialize with environment variable or default to testnet
    this.currentNetwork = (process.env.BLOCKCHAIN_NETWORK as 'testnet' | 'mainnet') || 'testnet';
  }

  public static getInstance(): NetworkConfigManager {
    if (!NetworkConfigManager.instance) {
      NetworkConfigManager.instance = new NetworkConfigManager();
    }
    return NetworkConfigManager.instance;
  }

  public getCurrentNetwork(): 'testnet' | 'mainnet' {
    return this.currentNetwork;
  }

  public setNetwork(network: 'testnet' | 'mainnet'): void {
    this.currentNetwork = network;
    console.log(`🔄 Network switched to: ${network.toUpperCase()}`);
  }

  public getConfig(): NetworkConfig {
    if (this.currentNetwork === 'mainnet') {
      return this.getMainnetConfig();
    } else {
      return this.getTestnetConfig();
    }
  }

  private getTestnetConfig(): NetworkConfig {
    return {
      rpcUrl: process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
      escrowV2Address: process.env.KUSTODIA_ESCROW_V2_ADDRESS || '',
      nftCompactAddress: process.env.UNIVERSAL_ASSET_CONTRACT_ADDRESS || '',
      mxnbTokenAddress: process.env.MXNB_CONTRACT_ADDRESS || '',
      privateKey: process.env.KUSTODIA_PRIVATE_KEY || '',
      bridgeWallet: process.env.ESCROW_BRIDGE_WALLET || '',
      platformWallet: process.env.PLATFORM_WALLET || '',
      junoWallet: process.env.JUNO_WALLET || '',
      explorerUrl: 'https://sepolia.arbiscan.io',
      explorerApiKey: process.env.ARBISCAN_API_KEY || '',
      chainId: 421614,
      networkName: 'Arbitrum Sepolia Testnet',
      junoEnv: process.env.JUNO_ENV || 'stage',
      junoApiKey: process.env.JUNO_STAGE_API_KEY || '', // 🚨 FIX: Use JUNO_STAGE_API_KEY to match JUNO_STAGE_API_SECRET
      // Multi-sig configuration (testnet)
      highValueMultisigAddress: process.env.HIGH_VALUE_MULTISIG_ADDRESS || '',
      enterpriseMultisigAddress: process.env.ENTERPRISE_MULTISIG_ADDRESS || '',
      multisigAdmin1: process.env.MULTISIG_ADMIN_1 || ''
    };
  }

  private getMainnetConfig(): NetworkConfig {
    return {
      rpcUrl: process.env.ARBITRUM_MAINNET_RPC_URL || 'https://arb1.arbitrum.io/rpc',
      escrowV2Address: process.env.ESCROW_V2_PAUSABLE_ADDRESS || '',
      nftCompactAddress: process.env.NFT_COMPACT_ADDRESS || '',
      mxnbTokenAddress: process.env.MXNB_MAINNET_ADDRESS || '',
      privateKey: process.env.MAINNET_PRIVATE_KEY || '',
      bridgeWallet: process.env.BRIDGE_WALLET_MAIN || '',
      platformWallet: process.env.PLATFORM_WALLET_MAIN || '',
      junoWallet: process.env.JUNO_MAIN_WALLET || '',
      explorerUrl: process.env.ARBISCAN_URL || 'https://arbiscan.io',
      explorerApiKey: process.env.ARBISCAN_API_KEY || '',
      chainId: 42161,
      networkName: 'Arbitrum One Mainnet',
      junoEnv: process.env.JUNO_PROD_ENV || 'production',
      junoApiKey: process.env.JUNO_PROD_API_KEY || '',
      // Multi-sig configuration (mainnet - using same addresses per user preference)
      highValueMultisigAddress: process.env.HIGH_VALUE_MULTISIG_ADDRESS || '',
      enterpriseMultisigAddress: process.env.ENTERPRISE_MULTISIG_ADDRESS || '',
      multisigAdmin1: process.env.BRIDGE_WALLET_MAIN || process.env.MULTISIG_ADMIN_1 || ''
    };
  }

  // Utility methods for common operations
  public isMainnet(): boolean {
    return this.currentNetwork === 'mainnet';
  }

  public isTestnet(): boolean {
    return this.currentNetwork === 'testnet';
  }

  public getNetworkDisplay(): string {
    return this.currentNetwork === 'mainnet' ? '🔴 MAINNET' : '🟡 TESTNET';
  }

  // Validation method to ensure all required config is present
  public validateConfig(): { valid: boolean; errors: string[] } {
    const config = this.getConfig();
    const errors: string[] = [];

    if (!config.rpcUrl) errors.push('RPC URL is missing');
    if (!config.escrowV2Address) errors.push('Escrow V2 contract address is missing');
    if (!config.nftCompactAddress) errors.push('NFT Compact contract address is missing');
    if (!config.mxnbTokenAddress) errors.push('MXNB token address is missing');
    if (!config.privateKey) errors.push('Private key is missing');
    if (!config.bridgeWallet) errors.push('Bridge wallet address is missing');
    if (!config.platformWallet) errors.push('Platform wallet address is missing');

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Log current configuration (without sensitive data)
  public logCurrentConfig(): void {
    const config = this.getConfig();
    console.log(`\n📊 Current Network Configuration:`);
    console.log(`   Network: ${this.getNetworkDisplay()}`);
    console.log(`   Chain ID: ${config.chainId}`);
    console.log(`   RPC URL: ${config.rpcUrl}`);
    console.log(`   Escrow V2: ${config.escrowV2Address}`);
    console.log(`   NFT Compact: ${config.nftCompactAddress}`);
    console.log(`   MXNB Token: ${config.mxnbTokenAddress}`);
    console.log(`   Bridge Wallet: ${config.bridgeWallet}`);
    console.log(`   Platform Wallet: ${config.platformWallet}`);
    console.log(`   Juno Environment: ${config.junoEnv}`);
    console.log(`   Explorer: ${config.explorerUrl}\n`);
  }
}

// Export singleton instance for easy access
export const networkConfig = NetworkConfigManager.getInstance();

// Export utility functions
export function getCurrentNetworkConfig(): NetworkConfig {
  return networkConfig.getConfig();
}

export function isMainnetActive(): boolean {
  return networkConfig.isMainnet();
}

export function isTestnetActive(): boolean {
  return networkConfig.isTestnet();
}

export function switchToMainnet(): void {
  networkConfig.setNetwork('mainnet');
}

export function switchToTestnet(): void {
  networkConfig.setNetwork('testnet');
}
