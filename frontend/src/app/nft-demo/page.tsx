'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '../../utils/authFetch';
import IntegracionMarketplace from '../../components/IntegracionMarketplace';

export default function GemeloDigitalPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First, check if we have user data in localStorage (same as dashboard)
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        console.log('[Gemelo Digital] Using cached user data from localStorage:', userData);
        setUser(userData);
        setLoading(false);
        return;
      } catch (e) {
        console.error('[Gemelo Digital] Error parsing stored user data:', e);
        localStorage.removeItem('userData'); // Remove corrupted data
      }
    }

    // No cached data, fetch with same logic as dashboard
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('auth_token'); // Same as dashboard
        console.log('[Gemelo Digital] Token check:', {
          hasToken: !!token,
          tokenLength: token?.length || 0,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
        });
        
        if (!token) {
          console.log('[Gemelo Digital] No auth_token found, redirecting to login');
          window.location.href = '/login';
          return;
        }
        
        // Use same endpoint as dashboard
        const response = await authFetch('users/me');
        console.log('[Gemelo Digital] authFetch response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('[Gemelo Digital] 401 Unauthorized - redirecting to login');
            window.location.href = '/login';
            return;
          }
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[NFT Demo] ✅ SUCCESS! Raw API response:', data);
        
        // Backend returns user data wrapped in 'user' property (same as dashboard)
        const userData = data.user || data;
        console.log('[NFT Demo] User data:', userData);
        
        setUser(userData);
        // Store in localStorage for future use
        localStorage.setItem('userData', JSON.stringify(userData));
        
      } catch (error) {
        console.error('[NFT Demo] Authentication error:', error);
        if (error instanceof Error && error.message === 'UNAUTHORIZED') {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
      <IntegracionMarketplace />
      
      {/* Footer with User Flow Explanation */}
      <div className="bg-white border-t mt-12 -mx-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">¿Cómo Funciona el Gemelo Digital?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Crear Gemelo Digital</h3>
              <p className="text-sm text-gray-600">
                Propietarios crean el gemelo digital verificado de su vehículo o propiedad a través de Kustodia
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Publicar Seguro</h3>
              <p className="text-sm text-gray-600">
                Agencias pueden mostrar el gemelo digital en piso de venta o publicar en cualquier plataforma de venta
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verificar Información</h3>
              <p className="text-sm text-gray-600">
                Compradores pueden verificar toda la información del activo antes de comprar con total transparencia
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Compra Segura</h3>
              <p className="text-sm text-gray-600">
                Pago seguro a través de Kustodia con protección de garantía y transferencia automática del activo
              </p>
            </div>
          </div>

          {/* Value Propositions */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">🛒 Para Compradores</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Historial verificado y trazabilidad completa</li>
                <li>• Protección de pago con garantía de depósito</li>
                <li>• Registros inmutables de propiedad</li>
                <li>• Verificación fácil con códigos QR</li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-3">💰 Para Vendedores</h4>
              <ul className="text-sm text-green-800 space-y-2">
                <li>• Mayor valor del activo con verificación</li>
                <li>• Publicar en cualquier plataforma de venta</li>
                <li>• Historial transparente de transacciones</li>
                <li>• Reducción de fraudes y disputas</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-3">🏢 Para Agencias y Talleres</h4>
              <ul className="text-sm text-purple-800 space-y-2">
                <li>• Actualizar registros de mantenimiento</li>
                <li>• Historial certificado de servicios</li>
                <li>• Mayor confianza del cliente</li>
                <li>• Nuevas oportunidades de ingresos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
