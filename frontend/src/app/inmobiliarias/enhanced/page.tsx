'use client';
import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import { 
  FaHome, 
  FaShieldAlt, 
  FaRegSmile, 
  FaHandshake, 
  FaArrowRight, 
  FaFileContract,
  FaCalculator,
  FaEye,
  FaUpload,
  FaCheckCircle,
  FaClock,
  FaGavel,
  FaRobot
} from 'react-icons/fa';
import Link from 'next/link';
import { useAnalyticsContext } from '../../../components/AnalyticsProvider';

// Mock CLABE generation for demo
const generateMockClabe = () => {
  const bankCode = '646'; // STP bank code
  const locationCode = '180'; // Mexico City
  const accountNumber = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  const checkDigit = Math.floor(Math.random() * 10);
  return `${bankCode}${locationCode}${accountNumber}${checkDigit}`;
};

interface PropertyEscrowCalculatorProps {
  onCalculate: (data: any) => void;
}

function PropertyEscrowCalculator({ onCalculate }: PropertyEscrowCalculatorProps) {
  const [propertyValue, setPropertyValue] = useState('');
  const [escrowPercentage, setEscrowPercentage] = useState('10');
  const [escrowDays, setEscrowDays] = useState('30');
  const [calculatedData, setCalculatedData] = useState<any>(null);
  const [showClabe, setShowClabe] = useState(false);

  const handleCalculate = () => {
    const value = parseFloat(propertyValue);
    const percentage = parseFloat(escrowPercentage);
    const days = parseInt(escrowDays);
    
    if (value && percentage && days) {
      const escrowAmount = (value * percentage) / 100;
      const data = {
        propertyValue: value,
        escrowAmount,
        escrowPercentage: percentage,
        escrowDays: days,
        clabe: generateMockClabe(),
        releaseDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX')
      };
      setCalculatedData(data);
      onCalculate(data);
      setShowClabe(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaCalculator className="text-blue-600 text-2xl" />
        <h3 className="text-2xl font-bold text-gray-900">Calculadora de Custodia Inmobiliaria</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Valor de la Propiedad (MXN)
          </label>
          <input
            type="number"
            value={propertyValue}
            onChange={(e) => setPropertyValue(e.target.value)}
            placeholder="2,500,000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            % en Custodia
          </label>
          <select
            value={escrowPercentage}
            onChange={(e) => setEscrowPercentage(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="5">5% - Apartado</option>
            <option value="10">10% - Enganche</option>
            <option value="20">20% - Anticipo</option>
            <option value="100">100% - Pago Total</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Días en Custodia
          </label>
          <select
            value={escrowDays}
            onChange={(e) => setEscrowDays(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="15">15 días</option>
            <option value="30">30 días</option>
            <option value="45">45 días</option>
            <option value="60">60 días</option>
            <option value="90">90 días</option>
          </select>
        </div>
      </div>
      
      <button
        onClick={handleCalculate}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
      >
        Calcular Custodia y Generar CLABE
      </button>
      
      {calculatedData && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-green-800 text-lg mb-4">Resumen de Custodia</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-700">Valor Propiedad:</span>
                  <span className="font-semibold text-green-800">
                    ${calculatedData.propertyValue.toLocaleString('es-MX')} MXN
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Monto en Custodia:</span>
                  <span className="font-bold text-green-800 text-xl">
                    ${calculatedData.escrowAmount.toLocaleString('es-MX')} MXN
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Liberación:</span>
                  <span className="font-semibold text-green-800">{calculatedData.releaseDate}</span>
                </div>
              </div>
            </div>
            
            {showClabe && (
              <div>
                <h4 className="font-bold text-green-800 text-lg mb-4">CLABE Única Generada</h4>
                <div className="bg-white rounded-lg p-4 border border-green-300">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCheckCircle className="text-green-600" />
                    <span className="text-sm text-green-700 font-semibold">CLABE Lista para Recibir Pago</span>
                  </div>
                  <div className="font-mono text-lg font-bold text-gray-900 bg-gray-50 p-3 rounded border">
                    {calculatedData.clabe}
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    ✅ Esta CLABE está vinculada específicamente a esta transacción inmobiliaria
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentUploadPreview() {
  const [uploadStep, setUploadStep] = useState(0);
  const [documents, setDocuments] = useState([
    { name: 'Escritura Pública', uploaded: false, verified: false },
    { name: 'Certificado de Libertad de Gravamen', uploaded: false, verified: false },
    { name: 'Predial al Corriente', uploaded: false, verified: false },
    { name: 'Identificación Oficial', uploaded: false, verified: false }
  ]);

  const simulateUpload = () => {
    if (uploadStep < documents.length) {
      const newDocs = [...documents];
      newDocs[uploadStep].uploaded = true;
      setTimeout(() => {
        newDocs[uploadStep].verified = true;
        setDocuments([...newDocs]);
        setUploadStep(uploadStep + 1);
      }, 1500);
      setDocuments(newDocs);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaFileContract className="text-purple-600 text-2xl" />
        <h3 className="text-2xl font-bold text-gray-900">Verificación de Documentos</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Sube los documentos requeridos para la transacción. Nuestro sistema los verificará automáticamente.
      </p>
      
      <div className="space-y-4 mb-6">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                doc.verified ? 'bg-green-100' : doc.uploaded ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                {doc.verified ? (
                  <FaCheckCircle className="text-green-600 text-sm" />
                ) : doc.uploaded ? (
                  <FaClock className="text-yellow-600 text-sm animate-spin" />
                ) : (
                  <FaUpload className="text-gray-400 text-sm" />
                )}
              </div>
              <span className="font-medium text-gray-900">{doc.name}</span>
            </div>
            <div className="text-sm">
              {doc.verified ? (
                <span className="text-green-600 font-semibold">✅ Verificado</span>
              ) : doc.uploaded ? (
                <span className="text-yellow-600 font-semibold">🔄 Verificando...</span>
              ) : (
                <span className="text-gray-400">Pendiente</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={simulateUpload}
        disabled={uploadStep >= documents.length}
        className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 ${
          uploadStep >= documents.length
            ? 'bg-green-100 text-green-800 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transform hover:scale-[1.02] shadow-lg'
        }`}
      >
        {uploadStep >= documents.length ? '✅ Todos los Documentos Verificados' : `Subir ${documents[uploadStep]?.name}`}
      </button>
    </div>
  );
}

function DisputeResolutionPreview() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    {
      title: 'Disputa Reportada',
      description: 'El comprador reporta un problema con la propiedad',
      icon: <FaGavel className="text-red-600" />,
      status: 'completed'
    },
    {
      title: 'Análisis IA',
      description: 'Nuestro sistema de IA analiza la evidencia automáticamente',
      icon: <FaRobot className="text-blue-600" />,
      status: currentStep >= 1 ? 'completed' : 'pending'
    },
    {
      title: 'Revisión Humana',
      description: 'Un especialista revisa el caso y toma una decisión',
      icon: <FaEye className="text-green-600" />,
      status: currentStep >= 2 ? 'completed' : 'pending'
    },
    {
      title: 'Resolución Automática',
      description: 'Los fondos se liberan o devuelven según la decisión',
      icon: <FaCheckCircle className="text-purple-600" />,
      status: currentStep >= 3 ? 'completed' : 'pending'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < 3 ? prev + 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaShieldAlt className="text-orange-600 text-2xl" />
        <h3 className="text-2xl font-bold text-gray-900">Sistema de Resolución de Disputas</h3>
      </div>
      
      <p className="text-gray-600 mb-8">
        Si surge algún problema, nuestro sistema automatizado garantiza una resolución justa y rápida.
      </p>
      
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
              step.status === 'completed' 
                ? 'bg-green-50 border-green-200' 
                : index === currentStep 
                  ? 'bg-blue-50 border-blue-200 animate-pulse'
                  : 'bg-gray-50 border-gray-200'
            }`}>
              {step.icon}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold text-lg ${
                step.status === 'completed' ? 'text-green-800' : 'text-gray-900'
              }`}>
                {step.title}
                {step.status === 'completed' && <span className="ml-2 text-green-600">✅</span>}
                {index === currentStep && step.status !== 'completed' && <span className="ml-2 text-blue-600">🔄</span>}
              </h4>
              <p className="text-gray-600 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <FaRobot className="text-blue-600" />
          <span className="font-semibold text-blue-800">IA + Humano = Resolución Justa</span>
        </div>
        <p className="text-blue-700 text-sm">
          Combinamos análisis automatizado con revisión humana para garantizar decisiones justas en menos de 48 horas.
        </p>
      </div>
    </div>
  );
}

export default function InmobiliariasEnhanced() {
  const { trackEvent, trackUserAction } = useAnalyticsContext();
  const [calculatorData, setCalculatorData] = useState<any>(null);

  useEffect(() => {
    trackEvent('enhanced_real_estate_page_loaded', {
      journey_stage: 'awareness',
      page_variant: 'enhanced',
      features: ['calculator', 'document_upload', 'dispute_resolution'],
      referrer: typeof window !== 'undefined' ? document.referrer || 'direct' : 'unknown'
    });
  }, []);

  const handleCalculatorUse = (data: any) => {
    setCalculatorData(data);
    trackUserAction('property_calculator_used', {
      property_value: data.propertyValue,
      escrow_amount: data.escrowAmount,
      escrow_percentage: data.escrowPercentage,
      escrow_days: data.escrowDays,
      engagement_level: 'high'
    });
  };

  return (
    <>
      <header>
        <title>Ventas Inmobiliarias Seguras con Custodia Blockchain | Kustodia Enhanced</title>
        <meta name="description" content="Calcula tu custodia inmobiliaria, sube documentos y protege tu transacción con nuestro sistema avanzado de pagos seguros. Demo interactivo incluido." />
        <meta name="keywords" content="custodia inmobiliaria, calculadora escrow, documentos inmobiliarios, pagos seguros, blockchain inmobiliaria, CLABE única, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/inmobiliarias/enhanced" />
      </header>
      
      <Header isAuthenticated={false} userName={''} />
      
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen px-4 pt-10 pb-20">
        {/* Hero Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20 mt-20">
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-8 mx-auto">
              <FaHome className="text-blue-700 text-4xl" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Ventas Inmobiliarias sin Riesgos
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
              Calcula tu custodia, sube documentos y protege cada peso con tecnología blockchain. 
              <span className="text-blue-600 font-semibold"> Todo en un solo lugar.</span>
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <FaCalculator className="text-blue-600" />
                <span className="text-gray-700 font-medium">Calculadora Integrada</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <FaFileContract className="text-purple-600" />
                <span className="text-gray-700 font-medium">Verificación de Documentos</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <FaRobot className="text-green-600" />
                <span className="text-gray-700 font-medium">Resolución IA</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Calculator Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20">
          <PropertyEscrowCalculator onCalculate={handleCalculatorUse} />
        </section>

        {/* Document Upload Preview */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20">
          <DocumentUploadPreview />
        </section>

        {/* Dispute Resolution Preview */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20">
          <DisputeResolutionPreview />
        </section>

        {/* Benefits Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              ¿Por qué elegir Kustodia para inmobiliarias?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Protección Total</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                Cada peso está protegido hasta que se cumplan todas las condiciones acordadas.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <FaHandshake className="text-green-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Confianza Mutua</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                Compradores y vendedores operan con total transparencia y seguridad.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <FaRobot className="text-purple-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Automatización IA</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                Resolución de disputas automatizada y justa en menos de 48 horas.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20 text-center">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              ¿Listo para revolucionar tus ventas inmobiliarias?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Únete a los agentes inmobiliarios que ya protegen sus transacciones con Kustodia
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/register" 
                onClick={() => {
                  trackUserAction('enhanced_page_signup_clicked', {
                    source: 'real_estate_enhanced',
                    journey_stage: 'conversion',
                    calculator_used: !!calculatorData,
                    property_value: calculatorData?.propertyValue || null
                  });
                }}
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Crear Cuenta Gratis
              </Link>
              
              <Link 
                href="/inmobiliarias" 
                className="inline-block bg-white text-blue-700 border-2 border-blue-200 text-lg font-semibold px-8 py-4 rounded-2xl shadow hover:shadow-lg hover:bg-blue-50 transition-all duration-300"
              >
                Ver Página Original
              </Link>
            </div>
            
            {calculatorData && (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">
                  💡 Tu custodia calculada: ${calculatorData.escrowAmount.toLocaleString('es-MX')} MXN
                </p>
                <p className="text-green-700 text-sm mt-1">
                  CLABE generada y lista para usar: {calculatorData.clabe}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
