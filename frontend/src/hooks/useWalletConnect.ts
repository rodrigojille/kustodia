import { useState, useEffect, useCallback } from 'react';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import walletConnectService, { PendingRequest } from '../services/walletConnectService';

interface UseWalletConnectReturn {
  // Connection state
  isInitialized: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  
  // Sessions and requests
  activeSessions: SessionTypes.Struct[];
  pendingRequests: PendingRequest[];
  sessionProposal: SignClientTypes.EventArguments['session_proposal'] | null;
  
  // Actions
  initialize: () => Promise<void>;
  createPairingUri: () => Promise<string>;
  approveSession: (accounts: string[]) => Promise<void>;
  rejectSession: () => Promise<void>;
  approveRequest: (requestId: number, result: any) => Promise<void>;
  rejectRequest: (requestId: number, error?: any) => Promise<void>;
  disconnectSession: (topic: string) => Promise<void>;
  clearError: () => void;
}

export const useWalletConnect = (): UseWalletConnectReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSessions, setActiveSessions] = useState<SessionTypes.Struct[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [sessionProposal, setSessionProposal] = useState<SignClientTypes.EventArguments['session_proposal'] | null>(null);

  // Initialize WalletConnect
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    try {
      setIsConnecting(true);
      setError(null);

      const config = {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
        metadata: {
          name: 'Kustodia Admin',
          description: 'Kustodia Multi-Signature Wallet Administration',
          url: 'https://kustodia.mx',
          icons: ['https://kustodia.mx/favicon.ico'],
        },
      };

      await walletConnectService.initialize(config);

      // Set up event listeners
      walletConnectService.setEventListeners({
        onSessionProposal: (proposal) => {
          console.log('Session proposal received in hook:', proposal);
          setSessionProposal(proposal);
        },
        onSessionRequest: (request) => {
          console.log('Session request received in hook:', request);
          setPendingRequests(walletConnectService.getPendingRequests());
        },
        onSessionDelete: () => {
          setActiveSessions(walletConnectService.getActiveSessions());
        },
        onSessionUpdate: () => {
          setActiveSessions(walletConnectService.getActiveSessions());
        },
      });

      setActiveSessions(walletConnectService.getActiveSessions());
      setPendingRequests(walletConnectService.getPendingRequests());
      setIsInitialized(true);
    } catch (err) {
      console.error('Failed to initialize WalletConnect:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize WalletConnect');
    } finally {
      setIsConnecting(false);
    }
  }, [isInitialized]);

  // Create pairing URI for QR code
  const createPairingUri = useCallback(async (): Promise<string> => {
    try {
      setError(null);
      return await walletConnectService.createPairingUri();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create pairing URI';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Approve session proposal
  const approveSession = useCallback(async (accounts: string[]) => {
    if (!sessionProposal) {
      throw new Error('No session proposal to approve');
    }

    try {
      setError(null);
      await walletConnectService.approveSession(sessionProposal, accounts);
      setActiveSessions(walletConnectService.getActiveSessions());
      setSessionProposal(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve session';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [sessionProposal]);

  // Reject session proposal
  const rejectSession = useCallback(async () => {
    if (!sessionProposal) {
      throw new Error('No session proposal to reject');
    }

    try {
      setError(null);
      await walletConnectService.rejectSession(sessionProposal);
      setSessionProposal(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject session';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [sessionProposal]);

  // Approve transaction request
  const approveRequest = useCallback(async (requestId: number, result: any) => {
    try {
      setError(null);
      await walletConnectService.approveRequest(requestId, result);
      setPendingRequests(walletConnectService.getPendingRequests());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve request';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Reject transaction request
  const rejectRequest = useCallback(async (requestId: number, error?: any) => {
    try {
      setError(null);
      await walletConnectService.rejectRequest(requestId, error);
      setPendingRequests(walletConnectService.getPendingRequests());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject request';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Disconnect session
  const disconnectSession = useCallback(async (topic: string) => {
    try {
      setError(null);
      await walletConnectService.disconnectSession(topic);
      setActiveSessions(walletConnectService.getActiveSessions());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect session';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const isConnected = activeSessions.length > 0;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInitialized) {
        walletConnectService.cleanup();
      }
    };
  }, [isInitialized]);

  return {
    // State
    isInitialized,
    isConnecting,
    isConnected,
    error,
    activeSessions,
    pendingRequests,
    sessionProposal,
    
    // Actions
    initialize,
    createPairingUri,
    approveSession,
    rejectSession,
    approveRequest,
    rejectRequest,
    disconnectSession,
    clearError,
  };
};

export default useWalletConnect;
