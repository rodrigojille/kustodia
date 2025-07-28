'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PublicVehicleLandingPage() {
  const [tokenId, setTokenId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId.trim()) return;

    setLoading(true);
    
    try {
      // First check if the vehicle exists
      const response = await fetch(`/api/public/vehicle/${tokenId.trim()}/summary`);
      
      if (response.ok) {
        // Vehicle exists, navigate to full history
        router.push(`/public/vehicle/${tokenId.trim()}`);
      } else {
        alert('Vehículo no encontrado. Verifica el Token ID.');
      }
    } catch (error) {
      alert('Error al buscar el vehículo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kustodia</h1>
                <p className="text-sm text-gray-600">Verificación Pública de Vehículos</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Powered by Blockchain
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚗 Historial Público de Vehículos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Verifica la historia completa de cualquier vehículo registrado en blockchain. 
            Transparencia total para compradores, vendedores y concesionarios.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="mb-6">
              <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700 mb-2">
                Ingresa el Token ID del vehículo
              </label>
              <input
                type="text"
                id="tokenId"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Ej: 0, 123, ABC123..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !tokenId.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Buscando...
                </div>
              ) : (
                '🔍 Ver Historial Completo'
              )}
            </button>
          </form>
        </div>

        {/* Example Vehicle */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚙 Ejemplo: Prueba con Token ID "0"</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium text-gray-900">2022 CUPRA ATECA</div>
              <div className="text-gray-600">Token ID: 0</div>
              <div className="text-green-600 mt-2">✅ Verificado</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium text-gray-900">Historial Completo</div>
              <div className="text-gray-600">Mantenimientos registrados</div>
              <div className="text-blue-600 mt-2">📋 2 eventos</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium text-gray-900">Blockchain Verified</div>
              <div className="text-gray-600">Arbitrum Sepolia</div>
              <div className="text-purple-600 mt-2">🔗 Inmutable</div>
            </div>
          </div>
          <button
            onClick={() => router.push('/public/vehicle/0')}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver ejemplo completo →
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparencia Total</h3>
            <p className="text-gray-600">
              Accede al historial completo de mantenimientos, inspecciones y eventos del vehículo.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🛡️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Verificación Blockchain</h3>
            <p className="text-gray-600">
              Todos los datos están verificados y almacenados de forma inmutable en blockchain.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Análisis de Confianza</h3>
            <p className="text-gray-600">
              Puntuaciones de confianza y análisis de riesgo basados en el historial verificado.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8">
          <h2 className="text-3xl font-bold mb-6">¿Por qué usar Kustodia?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-semibold mb-1">Para Compradores</h4>
                <p className="text-blue-100">Conoce la historia real del vehículo antes de comprar</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🏪</span>
              <div>
                <h4 className="font-semibold mb-1">Para Concesionarios</h4>
                <p className="text-blue-100">Demuestra la calidad y mantenimiento de tus vehículos</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💰</span>
              <div>
                <h4 className="font-semibold mb-1">Para Vendedores</h4>
                <p className="text-blue-100">Aumenta el valor de tu vehículo con historial verificado</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h4 className="font-semibold mb-1">Seguridad Garantizada</h4>
                <p className="text-blue-100">Datos inmutables protegidos por blockchain</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            ¿Tienes un vehículo que quieres registrar en blockchain?
          </p>
          <button
            onClick={() => window.open('https://kustodia.mx', '_blank')}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all"
          >
            🚗 Registra tu Vehículo
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-6 mb-4">
            <a href="https://kustodia.mx" className="hover:text-blue-400">Kustodia.mx</a>
            <span className="text-gray-400">•</span>
            <a href="https://sepolia.arbiscan.io" className="hover:text-blue-400">Blockchain Explorer</a>
            <span className="text-gray-400">•</span>
            <a href="mailto:soporte@kustodia.mx" className="hover:text-blue-400">Soporte</a>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 Kustodia. Plataforma de verificación vehicular en blockchain.
          </p>
        </div>
      </div>
    </div>
  );
}
