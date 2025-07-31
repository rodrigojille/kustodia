'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { useWalletConnect } from '../../hooks/useWalletConnect';

interface WalletConnectQRProps {
  onConnectionEstablished?: () => void;
  className?: string;
}

const WalletConnectQR: React.FC<WalletConnectQRProps> = ({
  onConnectionEstablished,
  className = '',
}) => {
  const {
    isInitialized,
    isConnecting,
    isConnected,
    error,
    activeSessions,
    sessionProposal,
    initialize,
    createPairingUri,
    approveSession,
    rejectSession,
    disconnectSession,
    clearError,
  } = useWalletConnect();

  const [pairingUri, setPairingUri] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Initialize WalletConnect on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Handle session proposal
  useEffect(() => {
    if (sessionProposal) {
      setShowApprovalModal(true);
    }
  }, [sessionProposal]);

  // Handle connection established
  useEffect(() => {
    if (isConnected && onConnectionEstablished) {
      onConnectionEstablished();
    }
  }, [isConnected, onConnectionEstablished]);

  // Generate new pairing URI
  const handleGenerateQR = async () => {
    try {
      setIsGeneratingQR(true);
      clearError();
      const uri = await createPairingUri();
      setPairingUri(uri);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Approve session with multi-sig wallet addresses
  const handleApproveSession = async () => {
    try {
      // Use the multi-sig wallet addresses from environment
      const accounts = [
        process.env.NEXT_PUBLIC_HIGH_VALUE_MULTISIG_ADDRESS || '0xA8F1B1Bac8D3B1c5D28A7eD91fa01e96eDB6711c',
        process.env.NEXT_PUBLIC_ENTERPRISE_MULTISIG_ADDRESS || '0xA8F1B1Bac8D3B1c5D28A7eD91fa01e96eDB6711c',
      ];
      
      await approveSession(accounts);
      setShowApprovalModal(false);
    } catch (err) {
      console.error('Failed to approve session:', err);
    }
  };

  // Reject session
  const handleRejectSession = async () => {
    try {
      await rejectSession();
      setShowApprovalModal(false);
    } catch (err) {
      console.error('Failed to reject session:', err);
    }
  };

  // Disconnect active session
  const handleDisconnect = async (topic: string) => {
    try {
      await disconnectSession(topic);
      setPairingUri('');
    } catch (err) {
      console.error('Failed to disconnect session:', err);
    }
  };

  if (!isInitialized && isConnecting) {
    return (
      <div className={`text-center p-6 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Inicializando WalletConnect...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
        <button
          onClick={() => {
            clearError();
            initialize();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <div className="text-center">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          {isConnected ? 'Wallet Conectado' : 'Wallet Desconectado'}
        </div>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Sesiones Activas</h3>
          {activeSessions.map((session) => (
            <div key={session.topic} className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-800">
                    {session.peer.metadata.name}
                  </p>
                  <p className="text-sm text-green-600">
                    {session.peer.metadata.url}
                  </p>
                </div>
                <button
                  onClick={() => handleDisconnect(session.topic)}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  Desconectar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Section */}
      {!isConnected && (
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Conectar Wallet Móvil</h3>
          <p className="text-sm text-gray-600">
            Escanea el código QR con tu wallet móvil (Coinbase Wallet, MetaMask, etc.)
          </p>
          
          {pairingUri ? (
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block">
              <QRCode
                value={pairingUri}
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 inline-block">
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                <p className="text-gray-500 text-sm">Código QR aparecerá aquí</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleGenerateQR}
            disabled={isGeneratingQR}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingQR ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generando...
              </div>
            ) : (
              'Generar Código QR'
            )}
          </button>
        </div>
      )}

      {/* Session Approval Modal */}
      {showApprovalModal && sessionProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Solicitud de Conexión</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                {sessionProposal.params.proposer.metadata.icons?.[0] && (
                  <img
                    src={sessionProposal.params.proposer.metadata.icons[0]}
                    alt="App icon"
                    className="w-8 h-8 rounded"
                  />
                )}
                <div>
                  <p className="font-medium">{sessionProposal.params.proposer.metadata.name}</p>
                  <p className="text-sm text-gray-600">{sessionProposal.params.proposer.metadata.url}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Esta aplicación quiere conectarse a tu wallet multi-sig para firmar transacciones.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRejectSession}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Rechazar
              </button>
              <button
                onClick={handleApproveSession}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aprobar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnectQR;
