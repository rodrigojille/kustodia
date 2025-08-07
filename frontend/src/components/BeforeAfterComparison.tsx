'use client';

import { useState } from 'react';
import { FaCar, FaHome, FaLaptop, FaShoppingCart } from 'react-icons/fa';

interface Scenario {
  id: string;
  title: string;
  icon: React.ReactNode;
  amount: string;
  before: {
    steps: string[];
    risk: string;
    emotion: string;
  };
  after: {
    steps: string[];
    benefit: string;
    emotion: string;
  };
}

const scenarios: Scenario[] = [
  {
    id: 'auto',
    title: 'Venta de auto',
    icon: <FaCar className="w-6 h-6" />,
    amount: '$180,000',
    before: {
      steps: [
        '1. Comprador transfiere $180,000',
        '2. Vendedor puede desaparecer con el dinero',
        '3. 😰 Perdiste tu dinero y no tienes el auto'
      ],
      risk: 'Alto riesgo de estafa',
      emotion: '😰'
    },
    after: {
      steps: [
        '1. Comprador paga a Kustodia ($180,000)',
        '2. Vendedor entrega auto + papeles',
        '3. 😊 Kustodia libera el pago automáticamente'
      ],
      benefit: 'Cero riesgo para ambos',
      emotion: '😊'
    }
  },
  {
    id: 'renta',
    title: 'Depósito de renta',
    icon: <FaHome className="w-6 h-6" />,
    amount: '$25,000',
    before: {
      steps: [
        '1. Inquilino da depósito de $25,000',
        '2. Propietario puede no regresarlo',
        '3. 😤 Perdiste tu depósito sin razón'
      ],
      risk: 'Depósitos perdidos',
      emotion: '😤'
    },
    after: {
      steps: [
        '1. Inquilino paga depósito a Kustodia',
        '2. Al salir, se revisa el inmueble',
        '3. 🏠 Depósito regresa si todo está bien'
      ],
      benefit: 'Depósito protegido siempre',
      emotion: '🏠'
    }
  },
  {
    id: 'freelance',
    title: 'Trabajo freelance',
    icon: <FaLaptop className="w-6 h-6" />,
    amount: '$50,000',
    before: {
      steps: [
        '1. Cliente paga $50,000 por adelantado',
        '2. Freelancer puede no entregar',
        '3. 😡 Pagaste y no recibiste nada'
      ],
      risk: 'Pagos sin entrega',
      emotion: '😡'
    },
    after: {
      steps: [
        '1. Cliente paga a Kustodia',
        '2. Freelancer entrega el trabajo',
        '3. 🎉 Pago se libera al aprobar el trabajo'
      ],
      benefit: 'Solo pagas por trabajo entregado',
      emotion: '🎉'
    }
  }
];

export default function BeforeAfterComparison() {
  const [activeScenario, setActiveScenario] = useState<string>('auto');
  
  const currentScenario = scenarios.find(s => s.id === activeScenario) || scenarios[0];

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Scenario Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => setActiveScenario(scenario.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeScenario === scenario.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            <div className={activeScenario === scenario.id ? 'text-white' : 'text-blue-600'}>
              {scenario.icon}
            </div>
            <span>{scenario.title}</span>
            <span className="text-sm font-bold">{scenario.amount}</span>
          </button>
        ))}
      </div>

      {/* Before/After Comparison */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* BEFORE - Traditional Way */}
          <div className="bg-red-50 p-8 border-r border-red-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-3 bg-red-100 px-4 py-2 rounded-full mb-4">
                <span className="text-2xl">{currentScenario.before.emotion}</span>
                <h3 className="text-lg font-bold text-red-800">Forma tradicional</h3>
              </div>
              <p className="text-red-600 font-medium">{currentScenario.before.risk}</p>
            </div>
            
            <div className="space-y-4">
              {currentScenario.before.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    index === currentScenario.before.steps.length - 1 ? 'bg-red-500' : 'bg-red-400'
                  }`}>
                    {index + 1}
                  </div>
                  <p className={`text-sm ${
                    index === currentScenario.before.steps.length - 1 ? 'text-red-700 font-semibold' : 'text-red-600'
                  }`}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AFTER - With Kustodia */}
          <div className="bg-green-50 p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-3 bg-green-100 px-4 py-2 rounded-full mb-4">
                <span className="text-2xl">{currentScenario.after.emotion}</span>
                <h3 className="text-lg font-bold text-green-800">Con Kustodia</h3>
              </div>
              <p className="text-green-600 font-medium">{currentScenario.after.benefit}</p>
            </div>
            
            <div className="space-y-4">
              {currentScenario.after.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    index === currentScenario.after.steps.length - 1 ? 'bg-green-500' : 'bg-green-400'
                  }`}>
                    {index + 1}
                  </div>
                  <p className={`text-sm ${
                    index === currentScenario.after.steps.length - 1 ? 'text-green-700 font-semibold' : 'text-green-600'
                  }`}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 text-center border-t border-gray-100">
          <p className="text-lg text-gray-700 mb-4">
            <span className="font-semibold text-blue-600">¿Ya viste la diferencia?</span> Con Kustodia, todos ganan.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Compradores protegidos
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Vendedores seguros
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
