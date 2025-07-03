"use client";
import React, { useState, useEffect } from 'react';
import authFetch from '../../../lib/api';

interface User {
  full_name: string;
  email: string;
  deposit_clabe: string;
  payout_clabe: string;
  kyc_status: string;
  wallet_address: string;
}

const SettingsPage = () => {
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

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [paymentNotifications, setPaymentNotifications] = useState(true);
  const [newsUpdates, setNewsUpdates] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authFetch('/api/users/me');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch user data' }));
          throw new Error(errorData.error || 'Failed to fetch user data');
        }
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
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
        method: 'POST',
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

          {/* Wallet Section */}
          <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Wallet y CLABE</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-900">Wallet</p>
                <p className="text-gray-600">{user.wallet_address || 'No asignada'}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="font-medium text-gray-900">CLABE de Depósito</p>
                <p className="text-gray-600">{user.deposit_clabe || 'No asignada'}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">CLABE de Retiro</p>
                    {!isEditingClabe ? (
                      <p className="text-gray-600">{user.payout_clabe || 'No asignada'}</p>
                    ) : (
                      <input
                        type="text"
                        value={newClabe}
                        onChange={(e) => setNewClabe(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="CLABE de 18 dígitos"
                      />
                    )}
                  </div>
                  {!isEditingClabe ? (
                    <button
                      onClick={() => {
                        setIsEditingClabe(true);
                        setNewClabe(user.payout_clabe || '');
                      }}
                      className="font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateClabe}
                        className="font-semibold text-green-600 hover:text-green-800"
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
