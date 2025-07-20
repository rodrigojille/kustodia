"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authFetch } from '../../../../utils/authFetch';

export default function CobroTipoPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await authFetch('users/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData.user || userData);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const transactionTypes = [
    {
      id: 'inmobiliaria',
      title: 'Inmobiliaria',
      subtitle: 'Ventas de propiedades',
      icon: '🏠',
      description: 'Apartados, enganches, rentas y compra-ventas inmobiliarias. Comisiones automáticas para brokers y agentes.',
      features: [
        'Comisiones automáticas para brokers',
        'Oculta detalles de comisión al comprador',
        'Múltiples beneficiarios de comisión',
        'Especializado para inmobiliaria',
        'Integración con CRM inmobiliario'
      ],
      route: '/dashboard/cobros/inmobiliaria',
      color: 'from-blue-500 to-blue-600',
      available: true
    },
    {
      id: 'autos',
      title: 'Autos',
      subtitle: 'Venta de vehículos',
      icon: '🚗',
      description: 'Apartados, enganches y compra-ventas de vehículos. Comisiones automáticas para vendedores y distribuidores.',
      features: [
        'Comisiones para vendedores',
        'Información específica del vehículo',
        'Apartados y enganches',
        'Especializado para automotriz',
        'Integración con sistemas de concesionarios'
      ],
      route: '/dashboard/cobros/autos',
      color: 'from-green-500 to-green-600',
      available: true
    },
    {
      id: 'otros',
      title: 'Otros',
      subtitle: 'Servicios y productos',
      icon: '📦',
      description: 'Servicios profesionales, productos y otros conceptos. Comisiones flexibles para cualquier tipo de negocio.',
      features: [
        'Comisiones flexibles',
        'Adaptable a cualquier negocio',
        'Servicios profesionales',
        'Productos diversos',
        'Integración general'
      ],
      route: '/dashboard/cobros/otros',
      color: 'from-purple-500 to-purple-600',
      available: true
    }
  ];

  const handleTransactionTypeSelect = (transactionType: typeof transactionTypes[0]) => {
    if (!transactionType.available) return;
    
    console.log(`User selected transaction type: ${transactionType.id}`);
    router.push(transactionType.route);
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tipos de transacción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="page-title mb-4">
            Cobro Condicional Premium
          </h1>
          <p className="page-description text-base sm:text-lg lg:text-xl max-w-3xl mx-auto px-4">
            Selecciona el tipo de transacción que mejor se adapte a tu negocio. 
            Cada opción está optimizada para diferentes industrias.
          </p>
        </div>

        {/* Transaction Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {transactionTypes.map((transactionType) => (
            <div
              key={transactionType.id}
              className={`
                relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8 
                transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105
                ${transactionType.available 
                  ? 'hover:border-gray-300' 
                  : 'opacity-60 cursor-not-allowed'
                }
              `}
              onClick={() => handleTransactionTypeSelect(transactionType)}
            >
              <div className="flex flex-col h-full">
                {/* Icon and Title */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center text-2xl
                    bg-gradient-to-r ${transactionType.color}
                  `}>
                    <span className="text-white text-3xl">{transactionType.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {transactionType.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {transactionType.subtitle}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {transactionType.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-6">
                  {transactionType.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="mt-auto">
                  <button
                    className={`
                      w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
                      ${transactionType.available 
                        ? `bg-gradient-to-r ${transactionType.color} text-white hover:opacity-90 shadow-md hover:shadow-lg`
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }
                    `}
                    disabled={!transactionType.available}
                  >
                    {transactionType.available ? 'Seleccionar' : 'Próximamente'}
                  </button>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              {transactionType.available && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0 hover:opacity-5 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Cuál es la diferencia?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cada tipo de transacción tiene campos específicos y configuraciones optimizadas para diferentes industrias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Inmobiliaria</h3>
              <p className="text-sm text-gray-600">
                Campos específicos para propiedades, direcciones y tipos de operación inmobiliaria.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚗</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Autos</h3>
              <p className="text-sm text-gray-600">
                Información específica del vehículo como marca, modelo, año y número de serie.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Otros</h3>
              <p className="text-sm text-gray-600">
                Campos generales para servicios profesionales, productos y otros conceptos.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => router.push('/dashboard/crear-pago')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a tipos de movimiento
          </button>
        </div>
      </div>
    </div>
  );
}
