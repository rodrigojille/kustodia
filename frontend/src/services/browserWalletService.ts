import { ethers } from 'ethers';

export interface WalletInfo {
  address: string;
  chainId: number;
  provider: ethers.BrowserProvider;
}

export interface SignatureRequest {
  id: string;
  message: string;
  data?: any;
}

class BrowserWalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private connectedAccount: string | null = null;
  private chainId: number | null = null;

  // Check if MetaMask or other wallet is available
  isWalletAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum;
  }

  // Get available wallet providers
  getAvailableWallets(): string[] {
    if (typeof window === 'undefined') return [];
    
    const wallets: string[] = [];
    
    // Check for window.ethereum (injected by most wallets)
    if (window.ethereum) {
      // Handle multiple providers (some wallets inject an array)
      const ethereum = window.ethereum as any;
      const providers = Array.isArray(ethereum.providers) 
        ? ethereum.providers 
        : [window.ethereum];
      
      const detectedWallets = new Set<string>();
      
      providers.forEach((provider: any) => {
        if (provider.isMetaMask) detectedWallets.add('MetaMask');
        if (provider.isCoinbaseWallet) detectedWallets.add('Coinbase Wallet');
        if (provider.isRabby) detectedWallets.add('Rabby');
        if (provider.isTrust) detectedWallets.add('Trust Wallet');
        if (provider.isExodus) detectedWallets.add('Exodus');
        if (provider.isBraveWallet) detectedWallets.add('Brave Wallet');
      });
      
      wallets.push(...Array.from(detectedWallets));
      
      // If no specific wallet detected but ethereum exists, add generic
      if (wallets.length === 0) {
        wallets.push('Web3 Wallet');
      }
    }
    
    // Check for specific wallet objects
    if ((window as any).coinbaseWalletExtension) {
      if (!wallets.includes('Coinbase Wallet')) {
        wallets.push('Coinbase Wallet');
      }
    }
    
    // Debug logging
    console.log('Wallet detection debug:', {
      hasEthereum: !!window.ethereum,
      ethereumKeys: window.ethereum ? Object.keys(window.ethereum) : [],
      isMetaMask: window.ethereum?.isMetaMask,
      isCoinbaseWallet: window.ethereum?.isCoinbaseWallet,
      providers: (window.ethereum as any)?.providers,
      detectedWallets: wallets
    });
    
    return wallets;
  }

  // Connect to browser wallet
  async connect(): Promise<WalletInfo> {
    if (!window.ethereum) {
      throw new Error('No wallet extension found. Please install MetaMask or another Web3 wallet.');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer - we know window.ethereum exists from the check above
      this.provider = new ethers.BrowserProvider(window.ethereum as any);
      this.signer = await this.provider.getSigner();
      
      // Get account and chain info
      this.connectedAccount = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      this.chainId = Number(network.chainId);

      console.log('Wallet connected:', {
        address: this.connectedAccount,
        chainId: this.chainId
      });

      return {
        address: this.connectedAccount,
        chainId: this.chainId,
        provider: this.provider
      };
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  // Disconnect wallet
  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
    this.connectedAccount = null;
    this.chainId = null;
    console.log('Wallet disconnected');
  }

  // Get current connection status
  getConnectionInfo(): WalletInfo | null {
    if (!this.provider || !this.connectedAccount || !this.chainId) {
      return null;
    }

    return {
      address: this.connectedAccount,
      chainId: this.chainId,
      provider: this.provider
    };
  }

  // Sign a message
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await this.signer.signMessage(message);
      console.log('Message signed:', { message, signature });
      return signature;
    } catch (error: any) {
      console.error('Message signing failed:', error);
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  // Sign typed data (EIP-712)
  async signTypedData(domain: any, types: any, value: any): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await this.signer.signTypedData(domain, types, value);
      console.log('Typed data signed:', { domain, types, value, signature });
      return signature;
    } catch (error: any) {
      console.error('Typed data signing failed:', error);
      throw new Error(`Failed to sign typed data: ${error.message}`);
    }
  }

  // Switch to specific network
  async switchNetwork(chainId: number): Promise<void> {
    if (!window.ethereum) {
      throw new Error('No wallet available');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      this.chainId = chainId;
      console.log('Network switched to:', chainId);
    } catch (error: any) {
      console.error('Network switch failed:', error);
      throw new Error(`Failed to switch network: ${error.message}`);
    }
  }

  // Listen for account changes
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  // Listen for chain changes
  onChainChanged(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }

  // Remove event listeners
  removeAllListeners(): void {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }
}

// Create singleton instance
export const browserWalletService = new BrowserWalletService();
export default browserWalletService;
