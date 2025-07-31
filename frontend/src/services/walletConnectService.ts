import { Web3Wallet, IWeb3Wallet } from '@walletconnect/web3wallet';
import { Core } from '@walletconnect/core';
import { getSdkError } from '@walletconnect/utils';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';

export interface WalletConnectConfig {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

export interface PendingRequest {
  id: number;
  topic: string;
  params: any;
  method: string;
  chainId: string;
}

class WalletConnectService {
  private web3wallet: IWeb3Wallet | null = null;
  private core: InstanceType<typeof Core> | null = null;
  private initialized = false;
  private sessions: SessionTypes.Struct[] = [];
  private pendingRequests: PendingRequest[] = [];
  private listeners: {
    onSessionProposal?: (proposal: SignClientTypes.EventArguments['session_proposal']) => void;
    onSessionRequest?: (request: SignClientTypes.EventArguments['session_request']) => void;
    onSessionDelete?: (session: SignClientTypes.EventArguments['session_delete']) => void;
    onSessionUpdate?: (session: SignClientTypes.EventArguments['session_update']) => void;
  } = {};

  async initialize(config: WalletConnectConfig): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize Core
      this.core = new Core({
        projectId: config.projectId,
      });

      // Initialize Web3Wallet
      this.web3wallet = await Web3Wallet.init({
        core: this.core,
        metadata: config.metadata,
      });

      // Set up event listeners
      this.setupEventListeners();

      this.initialized = true;
      console.log('WalletConnect initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.web3wallet) return;

    // Session proposal (when a dApp wants to connect)
    this.web3wallet.on('session_proposal', (proposal) => {
      console.log('Session proposal received:', proposal);
      if (this.listeners.onSessionProposal) {
        this.listeners.onSessionProposal(proposal);
      }
    });

    // Session request (when a dApp wants to sign a transaction)
    this.web3wallet.on('session_request', (request) => {
      console.log('Session request received:', request);
      this.pendingRequests.push({
        id: request.id,
        topic: request.topic,
        params: request.params,
        method: request.params.request.method,
        chainId: request.params.chainId,
      });
      
      if (this.listeners.onSessionRequest) {
        this.listeners.onSessionRequest(request);
      }
    });

    // Session delete
    this.web3wallet.on('session_delete', (session) => {
      console.log('Session deleted:', session);
      this.sessions = this.sessions.filter(s => s.topic !== session.topic);
      
      if (this.listeners.onSessionDelete) {
        this.listeners.onSessionDelete(session);
      }
    });

    // Session update
    (this.web3wallet as any).on('session_update', (event: any) => {
      console.log('Session updated:', event);
      if (this.listeners.onSessionUpdate) {
        this.listeners.onSessionUpdate(event);
      }
    });
  }

  // Generate pairing URI for QR code
  async createPairingUri(): Promise<string> {
    if (!this.web3wallet) {
      throw new Error('WalletConnect not initialized');
    }

    const { uri } = await this.web3wallet.core.pairing.create();
    return uri;
  }

  // Approve session proposal
  async approveSession(
    proposal: SignClientTypes.EventArguments['session_proposal'],
    accounts: string[]
  ): Promise<void> {
    if (!this.web3wallet) {
      throw new Error('WalletConnect not initialized');
    }

    const { id, params } = proposal;
    const { requiredNamespaces, relays } = params;

    // Build approved namespaces
    const approvedNamespaces: SessionTypes.Namespaces = {};
    
    Object.keys(requiredNamespaces).forEach((key) => {
      const namespace = requiredNamespaces[key];
      approvedNamespaces[key] = {
        accounts: accounts.map(account => `${key}:${namespace.chains?.[0]}:${account}`),
        methods: namespace.methods,
        events: namespace.events,
      };
    });

    const session = await this.web3wallet.approveSession({
      id,
      relayProtocol: relays[0].protocol,
      namespaces: approvedNamespaces,
    });

    this.sessions.push(session);
    console.log('Session approved:', session);
  }

  // Reject session proposal
  async rejectSession(proposal: SignClientTypes.EventArguments['session_proposal']): Promise<void> {
    if (!this.web3wallet) {
      throw new Error('WalletConnect not initialized');
    }

    await this.web3wallet.rejectSession({
      id: proposal.id,
      reason: getSdkError('USER_REJECTED'),
    });
  }

  // Approve transaction request
  async approveRequest(requestId: number, result: any): Promise<void> {
    if (!this.web3wallet) {
      throw new Error('WalletConnect not initialized');
    }

    const request = this.pendingRequests.find(r => r.id === requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    await this.web3wallet.respondSessionRequest({
      topic: request.topic,
      response: {
        id: requestId,
        result,
        jsonrpc: '2.0',
      },
    });

    // Remove from pending requests
    this.pendingRequests = this.pendingRequests.filter(r => r.id !== requestId);
  }

  // Reject transaction request
  async rejectRequest(requestId: number, error?: any): Promise<void> {
    if (!this.web3wallet) {
      throw new Error('WalletConnect not initialized');
    }

    const request = this.pendingRequests.find(r => r.id === requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    await this.web3wallet.respondSessionRequest({
      topic: request.topic,
      response: {
        id: requestId,
        error: error || getSdkError('USER_REJECTED'),
        jsonrpc: '2.0',
      },
    });

    // Remove from pending requests
    this.pendingRequests = this.pendingRequests.filter(r => r.id !== requestId);
  }

  // Disconnect session
  async disconnectSession(topic: string): Promise<void> {
    if (!this.web3wallet) {
      throw new Error('WalletConnect not initialized');
    }

    await this.web3wallet.disconnectSession({
      topic,
      reason: getSdkError('USER_DISCONNECTED'),
    });

    this.sessions = this.sessions.filter(s => s.topic !== topic);
  }

  // Get active sessions
  getActiveSessions(): SessionTypes.Struct[] {
    return this.sessions;
  }

  // Get pending requests
  getPendingRequests(): PendingRequest[] {
    return this.pendingRequests;
  }

  // Set event listeners
  setEventListeners(listeners: typeof this.listeners): void {
    this.listeners = { ...this.listeners, ...listeners };
  }

  // Check if initialized
  isInitialized(): boolean {
    return this.initialized;
  }

  // Cleanup
  async cleanup(): Promise<void> {
    if (this.web3wallet) {
      // Disconnect all sessions
      for (const session of this.sessions) {
        await this.disconnectSession(session.topic);
      }
    }
    
    this.web3wallet = null;
    this.core = null;
    this.initialized = false;
    this.sessions = [];
    this.pendingRequests = [];
  }
}

// Export singleton instance
export const walletConnectService = new WalletConnectService();
export default walletConnectService;
