'use client';

import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import { FaCar, FaShieldAlt, FaUsers, FaEye, FaCertificate, FaCheckCircle, FaChartLine, FaHandshake, FaLock, FaHistory, FaAward } from 'react-icons/fa';
import { HiSparkles, HiDocumentText, HiTrendingUp } from 'react-icons/hi';
import Link from 'next/link';
import MarketplaceAnalytics, { trackVehicleView, trackTrustScoreInteraction } from '../../../components/MarketplaceAnalytics';

// Add global gtag type declaration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function CompraVentaVehiculos() {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setIsVisible(true);
    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Compra-Venta Vehículos',
        page_location: window.location.href,
        content_group1: 'Vehicle Landing'
      });
    }
    
    // Track example vehicle view
    trackVehicleView('1', 85);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const scrollToForm = () => {
    const formElement = document.getElementById('interest-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Track form submission
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'generate_lead', {
          event_category: 'Vehicle Sales',
          event_label: 'Vehicle NFT Interest',
          value: 1
        });
      }
      
      // Here you would typically send the data to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: <FaChartLine className="text-green-600 text-3xl" />,
      title: "IA Calcula 23% Más Valor",
      description: "Sistema inteligente analiza cada documento y servicio para calcular el valor real de tu cuidado. Tu inversión finalmente se refleja en el precio"
    },
    {
      icon: <FaHistory className="text-blue-600 text-3xl" />,
      title: "Elimina Desconfianza",
      description: "El historial verificado elimina dudas del comprador. No más regateos por 'posibles problemas ocultos'"
    },
    {
      icon: <FaShieldAlt className="text-purple-600 text-3xl" />,
      title: "Cobras Garantizado",
      description: "El dinero queda en custodia desde el primer día. No más cheques sin fondos o estafas"
    },
    {
      icon: <FaAward className="text-orange-600 text-3xl" />,
      title: "Ventaja Competitiva",
      description: "Mientras otros venden 'a ciegas', tú ofreces certificación que los compradores buscan"
    }
  ];

  const transparencyFeatures = [
    {
      icon: <HiDocumentText className="text-blue-500 text-2xl" />,
      title: "Cada Peso Invertido Cuenta",
      description: "Todos tus servicios y mejoras quedan registrados, aumentando el valor percibido"
    },
    {
      icon: <FaEye className="text-green-500 text-2xl" />,
      title: "Prueba Tu Cuidado",
      description: "Las inspecciones verificadas demuestran que mantuviste el auto en excelente estado"
    },
    {
      icon: <HiTrendingUp className="text-purple-500 text-2xl" />,
      title: "IA que Calcula tu Valor",
      description: "Sistema inteligente que analiza documentos, servicios oficiales y patrones de mantenimiento para maximizar tu precio"
    },
    {
      icon: <HiSparkles className="text-orange-500 text-2xl" />,
      title: "Certificado Único",
      description: "Tu auto se convierte en un activo digital verificado que vale más"
    }
  ];

  const stats = [
    { number: "+23%", label: "Más dinero en tu bolsillo", color: "text-green-600" },
    { number: "89%", label: "Más rápido que la competencia", color: "text-blue-600" },
    { number: "100%", label: "Pago garantizado", color: "text-purple-600" },
    { number: "0", label: "Estafas o cheques sin fondos", color: "text-orange-600" }
  ];

  return (
    <>
      <MarketplaceAnalytics 
        vehicleId="1"
        trustScore={85}
        verificationStatus="verified"
        eventType="view"
        category="vehicle_history"
      />
      <header>
        <title>Vende tu Auto Más Rápido y a Mejor Precio | Kustodia</title>
        <meta name="description" content="Incrementa el valor de tu auto hasta 23% con certificación digital. Vende más rápido con historial verificado y pagos 100% seguros. La ventaja competitiva que necesitas." />
        <meta name="keywords" content="vender auto, historial vehicular, blockchain, NFT vehicular, transparencia, pagos seguros" />
      </header>
      
      <Header isAuthenticated={false} userName={''} />
      
      <main className="bg-gradient-to-b from-blue-50 via-white to-gray-50 min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }} />
          </div>
          
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <FaShieldAlt className="mr-2" />
                Gemelo Digital Certificado
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Vende tu auto{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  más rápido y a mejor precio
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                <strong>Incrementa el valor de tu auto hasta 23%</strong> con certificación digital. Los compradores pagan más por 
                autos con historial verificado y tú cobras con pagos 100% seguros desde el primer día.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <button 
                  onClick={() => {
                    scrollToForm();
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'click', {
                        event_category: 'Hero CTA',
                        event_label: 'Main Hero CTA',
                        page_location: window.location.href
                      });
                    }
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-xl font-bold text-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center"
                >
                  <FaShieldAlt className="mr-3" />
                  Acceso Prioritario a Crear Gemelo Digital
                </button>
                <Link 
                  href="/public/vehicle/0" 
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'click', {
                        event_category: 'Hero Secondary',
                        event_label: 'View Example Vehicle',
                        page_location: window.location.href
                      });
                    }
                  }}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-5 rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center"
                >
                  <FaEye className="mr-2" />
                  Ver Ejemplo
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                La ventaja competitiva que necesitas
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Mientras otros vendedores luchan con desconfianza y regateos, tú vendes con ventaja competitiva
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Transparency Features */}
        <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Tu historial de mantenimiento ahora vale dinero
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Cada peso que invertiste en mantenimiento ahora se refleja en el precio de venta. 
                  Los compradores pagan más por autos con historial comprobado.
                </p>
                
                <div className="space-y-6">
                  {transparencyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">2022 CUPRA ATECA</h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      ✅ Verificado
                    </span>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div 
                      className="flex justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      onClick={() => trackTrustScoreInteraction('1', 85, 'trust_score_click')}
                    >
                      <span className="text-gray-600">Puntuación de Confianza:</span>
                      <span className="font-semibold text-green-600">85/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Eventos Verificados:</span>
                      <span className="font-semibold">2/2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Último Mantenimiento:</span>
                      <span className="font-semibold">25 jul 2025</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Historial Reciente:</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Mantenimiento - hace 2 días</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Creación del NFT - hace 3 días</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Link 
                      href="/public/vehicle/1"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.gtag) {
                          window.gtag('event', 'click', {
                            event_category: 'Vehicle History',
                            event_label: 'View Complete History',
                            page_location: window.location.href
                          });
                        }
                        trackTrustScoreInteraction('1', 85, 'view_full_history');
                      }}
                      className="flex-1 text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Ver Historial
                    </Link>
                    <button 
                      onClick={() => {
                        scrollToForm();
                        if (typeof window !== 'undefined' && window.gtag) {
                          window.gtag('event', 'click', {
                            event_category: 'Vehicle Interest',
                            event_label: 'Interest from Example',
                            page_location: window.location.href
                          });
                        }
                      }}
                      className="flex-1 text-center bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                    >
                      Me Interesa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligent Trust Score System */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <HiSparkles className="mr-2" />
                Sistema Inteligente de Confianza
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                La IA que convierte tu mantenimiento en{' '}
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  dinero extra
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Nuestro sistema inteligente analiza cada documento, servicio y cuidado que le diste a tu auto 
                para calcular un puntaje de confianza que justifica precios premium.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-8">¿Cómo funciona la IA de confianza?</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <FaCheckCircle className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Análisis de Documentación</h4>
                      <p className="text-gray-600">
                        Cada factura, certificado y foto suma puntos. 2+ documentos = +30 puntos de confianza.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaAward className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Reconocimiento de Servicios Oficiales</h4>
                      <p className="text-gray-600">
                        Mantenimiento en agencias/concesionarios recibe +15 puntos extra por credibilidad.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FaHistory className="text-purple-600 text-xl" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Análisis Temporal Inteligente</h4>
                      <p className="text-gray-600">
                        Mantenimientos recientes (≤6 meses) reciben +10 puntos. El cuidado constante se premia.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <FaChartLine className="text-orange-600 text-xl" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Reconocimiento de Patrones de Kilometraje</h4>
                      <p className="text-gray-600">
                        Mantenimientos en intervalos correctos (5k/10k km) suman puntos por cuidado responsable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Sistema de Puntuación IA</h3>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      ✨ INTELIGENTE
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Base Score:</span>
                      <span className="font-semibold text-gray-900">60 pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">+ Documentos (2+):</span>
                      <span className="font-semibold text-green-600">+30 pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">+ Servicio Oficial:</span>
                      <span className="font-semibold text-blue-600">+15 pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">+ Mantenimiento Reciente:</span>
                      <span className="font-semibold text-purple-600">+10 pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">+ Intervalos Correctos:</span>
                      <span className="font-semibold text-orange-600">+5 pts</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center text-xl">
                        <span className="font-bold text-gray-900">Score Total:</span>
                        <span className="font-bold text-green-600">95/100</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaCertificate className="text-green-600" />
                      <span className="font-semibold text-green-800">Estado: EXCELENTE</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Este vehículo califica para precios premium por su excelente historial de cuidado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Por qué los compradores pagan más?</h3>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">95+</div>
                    <div className="text-sm text-gray-600">Score = Precio Premium</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                    <div className="text-sm text-gray-600">Dudas sobre el historial</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">23%</div>
                    <div className="text-sm text-gray-600">Más dinero en tu bolsillo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Cómo funciona
              </h2>
              <p className="text-xl text-gray-600">
                En 3 simples pasos, convierte tu vehículo en un activo digital verificado
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Registra tu Vehículo</h3>
                <p className="text-gray-600">
                  Crea el NFT de tu vehículo con todos los datos y documentos y valida en centro autorizado
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Publica tu Venta</h3>
                <p className="text-gray-600">
                  Agrega y comparte el link de tu gemelo digital para agilizar la venta
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Vende seguro a través de Kustodia</h3>
                <p className="text-gray-600">
                  Con nuestro sistema de custodia digital, los compradores ven el historial completo y están dispuestos a pagar <span className="font-semibold text-green-600">hasta 23% más</span> por vehículos con certificación digital verificada
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lead Generation Form */}
        <section id="interest-form" className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Solicita Acceso Prioritario
                </h2>
                <p className="text-xl text-gray-600">
                  Regístrate para obtener acceso prioritario a la creación del gemelo digital de tu vehículo
                </p>
              </div>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
                  ¡Acceso prioritario confirmado! Te contactaremos en las próximas 24 horas para crear el gemelo digital de tu vehículo.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                  Hubo un error al enviar el formulario. Por favor inténtalo de nuevo.
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="55 1234 5678"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa (opcional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Empresa (opcional)"
                  />
                </div>
                

                
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaShieldAlt className="mr-2" />
                    {isSubmitting ? 'Procesando...' : 'Solicitar Acceso Prioritario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>


      </main>
    </>
  );
}
