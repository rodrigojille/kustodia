import { useState, useEffect, useCallback } from 'react';
import browserWalletService, { WalletInfo } from '../services/browserWalletService';

export interface UseBrowserWalletReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  walletInfo: WalletInfo | null;
  availableWallets: string[];
  error: string | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  signTypedData: (domain: any, types: any, value: any) => Promise<string>;
  switchNetwork: (chainId: number) => Promise<void>;
  clearError: () => void;
}

export const useBrowserWallet = (): UseBrowserWalletReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize available wallets
  useEffect(() => {
    const wallets = browserWalletService.getAvailableWallets();
    setAvailableWallets(wallets);
  }, []);

  // Connect to wallet
  const connect = useCallback(async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      const info = await browserWalletService.connect();
      setWalletInfo(info);
      setIsConnected(true);
      console.log('Browser wallet connected:', info);
    } catch (err: any) {
      setError(err.message);
      console.error('Browser wallet connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  // Disconnect from wallet
  const disconnect = useCallback(async () => {
    try {
      await browserWalletService.disconnect();
      setWalletInfo(null);
      setIsConnected(false);
      setError(null);
      console.log('Browser wallet disconnected');
    } catch (err: any) {
      setError(err.message);
      console.error('Browser wallet disconnect failed:', err);
    }
  }, []);

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setError(null);
      const signature = await browserWalletService.signMessage(message);
      return signature;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [isConnected]);

  // Sign typed data
  const signTypedData = useCallback(async (domain: any, types: any, value: any): Promise<string> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setError(null);
      const signature = await browserWalletService.signTypedData(domain, types, value);
      return signature;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [isConnected]);

  // Switch network
  const switchNetwork = useCallback(async (chainId: number): Promise<void> => {
    try {
      setError(null);
      await browserWalletService.switchNetwork(chainId);
      
      // Update wallet info with new chain
      const currentInfo = browserWalletService.getConnectionInfo();
      if (currentInfo) {
        setWalletInfo(currentInfo);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        setIsConnected(false);
        setWalletInfo(null);
      } else {
        // Account changed - reconnect to get updated info
        const currentInfo = browserWalletService.getConnectionInfo();
        if (currentInfo) {
          setWalletInfo({ ...currentInfo, address: accounts[0] });
        }
      }
    };

    const handleChainChanged = (chainId: string) => {
      const newChainId = parseInt(chainId, 16);
      const currentInfo = browserWalletService.getConnectionInfo();
      if (currentInfo) {
        setWalletInfo({ ...currentInfo, chainId: newChainId });
      }
    };

    browserWalletService.onAccountsChanged(handleAccountsChanged);
    browserWalletService.onChainChanged(handleChainChanged);

    return () => {
      browserWalletService.removeAllListeners();
    };
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    const existingConnection = browserWalletService.getConnectionInfo();
    if (existingConnection) {
      setWalletInfo(existingConnection);
      setIsConnected(true);
    }
  }, []);

  return {
    isConnected,
    isConnecting,
    walletInfo,
    availableWallets,
    error,
    connect,
    disconnect,
    signMessage,
    signTypedData,
    switchNetwork,
    clearError,
  };
};
