"use client";
import React, { useState, useEffect } from 'react';
import { authFetch } from '../../../utils/authFetch';
import Portal, { BackupMethods, MpcStatus } from '@portal-hq/web';
import { useKustodiaPortal } from '@/app/providers';

interface User {
  full_name: string;
  email: string;
  deposit_clabe: string;
  payout_clabe: string;
  kyc_status: string;
  wallet_address: string;
}

const SettingsPage = () => {
  const { portal } = useKustodiaPortal();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [isEditingClabe, setIsEditingClabe] = useState(false);
  const [newClabe, setNewClabe] = useState('');
  const [clabeUpdateError, setClabeUpdateError] = useState<string | null>(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);

  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);

  // This state is not used to pass the share, but to trigger UI updates.
  const [portalShare, setPortalShare] = useState<string | null>(null);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [paymentNotifications, setPaymentNotifications] = useState(true);
  const [newsUpdates, setNewsUpdates] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log('[ConfigPage] Fetching user data...');
      try {
        const token = localStorage.getItem('auth_token');
        console.log('[ConfigPage] Token check before API call:', {
          hasToken: !!token,
        });

        const response = await authFetch('users/me');
        console.log(`[ConfigPage] API response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[ConfigPage] API request failed with status:', response.status, 'and response text:', errorText);
          const errorData = JSON.parse(errorText || '{}');
          throw new Error(errorData.error || `Failed to fetch user data with status ${response.status}`);
        }

        const data = await response.json();
        console.log('[ConfigPage] ✅ SUCCESS! Raw API response:', data);
        
        // Backend returns user data wrapped in 'user' property
        const userData = data.user || data; // Fallback to data if no user wrapper
        
        console.log('[ConfigPage] User data extracted:', userData);
        console.log('[ConfigPage] Full user object:', JSON.stringify(userData, null, 2));
        console.log('[ConfigPage] User KYC status:', userData?.kyc_status);
        console.log('[ConfigPage] User wallet address:', userData?.wallet_address);
        
        setUser(userData);
        console.log('[ConfigPage] User state set successfully.');

      } catch (err) {
        console.error('[ConfigPage] ❌ ERROR fetching user data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        console.log('[ConfigPage] Setting loading to false.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateName = async () => {
    if (!user || newName.trim() === '' || newName.trim() === user.full_name) {
      setIsEditingName(false);
      return;
    }

    setUpdateError(null);

    try {
      const response = await authFetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ full_name: newName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update name');
      }

      const data = await response.json();
      setUser(data.user);
      setIsEditingName(false);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleUpdateClabe = async () => {
    if (!user || newClabe.trim() === '' || newClabe.trim() === user.payout_clabe) {
      setIsEditingClabe(false);
      return;
    }

    setClabeUpdateError(null);

    try {
      const response = await authFetch('/api/users/update-payout-clabe', {
        method: 'PUT',
        body: JSON.stringify({ payout_clabe: newClabe.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update CLABE');
      }

      const data = await response.json();
      setUser(prevUser => prevUser ? { ...prevUser, payout_clabe: data.payout_clabe } : null);
      setIsEditingClabe(false);
    } catch (err) {
      setClabeUpdateError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordChangeError('New password must be at least 8 characters long.');
      return;
    }

    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    try {
      const response = await authFetch('/api/users/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      setPasswordChangeSuccess('Password updated successfully!');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordChangeError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleRecoverWallet = async () => {
    if (!portal || !user) {
      setRecoveryError('Portal SDK or user data is not available.');
      return;
    }

    setIsRecovering(true);
    setRecoveryError(null);
    setRecoverySuccess(null);

    portal.onReady(async () => {
      try {
        // Step 1: Retrieve the existing cipherText from your backend.
        const response = await authFetch('/api/users/get-portal-share');
        const data = await response.json();
        
        if (!data.portalShare) {
          throw new Error('No backup share found for this user.');
        }
        
        // Step 2: Use the cipherText directly for recovery
        const newBackupShare = await portal.recoverWallet(data.portalShare, BackupMethods.passkey);

        // Step 3: Extract and save the *new* cipherText to your backend
        const newCipherText = (newBackupShare as any).cipherText || JSON.stringify(newBackupShare);
        await authFetch('/api/users/save-portal-share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ portal_share: newCipherText }),
        });

        // Step 4: Notify Portal that the new share has been stored.
        await portal.storedClientBackupShare(true, BackupMethods.passkey);

        setRecoverySuccess('Wallet recovered successfully! A new backup has been secured.');
      } catch (err) {
        const error = err as Error;
        console.error('Error during wallet recovery process:', error);
        setRecoveryError(error.message);
        // On failure, notify Portal
        await portal.storedClientBackupShare(false, BackupMethods.passkey);
      } finally {
        setIsRecovering(false);
      }
    });
  };

  const handleBackupWallet = async () => {
    if (!portal || !user) {
      setBackupError('SDK de Portal o datos de usuario no están disponibles.');
      return;
    }

    setIsBackingUp(true);
    setBackupError(null);
    setBackupSuccess(null);

    portal.onReady(async () => {
      let backupSuccessful = false;
      try {
        // Step 1: Create the backup share.
        // Step 1: Create the backup share.
        console.log('🔍 [Frontend] Calling portal.backupWallet...');
        const backupShare = await portal.backupWallet(BackupMethods.passkey);
        console.log('🔍 [Frontend] backupShare result:', backupShare);
        console.log('🔍 [Frontend] backupShare type:', typeof backupShare);
        console.log('🔍 [Frontend] backupShare keys:', backupShare ? Object.keys(backupShare) : 'null');
        console.log('🔍 [Frontend] backupShare.cipherText:', backupShare?.cipherText);
        console.log('🔍 [Frontend] backupShare stringified:', JSON.stringify(backupShare));
        
        if (!backupShare) {
          throw new Error('Error en respaldo: No se devolvió portal share.');
        }

        // Step 2: Let's use the full backup share as a string for now
        const shareData = JSON.stringify(backupShare);
        console.log('🔍 [Frontend] shareData length:', shareData.length);
        
        await authFetch('/api/users/save-portal-share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ portal_share: shareData }),
        });

        // Step 3: Notify the Portal SDK that the backup was stored.
        await portal.storedClientBackupShare(true, BackupMethods.passkey);

        setPortalShare(shareData); // Trigger UI update
        setBackupSuccess('¡Respaldo de billetera creado exitosamente!');
        backupSuccessful = true;

      } catch (err) {
        // If any step fails, notify the SDK that the backup was not stored.
        if (backupSuccessful) {
          await portal.storedClientBackupShare(false, BackupMethods.passkey);
        }
        console.error('Error during wallet backup:', err);
        setBackupError(err instanceof Error ? err.message : 'Ocurrió un error desconocido durante el respaldo.');
      } finally {
        setIsBackingUp(false);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Configuración</h1>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {user && (
        <div className="space-y-12">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Perfil</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Nombre completo</p>
                  {!isEditingName ? (
                    <p className="text-gray-600">{user.full_name}</p>
                  ) : (
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  )}
                </div>
                {!isEditingName ? (
                  <button
                    onClick={() => {
                      setIsEditingName(true);
                      setNewName(user.full_name);
                    }}
                    className="font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateName}
                      className="font-semibold text-green-600 hover:text-green-800"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="font-semibold text-gray-600 hover:text-gray-800"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
              {updateError && <p className="text-red-500 text-sm mt-2">{updateError}</p>}
              <div className="border-t border-gray-200 pt-4">
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Seguridad</h2>
            {!isChangingPassword ? (
              <div>
                <p className="text-gray-600 mb-4">Aquí podrás cambiar tu contraseña y gestionar la autenticación de dos factores.</p>
                <button 
                  onClick={() => {
                    setIsChangingPassword(true);
                    setPasswordChangeError(null);
                    setPasswordChangeSuccess(null);
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  Cambiar contraseña
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Cambiar contraseña</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña actual</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                {passwordChangeError && <p className="text-red-500 text-sm">{passwordChangeError}</p>}
                {passwordChangeSuccess && <p className="text-green-500 text-sm">{passwordChangeSuccess}</p>}
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={handleChangePassword}
                    className="font-semibold text-green-600 hover:text-green-800"
                  >
                    Guardar cambios
                  </button>
                  <button
                    onClick={() => setIsChangingPassword(false)}
                    className="font-semibold text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wallet y CLABE Section */}
          <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Wallet y CLABE</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Wallet</p>
                <p className="text-gray-900 font-medium break-all">{user.wallet_address || 'No asignada'}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">CLABE de Depósito</p>
                <p className="text-gray-900 font-medium">{user.deposit_clabe || 'No asignada'}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">CLABE de Retiro</p>
                    {!isEditingClabe ? (
                      <p className="text-gray-900 font-medium">{user.payout_clabe || 'No asignada'}</p>
                    ) : (
                      <input
                        type="text"
                        value={newClabe}
                        onChange={(e) => setNewClabe(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    )}
                  </div>
                  {!isEditingClabe ? (
                    <button
                      onClick={() => {
                        setIsEditingClabe(true);
                        setNewClabe(user.payout_clabe || '');
                      }}
                      className="font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Editar
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleUpdateClabe}
                        className="font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setIsEditingClabe(false)}
                        className="font-semibold text-gray-600 hover:text-gray-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
                {clabeUpdateError && <p className="text-red-500 text-sm mt-2">{clabeUpdateError}</p>}
              </div>

              {/* Wallet Security & Backup Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 1L5 4v5.5C5 15.26 8.03 18.81 10 19c1.97-.19 5-3.74 5-8.5V4l-5-3zM8.5 9.5l1.5 1.5 3-3L14 8.5l-4 4-2.5-2.5L8.5 9.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-semibold text-blue-800">
                        🔐 Seguridad de Grado Financiero
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Tu billetera utiliza tecnología <strong>Passkey + Enclave Seguro</strong> con autenticación biométrica. Esto proporciona seguridad de nivel bancario sin contraseñas que recordar.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Respaldo Seguro de Billetera</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Crea un respaldo encriptado protegido por el hardware seguro de tu dispositivo. Usa tu huella dactilar o Face ID para restaurar tu billetera en cualquier dispositivo nuevo.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Protegido por Hardware
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Acceso Biométrico
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Sincronización Multi-dispositivo
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleBackupWallet}
                  disabled={isBackingUp}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 font-medium flex items-center justify-center"
                >
                  {isBackingUp ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creando Respaldo Seguro...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 1L5 4v5.5C5 15.26 8.03 18.81 10 19c1.97-.19 5-3.74 5-8.5V4l-5-3z" clipRule="evenodd" />
                      </svg>
                      Crear Respaldo Seguro
                    </>
                  )}
                </button>
                {backupError && <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{backupError}</p>}
                {backupSuccess && <p className="mt-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded p-2">✅ {backupSuccess}</p>}

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recuperación de Billetera</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    ¿Perdiste acceso a tu dispositivo? Usa tu respaldo biométrico para restaurar instantáneamente tu billetera en cualquier dispositivo nuevo.
                  </p>
                  <button
                    onClick={handleRecoverWallet}
                    disabled={isRecovering}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 font-medium flex items-center justify-center"
                  >
                    {isRecovering ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Restaurando Billetera...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Recuperar / Re-sincronizar Billetera
                      </>
                    )}
                  </button>
                  {recoveryError && <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{recoveryError}</p>}
                  {recoverySuccess && <p className="mt-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded p-2">✅ {recoverySuccess}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* API Keys Section */}
          <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">API Keys</h2>
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-white font-semibold rounded-lg cursor-not-allowed"
              >
                Generar nueva llave
              </button>
            </div>
            <p className="text-gray-600 mb-4">Aquí podrás gestionar tus llaves de API para integraciones.</p>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-500 italic">No hay llaves de API generadas aún.</p>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Notificaciones</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-900">Notificaciones por email</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="text-gray-900">Notificaciones de pagos</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={paymentNotifications} onChange={() => setPaymentNotifications(!paymentNotifications)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="text-gray-900">Noticias y actualizaciones</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={newsUpdates} onChange={() => setNewsUpdates(!newsUpdates)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
      )}

    </div>
  );
};
export default SettingsPage;
