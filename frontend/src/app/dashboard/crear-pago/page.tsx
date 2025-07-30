"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authFetch } from '../../../utils/authFetch';

export default function CrearPagoPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Let ClientAuthGuard handle authentication, just fetch user data
        const res = await authFetch('users/me');
        if (res.ok) {
          const userData = await res.json();
          // Handle both wrapped and direct user data responses
          setUser(userData.user || userData);
        } else {
          console.error('Failed to fetch user data');
          // Don't redirect here - let ClientAuthGuard handle auth failures
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Don't redirect here - let ClientAuthGuard handle auth failures
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const paymentTypes = [
    {
      id: 'standard',
      title: 'Pago Condicional Estándar',
      subtitle: 'Custodia Tradicional',
      icon: '💰',
      description: 'Pagos estándar condicionales en base a tiempo y % a custodiar, ideal para transacciones en las cuales se necesita custodiar por un tiempo y % hasta que el trato se cumpla.',
      features: [
        'Pago sencillo mediante clabe única',
        'Transferencias inmediatas',
        'Visibilidad en tiempo real',
        'Sin condiciones adicionales',
        'Proceso simple'
      ],
      route: '/dashboard/pagos/nuevo',
      color: 'from-blue-500 to-blue-600',
      available: true
    },
    {
      id: 'conditional',
      title: 'Pago Condicional Premium',
      subtitle: 'Con sistema de aprobación dual e hitos',
      icon: '🎯',
      description: 'Pago con custodia y condiciones específicas. Perfecto para transacciones complejas con garantías y aprobación dual.',
      features: [
        'Pago sencillo mediante clabe única',
        'Sistema de custodia avanzado',
        'Aprobación dual',
        'Flujos especializados por caso de uso',
        'Condiciones personalizables'
      ],
      route: '/dashboard/nuevo-flujo',
      color: 'from-purple-500 to-purple-600',
      available: true
    },
    {
      id: 'cobro_inteligente',
      title: 'Cobro Condicional Premium',
      subtitle: 'Solicitudes de pago inteligente',
      icon: '🧠',
      description: 'Crea solicitudes de pago para que tus clientes te paguen con comisiones automáticas. Ideal para brokers, vendedores y ventas ligadas a gemelos digitales.',
      features: [
        'Solicitudes de pago personalizadas',
        'Comisiones automáticas ocultas',
        'Múltiples beneficiarios de comisión',
        'Distribución automática de fondos',
        'Soporte para ventas de gemelos digitales',
        'Ideal para brokers y vendedores'
      ],
      route: '/dashboard/cobros/tipo',
      color: 'from-orange-500 to-red-500',
      available: true
    }
  ];

  const handlePaymentTypeSelect = (paymentType: typeof paymentTypes[0]) => {
    if (!paymentType.available) return;
    
    // Add analytics or tracking here if needed
    console.log(`User selected payment type: ${paymentType.id}`);
    
    router.push(paymentType.route);
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando opciones de pago...</p>
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
            Crear Nuevo Movimiento
          </h1>
          <p className="page-description text-base sm:text-lg lg:text-xl max-w-3xl mx-auto px-4">
            Elige el tipo de movimiento que mejor se adapte a tus necesidades. 
            Cada opción está diseñada para diferentes casos de uso.
          </p>
        </div>



        {/* Payment Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-4 sm:px-0">
          {paymentTypes.map((paymentType) => (
            <div
              key={paymentType.id}
              onClick={() => handlePaymentTypeSelect(paymentType)}
              className={`
                relative bg-white rounded-2xl shadow-lg border border-gray-200 
                hover:shadow-xl transition-all duration-300 cursor-pointer
                transform hover:-translate-y-1 flex flex-col h-full
                ${!paymentType.available ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {/* Card Header with Gradient */}
              <div className={`bg-gradient-to-r ${paymentType.color} p-4 sm:p-6 rounded-t-2xl text-white min-h-[140px] sm:min-h-[160px] flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{paymentType.icon}</span>
                  {!paymentType.available && (
                    <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                      Próximamente
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 leading-tight">{paymentType.title}</h3>
                  <p className="text-white text-opacity-90 font-medium leading-tight text-sm sm:text-base">
                    {paymentType.subtitle}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-6 flex flex-col h-full">
                <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  {paymentType.description}
                </p>

                {/* Features List */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {paymentType.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></div>
                      <span className="text-gray-700 text-xs sm:text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="mt-auto">
                  <button
                    className={`
                      w-full py-2.5 sm:py-3 px-4 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base
                      ${paymentType.available 
                        ? `bg-gradient-to-r ${paymentType.color} text-white hover:opacity-90 shadow-md hover:shadow-lg`
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }
                    `}
                    disabled={!paymentType.available}
                  >
                    {paymentType.available ? 'Crear Pago' : 'Próximamente'}
                  </button>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              {paymentType.available && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0 hover:opacity-5 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-8 sm:mt-12 md:mt-16 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8 mx-4 sm:mx-0">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              ¿No estás seguro cuál elegir?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4 sm:px-0">
              Aquí tienes una guía rápida para ayudarte a decidir qué tipo de pago es mejor para tu situación.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-3 sm:p-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">💰</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Pago Condicional Estándar</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Ideal para transacciones que requieren garantías rápidas y sencillas.
              </p>
            </div>

            <div className="text-center p-3 sm:p-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Pago Condicional Premium</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Para transacciones complejas como un apartado inmobiliario, una compra de auto de segunda mano o un pago de servicios especializados.
              </p>
            </div>

            <div className="text-center p-3 sm:p-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">🏢</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Cobros</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Para brokers y vendedores que necesitan distribución automática de comisiones o para venta ligada a gemelos digitales.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-12 text-center px-4 sm:px-0">
          <p className="text-gray-500 text-xs sm:text-sm">
            ¿Necesitas ayuda? <a href="/dashboard/soporte" className="text-blue-600 hover:text-blue-800 underline">Contacta a nuestro equipo de soporte</a>
          </p>
        </div>
      </div>
    </div>
  );
}
