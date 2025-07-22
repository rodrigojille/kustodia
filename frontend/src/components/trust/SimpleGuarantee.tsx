import { FaShieldAlt, FaCheckCircle, FaClock, FaUniversity } from 'react-icons/fa';

interface SimpleGuaranteeProps {
  vertical?: string;
  title?: string;
  description?: string;
  guarantees?: string[];
}

const verticalGuarantees = {
  freelancer: {
    title: "Garantía de Pago",
    description: "Tu trabajo está protegido. Si el cliente no paga, nosotros te pagamos.",
    guarantees: [
      "Pago garantizado al completar el trabajo",
      "Devolución si el cliente cancela",
      "Soporte 24/7 en español"
    ]
  },
  inmobiliarias: {
    title: "Garantía Bancaria",
    description: "Tu dinero está protegido igual que en el banco. Si algo sale mal, te devolvemos todo en 24 horas.",
    guarantees: [
      "Protección total de fondos",
      "Devolución garantizada",
      "Regulado por CNBV"
    ]
  },
  marketplaces: {
    title: "Garantía de Compra Segura",
    description: "Compradores y vendedores protegidos. Tu dinero seguro hasta recibir el producto.",
    guarantees: [
      "Reembolso si no recibes el producto",
      "Verificación de vendedores",
      "Resolución de disputas en 48 horas"
    ]
  },
  ecommerce: {
    title: "Garantía Anti-Fraude",
    description: "Protección total contra fraudes. Tu tienda y tus clientes están seguros.",
    guarantees: [
      "Protección contra chargebacks",
      "Verificación de compradores",
      "Seguro contra fraudes"
    ]
  },
  b2b: {
    title: "Garantía Empresarial",
    description: "Pagos B2B seguros con cumplimiento regulatorio. Tu empresa protegida.",
    guarantees: [
      "Cumplimiento CNBV y SAT",
      "Auditoría completa de transacciones",
      "Soporte empresarial dedicado"
    ]
  }
};

export default function SimpleGuarantee({ 
  vertical = 'inmobiliarias',
  title,
  description,
  guarantees
}: SimpleGuaranteeProps) {
  const config = verticalGuarantees[vertical as keyof typeof verticalGuarantees] || verticalGuarantees.inmobiliarias;
  
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayGuarantees = guarantees || config.guarantees;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-8 mb-12 border-2 border-green-200">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaShieldAlt className="text-green-700 text-4xl" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          {displayTitle}
        </h3>
        <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
          {displayDescription}
        </p>
        <div className="bg-white rounded-xl p-6 shadow-inner">
          {displayGuarantees.map((guarantee, index) => (
            <p key={index} className="text-lg font-semibold text-green-800 mb-2 last:mb-0">
              ✓ {guarantee}
            </p>
          ))}
        </div>
        
        {/* Trust badges */}
        <div className="flex justify-center space-x-6 mt-6 pt-6 border-t border-green-200">
          <div className="flex items-center text-sm text-gray-600">
            <FaUniversity className="mr-2 text-blue-600" />
            Regulado por CNBV
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaClock className="mr-2 text-green-600" />
            Devolución en 24h
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaCheckCircle className="mr-2 text-purple-600" />
            +1,000 transacciones
          </div>
        </div>
      </div>
    </div>
  );
}
