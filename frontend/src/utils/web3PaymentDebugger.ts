/**
 * Web3 Payment Debugger Utility
 * Comprehensive debugging for Portal wallet and MXNB payments
 */

import { ethers } from 'ethers';
import { getPortalInstance } from './portalInstance';
import { authFetch } from './authFetch';
import ERC20_ABI from '@/abis/ERC20.json';

const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW3_CONTRACT_ADDRESS;
const MXNB_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MXNB_CONTRACT_ADDRESS;
const ARB_MAINNET_RPC = process.env.NEXT_PUBLIC_ARBITRUM_MAINNET_RPC_URL;

export interface DebugResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
  timestamp: string;
}

export class Web3PaymentDebugger {
  private results: DebugResult[] = [];
  
  private log(step: string, status: 'success' | 'error' | 'warning', message: string, data?: any) {
    const result: DebugResult = {
      step,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    
    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '⚠️';
    console.log(`${emoji} [${step}] ${message}`, data || '');
    
    return result;
  }

  async debugFullFlow(userEmail: string): Promise<DebugResult[]> {
    this.results = [];
    
    try {
      // Step 1: Environment Variables Check
      await this.checkEnvironmentVariables();
      
      // Step 2: User Authentication & Profile
      await this.checkUserProfile(userEmail);
      
      // Step 3: Portal SDK Initialization
      await this.checkPortalSDK();
      
      // Step 4: Portal Wallet Status
      await this.checkPortalWallet();
      
      // Step 5: MXNB Balance Check
      await this.checkMXNBBalance();
      
      // Step 6: Contract Interactions Test
      await this.testContractInteractions();
      
      // Step 7: Network Connectivity
      await this.checkNetworkConnectivity();
      
    } catch (error: any) {
      this.log('debug_flow', 'error', `Debug flow failed: ${error.message}`, error);
    }
    
    return this.results;
  }

  private async checkEnvironmentVariables() {
    const envVars = {
      NEXT_PUBLIC_PORTAL_API_KEY: process.env.NEXT_PUBLIC_PORTAL_API_KEY,
      NEXT_PUBLIC_ESCROW3_CONTRACT_ADDRESS: ESCROW_CONTRACT_ADDRESS,
      NEXT_PUBLIC_MXNB_CONTRACT_ADDRESS: MXNB_CONTRACT_ADDRESS,
      NEXT_PUBLIC_ARBITRUM_MAINNET_RPC_URL: ARB_MAINNET_RPC,
      NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID
    };

    for (const [key, value] of Object.entries(envVars)) {
      if (!value) {
        this.log('env_check', 'error', `Missing environment variable: ${key}`);
      } else {
        this.log('env_check', 'success', `${key}: ${key.includes('API_KEY') ? '***' : value}`);
      }
    }
  }

  private async checkUserProfile(userEmail: string) {
    try {
      const response = await authFetch('/api/users/me');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const user = data.user;
      
      if (!user) {
        this.log('user_profile', 'error', 'No user data returned from API');
        return;
      }

      this.log('user_profile', 'success', `User authenticated: ${user.email}`, {
        id: user.id,
        email: user.email,
        wallet_address: user.wallet_address,
        verified: user.verified
      });

      if (user.email !== userEmail) {
        this.log('user_profile', 'warning', `Email mismatch: expected ${userEmail}, got ${user.email}`);
      }

      if (!user.wallet_address) {
        this.log('user_profile', 'warning', 'User has no wallet address configured');
      }

    } catch (error: any) {
      this.log('user_profile', 'error', `User profile check failed: ${error.message}`, error);
    }
  }

  private async checkPortalSDK() {
    try {
      if (typeof window === 'undefined') {
        this.log('portal_sdk', 'error', 'Portal SDK only works in browser environment');
        return;
      }

      const portal = await getPortalInstance();
      if (!portal) {
        this.log('portal_sdk', 'error', 'Failed to initialize Portal SDK');
        return;
      }

      this.log('portal_sdk', 'success', 'Portal SDK initialized successfully', {
        autoApprove: portal.autoApprove,
        chainId: process.env.NEXT_PUBLIC_CHAIN_ID
      });

    } catch (error: any) {
      this.log('portal_sdk', 'error', `Portal SDK initialization failed: ${error.message}`, error);
    }
  }

  private async checkPortalWallet() {
    try {
      const portal = await getPortalInstance();
      if (!portal) {
        this.log('portal_wallet', 'error', 'Portal SDK not available');
        return;
      }

      await portal.onReady(() => {});
      
      const exists = await portal.doesWalletExist();
      this.log('portal_wallet', exists ? 'success' : 'warning', 
        `Portal wallet ${exists ? 'exists' : 'does not exist'}`);

      if (exists) {
        const address = await portal.getEip155Address();
        this.log('portal_wallet', 'success', `Portal wallet address: ${address}`, { address });
      } else {
        this.log('portal_wallet', 'warning', 'Portal wallet needs to be created');
      }

    } catch (error: any) {
      this.log('portal_wallet', 'error', `Portal wallet check failed: ${error.message}`, error);
    }
  }

  private async checkMXNBBalance() {
    try {
      const portal = await getPortalInstance();
      if (!portal) {
        this.log('mxnb_balance', 'error', 'Portal SDK not available');
        return;
      }

      const exists = await portal.doesWalletExist();
      if (!exists) {
        this.log('mxnb_balance', 'warning', 'Cannot check balance - no wallet exists');
        return;
      }

      const address = await portal.getEip155Address();
      const provider = new ethers.JsonRpcProvider(ARB_MAINNET_RPC);
      const mxnbContract = new ethers.Contract(MXNB_CONTRACT_ADDRESS!, ERC20_ABI, provider);
      
      const balance = await mxnbContract.balanceOf(address);
      const decimals = await mxnbContract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      this.log('mxnb_balance', 'success', `MXNB Balance: ${formattedBalance}`, {
        address,
        balance: balance.toString(),
        decimals,
        formatted: formattedBalance
      });

      // Check ETH balance for gas
      const ethBalance = await provider.getBalance(address);
      const formattedEthBalance = ethers.formatEther(ethBalance);
      
      this.log('mxnb_balance', 'success', `ETH Balance: ${formattedEthBalance}`, {
        ethBalance: ethBalance.toString(),
        formatted: formattedEthBalance
      });

      if (parseFloat(formattedEthBalance) < 0.001) {
        this.log('mxnb_balance', 'warning', 'Low ETH balance - may not have enough gas for transactions');
      }

    } catch (error: any) {
      this.log('mxnb_balance', 'error', `Balance check failed: ${error.message}`, error);
    }
  }

  private async testContractInteractions() {
    try {
      const provider = new ethers.JsonRpcProvider(ARB_MAINNET_RPC);
      
      // Test MXNB contract
      const mxnbContract = new ethers.Contract(MXNB_CONTRACT_ADDRESS!, ERC20_ABI, provider);
      const name = await mxnbContract.name();
      const symbol = await mxnbContract.symbol();
      const decimals = await mxnbContract.decimals();
      
      this.log('contract_test', 'success', `MXNB Contract accessible`, {
        address: MXNB_CONTRACT_ADDRESS,
        name,
        symbol,
        decimals
      });

      // Test Escrow contract (basic call)
      const escrowCode = await provider.getCode(ESCROW_CONTRACT_ADDRESS!);
      if (escrowCode === '0x') {
        this.log('contract_test', 'error', 'Escrow contract not deployed at specified address');
      } else {
        this.log('contract_test', 'success', 'Escrow contract found at specified address', {
          address: ESCROW_CONTRACT_ADDRESS,
          codeLength: escrowCode.length
        });
      }

    } catch (error: any) {
      this.log('contract_test', 'error', `Contract interaction test failed: ${error.message}`, error);
    }
  }

  private async checkNetworkConnectivity() {
    try {
      const provider = new ethers.JsonRpcProvider(ARB_MAINNET_RPC);
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      
      this.log('network_check', 'success', `Connected to Arbitrum One`, {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber
      });

    } catch (error: any) {
      this.log('network_check', 'error', `Network connectivity failed: ${error.message}`, error);
    }
  }

  getResults(): DebugResult[] {
    return this.results;
  }

  getSummary(): { total: number; success: number; errors: number; warnings: number } {
    const total = this.results.length;
    const success = this.results.filter(r => r.status === 'success').length;
    const errors = this.results.filter(r => r.status === 'error').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    
    return { total, success, errors, warnings };
  }
}

export const debugInstance = new Web3PaymentDebugger();
