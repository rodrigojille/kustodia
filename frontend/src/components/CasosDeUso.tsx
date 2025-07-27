import React from "react";
import { useAnalyticsContext } from './AnalyticsProvider';

const casos = [
  {
    title: "Inmobiliarias y agentes",
    description: "Cierra ventas más rápido y genera confianza con tus clientes usando pagos en custodia. Protege anticipos, apartados y rentas: el dinero solo se libera cuando se cumplen las condiciones del pago.",
    icon: "🏠",
  },
  {
    title: "Freelancers y servicios",
    description: "Asegura tu pago antes de comenzar a trabajar. El cliente deposita en custodia y tú entregas con tranquilidad. Sin riesgos de impago.",
    icon: "💻",
  },
  {
    title: "E-commerce y ventas online",
    description: "Ofrece máxima confianza a tus compradores. El pago queda protegido hasta que el producto llega en buen estado.",
    icon: "🛒",
  },
  {
    title: "Compra-venta entre particulares",
    description: "Evita fraudes en ventas de autos, gadgets, muebles y más. El dinero solo se libera cuando se cumplen las condiciones del pago.",
    icon: "🤝",
  },
  {
    title: "Empresas B2B y control de entregas",
    description: "Gestiona compras entre empresas con pagos protegidos: el dinero queda en custodia hasta que la entrega y la calidad sean verificadas. Ideal para compras con control de entregas, pagos por adelantado y flujos tipo escrow.",
    icon: "🏢",
  },
  {
    title: "Marketplaces de servicios",
    description: "Facilita pagos en custodia en marketplaces donde se ofrecen servicios y es fundamental asegurar la entrega y satisfacción antes de liberar el pago. Ideal para plataformas que conectan profesionales y clientes, garantizando la completitud del servicio.",
    icon: "🌐",
  },
];

export default function CasosDeUso() {
  const { trackUserAction } = useAnalyticsContext();
  return (
    <section className="w-full max-w-7xl mx-auto px-6 mb-32" aria-labelledby="use-cases-heading">
      <div className="text-center mb-20">
        <h2 id="use-cases-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
          Casos de uso
        </h2>
        <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
          Soluciones de custodia para cada industria y necesidad
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" role="list">
        {casos.map((caso) => {
          let href = null;
          if (caso.title === "Freelancers y servicios") href = "/freelancer";
          if (caso.title === "Inmobiliarias y agentes") href = "/inmobiliarias";
          if (caso.title === "E-commerce y ventas online") href = "/ecommerce";
          if (caso.title === "Compra-venta entre particulares") href = "/compra-venta";
          if (caso.title === "Empresas B2B y control de entregas") href = "/b2b";
          if (caso.title === "Marketplaces de servicios") href = "/marketplaces";
          
          return (
            <article 
              key={caso.title} 
              className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group h-full"
              role="listitem"
            >
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300" role="img" aria-hidden="true">
                {caso.icon}
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">
                {caso.title}
              </h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light mb-8 flex-1">
                {caso.description}
              </p>
              <div className="flex w-full justify-center mt-auto">
                {href ? (
                  <a 
                    href={href} 
                    className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] min-w-[140px]"
                    onClick={() => trackUserAction('use_case_button_click', {
                      button_text: 'Saber más',
                      use_case_title: caso.title,
                      target_url: href,
                      fraud_category: caso.title.includes('Inmobiliarias') ? 'real_estate' : 
                                     caso.title.includes('Freelancer') ? 'services' :
                                     caso.title.includes('E-commerce') ? 'ecommerce' :
                                     caso.title.includes('Compra-venta') ? 'marketplace' :
                                     caso.title.includes('B2B') ? 'b2b' :
                                     caso.title.includes('Marketplaces') ? 'marketplaces' : 'other',
                      engagement_level: 'high',
                      conversion_stage: 'consideration'
                    })}
                  >
                    Saber más
                  </a>
                ) : (
                  <span 
                    className="inline-block px-8 py-4 bg-gray-200 text-gray-500 rounded-2xl font-semibold text-base shadow opacity-60 cursor-not-allowed min-w-[140px]"
                    onClick={() => trackUserAction('use_case_coming_soon_click', {
                      use_case_title: caso.title,
                      button_text: 'Próximamente',
                      engagement_level: 'medium'
                    })}
                  >
                    Próximamente
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
