'use client';
import React, { useState, useEffect } from 'react';
import { useAnalyticsContext } from '../../../components/AnalyticsProvider';
import Header from '../../../components/Header';
import { 
  FaHandshake, 
  FaShieldAlt, 
  FaRegSmile, 
  FaCar,
  FaMobile,
  FaCogs,
  FaCouch,
  FaCalculator,
  FaEye,
  FaUpload,
  FaCheckCircle,
  FaClock,
  FaGavel,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaFileContract
} from 'react-icons/fa';
import Link from 'next/link';
import InterestRegistrationForm from '../../../components/InterestRegistrationForm';

// Purchase categories with typical fraud scenarios
const purchaseCategories = {
  cars: {
    icon: FaCar,
    title: 'Vehículos',
    color: 'blue',
    examples: ['Auto usado', 'Motocicleta', 'Camioneta', 'Auto clásico'],
    fraudScenarios: [
      'Vendedor desaparece después del anticipo',
      'Vehículo con adeudos o problemas legales',
      'Documentos falsos o alterados',
      'Condición del vehículo no coincide con lo descrito'
    ],
    avgValue: 150000,
    riskLevel: 'Alto'
  },
  electronics: {
    icon: FaMobile,
    title: 'Electrónicos',
    color: 'green',
    examples: ['iPhone', 'Laptop', 'Consola', 'Cámara profesional'],
    fraudScenarios: [
      'Producto robado o reportado',
      'Dispositivo bloqueado o con iCloud',
      'Especificaciones falsas o producto dañado',
      'Vendedor fantasma con perfiles falsos'
    ],
    avgValue: 25000,
    riskLevel: 'Medio'
  },
  machinery: {
    icon: FaCogs,
    title: 'Maquinaria',
    color: 'purple',
    examples: ['Herramienta industrial', 'Equipo de construcción', 'Maquinaria agrícola', 'Equipo médico'],
    fraudScenarios: [
      'Maquinaria en mal estado o inoperante',
      'Falta de garantías o manuales',
      'Vendedor sin autorización para vender',
      'Equipo con deudas o embargos'
    ],
    avgValue: 80000,
    riskLevel: 'Alto'
  },
  furniture: {
    icon: FaCouch,
    title: 'Muebles',
    color: 'orange',
    examples: ['Sala completa', 'Recámara', 'Comedor', 'Muebles de oficina'],
    fraudScenarios: [
      'Muebles dañados o en mal estado',
      'Medidas incorrectas o no coinciden',
      'Material diferente al descrito',
      'Vendedor no entrega después del pago'
    ],
    avgValue: 35000,
    riskLevel: 'Medio'
  }
};

interface PurchaseCalculatorProps {
  onCalculate: (data: any) => void;
}

