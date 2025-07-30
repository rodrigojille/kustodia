"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authFetch } from '../../../../utils/authFetch';

// Custom hook for responsive design
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowSize;
}

export default function CobroTipoPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>('');
  const { width } = useWindowSize();

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
      key: 'inmobiliaria',
      icon: '🏠',
      title: 'Inmobiliarias y agentes',
      subtitle: 'Propiedades y bienes raíces',
      description: 'Cierra ventas más rápido y genera confianza con tus clientes usando pagos en custodia.',
      features: [
        'Protege anticipos y apartados',
        'Comisiones automáticas para brokers',
        'Documentación inmobiliaria integrada',
        'Liberación condicional de fondos'
      ],
      color: 'from-blue-500 to-blue-600',
      available: true,
      route: '/dashboard/cobros/inmobiliaria'
    },
    {
      id: 'autos',
      key: 'autos',
      icon: '🚗',
      title: 'Autos y vehículos',
      subtitle: 'Compra-venta automotriz',
      description: 'Apartados, enganches y compra-ventas de vehículos con máxima seguridad.',
      features: [
        'Apartados y enganches seguros',
        'Comisiones para vendedores',
        'Verificación de documentos',
        'Transferencia segura de títulos'
      ],
      color: 'from-green-500 to-green-600',
      available: true,
      route: '/dashboard/cobros/autos'
    },
    {
      id: 'otros',
      key: 'otros',
      icon: '📦',
      title: 'Otros servicios y productos',
      subtitle: 'Servicios profesionales',
      description: 'Servicios profesionales, productos y otros conceptos con comisiones flexibles.',
      features: [
        'Configuración flexible',
        'Comisiones personalizables',
        'Múltiples tipos de productos',
        'Pagos seguros garantizados'
      ],
      color: 'from-purple-500 to-purple-600',
      available: true,
      route: '/dashboard/cobros/otros'
    }
  ];

  const handleTransactionTypeSelect = (transactionType: typeof transactionTypes[0]) => {
    console.log(`User selected transaction type: ${transactionType.key}`);
    router.push(transactionType.route);
  };

  const handleContinue = () => {
    if (!selected) return;
    const selectedType = transactionTypes.find(t => t.key === selected);
    if (selectedType) {
      handleTransactionTypeSelect(selectedType);
    }
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
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      padding: width < 640 ? "16px" : "24px"
    }}>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        style={{
          display: "flex",
          alignItems: "center",
          background: "transparent",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "8px 16px",
          color: "#6b7280",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          marginBottom: 24,
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        <span style={{ marginRight: '8px' }}>←</span>
        Volver a tipos de pago
      </button>

      <h1 style={{ 
        fontSize: width < 640 ? "1.5rem" : "2rem", 
        fontWeight: "bold", 
        textAlign: "center", 
        marginBottom: 32 
      }}>
        🎯 Cobro Condicional Premium
      </h1>

      <div className="content-wrapper">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
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
                  {transactionType.features.map((feature: string, index: number) => (
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Inmobiliaria</h3>
              <p className="text-sm text-gray-600">
                Campos específicos para propiedades, comisiones de brokers y documentación inmobiliaria.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚗</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Autos</h3>
              <p className="text-sm text-gray-600">
                Información del vehículo, documentación automotriz y comisiones de vendedores.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Otros</h3>
              <p className="text-sm text-gray-600">
                Configuración flexible para servicios, productos y cualquier tipo de negocio.
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
