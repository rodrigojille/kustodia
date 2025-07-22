import { ReactNode } from 'react';
import Header from '../Header';
import Link from 'next/link';
import { useAnalyticsContext } from '../AnalyticsProvider';

import SimpleGuarantee from './SimpleGuarantee';
import SimpleExample from './SimpleExample';
import RealTestimonials from './RealTestimonials';
import { FaShieldAlt, FaHeart, FaCheckCircle } from 'react-icons/fa';

interface TrustFocusedTemplateProps {
  vertical: string;
  heroIcon: ReactNode;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription?: string;
  customSections?: ReactNode[];
  showDefaultSections?: boolean;
  ctaText?: string;
  finalCtaTitle?: string;
  finalCtaDescription?: string;
}

const verticalIcons = {
  freelancer: "💼",
  inmobiliarias: "🏠", 
  marketplaces: "🛒",
  ecommerce: "🛍️",
  b2b: "🏢"
};

const verticalCTAs = {
  freelancer: "Proteger mis pagos gratis",
  inmobiliarias: "Proteger mi compra gratis",
  marketplaces: "Comprar con seguridad",
  ecommerce: "Proteger mi tienda",
  b2b: "Solución empresarial"
};

const finalCTATitles = {
  freelancer: "¿Listo para cobrar sin miedo?",
  inmobiliarias: "¿Listo para comprar con total seguridad?",
  marketplaces: "¿Listo para comprar y vender sin riesgos?",
  ecommerce: "¿Listo para proteger tu tienda?",
  b2b: "¿Listo para pagos B2B seguros?"
};

const finalCTADescriptions = {
  freelancer: "Únete a los freelancers mexicanos que protegen sus pagos",
  inmobiliarias: "Únete a los mexicanos que protegen sus transacciones inmobiliarias",
  marketplaces: "Protege tus compras y ventas en línea",
  ecommerce: "Protege las ventas de tu tienda en línea",
  b2b: "Soluciones de pago seguro para empresas"
};

export default function TrustFocusedTemplate({
  vertical,
  heroIcon,
  heroTitle,
  heroSubtitle,
  heroDescription,
  customSections = [],
  showDefaultSections = true,
  ctaText,
  finalCtaTitle,
  finalCtaDescription
}: TrustFocusedTemplateProps) {
  const { trackEvent } = useAnalyticsContext();
  
  const displayCTA = ctaText || verticalCTAs[vertical as keyof typeof verticalCTAs] || "Acceso Anticipado Gratis";
  const displayFinalTitle = finalCtaTitle || finalCTATitles[vertical as keyof typeof finalCTATitles] || "¿Listo para comenzar?";
  const displayFinalDescription = finalCtaDescription || finalCTADescriptions[vertical as keyof typeof finalCTADescriptions] || "Únete a miles de usuarios satisfechos";
  
  const handleEarlyAccessClick = (location: string) => {
    trackEvent('trust_focused_early_access_click', {
      page: `${vertical}_trust_focused`,
      section: location,
      vertical: vertical
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
              {heroIcon}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              {heroTitle}
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              {heroSubtitle}
            </p>
            
            {heroDescription && (
              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                {heroDescription}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/#early-access"
                onClick={() => handleEarlyAccessClick('hero')}
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                {verticalIcons[vertical as keyof typeof verticalIcons]} {displayCTA}
              </Link>
              
              <Link 
                href={['brokers', 'desarrolladores', 'compradores'].includes(vertical) ? '/inmobiliarias' : `/${vertical}`}
                className="inline-block bg-white text-blue-700 border-2 border-blue-200 text-lg font-semibold px-8 py-4 rounded-2xl shadow hover:shadow-lg hover:bg-blue-50 transition-all duration-300"
              >
                Más información
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <FaShieldAlt className="mr-2 text-green-600" />
                Custodia Segura
              </div>
              <div className="flex items-center">
                <FaHeart className="mr-2 text-red-500" />
                Empresa mexicana
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="mr-2 text-blue-600" />
                Soporte 24/7
              </div>
            </div>
          </div>
        </section>

        {/* Trust-Building Sections */}
        <section className="w-full max-w-6xl px-6 mx-auto pb-20">
          {/* Custom sections first */}
          {customSections.map((section, index) => (
            <div key={`custom-${index}`}>
              {section}
            </div>
          ))}
          
          {/* Default trust sections */}
          {showDefaultSections && (
            <>
              <SimpleGuarantee vertical={vertical} />
              <SimpleExample vertical={vertical} />
              <RealTestimonials vertical={vertical} />
            </>
          )}
          
          {/* Final CTA */}
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {displayFinalTitle}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {displayFinalDescription}
              </p>
              <Link 
                href="/#early-access"
                onClick={() => handleEarlyAccessClick('final')}
                className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white text-xl font-semibold px-12 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Comenzar ahora - Es gratis
              </Link>
              
              {/* Trust indicators */}
              <div className="flex justify-center space-x-8 mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">Sin costo</div>
                  <div>Durante acceso anticipado</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">24/7</div>
                  <div>Soporte en español</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">100%</div>
                  <div>Dinero protegido</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
      </main>
    </>
  );
}
