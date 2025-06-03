import React from 'react';
import { FaHome, FaHandshake, FaCar, FaIndustry, FaTools, FaBolt, FaBuilding, FaShieldAlt, FaGavel } from 'react-icons/fa';

const useCases = [
  {
    icon: <FaHome size={40} className="text-blue-700 mb-3" />,
    color: 'bg-blue-50 border-blue-200',
    title: 'Quiero asegurar mi comisión inmobiliaria',
    problem: '¿Te preocupa que no te paguen tu comisión tras cerrar una venta o renta?',
    solution: 'Kustodia libera tu comisión solo cuando se cumplen las condiciones. Sin promesas, sin abogados, sin riesgos.',
    cta: 'Proteger mi comisión'
  },
  {
    icon: <FaHandshake size={40} className="text-green-700 mb-3" />,
    color: 'bg-green-50 border-green-200',
    title: 'Quiero proteger mis anticipos profesionales',
    problem: '¿Te han quedado mal con pagos de proyectos o consultorías?',
    solution: 'Con Kustodia, tu anticipo se libera solo si se cumple el servicio. Tú decides las condiciones.',
    cta: 'Proteger mi anticipo'
  },
  {
    icon: <FaCar size={40} className="text-indigo-700 mb-3" />,
    color: 'bg-indigo-50 border-indigo-200',
    title: 'Quiero comprar o vender sin riesgos',
    problem: '¿Desconfías al comprar o vender entre particulares?',
    solution: 'Kustodia retiene el dinero y solo lo libera cuando ambas partes cumplen. Así, nadie pierde.',
    cta: 'Comprar/vender seguro'
  },
  {
    icon: <FaIndustry size={40} className="text-amber-700 mb-3" />,
    color: 'bg-amber-50 border-amber-200',
    title: 'Quiero proteger mi negocio',
    problem: '¿Te preocupa pagar por adelantado, incumplimientos o problemas en producción, talleres u obras?',
    solution: 'Kustodia libera el pago por avance y solo cuando tú lo apruebas. Perfecto para producción, maquila, talleres y obras.',
    cta: 'Proteger mi negocio'
  },
];

export default function KustodiaUseCases() {
  // Scroll to the form when CTA is clicked
  const scrollToForm = () => {
    const form = document.querySelector('form');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-7 my-10">
      {useCases.map((uc, i) => (
        <div
          key={i}
          className={`relative rounded-2xl shadow-xl p-7 flex flex-col items-start border ${uc.color} transition-transform hover:-translate-y-1 hover:shadow-2xl`}
        >
          {uc.icon}
          <h3 className="text-xl font-extrabold text-indigo-900 mb-2 leading-tight">{uc.title}</h3>
          <div className="text-gray-700 text-sm mb-1">{uc.problem}</div>
          <div className="text-gray-900 text-sm mb-4">{uc.solution}</div>
          <button
            onClick={scrollToForm}
            className="mt-auto w-full bg-gradient-to-r from-indigo-500 to-blue-400 text-white py-2 rounded-lg font-semibold text-base shadow hover:from-indigo-600 hover:to-blue-500 transition"
          >
            {uc.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
