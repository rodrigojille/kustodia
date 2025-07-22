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
import PostHogSurvey from '../../../components/PostHogSurvey';

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

function CommissionSplitPreview() {
  const [commissions, setCommissions] = useState([
    { id: 1, name: 'Broker Principal', email: 'broker@inmobiliaria.com', percentage: 60, amount: 0, status: 'pending', editable: false },
    { id: 2, name: 'Co-Broker', email: 'cobroker@partner.com', percentage: 25, amount: 0, status: 'pending', editable: false },
    { id: 3, name: 'Referido', email: 'referido@network.com', percentage: 15, amount: 0, status: 'pending', editable: false }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [propertyValue, setPropertyValue] = useState(2500000);
  const [commissionRate, setCommissionRate] = useState(5);
  const [buyerEmail, setBuyerEmail] = useState('comprador@email.com');
  const [isEditingCommissions, setIsEditingCommissions] = useState(false);
  const [cobroSent, setCobroSent] = useState(false);
  const [showCobroPreview, setShowCobroPreview] = useState(false);
  
  const totalCommission = (propertyValue * commissionRate) / 100;

  // Update amounts when percentages or property value changes
  useEffect(() => {
    setCommissions(prev => prev.map(c => ({
      ...c,
      amount: (totalCommission * c.percentage) / 100
    })));
  }, [totalCommission, commissions.map(c => c.percentage).join(',')]);

  const updateCommissionPercentage = (id: number, newPercentage: number) => {
    setCommissions(prev => prev.map(c => 
      c.id === id ? { ...c, percentage: Math.max(0, Math.min(100, newPercentage)) } : c
    ));
  };

  const getTotalPercentage = () => {
    return commissions.reduce((sum, c) => sum + c.percentage, 0);
  };

  const simulatePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    commissions.forEach((commission, index) => {
      setTimeout(() => {
        setCommissions(prev => prev.map(c => 
          c.id === commission.id ? { ...c, status: 'completed' } : c
        ));
        
        if (index === commissions.length - 1) {
          setIsProcessing(false);
        }
      }, (index + 1) * 1000);
    });
  };

  const simulateSendCobro = () => {
    setShowCobroPreview(true);
    setTimeout(() => {
      setCobroSent(true);
      setShowCobroPreview(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaHandshake className="text-green-600 text-2xl" />
        <h3 className="text-2xl font-bold text-gray-900">División Automática de Comisiones</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Configura las comisiones y simula el envío del cobro al comprador.
      </p>
      
      {/* Property Value and Commission Rate Controls */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-blue-800 mb-4">Configuración de la Propiedad</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor de la Propiedad</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={propertyValue}
                onChange={(e) => setPropertyValue(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2,500,000"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">MXN</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tasa de Comisión</label>
            <div className="relative">
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="10"
                step="0.5"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-blue-800 font-semibold">Comisión Total:</span>
            <span className="text-blue-900 font-bold text-xl">${totalCommission.toLocaleString('es-MX')} MXN</span>
          </div>
        </div>
      </div>
      
      {/* Buyer Email Input */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4 mb-6">
        <label className="block text-sm font-medium text-purple-800 mb-2">Email del Comprador</label>
        <input
          type="email"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="comprador@email.com"
        />
      </div>
      
      {/* Commission Distribution Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">Distribución de Comisiones</h4>
        <button
          onClick={() => setIsEditingCommissions(!isEditingCommissions)}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          {isEditingCommissions ? '✅ Guardar' : '✏️ Editar %'}
        </button>
      </div>
      
      <div className="space-y-4 mb-6">
        {commissions.map((commission) => (
          <div key={commission.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                commission.status === 'completed' ? 'bg-green-100' : 
                isProcessing ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                {commission.status === 'completed' ? (
                  <FaCheckCircle className="text-green-600" />
                ) : isProcessing ? (
                  <FaClock className="text-yellow-600 animate-spin" />
                ) : isEditingCommissions ? (
                  <input
                    type="number"
                    value={commission.percentage}
                    onChange={(e) => updateCommissionPercentage(commission.id, Number(e.target.value))}
                    className="w-8 h-8 text-xs text-center border border-gray-300 rounded"
                    min="0"
                    max="100"
                  />
                ) : (
                  <span className="text-gray-600 font-bold text-sm">{commission.percentage}%</span>
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{commission.name}</div>
                <div className="text-sm text-gray-600">{commission.email}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">${commission.amount.toLocaleString('es-MX')} MXN</div>
              <div className={`text-sm font-medium ${
                commission.status === 'completed' ? 'text-green-600' :
                isProcessing ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                {commission.status === 'completed' ? '✅ Transferido' :
                 isProcessing ? '🔄 Procesando...' : `${commission.percentage}% del total`}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Percentage Validation */}
      {isEditingCommissions && (
        <div className={`p-3 rounded-lg mb-4 ${
          getTotalPercentage() === 100 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">
              Total de Porcentajes: {getTotalPercentage()}%
            </span>
            {getTotalPercentage() === 100 ? (
              <span className="text-green-600">✅ Perfecto</span>
            ) : (
              <span className="text-yellow-600">⚠️ Debe sumar 100%</span>
            )}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={simulateSendCobro}
          disabled={cobroSent || showCobroPreview || getTotalPercentage() !== 100}
          className={`py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
            cobroSent
              ? 'bg-green-100 text-green-700 cursor-default'
              : showCobroPreview
                ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                : getTotalPercentage() !== 100
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl'
          }`}
        >
          {cobroSent ? '✅ Cobro Enviado al Comprador' :
           showCobroPreview ? '📧 Enviando Cobro...' : '📧 Enviar Cobro al Comprador'}
        </button>
        
        <button
          onClick={simulatePayment}
          disabled={!cobroSent || isProcessing || commissions.every(c => c.status === 'completed')}
          className={`py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
            !cobroSent
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isProcessing || commissions.every(c => c.status === 'completed')
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
          }`}
        >
          {!cobroSent ? '⏳ Primero envía el cobro' :
           commissions.every(c => c.status === 'completed') ? '✅ Comisiones Distribuidas' :
           isProcessing ? '🔄 Distribuyendo Comisiones...' : '💰 Simular Pago del Comprador'}
        </button>
      </div>
      
      {/* Cobro Preview */}
      {showCobroPreview && (
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📧</span>
            <h4 className="font-semibold text-purple-800">Enviando Cobro por Email...</h4>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-gray-600 mb-2">Para: {buyerEmail}</div>
            <div className="text-sm text-gray-600 mb-2">Asunto: Solicitud de Pago - Propiedad ${propertyValue.toLocaleString('es-MX')} MXN</div>
            <div className="text-sm text-gray-700">
              Se ha generado una solicitud de pago seguro por ${propertyValue.toLocaleString('es-MX')} MXN.
              Los fondos se mantendrán en custodia hasta completar la transacción.
            </div>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {cobroSent && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaCheckCircle className="text-green-600" />
            <span className="font-semibold text-green-800">Cobro Enviado Exitosamente</span>
          </div>
          <p className="text-green-700 text-sm">
            El comprador ({buyerEmail}) recibirá un email con las instrucciones de pago.
            Una vez que pague, las comisiones se distribuirán automáticamente.
          </p>
        </div>
      )}
    </div>
  );
}

function PaymentTrackerPreview() {
  const [currentStatus, setCurrentStatus] = useState(0);
  const [approvals, setApprovals] = useState({
    buyer: false,
    seller: false
  });
  
  const statuses = [
    { title: 'Pago Iniciado', description: 'Comprador deposita fondos en custodia', icon: '💰', completed: true },
    { title: 'Fondos Verificados', description: 'Sistema confirma recepción de fondos', icon: '✅', completed: true },
    { title: 'Documentos Subidos', description: 'Vendedor sube documentos de la propiedad', icon: '📄', completed: true },
    { title: 'Verificación Pendiente', description: 'Documentos en proceso de verificación', icon: '🔍', completed: currentStatus >= 3 },
    { title: 'Aprobación Dual', description: 'Esperando aprobación de ambas partes', icon: '👥', completed: currentStatus >= 4 },
    { title: 'Fondos Liberados', description: 'Pago automático al vendedor', icon: '🎉', completed: currentStatus >= 5 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatus(prev => {
        if (prev < 5) {
          return prev + 1;
        } else {
          // Reset for demo
          setApprovals({ buyer: false, seller: false });
          return 0;
        }
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentStatus === 4) {
      // Simulate approvals
      setTimeout(() => setApprovals(prev => ({ ...prev, buyer: true })), 500);
      setTimeout(() => setApprovals(prev => ({ ...prev, seller: true })), 1000);
    }
  }, [currentStatus]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaEye className="text-blue-600 text-2xl" />
        <h3 className="text-2xl font-bold text-gray-900">Rastreador de Pagos en Tiempo Real</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Seguimiento completo del estado de la transacción con aprobación dual automática.
      </p>
      
      <div className="space-y-4 mb-6">
        {statuses.map((status, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 ${
              status.completed 
                ? 'bg-green-50 border-green-200' 
                : index === currentStatus 
                  ? 'bg-blue-50 border-blue-200 animate-pulse'
                  : 'bg-gray-50 border-gray-200'
            }`}>
              {status.icon}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold ${
                status.completed ? 'text-green-800' : 'text-gray-900'
              }`}>
                {status.title}
                {status.completed && <span className="ml-2 text-green-600">✅</span>}
                {index === currentStatus && !status.completed && <span className="ml-2 text-blue-600">🔄</span>}
              </h4>
              <p className="text-gray-600 text-sm">{status.description}</p>
            </div>
            <div className="text-sm text-gray-500">
              {status.completed ? 'Completado' : index === currentStatus ? 'En proceso' : 'Pendiente'}
            </div>
          </div>
        ))}
      </div>
      
      {currentStatus === 4 && (
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-purple-800 mb-3">Aprobación Dual Requerida</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg border ${
              approvals.buyer ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                {approvals.buyer ? <FaCheckCircle className="text-green-600" /> : <FaClock className="text-gray-400" />}
                <span className={`font-medium ${
                  approvals.buyer ? 'text-green-800' : 'text-gray-600'
                }`}>Comprador</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {approvals.buyer ? 'Aprobado ✅' : 'Esperando aprobación...'}
              </p>
            </div>
            <div className={`p-3 rounded-lg border ${
              approvals.seller ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                {approvals.seller ? <FaCheckCircle className="text-green-600" /> : <FaClock className="text-gray-400" />}
                <span className={`font-medium ${
                  approvals.seller ? 'text-green-800' : 'text-gray-600'
                }`}>Vendedor</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {approvals.seller ? 'Aprobado ✅' : 'Esperando aprobación...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationSystemPreview() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', title: 'Pago Recibido', message: 'Se recibieron $250,000 MXN en custodia', time: '2 min', read: false },
    { id: 2, type: 'info', title: 'Documentos Verificados', message: 'Escritura pública verificada exitosamente', time: '5 min', read: false },
    { id: 3, type: 'warning', title: 'Aprobación Requerida', message: 'Se requiere tu aprobación para liberar fondos', time: '10 min', read: true }
  ]);
  
  const [newNotification, setNewNotification] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewNotification(true);
      const newNotif = {
        id: Date.now(),
        type: 'success',
        title: 'Comisión Transferida',
        message: `Comisión de $${(Math.random() * 50000 + 10000).toFixed(0)} MXN transferida`,
        time: 'Ahora',
        read: false
      };
      
      setNotifications(prev => [newNotif, ...prev.slice(0, 2)]);
      
      setTimeout(() => setNewNotification(false), 2000);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <span className="text-2xl">🔔</span>
          {newNotification && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Sistema de Notificaciones</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Mantente informado de cada paso de tus transacciones inmobiliarias en tiempo real.
      </p>
      
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className={`p-4 rounded-lg border transition-all duration-300 ${
            getNotificationColor(notification.type)
          } ${!notification.read ? 'ring-2 ring-blue-200' : ''}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl">{getNotificationIcon(notification.type)}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </div>
                <p className="text-gray-700 text-sm">{notification.message}</p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📱</span>
          <span className="font-semibold text-gray-800">Notificaciones Multicanal</span>
        </div>
        <p className="text-gray-700 text-sm">
          Recibe notificaciones por email, SMS, WhatsApp y push notifications en tiempo real.
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
              Para <span className="text-green-600 font-semibold">brokers</span>, <span className="text-blue-600 font-semibold">compradores</span> y <span className="text-purple-600 font-semibold">vendedores</span>. 
              <span className="text-gray-900 font-semibold"> Protección total para todos.</span>
            </p>
          </div>

          {/* Three Use Cases */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Brokers */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <FaHandshake className="text-green-700 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-4">Para Brokers</h3>
              <ul className="text-green-700 text-left space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Comisiones transferidas en tiempo real</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Reduce incertidumbre de ventas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Distribución automática de comisiones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Ahorra tiempo en cobros</span>
                </li>
              </ul>
              <div className="bg-green-100 rounded-lg p-3">
                <p className="text-green-800 font-semibold text-sm">💰 Genera cobros seguros con comisiones automáticas</p>
              </div>
            </div>

            {/* Buyers */}
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl shadow-lg border border-blue-200 p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-blue-800 mb-4">Para Compradores</h3>
              <ul className="text-blue-700 text-left space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Tranquilidad total en la compra</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Dinero protegido hasta entrega</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Resolución automática de problemas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Reembolso garantizado si algo falla</span>
                </li>
              </ul>
              <div className="bg-blue-100 rounded-lg p-3">
                <p className="text-blue-800 font-semibold text-sm">🛡️ Protección completa de tu inversión</p>
              </div>
            </div>

            {/* Sellers */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl shadow-lg border border-purple-200 p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <FaCheckCircle className="text-purple-700 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-4">Para Vendedores</h3>
              <ul className="text-purple-700 text-left space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Garantía de fondos del comprador</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Pago automático al cumplir condiciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Sin riesgo de transacciones fallidas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Proceso transparente y seguro</span>
                </li>
              </ul>
              <div className="bg-purple-100 rounded-lg p-3">
                <p className="text-purple-800 font-semibold text-sm">💎 Vende con total seguridad y confianza</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Calculator Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20">
          <PropertyEscrowCalculator onCalculate={handleCalculatorUse} />
        </section>

        {/* Interactive Features */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <DocumentUploadPreview />
            <CommissionSplitPreview />
          </div>
        </section>
        
        {/* Payment Tracking */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20">
          <PaymentTrackerPreview />
        </section>
        
        {/* Notification System */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20">
          <NotificationSystemPreview />
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
            
            <div className="flex justify-center">
              <Link 
                href="/#early-access" 
                onClick={() => {
                  trackUserAction('enhanced_page_early_access_clicked', {
                    source: 'real_estate_enhanced',
                    journey_stage: 'conversion',
                    calculator_used: !!calculatorData,
                    property_value: calculatorData?.propertyValue || null,
                    user_type: 'all_personas' // brokers, buyers, sellers
                  });
                }}
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                🚀 Acceso Anticipado Gratis
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

        {/* PostHog Survey Integration */}
        <PostHogSurvey 
          trigger="auto"
          showOnPage={['/inmobiliarias/enhanced']}
          className="fixed bottom-4 right-4 z-50"
        />
      </main>
    </>
  );
}
