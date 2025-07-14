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
  const [newClabe, setNewClabe] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);

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



  // Debug: Check what user data we're receiving
  console.log('[RevolutAccountCards] 🔍 Props received:', { user, loading, error });
  if (user) {
    console.log('[RevolutAccountCards] 📊 User data:', user);
    console.log('[RevolutAccountCards] 🔑 KYC Status:', user.kyc_status);
    console.log('[RevolutAccountCards] 🏦 Payout CLABE:', user.payout_clabe);
    console.log('[RevolutAccountCards] 🏦 Deposit CLABE:', user.deposit_clabe);
    console.log('[RevolutAccountCards] 🔍 User object keys:', Object.keys(user));
    console.log('[RevolutAccountCards] ✅ KYC check (approved):', user.kyc_status === 'approved');
    console.log('[RevolutAccountCards] ✅ Payout CLABE check (exists):', !!user.payout_clabe);
    console.log('[RevolutAccountCards] ✅ Deposit CLABE check (exists):', !!user.deposit_clabe);
  } else {
    console.log('[RevolutAccountCards] ⚠️ No user data received!');
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Loading skeletons for 3 cards */}
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

  // Determine which cards to show
  const showPayoutCard = user.payout_clabe && user.payout_clabe.trim() !== '';
  const cardCount = showPayoutCard ? 3 : 2;
  const gridCols = cardCount === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-6 mb-8`}>
      {/* 1. Payout CLABE Card - Only show if user has payout_clabe */}
      {showPayoutCard && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏦</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">CLABE de Cobro</h3>
                  <p className="text-sm text-gray-600">Para recibir pagos SPEI</p>
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
                  />
                  {updateError && <p className="text-red-500 text-sm">{updateError}</p>}
                  <button 
                    onClick={handleUpdateClabe} 
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Guardar CLABE
                  </button>
                </div>
              ) : (
                <p className="text-xl font-mono font-bold text-gray-900 tracking-wider bg-gray-50 p-3 rounded-xl">
                  {user.payout_clabe}
                </p>
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
      )}

      {/* 2. Wallet & Balance Card - Shows deposit CLABE + Web3 wallet + balance */}
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
          {user.deposit_clabe && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">CLABE para fondear mi wallet</p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-sm font-mono font-semibold text-gray-900 mb-2">
                  {user.deposit_clabe}
                </p>
                <button
                  className="w-full bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm mb-2"
                >
                  📋 Copiar CLABE de Depósito
                </button>
                <button
                  className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                  onClick={() => {
                    // TODO: Implement MXNB withdrawal functionality
                    alert('Funcionalidad de retiro MXNB próximamente disponible');
                  }}
                >
                  💸 Retirar MXNBs
                </button>
              </div>
            </div>
          )}
          
          {/* Web3 Wallet */}
          {user.wallet_address && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Wallet Web3</p>
              <p className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded-lg break-all">
                {user.wallet_address}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. KYC Status Card - Simple verification check */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🛡️</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Verificación KYC</h3>
              <p className="text-sm text-gray-600">Estado de identidad</p>
            </div>
          </div>
          
          {user.kyc_status === 'approved' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">Verificado</h4>
                  <p className="text-sm text-green-700">
                    Identidad confirmada
                  </p>
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
                  <p className="text-sm text-red-700 mb-3">
                    Completa tu verificación
                  </p>
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 text-sm">
                Verificar Identidad
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
