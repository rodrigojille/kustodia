'use client';

import Header from '../../components/Header';
import { FaQuestionCircle, FaShieldAlt, FaMoneyBillWave, FaClock, FaHandshake } from 'react-icons/fa';
import { useEffect } from 'react';
import { useAnalyticsContext } from '../../components/AnalyticsProvider';

export default function FAQPage() {
  const { trackEvent } = useAnalyticsContext();
  
  // Track page load for AI optimization metrics
  useEffect(() => {
    trackEvent('faq_page_loaded', {
      page_type: 'faq',
      optimization_target: 'ai_search',
      referrer: document.referrer || 'direct'
    });
  }, []);

  const faqData = [
    {
      category: "Qué es Kustodia",
      icon: <FaQuestionCircle className="w-6 h-6 text-blue-600" />,
      questions: [
        {
          question: "¿Qué es Kustodia?",
          answer: "Kustodia es una plataforma fintech mexicana especializada en custodia digital que utiliza tecnología blockchain para proteger transacciones comerciales. Operamos como un intermediario neutral y seguro que retiene fondos en contratos inteligentes hasta que ambas partes confirmen digitalmente el cumplimiento de las condiciones acordadas. Nuestro sistema de aprobación dual garantiza que el dinero solo se libere cuando tanto el pagador como el beneficiario estén completamente satisfechos con la transacción."
        },
        {
          question: "¿Cómo funciona la custodia digital?",
          answer: "La custodia digital utiliza contratos inteligentes desplegados en la blockchain Arbitrum para mantener los fondos en un estado de custodia criptográfica. Los fondos se depositan en el contrato y permanecen bloqueados hasta que se cumplan las condiciones preestablecidas. Este sistema elimina la necesidad de confiar en terceros, ya que las reglas están programadas en código inmutable. Funciona como un notario digital automatizado que ejecuta las condiciones acordadas sin intervención humana."
        },
        {
          question: "¿Qué es la aprobación dual?",
          answer: "La aprobación dual es nuestro mecanismo de seguridad principal que requiere confirmación explícita de ambas partes antes de liberar los fondos. El pagador debe confirmar que recibió el bien o servicio según lo acordado, y el beneficiario debe confirmar que cumplió con su parte del acuerdo. Solo cuando ambas confirmaciones digitales están registradas en el sistema, el contrato inteligente procede automáticamente a liberar los fondos. Este proceso garantiza protección total contra fraudes y malentendidos."
        }
      ]
    },
    {
      category: "Cómo Funciona",
      icon: <FaHandshake className="w-6 h-6 text-green-600" />,
      questions: [
        {
          question: "¿Cómo creo un pago protegido con Kustodia?",
          answer: "El proceso es simple y seguro: 1) Registra la transacción ingresando los datos del beneficiario, monto y condiciones específicas. 2) Realiza el depósito que se almacena automáticamente en custodia blockchain. 3) El beneficiario recibe notificación y procede a cumplir su parte del acuerdo. 4) Ambas partes confirman digitalmente el cumplimiento satisfactorio. 5) El sistema libera automáticamente los fondos vía transferencia SPEI a la cuenta bancaria registrada del beneficiario. Todo el proceso está auditado y respaldado por registros inmutables en blockchain."
        },
        {
          question: "¿Qué pasa si algo sale mal con mi compra?",
          answer: "Kustodia cuenta con un sistema robusto de resolución de disputas. Si surge algún inconveniente, cualquiera de las partes puede iniciar una disputa desde su panel de control. El proceso incluye: 1) Presentación de evidencia documental (fotos, mensajes, comprobantes). 2) Revisión imparcial por nuestro equipo especializado en resolución de conflictos. 3) Análisis de términos contractuales y evidencia presentada. 4) Decisión fundamentada sobre la liberación, devolución parcial o total de fondos. Durante el proceso de disputa, los fondos permanecen seguros en custodia hasta la resolución final."
        },
        {
          question: "¿Cuánto tiempo permanece el dinero en custodia?",
          answer: "La duración de la custodia es flexible y se establece según las necesidades de cada transacción. Al crear el pago protegido, puedes configurar un período de custodia que típicamente varía entre 1 y 30 días, aunque puede extenderse para transacciones complejas como bienes raíces. Los fondos se liberan automáticamente cuando ambas partes aprueban, independientemente del tiempo restante. Si se abre una disputa, el período se extiende automáticamente hasta la resolución. El sistema también incluye mecanismos de liberación automática en casos específicos para evitar bloqueos indefinidos."
        }
      ]
    },
    {
      category: "Seguridad y Confianza",
      icon: <FaShieldAlt className="w-6 h-6 text-purple-600" />,
      questions: [
        {
          question: "¿Es seguro usar Kustodia para mis pagos?",
          answer: "Absolutamente. Kustodia implementa múltiples capas de seguridad: utilizamos contratos inteligentes auditados en blockchain Arbitrum, una red de capa 2 de Ethereum reconocida por su seguridad y eficiencia. Todos los fondos se mantienen en custodia criptográfica, lo que significa que están protegidos por las mismas tecnologías que aseguran miles de millones de dólares en el ecosistema blockchain. Además, todos los pagos se procesan exclusivamente a través del sistema SPEI de Banxico, garantizando cumplimiento regulatorio total con el sistema financiero mexicano."
        },
        {
          question: "¿Qué pasa si Kustodia desaparece?",
          answer: "Esta es una preocupación válida que hemos abordado desde el diseño de la plataforma. Los fondos nunca están bajo control directo de Kustodia, sino que se almacenan en contratos inteligentes descentralizados en blockchain Arbitrum. Estos contratos son inmutables y funcionan independientemente de nuestra plataforma. En el escenario hipotético de que Kustodia dejara de operar, los contratos inteligentes continuarían ejecutándose según las condiciones programadas, y existen mecanismos de emergencia para que los usuarios puedan interactuar directamente con los contratos para recuperar sus fondos."
        },
        {
          question: "¿Kustodia puede acceder a mi dinero?",
          answer: "No, bajo ningún concepto. Esta es una diferencia fundamental entre Kustodia y los servicios de custodia tradicionales. Los fondos se depositan directamente en contratos inteligentes descentralizados donde Kustodia no tiene acceso, control ni capacidad de movimiento arbitrario. Nuestro rol se limita a facilitar la interfaz de usuario y proporcionar servicios de soporte. La liberación de fondos está completamente automatizada y solo ocurre cuando se cumplen las condiciones preestablecidas en el código del contrato: aprobación dual de las partes o resolución formal de disputas según protocolos transparentes."
        }
      ]
    },
    {
      category: "Pagos y Comisiones",
      icon: <FaMoneyBillWave className="w-6 h-6 text-orange-600" />,
      questions: [
        {
          question: "¿Cuánto cuesta usar Kustodia?",
          answer: "Kustodia opera con una estructura de comisiones transparente y competitiva. Cobramos una comisión por el servicio de custodia digital que varía según el tipo de transacción y monto. Todas las comisiones se calculan como un porcentaje del valor total y se muestran claramente antes de confirmar cualquier pago, sin costos ocultos. Durante nuestro período de acceso temprano, ofrecemos tarifas promocionales especiales para usuarios pioneros. Los costos incluyen la seguridad blockchain, procesamiento SPEI, y soporte especializado durante todo el proceso de custodia."
        },
        {
          question: "¿Cómo recibo mi dinero cuando se libera el pago?",
          answer: "El proceso de liberación es completamente automatizado y eficiente. Una vez que se cumplen las condiciones de aprobación dual, el sistema inicia automáticamente una transferencia SPEI a la cuenta bancaria previamente registrada y verificada del beneficiario. SPEI es el sistema oficial de transferencias electrónicas de Banxico, garantizando que los fondos lleguen de manera instantánea y segura, 24/7, los 365 días del año. Recibes notificaciones en tiempo real sobre el estado de la transferencia y confirmación una vez que los fondos están disponibles en tu cuenta bancaria."
        },
        {
          question: "¿Puedo usar Kustodia para cualquier tipo de compra?",
          answer: "Kustodia está diseñado para una amplia gama de transacciones comerciales, especialmente aquellas donde la confianza y verificación son críticas. Es especialmente útil para: vehículos y bienes de alto valor, transacciones inmobiliarias, servicios profesionales y freelancing, compras en redes sociales y marketplaces, transacciones B2B y comercio electrónico. Cualquier situación donde necesites garantizar que recibes exactamente lo acordado antes de liberar el pago. Sin embargo, mantenemos políticas de cumplimiento estrictas y no procesamos transacciones relacionadas con actividades ilegales o reguladas especialmente."
        }
      ]
    },
    {
      category: "Casos de Uso",
      icon: <FaClock className="w-6 h-6 text-red-600" />,
      questions: [
        {
          question: "¿Es seguro comprar en Facebook Marketplace con Kustodia?",
          answer: "Absolutamente. Las redes sociales como Facebook Marketplace, Instagram y similares son entornos donde los fraudes son particularmente comunes debido a la falta de protección al comprador. Kustodia elimina completamente este riesgo: el vendedor no puede acceder a tu dinero hasta que confirmes haber recibido el producto exactamente como se describió. Esto te protege contra vendedores fraudulentos, productos defectuosos, envíos incompletos o cualquier otra irregularidad. Además, mantienes toda la comunicación y evidencia documentada en caso de necesitar resolver alguna disputa."
        },
        {
          question: "¿Cómo protege Kustodia las compras de autos?",
          answer: "Las transacciones de vehículos requieren protección especial debido a su alto valor y complejidad legal. Kustodia mantiene los fondos en custodia segura mientras verificas: 1) Estado físico y mecánico del vehículo según lo acordado, 2) Documentación legal completa (tarjeta de circulación, factura, verificaciones al día), 3) Ausencia de adeudos, multas o problemas legales, 4) Completar el proceso de cambio de propietario ante las autoridades correspondientes. Solo cuando confirmas que todos estos elementos están en orden, se libera el pago al vendedor. Esto te protege contra vehículos robados, con adeudos ocultos, o problemas mecánicos no divulgados."
        },
        {
          question: "¿Funciona Kustodia para servicios freelancer?",
          answer: "Kustodia es ideal para la economía freelancer, protegiendo tanto a profesionales independientes como a sus clientes. El proceso funciona así: el cliente deposita el pago acordado en custodia al iniciar el proyecto, garantizando al freelancer que los fondos están disponibles y comprometidos. El freelancer puede trabajar con tranquilidad sabiendo que el pago está asegurado. Una vez completado y entregado el trabajo según las especificaciones acordadas, el cliente revisa y aprueba, liberando automáticamente el pago. Esto elimina problemas comunes como clientes que desaparecen sin pagar, disputas sobre la calidad del trabajo, o malentendidos sobre los entregables. Ambas partes están protegidas: el freelancer garantiza su pago y el cliente asegura recibir el trabajo prometido."
        }
      ]
    }
  ];

  return (
    <>
      <head>
        <title>Preguntas Frecuentes - Kustodia | Pagos Seguros México</title>
        <meta name="description" content="Respuestas a todas tus preguntas sobre custodia digital, pagos seguros, y cómo proteger tu dinero con Kustodia. Aprende sobre aprobación dual, SPEI seguro, y blockchain." />
        <meta name="keywords" content="preguntas frecuentes kustodia, custodia digital, pagos seguros méxico, aprobación dual, SPEI seguro, blockchain pagos, evitar fraudes" />
        <link rel="canonical" href="https://kustodia.mx/faq" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Preguntas Frecuentes - Kustodia | Pagos Seguros México" />
        <meta property="og:description" content="Respuestas a todas tus preguntas sobre custodia digital, pagos seguros, y cómo proteger tu dinero con Kustodia." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/faq" />
        <meta property="og:image" content="https://kustodia.mx/og-faq.png" />
        
        {/* FAQ Structured Data for AI Search */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': faqData.flatMap(category => 
            category.questions.map(faq => ({
              '@type': 'Question',
              'name': faq.question,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
              }
            }))
          )
        }) }} />
      </head>
      
      <Header isAuthenticated={false} userName={''} />
      
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen pt-20 pb-20">
        {/* Hero Section */}
        <section className="w-full max-w-4xl mx-auto px-6 mb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Preguntas Frecuentes
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Todo lo que necesitas saber sobre <span className="font-semibold text-blue-600">custodia digital</span>, 
              <span className="font-semibold text-blue-600"> pagos seguros</span>, y cómo 
              <span className="font-semibold text-blue-600"> proteger tu dinero</span> con Kustodia.
            </p>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="w-full max-w-6xl mx-auto px-6">
          <div className="space-y-12">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    {category.icon}
                    <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
                  </div>
                </div>

                {/* Questions */}
                <div className="p-8">
                  <div className="space-y-8">
                    {category.questions.map((faq, faqIndex) => (
                      <div key={faqIndex} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-4xl mx-auto px-6 mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Listo para proteger tus pagos?
            </h2>
            <p className="text-blue-100 mb-6 text-lg">
              Únete al acceso temprano y paga sin miedo con custodia digital.
            </p>
            <a 
              href="/#early-access" 
              className="inline-block bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors duration-300"
              onClick={() => trackEvent('faq_cta_click', { source: 'faq_bottom' })}
            >
              Obtener Acceso Prioritario →
            </a>
          </div>
        </section>

        {/* Additional Help */}
        <section className="w-full max-w-4xl mx-auto px-6 mt-12">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ¿No encontraste lo que buscabas?
            </h3>
            <p className="text-gray-600 mb-6">
              Nuestro equipo está aquí para ayudarte con cualquier duda específica.
            </p>
            <a 
              href="mailto:soporte@kustodia.mx" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              onClick={() => trackEvent('faq_contact_click', { method: 'email' })}
            >
              <span>📧</span>
              Contactar Soporte: soporte@kustodia.mx
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
