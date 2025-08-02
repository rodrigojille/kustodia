'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authFetch } from '@/utils/authFetch';

export default function KYCCompletedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const processId = searchParams?.get('process_id');
  const accountId = searchParams?.get('account_id');

  useEffect(() => {
    const updateKYCStatus = async () => {
      if (!processId || !accountId) {
        setStatus('error');
        setMessage('Faltan parámetros de proceso');
        return;
      }

      try {
        console.log('Updating KYC status for:', { processId, accountId });
        
        // Call backend to update user KYC status
        const response = await authFetch('/api/truora/update-kyc-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            process_id: processId,
            account_id: accountId,
            status: 'completed'
          })
        });

        if (response.ok) {
          const data = await response.json();
          setStatus('success');
          setMessage('KYC completado exitosamente');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          const errorData = await response.json();
          setStatus('error');
          setMessage(errorData.error || 'Error al actualizar estado KYC');
        }
      } catch (error) {
        console.error('Error updating KYC status:', error);
        setStatus('error');
        setMessage('Error de conexión');
      }
    };

    updateKYCStatus();
  }, [processId, accountId, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Procesando verificación KYC...
            </h2>
            <p className="text-gray-600">
              Actualizando tu estado de verificación
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-900 mb-2">
              ¡Verificación Completada!
            </h2>
            <p className="text-gray-600 mb-4">
              Tu identidad ha sido verificada exitosamente
            </p>
            <p className="text-sm text-gray-500">
              Serás redirigido al dashboard en unos segundos...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Error en la verificación
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Volver al Dashboard
            </button>
          </>
        )}

        {processId && (
          <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <p>Process ID: {processId}</p>
            <p>Account ID: {accountId}</p>
          </div>
        )}
      </div>
    </div>
  );
}
