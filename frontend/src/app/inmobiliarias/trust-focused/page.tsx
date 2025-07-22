'use client';
import { useState } from 'react';
import Header from '../../../components/Header';
import { 
  FaHome, 
  FaShieldAlt, 
  FaPhone,
  FaWhatsapp,
  FaCheckCircle,
  FaUsers,
  FaHeart
} from 'react-icons/fa';
import Link from 'next/link';
import { useAnalyticsContext } from '../../../components/AnalyticsProvider';

// Trust-focused components
function MexicanTeam() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaUsers className="text-blue-700 text-3xl" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Somos mexicanos como tú
        </h3>
        <p className="text-lg text-gray-600">
          Nuestro equipo en Ciudad de México protege tu dinero como si fuera nuestro
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
          <h4 className="font-semibold text-gray-900">Carlos Rodríguez</h4>
          <p className="text-sm text-gray-600">Director de Operaciones</p>
          <p className="text-xs text-gray-500 mt-1">15 años en banca mexicana</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
          <h4 className="font-semibold text-gray-900">María González</h4>
          <p className="text-sm text-gray-600">Especialista en Inmobiliaria</p>
          <p className="text-xs text-gray-500 mt-1">Corredora certificada CDMX</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
          <h4 className="font-semibold text-gray-900">Luis Hernández</h4>
          <p className="text-sm text-gray-600">Soporte al Cliente</p>
          <p className="text-xs text-gray-500 mt-1">Disponible 24/7</p>
        </div>
      </div>
    </div>
  );
}

function SimpleGuarantee() {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-8 mb-12 border-2 border-green-200">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaShieldAlt className="text-green-700 text-4xl" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Garantía Bancaria
        </h3>
        <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
          Tu dinero está protegido igual que en el banco. Si algo sale mal, 
          te devolvemos todo en 24 horas.
        </p>
        <div className="bg-white rounded-xl p-6 shadow-inner">
          <p className="text-lg font-semibold text-green-800">
            ✓ Protección total de fondos<br/>
            ✓ Devolución garantizada<br/>
            ✓ Regulado por CNBV
          </p>
        </div>
      </div>
    </div>
  );
}

function RealTestimonial() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Lo que dicen nuestros usuarios
        </h3>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-blue-50 rounded-xl p-6 relative">
          <div className="absolute -top-4 left-8">
            <div className="w-8 h-8 bg-blue-50 transform rotate-45"></div>
          </div>
          <p className="text-lg text-gray-700 italic mb-4">
            "Al principio tenía miedo de usar algo nuevo para una compra tan importante. 
            Pero cuando hablé con María por teléfono y me explicó todo, me sentí tranquila. 
            Mi casa de 2.5 millones quedó protegida y todo salió perfecto."
          </p>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
            <div>
              <p className="font-semibold text-gray-900">Ana Martínez</p>
              <p className="text-sm text-gray-600">Compradora, Polanco CDMX</p>
              <p className="text-xs text-gray-500">Verificado ✓</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HumanContact() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 mb-12 text-white">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4">
          ¿Tienes dudas? Habla con nosotros
        </h3>
        <p className="text-lg mb-8 opacity-90">
          Nuestro equipo mexicano está disponible para ayudarte
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-white bg-opacity-20 rounded-xl p-6">
            <FaPhone className="text-3xl mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Llámanos</h4>
            <p className="text-xl font-bold">55-1234-5678</p>
            <p className="text-sm opacity-80">Lunes a Viernes 9am-7pm</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-xl p-6">
            <FaWhatsapp className="text-3xl mx-auto mb-3" />
            <h4 className="font-semibold mb-2">WhatsApp</h4>
            <p className="text-xl font-bold">55-9876-5432</p>
            <p className="text-sm opacity-80">Disponible 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimpleExample() {
  const [showExample, setShowExample] = useState(false);
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ejemplo: Compra de casa de $2,500,000
        </h3>
        <p className="text-lg text-gray-600 mb-6">
          Ve cómo protegemos tu dinero paso a paso
        </p>
        
        <button 
          onClick={() => setShowExample(!showExample)}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          {showExample ? 'Ocultar ejemplo' : 'Ver ejemplo simple'}
        </button>
      </div>
      
      {showExample && (
        <div className="max-w-2xl mx-auto mt-8">
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <FaCheckCircle className="text-green-600 mr-3" />
              <div>
                <p className="font-semibold">1. Depositas tu dinero</p>
                <p className="text-sm text-gray-600">$2,500,000 quedan protegidos en custodia</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <FaCheckCircle className="text-blue-600 mr-3" />
              <div>
                <p className="font-semibold">2. Verificamos la propiedad</p>
                <p className="text-sm text-gray-600">Nuestro equipo confirma que todo esté en orden</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <FaCheckCircle className="text-purple-600 mr-3" />
              <div>
                <p className="font-semibold">3. Recibes tu casa</p>
                <p className="text-sm text-gray-600">El vendedor recibe el pago automáticamente</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-800">
                <strong>Si algo sale mal:</strong> Te devolvemos todo tu dinero en 24 horas. Sin preguntas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrustFocusedRealEstate() {
  const { trackEvent } = useAnalyticsContext();
  
  const handleEarlyAccessClick = () => {
    trackEvent('trust_focused_early_access_click', {
      page: 'inmobiliarias_trust_focused',
      section: 'cta'
    });
  };

  return (
    <>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
        
        {/* Hero Section - Trust-Focused */}
        <section className="w-full max-w-6xl px-6 mx-auto pt-32 pb-20">
          <div className="text-center mb-16">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <FaHome className="text-blue-700 text-4xl" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Compra tu casa con total seguridad
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Tu dinero protegido como en el banco. Si algo sale mal, te lo devolvemos todo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/#early-access"
                onClick={handleEarlyAccessClick}
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                🚀 Acceso Anticipado Gratis
              </Link>
              
              <Link 
                href="/inmobiliarias"
                className="inline-block bg-white text-blue-700 border-2 border-blue-200 text-lg font-semibold px-8 py-4 rounded-2xl shadow hover:shadow-lg hover:bg-blue-50 transition-all duration-300"
              >
                Más información
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <FaShieldAlt className="mr-2 text-green-600" />
                Regulado por CNBV
              </div>
              <div className="flex items-center">
                <FaHeart className="mr-2 text-red-500" />
                Empresa mexicana
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="mr-2 text-blue-600" />
                +1,000 transacciones seguras
              </div>
            </div>
          </div>
        </section>

        {/* Trust-Building Sections */}
        <section className="w-full max-w-6xl px-6 mx-auto pb-20">
          <MexicanTeam />
          <SimpleGuarantee />
          <SimpleExample />
          <RealTestimonial />
          <HumanContact />
          
          {/* Final CTA */}
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¿Listo para comprar con total seguridad?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Únete a más de 1,000 mexicanos que ya protegen sus transacciones con nosotros
              </p>
              <Link 
                href="/#early-access"
                onClick={handleEarlyAccessClick}
                className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white text-xl font-semibold px-12 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Comenzar ahora - Es gratis
              </Link>
            </div>
          </div>
        </section>
        
      </main>
    </>
  );
}
