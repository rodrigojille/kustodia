import React from 'react';
import { FaShieldAlt, FaLock, FaCheckCircle, FaGavel } from 'react-icons/fa';

interface SimpleGuaranteeProps {
  vertical?: string;
  title?: string;
  subtitle?: string;
}

const verticalGuarantees = {
  freelancer: {
    title: "Proteccion para Freelancers",
    subtitle: "Tu trabajo protegido hasta recibir el pago",
    guarantees: [
      "Pago garantizado al completar el trabajo",
      "Dinero en custodia antes de empezar",
      "Disputas resueltas en tu favor",
      "Proteccion contra clientes morosos"
    ],
    badge: "Pago Garantizado"
  },
  inmobiliarias: {
    title: "Proteccion Total para Inmobiliarias",
    subtitle: "Custodia segura para anticipos, apartados y rentas",
    guarantees: [
      "Tu dinero permanece en custodia hasta que ambas partes confirmen",
      "Sistema de disputas que devuelve el dinero al comprador si procede",
      "Adjunta contratos y documentos importantes de forma segura",
      "Comisiones automaticas para agentes e intermediarios"
    ],
    badge: "Escrow Seguro"
  },
  marketplaces: {
    title: "Proteccion para Compradores y Vendedores",
    subtitle: "Tu dinero seguro hasta recibir el producto",
    guarantees: [
      "Dinero en custodia hasta recibir producto",
      "Verificacion de vendedores",
      "Disputas resueltas en tu favor",
      "Proteccion contra estafas"
    ],
    badge: "Compra Segura"
  },
  ecommerce: {
    title: "Proteccion Anti-Fraude para E-commerce",
    subtitle: "Tu tienda y tus clientes protegidos",
    guarantees: [
      "Proteccion contra chargebacks",
      "Verificacion de compradores",
      "Disputas resueltas automaticamente",
      "Prevencion de fraudes"
    ],
    badge: "Anti-Fraude"
  },
  b2b: {
    title: "Proteccion Empresarial B2B",
    subtitle: "Pagos empresariales seguros y transparentes",
    guarantees: [
      "Escrow para pagos grandes",
      "Auditoria completa de transacciones",
      "Resolucion de disputas empresariales",
      "Soporte empresarial dedicado"
    ],
    badge: "B2B Seguro"
  }
};

export default function SimpleGuarantee({ 
  vertical = 'inmobiliarias',
  title,
  subtitle
}: SimpleGuaranteeProps) {
  const config = verticalGuarantees[vertical as keyof typeof verticalGuarantees] || verticalGuarantees.inmobiliarias;
  
  const displayTitle = title || config.title;
  const displaySubtitle = subtitle || config.subtitle;
  const displayGuarantees = config.guarantees;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-8 mb-12 border-2 border-green-200">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaShieldAlt className="text-green-700 text-4xl" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          {displayTitle}
        </h3>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {displaySubtitle}
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
          {displayGuarantees.map((guarantee: string, index: number) => (
            <div key={index} className="flex items-center bg-white rounded-lg p-4 shadow-md">
              <FaCheckCircle className="text-green-600 text-xl mr-4 flex-shrink-0" />
              <span className="text-gray-800 font-medium">{guarantee}</span>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex justify-center space-x-6 pt-6 border-t border-gray-200">
          <div className="flex items-center text-green-700">
            <FaLock className="mr-2" />
            <span className="font-semibold">{config.badge}</span>
          </div>
          <div className="flex items-center text-blue-700">
            <FaGavel className="mr-2" />
            <span className="font-semibold">Disputas Resueltas</span>
          </div>
        </div>

        {/* How it works - fraud prevention focus */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Como te protegemos:
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Dinero en Custodia</h4>
              <p className="text-gray-600 text-sm">
                Tu dinero se mantiene seguro hasta que todo este correcto
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Validacion Mutua</h4>
              <p className="text-gray-600 text-sm">
                Ambas partes confirman que todo esta correcto y suben documentos
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Disputas</h4>
              <p className="text-gray-600 text-sm">
                Si algo sale mal, resolvemos la disputa y devolvemos tu dinero
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
