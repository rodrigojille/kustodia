'use client';
import TrustFocusedTemplate from '../../../components/trust/TrustFocusedTemplate';
import { FaUserTie, FaHandshake, FaShieldAlt, FaClock } from 'react-icons/fa';

// Freelancer-specific custom section
function FreelancerPainPoints() {
  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl shadow-lg p-8 mb-12 border-l-4 border-red-400">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          ¿Te ha pasado esto como freelancer?
        </h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-red-600 text-xl">😰</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                "Trabajé 3 semanas y no me pagaron"
              </h4>
              <p className="text-sm text-gray-600">
                El cliente desapareció después de entregar el proyecto completo.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-orange-600 text-xl">😤</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                "Me cancelaron a último momento"
              </h4>
              <p className="text-sm text-gray-600">
                Después de invertir tiempo y recursos, el cliente cambió de opinión.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-yellow-600 text-xl">😔</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                "Siempre trabajo con miedo"
              </h4>
              <p className="text-sm text-gray-600">
                La incertidumbre de no saber si voy a cobrar me quita el sueño.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-blue-600 text-xl">💪</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                "Con Kustodia trabajo tranquilo"
              </h4>
              <p className="text-sm text-gray-600">
                Ahora sé que mi pago está garantizado antes de empezar.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <p className="text-lg font-semibold text-gray-900">
          En Kustodia, <span className="text-blue-600">nunca más trabajas con miedo</span>
        </p>
      </div>
    </div>
  );
}

function FreelancerBenefits() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Cómo Kustodia protege a los freelancers mexicanos
        </h3>
        <p className="text-lg text-gray-600">
          Diseñado específicamente para los retos que enfrentas como freelancer
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="text-green-600 text-2xl" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Pago Garantizado</h4>
          <p className="text-sm text-gray-600">
            El cliente deposita el pago antes de que empieces. Tu dinero está protegido desde el día 1.
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaHandshake className="text-blue-600 text-2xl" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Resolución de Disputas</h4>
          <p className="text-sm text-gray-600">
            Si hay problemas, nuestro equipo mexicano media entre tú y el cliente para resolver rápido.
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaClock className="text-purple-600 text-2xl" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Pagos Automáticos</h4>
          <p className="text-sm text-gray-600">
            Al entregar el trabajo, recibes tu pago automáticamente. Sin esperas, sin excusas.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TrustFocusedFreelancer() {
  return (
    <TrustFocusedTemplate
      vertical="freelancer"
      heroIcon={<FaUserTie className="text-blue-700 text-4xl" />}
      heroTitle="Nunca más trabajes con miedo a no cobrar"
      heroSubtitle="Tu pago protegido desde el primer día. Si el cliente no paga, nosotros te pagamos."
      heroDescription="Somos la única plataforma que garantiza el pago de freelancers mexicanos. Tu trabajo vale, y nosotros lo protegemos."
      customSections={[
        <FreelancerPainPoints key="pain-points" />,
        <FreelancerBenefits key="benefits" />
      ]}
      ctaText="Proteger mis pagos gratis"
      finalCtaTitle="¿Listo para trabajar sin miedo?"
      finalCtaDescription="Únete a más de 500 freelancers mexicanos que ya protegen sus pagos con nosotros"
    />
  );
}
