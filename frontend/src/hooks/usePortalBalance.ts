import { useState, useCallback } from 'react';
import { getPortalInstance } from '@/utils/portalInstance';

// Enhanced interfaces based on Portal hackathon kit patterns
interface TokenBalance {
  balance: string;
  decimals: number;
  name: string;
  symbol: string;
  rawBalance: string;
  metadata: {
    tokenAddress: string;
    verifiedContract: boolean;
  };
}

interface Assets {
  nativeBalance?: {
    name: string;
    symbol: string;
    balance: string;
  };
  tokenBalances?: TokenBalance[];
}

interface UsePortalBalanceReturn {
  balance: string | null;
  assets: Assets | null;
  isLoading: boolean;
  error: string | null;
  checkBalance: () => Promise<void>;
  sendTokens: (params: {
    to: string;
    tokenAddress: string;
    amount: string;
  }) => Promise<string | undefined>;
}

export function usePortalBalance(): UsePortalBalanceReturn {
  const [balance, setBalance] = useState<string | null>(null);
  const [assets, setAssets] = useState<Assets | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkBalance = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`[Portal Balance] Starting balance check... (attempt ${retryCount + 1})`);

      // Longer timeout for initial loads, shorter for retries
      const timeoutMs = retryCount === 0 ? 20000 : 10000; // 20s first try, 10s retries
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Balance check timed out after ${timeoutMs/1000} seconds`)), timeoutMs);
      });

      const balanceCheckPromise = (async () => {
        console.log('[Portal Balance] Getting Portal instance...');
        const portal = await getPortalInstance();
        if (!portal) {
          throw new Error('Portal instance not available');
        }
        console.log('[Portal Balance] Portal instance obtained');

        // More robust Portal readiness check with longer wait
        console.log('[Portal Balance] Waiting for Portal ready state...');
        await new Promise((resolve) => {
          portal.onReady(() => {
            console.log('[Portal Balance] Portal ready callback triggered');
            resolve(true);
          });
          // Fallback: assume ready after 3 seconds if callback doesn't fire
          setTimeout(() => {
            console.log('[Portal Balance] Portal ready fallback triggered');
            resolve(true);
          }, 3000);
        });
        
        // Additional small delay to ensure Portal is fully initialized
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('[Portal Balance] Portal initialization complete');

        // Check if wallet exists
        const walletExists = await portal.doesWalletExist();
        console.log('[Portal Balance] Wallet exists:', walletExists);
        if (!walletExists) {
          throw new Error('Portal wallet not found. Please create a wallet first.');
        }

        console.log('[Portal Balance] Checking MXNB balance...');
        
        // Simple balance check using Portal SDK
        const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || 'eip155:421614';
        console.log('[Portal Balance] Using chain ID:', chainId);
        
        const assets = await portal.getAssets(chainId);
        console.log('[Portal Balance] Assets response:', assets);

        // Find MXNB token balance
        const mxnbContractAddress = process.env.NEXT_PUBLIC_MXNB_CONTRACT_ADDRESS?.toLowerCase();
        console.log('[Portal Balance] Looking for MXNB contract:', mxnbContractAddress);
        
        if (!mxnbContractAddress) {
          throw new Error('MXNB contract address not configured');
        }

        const mxnbToken = assets.tokenBalances?.find(
          (token: any) => {
            console.log('[Portal Balance] Checking token:', token.metadata?.tokenAddress?.toLowerCase());
            return token.metadata?.tokenAddress?.toLowerCase() === mxnbContractAddress;
          }
        );

        if (mxnbToken && mxnbToken.rawBalance) {
          // Convert balance to human-readable format
          const decimals = mxnbToken.decimals || 18;
          const rawBalance = BigInt(mxnbToken.rawBalance);
          const divisor = BigInt(10 ** decimals);
          const readableBalance = (Number(rawBalance) / Number(divisor)).toFixed(2);
          
          setBalance(readableBalance);
          console.log('[Portal Balance] MXNB balance found:', readableBalance);
        } else {
          setBalance('0.00');
          console.log('[Portal Balance] MXNB token not found, setting balance to 0');
          console.log('[Portal Balance] Available tokens:', assets.tokenBalances?.map((t: any) => t.metadata?.tokenAddress));
        }
      })();

      // Race between balance check and timeout
      await Promise.race([balanceCheckPromise, timeoutPromise]);

    } catch (err) {
      console.error(`[Portal Balance] Error (attempt ${retryCount + 1}):`, err);
      
      // Auto-retry once if this is the first attempt and it's a timeout
      if (retryCount === 0 && (err instanceof Error && err.message.includes('timed out'))) {
        console.log('[Portal Balance] Auto-retrying after timeout...');
        setError('Primer intento falló, reintentando...');
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        return checkBalance(retryCount + 1);
      }
      
      setError(err instanceof Error ? err.message : 'Failed to check balance');
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendTokens = useCallback(async ({
    to,
    tokenAddress,
    amount,
  }: {
    to: string;
    tokenAddress: string;
    amount: string;
  }) => {
    // Simple implementation - can enhance later if needed
    throw new Error('Send tokens functionality not implemented yet');
  }, []);

  return {
    balance,
    assets,
    isLoading,
    error,
    checkBalance,
    sendTokens
  };
}
