import { useState } from 'react';
import { FaCheckCircle, FaPlay, FaEye } from 'react-icons/fa';

interface ExampleStep {
  title: string;
  description: string;
  icon: 'check' | 'clock' | 'shield' | 'money';
  color: 'green' | 'blue' | 'purple' | 'yellow';
}

interface SimpleExampleProps {
  vertical?: string;
  title?: string;
  subtitle?: string;
  amount?: string;
  scenario?: string;
  steps?: ExampleStep[];
  warningText?: string;
}

const verticalExamples = {
  freelancer: {
    title: "Ejemplo: Proyecto de diseño de $15,000",
    subtitle: "Ve cómo protegemos tu pago paso a paso",
    amount: "$15,000",
    scenario: "diseño_logo",
    steps: [
      {
        title: "Cliente deposita el pago",
        description: "$15,000 quedan protegidos en custodia",
        icon: 'check' as const,
        color: 'green' as const
      },
      {
        title: "Trabajas con tranquilidad",
        description: "Sabes que tu pago está garantizado",
        icon: 'clock' as const,
        color: 'blue' as const
      },
      {
        title: "Entregas el trabajo",
        description: "Cliente revisa y aprueba el diseño",
        icon: 'shield' as const,
        color: 'purple' as const
      },
      {
        title: "Recibes tu pago",
        description: "Transferencia automática a tu cuenta",
        icon: 'money' as const,
        color: 'yellow' as const
      }
    ],
    warningText: "Si el cliente cancela sin razón: Te pagamos el 50% del proyecto por el tiempo invertido."
  },
  inmobiliarias: {
    title: "Ejemplo: Compra de Casa con Kustodia",
    subtitle: "Como funciona nuestro sistema de custodia",
    scenario: "Compras una casa de $2,500,000 pesos - Casos reales de redes sociales",
    scenarioType: "compra_casa",
    steps: [
      {
        title: "Depositas tu dinero",
        description: "$2,500,000 quedan protegidos en custodia",
        icon: 'check' as const,
        color: 'green' as const
      },
      {
        title: "Adjuntas documentos",
        description: "Contratos y escrituras quedan registrados",
        icon: 'shield' as const,
        color: 'blue' as const
      },
      {
        title: "Ambas partes confirman",
        description: "El vendedor recibe el pago cuando confirmas",
        icon: 'money' as const,
        color: 'purple' as const
      }
    ],
    warningText: "Si algo sale mal: Nuestro sistema de disputas protege tu dinero."
  },
  marketplaces: {
    title: "Ejemplo: Compra de laptop de $25,000",
    subtitle: "Protección total para compradores y vendedores",
    amount: "$25,000",
    scenario: "compra_laptop",
    steps: [
      {
        title: "Comprador paga",
        description: "$25,000 quedan en custodia segura",
        icon: 'check' as const,
        color: 'green' as const
      },
      {
        title: "Vendedor envía producto",
        description: "Rastreo completo del envío",
        icon: 'clock' as const,
        color: 'blue' as const
      },
      {
        title: "Comprador recibe y confirma",
        description: "Producto en perfectas condiciones",
        icon: 'shield' as const,
        color: 'purple' as const
      },
      {
        title: "Vendedor recibe pago",
        description: "Transferencia automática al vendedor",
        icon: 'money' as const,
        color: 'yellow' as const
      }
    ],
    warningText: "Si el producto no llega o está dañado: Reembolso completo al comprador en 48 horas."
  },
  ecommerce: {
    title: "Ejemplo: Venta en tienda online de $8,500",
    subtitle: "Protección contra fraudes y chargebacks",
    amount: "$8,500",
    scenario: "venta_online",
    steps: [
      {
        title: "Cliente realiza compra",
        description: "Verificación automática anti-fraude",
        icon: 'shield' as const,
        color: 'green' as const
      },
      {
        title: "Procesas el pedido",
        description: "Pago protegido durante el envío",
        icon: 'clock' as const,
        color: 'blue' as const
      },
      {
        title: "Cliente recibe producto",
        description: "Confirmación automática de entrega",
        icon: 'check' as const,
        color: 'purple' as const
      },
      {
        title: "Recibes tu dinero",
        description: "Sin riesgo de chargebacks",
        icon: 'money' as const,
        color: 'yellow' as const
      }
    ],
    warningText: "Si hay un chargeback fraudulento: Nosotros cubrimos la pérdida, tú no pagas nada."
  },
  b2b: {
    title: "Ejemplo: Pago a proveedor de $500,000",
    subtitle: "Transacciones B2B seguras y auditables",
    amount: "$500,000",
    scenario: "pago_proveedor",
    steps: [
      {
        title: "Empresa autoriza pago",
        description: "Múltiples aprobaciones corporativas",
        icon: 'check' as const,
        color: 'green' as const
      },
      {
        title: "Fondos en custodia",
        description: "$500,000 protegidos hasta entrega",
        icon: 'shield' as const,
        color: 'blue' as const
      },
      {
        title: "Proveedor cumple contrato",
        description: "Verificación de entregables",
        icon: 'clock' as const,
        color: 'purple' as const
      },
      {
        title: "Pago automático",
        description: "Transferencia con auditoría completa",
        icon: 'money' as const,
        color: 'yellow' as const
      }
    ],
    warningText: "Si el proveedor no cumple: Reembolso completo con documentación para auditoría."
  }
};

const iconComponents = {
  check: FaCheckCircle,
  clock: FaCheckCircle,
  shield: FaCheckCircle,
  money: FaCheckCircle
};

const colorClasses = {
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  yellow: 'bg-yellow-50 text-yellow-600'
};

export default function SimpleExample({ 
  vertical = 'inmobiliarias',
  title,
  subtitle,
  amount,
  scenario,
  steps,
  warningText
}: SimpleExampleProps) {
  const [showExample, setShowExample] = useState(false);
  
  const config = verticalExamples[vertical as keyof typeof verticalExamples] || verticalExamples.inmobiliarias;
  
  const displayTitle = title || config.title;
  const displaySubtitle = subtitle || config.subtitle;
  const displaySteps = steps || config.steps;
  const displayWarning = warningText || config.warningText;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {displayTitle}
        </h3>
        <p className="text-lg text-gray-600 mb-6">
          {displaySubtitle}
        </p>
        
        <button 
          onClick={() => setShowExample(!showExample)}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center mx-auto"
        >
          {showExample ? (
            <>
              <FaEye className="mr-2" />
              Ocultar ejemplo
            </>
          ) : (
            <>
              <FaPlay className="mr-2" />
              Ver ejemplo simple
            </>
          )}
        </button>
      </div>
      
      {showExample && (
        <div className="max-w-2xl mx-auto mt-8">
          <div className="space-y-4">
            {displaySteps.map((step, index) => {
              const IconComponent = iconComponents[step.icon];
              return (
                <div key={index} className={`flex items-center p-4 ${colorClasses[step.color]} rounded-lg`}>
                  <IconComponent className={`mr-3 text-${step.color}-600`} />
                  <div>
                    <p className="font-semibold">{index + 1}. {step.title}</p>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-yellow-800">
              <strong>Si algo sale mal:</strong> {displayWarning}
            </p>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-center space-x-8 text-sm text-gray-600">
              <div className="text-center">
                <div className="font-semibold text-gray-900">24h</div>
                <div>Tiempo de resolución</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">100%</div>
                <div>Casos resueltos</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">0%</div>
                <div>Pérdidas de usuarios</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