function PurchaseCalculator({ onCalculate }: PurchaseCalculatorProps) {
  const analytics = useAnalyticsContext();
  const [selectedCategory, setSelectedCategory] = useState('cars');
  const [purchaseValue, setPurchaseValue] = useState('');
  const [escrowDays, setEscrowDays] = useState('7');
  const [calculatedData, setCalculatedData] = useState<any>(null);

  const handleCalculate = () => {
    const value = parseFloat(purchaseValue);
    const days = parseInt(escrowDays);
    const category = purchaseCategories[selectedCategory as keyof typeof purchaseCategories];
    
    if (value && days && category) {
      const data = {
        category: category.title,
        purchaseValue: value,
        escrowDays: days,
        protectionFee: Math.max(value * 0.02, 50), // 2% min $50
        releaseDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX'),
        riskLevel: category.riskLevel
      };
      setCalculatedData(data);
      onCalculate(data);
      
      // Track calculator usage
      analytics.trackEvent('compraventa_calculator_used', {
        category: category.title,
        purchase_value: value,
        escrow_days: days,
        protection_fee: data.protectionFee,
        risk_level: category.riskLevel,
        page_type: 'enhanced_demo'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaCalculator className="text-blue-600 text-2xl" />
        <h3 className="text-2xl font-bold text-gray-900">Calculadora de Protección</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Categoría de Compra
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(purchaseCategories).map(([key, category]) => (
              <option key={key} value={key}>{category.title}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Valor de Compra (MXN)
          </label>
          <input
            type="number"
            value={purchaseValue}
            onChange={(e) => setPurchaseValue(e.target.value)}
            placeholder={purchaseCategories[selectedCategory as keyof typeof purchaseCategories].avgValue.toString()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Días de Protección
          </label>
          <select
            value={escrowDays}
            onChange={(e) => setEscrowDays(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="3">3 días</option>
            <option value="7">7 días</option>
            <option value="14">14 días</option>
            <option value="30">30 días</option>
          </select>
        </div>
      </div>
      
      <button
        onClick={handleCalculate}
        className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 mb-6"
      >
        Calcular Protección
      </button>
      
      {calculatedData && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="font-bold text-blue-800 mb-4">Resumen de Protección</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-700">Categoría:</span>
              <span className="font-bold text-blue-800">{calculatedData.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Valor protegido:</span>
              <span className="font-bold text-blue-800">{formatCurrency(calculatedData.purchaseValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Tarifa de protección:</span>
              <span className="font-bold text-blue-800">{formatCurrency(calculatedData.protectionFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Liberación estimada:</span>
              <span className="font-bold text-blue-800">{calculatedData.releaseDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Nivel de riesgo:</span>
              <span className={`font-bold ${calculatedData.riskLevel === 'Alto' ? 'text-red-600' : calculatedData.riskLevel === 'Medio' ? 'text-yellow-600' : 'text-green-600'}`}>
                {calculatedData.riskLevel}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FraudScenariosDemo() {
  const [selectedCategory, setSelectedCategory] = useState('cars');
  const category = purchaseCategories[selectedCategory as keyof typeof purchaseCategories];
  const IconComponent = category.icon;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaExclamationTriangle className="text-red-600 text-2xl" />
        <h3 className="text-2xl font-bold text-gray-900">Fraudes Comunes por Categoría</h3>
      </div>
      
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
        {Object.entries(purchaseCategories).map(([key, cat]) => {
          const Icon = cat.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                selectedCategory === key
                  ? `bg-${cat.color}-100 text-${cat.color}-800 border-2 border-${cat.color}-300`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="text-sm sm:text-lg" />
              <span className="hidden sm:inline">{cat.title}</span>
              <span className="sm:hidden">{cat.title.slice(0, 4)}</span>
            </button>
          );
        })}
      </div>
      
      <div className="bg-red-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <IconComponent className={`text-2xl text-${category.color}-600`} />
          <h4 className="font-bold text-red-800">{category.title} - Fraudes Típicos</h4>
        </div>
        
        <div className="space-y-3">
          {category.fraudScenarios.map((scenario, index) => (
            <div key={index} className="flex items-start gap-3">
              <FaExclamationTriangle className="text-red-500 text-sm mt-1 flex-shrink-0" />
              <p className="text-red-700 text-sm">{scenario}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-green-100 rounded-lg">
          <p className="text-green-800 font-semibold text-sm">
            ✅ Con Kustodia, estos fraudes son IMPOSIBLES - Tu dinero está protegido hasta verificar todo
          </p>
        </div>
      </div>
    </div>
  );
}

function TransactionFlowDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: 'Acuerdo Inicial',
      description: 'Comprador y vendedor acuerdan términos, precio y condiciones de entrega',
      icon: FaHandshake,
      color: 'blue'
    },
    {
      title: 'Pago en Custodia',
      description: 'Comprador deposita el dinero en custodia segura de Kustodia',
      icon: FaShieldAlt,
      color: 'green'
    },
    {
      title: 'Entrega del Producto',
      description: 'Vendedor entrega el producto según las condiciones acordadas',
      icon: FaUpload,
      color: 'purple'
    },
    {
      title: 'Verificación',
      description: 'Comprador verifica que el producto cumple con lo acordado',
      icon: FaEye,
      color: 'orange'
    },
    {
      title: 'Liberación de Pago',
      description: 'Una vez verificado, el pago se libera automáticamente al vendedor',
      icon: FaCheckCircle,
      color: 'emerald'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaFileContract className="text-blue-600 text-2xl" />
        <h3 className="text-2xl font-bold text-gray-900">Flujo de Transacción Segura</h3>
      </div>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-500 ${
                isActive
                  ? `bg-${step.color}-50 border-2 border-${step.color}-300 scale-105`
                  : isCompleted
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isActive
                    ? `bg-${step.color}-100`
                    : isCompleted
                    ? 'bg-green-100'
                    : 'bg-gray-100'
                }`}
              >
                <IconComponent
                  className={`text-xl ${
                    isActive
                      ? `text-${step.color}-600`
                      : isCompleted
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                />
              </div>
              
              <div className="flex-1">
                <h4
                  className={`font-semibold ${
                    isActive
                      ? `text-${step.color}-800`
                      : isCompleted
                      ? 'text-green-800'
                      : 'text-gray-600'
                  }`}
                >
                  {step.title}
                </h4>
                <p
                  className={`text-sm ${
                    isActive
                      ? `text-${step.color}-700`
                      : isCompleted
                      ? 'text-green-700'
                      : 'text-gray-500'
                  }`}
                >
                  {step.description}
                </p>
              </div>
              
              {isCompleted && (
                <FaCheckCircle className="text-green-600 text-xl" />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-center">
        <div className="flex justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Paso {currentStep + 1} de {steps.length} - Proceso automático
        </p>
      </div>
    </div>
  );
}

export default function CompraVentaEnhanced() {
  const analytics = useAnalyticsContext();
  const [calculatorData, setCalculatorData] = useState<any>(null);

  const handleCalculatorUse = (data: any) => {
    setCalculatorData(data);
    // Analytics tracking is already handled in the calculator component
  };
  
  const handleCategoryInteraction = (category: string, action: string) => {
    analytics.trackEvent('compraventa_category_interaction', {
      category,
      action,
      page_type: 'enhanced_demo'
    });
  };

  return (
    <>
      <header>
        <title>Compra-venta segura entre particulares - Calculadora | Kustodia</title>
        <meta name="description" content="Calcula la protección para tus compras de autos, electrónicos y maquinaria. Evita fraudes con custodia blockchain. Demos interactivas y calculadoras." />
        <meta name="keywords" content="compra venta segura, calculadora protección, autos usados, electrónicos, maquinaria, evitar fraudes, custodia blockchain" />
        <link rel="canonical" href="https://kustodia.mx/compra-venta/enhanced" />
      </header>
      
      <Header isAuthenticated={false} userName={''} />
      
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen px-4 pt-10 pb-20">
        {/* Hero Section with Calculator */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20 mt-20">
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-8 mx-auto">
              <FaHandshake className="text-blue-700 text-4xl" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Compra-venta segura entre particulares
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Protege tus compras de autos, electrónicos y maquinaria con custodia blockchain. 
              Calcula tu protección y evita fraudes comunes.
            </p>
          </div>

          {/* Interactive Calculator in Hero */}
          <div className="mb-8">
            <PurchaseCalculator onCalculate={handleCalculatorUse} />
          </div>
        </section>

        {/* Fraud Scenarios Demo */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20">
          <FraudScenariosDemo />
        </section>

        {/* Transaction Flow Demo */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20">
          <TransactionFlowDemo />
        </section>

        {/* Category Benefits */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Protección Especializada por Categoría
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Cada tipo de compra tiene riesgos específicos. Kustodia los conoce y los previene.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Object.entries(purchaseCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <div key={key} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 text-center hover:shadow-xl transition-all duration-300">
                  <div className={`w-16 h-16 bg-${category.color}-100 rounded-full flex items-center justify-center mb-6 mx-auto`}>
                    <IconComponent className={`text-${category.color}-600 text-2xl`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{category.title}</h3>
                  
                  <div className="space-y-2 mb-6">
                    {category.examples.map((example, index) => (
                      <div key={index} className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-1">
                        {example}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Valor promedio</div>
                    <div className="text-lg font-bold text-gray-900">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(category.avgValue)}
                    </div>
                    <div className={`text-sm font-medium mt-2 ${
                      category.riskLevel === 'Alto' ? 'text-red-600' : 
                      category.riskLevel === 'Medio' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      Riesgo: {category.riskLevel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20 text-center">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              ¿Listo para comprar sin riesgos?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Únete a los mexicanos que ya protegen sus compras entre particulares con Kustodia
            </p>
            
            <div className="flex justify-center">
              <button 
                onClick={() => document.getElementById('interest-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                🚀 Acceso Prioritario
              </button>
            </div>
            
            {calculatorData && (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">
                  💡 Tu protección calculada: {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(calculatorData.protectionFee)} para {calculatorData.category}
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Valor protegido: {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(calculatorData.purchaseValue)}
                </p>
              </div>
            )}
          </div>
        </section>
        
        {/* Interest Registration Form */}
        <section className="w-full max-w-4xl px-6 mx-auto pb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Te interesa proteger tus compras?
            </h2>
            <p className="text-lg text-gray-600">
              Regístrate para acceso temprano a nuestra plataforma de protección
            </p>
          </div>
          <div id="interest-form" className="text-center">
            <InterestRegistrationForm
              source="compra_venta_enhanced_landing"
              vertical="compra-venta"
              title="Registro Prioritario"
              subtitle="Regístrate para acceso prioritario exclusivo"
              buttonText="Registro Prioritario"
            />
          </div>
        </section>
      </main>
    </>
  );
}
