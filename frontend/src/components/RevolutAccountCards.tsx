'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authFetch from '../utils/authFetch';

interface RevolutAccountCardsProps {
  user: any;
  mxnbsBalance: string | null;
  loading: boolean;
  error: string | null;
  onUserUpdate: (user: any) => void;
}

export default function RevolutAccountCards({ user, mxnbsBalance, loading, error, onUserUpdate }: RevolutAccountCardsProps) {
  const [isEditingClabe, setIsEditingClabe] = useState(false);
  const [newClabe, setNewClabe] = useState(user?.payout_clabe || '');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [showWalletCard, setShowWalletCard] = useState(!!user?.wallet_address); // Show if user already has wallet
  const [isStartingKYC, setIsStartingKYC] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.payout_clabe) {
      setNewClabe(user.payout_clabe);
    }
  }, [user?.payout_clabe]);

  const handleUpdateClabe = async () => {
    if (newClabe.length !== 18 || !/^\d+$/.test(newClabe)) {
      setUpdateError('La CLABE debe tener 18 dígitos numéricos.');
      return;
    }
    setUpdateError(null);

    try {
      const res = await authFetch('users/me/payout-clabe', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payout_clabe: newClabe }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al actualizar la CLABE');
      }

      const updatedUser = await res.json();
      onUserUpdate(updatedUser.user);
      setIsEditingClabe(false);
    } catch (err: any) {
      setUpdateError(err.message);
    }
  };

  const handleCreateWallet = async () => {
    setIsCreatingWallet(true);
    try {
      const res = await authFetch('users/retry-wallet', {
        method: 'POST'
      });
      
      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...user, wallet_address: data.wallet_address };
        onUserUpdate(updatedUser);
        setShowWalletCard(true);
        alert('¡Wallet creada exitosamente!');
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      alert('Error al crear wallet');
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleStartKYC = async () => {
    setIsStartingKYC(true);
    setKycError(null);
    
    try {
      const res = await authFetch('/api/truora/start-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          country: 'MX',
          redirect_url: `${window.location.origin}/dashboard`
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.url || data.front_url) {
          // Truora provides the URL with QR code - open it directly
          const truoraUrl = data.url || data.front_url;
          
          // Create a modal with options
          const modal = document.createElement('div');
          modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 10000;
          `;
          
          modal.innerHTML = `
            <div style="
              background: white; padding: 2rem; border-radius: 12px;
              max-width: 500px; text-align: center; position: relative;
            ">
              <button onclick="this.parentElement.parentElement.remove()" style="
                position: absolute; top: 10px; right: 15px; background: none;
                border: none; font-size: 24px; cursor: pointer;
              ">×</button>
              
              <h3 style="margin-bottom: 1rem; color: #333;">Verificación KYC</h3>
              
              <p style="color: #666; margin: 1rem 0;">Haz clic en el botón para acceder a la página de Truora con código QR para completar la verificación desde tu teléfono móvil.</p>
              
              <div style="margin: 2rem 0;">
                <a href="${truoraUrl}" target="_blank" style="
                  display: inline-block; padding: 1rem 2rem;
                  background: #28a745; color: white; text-decoration: none;
                  border-radius: 8px; font-size: 1.1rem; font-weight: bold;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ">Iniciar Verificación KYC</a>
              </div>
              
              <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                <p style="font-size: 0.9rem; color: #666; margin: 0;">Instrucciones:</p>
                <ul style="font-size: 0.9rem; color: #666; text-align: left; margin: 0.5rem 0;">
                  <li>Haz clic en "Iniciar Verificación KYC"</li>
                  <li>Escanea el código QR con tu teléfono</li>
                  <li>Sigue las instrucciones para subir tu documento</li>
                  <li>Completa la verificación facial si es requerida</li>
                </ul>
              </div>
              
              <p style="font-size: 0.8rem; color: #888; margin-top: 1rem;">
                ID de Validación: ${data.validation_id || 'N/A'}
              </p>
            </div>
          `;
          
          document.body.appendChild(modal);
          
        } else {
          throw new Error('No se recibió URL de verificación');
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al iniciar verificación KYC');
      }
    } catch (err: any) {
      console.error('KYC Error:', err);
      setKycError(err.message || 'Error al iniciar verificación KYC');
    } finally {
      setIsStartingKYC(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
        <p className="text-red-600">Error loading account data: {error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
        <p className="text-yellow-600">No user data available</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* 1. CLABE de Cobro Card - Always show FIRST */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏦</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">CLABE de Cobro</h3>
                    {!user?.payout_clabe && (
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500 text-sm">⚠️</span>
                        <span className="text-xs text-amber-600 font-medium">Requerida</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {!user?.payout_clabe ? (
                      <span className="text-amber-600">⚠️ Configura tu CLABE para recibir pagos</span>
                    ) : (
                      "Para recibir pagos SPEI"
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingClabe(!isEditingClabe)}
                className={`font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm ${isEditingClabe ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                {isEditingClabe ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">CLABE Interbancaria</p>
              {isEditingClabe ? (
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    value={newClabe}
                    onChange={(e) => setNewClabe(e.target.value)}
                    className="w-full p-3 border-2 border-blue-200 rounded-xl font-mono text-lg" 
                    maxLength={18}
                    placeholder="Ingresa tu CLABE de 18 dígitos"
                  />
                  {updateError && <p className="text-red-500 text-sm">{updateError}</p>}
                  <button 
                    onClick={handleUpdateClabe} 
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Guardar CLABE
                  </button>
                </div>
              ) : user?.payout_clabe ? (
                <p className="text-xl font-mono font-bold text-gray-900 tracking-wider bg-gray-50 p-3 rounded-xl">
                  {user?.payout_clabe}
                </p>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <p className="text-sm text-yellow-800 mb-2">No tienes CLABE de cobro configurada</p>
                  <p className="text-xs text-yellow-700">Configura tu CLABE para recibir pagos</p>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 mt-0.5">💡</div>
                <div>
                  <p className="text-xs font-medium text-blue-800 mb-1">Cómo usar</p>
                  <p className="text-xs text-blue-700">Esta es tu clabe bancaria final para recibir pagos finales através de Kustodia, asegurate que esta clabe sea la de tu banco de preferencia.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. KYC Status Card - Always show SECOND */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🛡️</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">Verificación KYC</h3>
                  {user?.kyc_status !== 'approved' && (
                    <div className="flex items-center gap-1">
                      <span className="text-red-500 text-sm">⚠️</span>
                      <span className="text-xs text-red-600 font-medium">Requerida</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {user?.kyc_status !== 'approved' ? (
                    <span className="text-red-600">⚠️ Verificación necesaria para transacciones</span>
                  ) : (
                    "Estado de identidad"
                  )}
                </p>
              </div>
            </div>
            
            {user?.kyc_status === 'approved' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-lg">✅</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">Verificado</h4>
                    <p className="text-sm text-green-700">Identidad confirmada</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-lg">❌</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800">No verificado</h4>
                    <p className="text-sm text-red-700 mb-3">Completa tu verificación</p>
                  </div>
                </div>
                {kycError && (
                  <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700">{kycError}</p>
                  </div>
                )}
                <button 
                  onClick={handleStartKYC}
                  disabled={isStartingKYC}
                  className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStartingKYC ? '⏳ Iniciando verificación...' : 'Verificar Identidad'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Wallet & Balance Card - Optional, show only if requested */}
        {showWalletCard ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-green-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Wallet & Saldo</h3>
                  <p className="text-sm text-gray-600">Deposita y gestiona fondos</p>
                </div>
              </div>
              
              {/* MXNB Balance */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Saldo MXNB</p>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {mxnbsBalance || '0.00'} MXNB
                </p>
              </div>
              
              {/* Deposit CLABE */}
              {user?.deposit_clabe && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">CLABE para fondear mi wallet</p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-sm font-mono font-semibold text-gray-900 mb-2">
                      {user?.deposit_clabe}
                    </p>
                    <button className="w-full bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm mb-2">
                      📋 Copiar CLABE de Depósito
                    </button>
                    <button
                      className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => alert('Funcionalidad de retiro MXNB próximamente disponible')}
                    >
                      💸 Retirar MXNBs
                    </button>
                  </div>
                </div>
              )}
              
              {/* Web3 Wallet */}
              {user?.wallet_address ? (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Wallet Web3</p>
                  <p className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded-lg break-all">
                    {user?.wallet_address}
                  </p>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Wallet Web3</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <p className="text-sm text-yellow-800 mb-3">No tienes wallet asignada</p>
                    <button
                      onClick={handleCreateWallet}
                      disabled={isCreatingWallet}
                      className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm disabled:opacity-50"
                    >
                      {isCreatingWallet ? '⏳ Creando...' : '🔗 Crear Wallet'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Wallet Activation Card - Show when wallet is not activated */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-green-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Wallet Web3</h3>
                  <p className="text-sm text-gray-600">Funciones avanzadas</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 mt-0.5">ℹ️</div>
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">¿Qué es una Wallet Web3?</p>
                    <p className="text-xs text-blue-700">Permite funciones avanzadas como creación de operaciones wallet to wallet y la gestión de MXNBs.</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowWalletCard(true)}
                className="w-full bg-green-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-green-700 transition-colors duration-200 text-sm"
              >
                🚀 Activar Wallet Web3
              </button>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                Opcional - Solo activa si necesitas funciones avanzadas
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Requirements Warning */}
      {(!user?.payout_clabe || user?.kyc_status !== 'approved') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-800 mb-2">Completa tu configuración</h3>
              <p className="text-sm text-amber-700 mb-3">
                Para realizar transacciones necesitas completar los siguientes requisitos:
              </p>
              <div className="space-y-2">
                {!user?.payout_clabe && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <span className="text-amber-500">•</span>
                    <span>Configurar tu CLABE de cobro</span>
                  </div>
                )}
                {user?.kyc_status !== 'approved' && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <span className="text-amber-500">•</span>
                    <span>Completar verificación KYC</span>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                <p className="text-xs text-amber-800">
                  <span className="font-medium">💡 Tip:</span> Una vez completados estos pasos, podrás enviar y recibir pagos sin restricciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
