"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { authFetch } from "../../../../utils/authFetch";

type CommissionRecipient = {
  id: string;
  email: string;
  percentage: string;
  name?: string;
};

type FormDataType = {
  payment_amount: string;
  payment_description: string;
  buyer_email: string;
  seller_email: string;
  total_commission_percentage: string;
  commission_recipients: CommissionRecipient[];
  custody_percent: string;
  custody_period: string;
  operation_type: string;
  release_conditions: string;
  has_commission: boolean;
  payer_email?: string;
  payee_email?: string;
};

// Custom hook for responsive design
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return windowSize;
}

export default function CobroInmobiliariaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<FormDataType>({
    payment_amount: '',
    payment_description: '',
    buyer_email: '',
    seller_email: '',
    total_commission_percentage: '5',
    commission_recipients: [],
    custody_percent: '100',
    custody_period: '30',
    operation_type: '',
    release_conditions: '',
    has_commission: true
  });
  const [buyerValid, setBuyerValid] = useState<boolean | undefined>(undefined);
  const [buyerVerified, setBuyerVerified] = useState<boolean | undefined>(undefined);
  const [buyerLoading, setBuyerLoading] = useState(false);
  const [buyerError, setBuyerError] = useState<string | null>(null);
  const [sellerValid, setSellerValid] = useState<boolean | undefined>(undefined);
  const [sellerVerified, setSellerVerified] = useState<boolean | undefined>(undefined);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerError, setSellerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { width } = useWindowSize();

  const steps: string[] = [
    "Datos del cobro y comprador",
    "Tipo de operación",
    "Condiciones de liberación", 
    "Resumen y creación"
  ];

  // Helper functions for commission recipients
  const addCommissionRecipient = () => {
    const newRecipient: CommissionRecipient = {
      id: Date.now().toString(),
      email: '',
      percentage: ''
    };
    setData({
      ...data,
      commission_recipients: [...data.commission_recipients, newRecipient]
    });
  };

  const removeCommissionRecipient = (id: string) => {
    setData({
      ...data,
      commission_recipients: data.commission_recipients.filter(r => r.id !== id)
    });
  };

  const updateCommissionRecipient = (id: string, field: keyof CommissionRecipient, value: string) => {
    setData({
      ...data,
      commission_recipients: data.commission_recipients.map(r => 
        r.id === id ? { ...r, [field]: value } : r
      )
    });
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await authFetch('users/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData.user || userData);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Buyer validation function
  const validateUser = async (email: string) => {
    setBuyerLoading(true);
    setBuyerError(null);
    setBuyerValid(undefined);
    setBuyerVerified(undefined);

    try {
      const response = await authFetch('users/verify-recipient', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      const result = await response.json();

      if (response.ok) {
        setBuyerValid(result.exists);
        setBuyerVerified(result.verified || false);
        if (!result.exists) {
          setBuyerError('Email not found in system');
        }
      } else {
        setBuyerValid(false);
        setBuyerError(result.error || 'Error validating user');
      }
    } catch (error) {
      setBuyerValid(false);
      setBuyerError('Error connecting to server');
    } finally {
      setBuyerLoading(false);
    }
  };

  // Seller validation function
  const validateSeller = async (email: string) => {
    setSellerLoading(true);
    setSellerError(null);
    setSellerValid(undefined);
    setSellerVerified(undefined);

    try {
      const response = await authFetch('users/verify-recipient', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      const result = await response.json();

      if (response.ok) {
        setSellerValid(result.exists);
        setSellerVerified(result.verified || false);
        if (!result.exists) {
          setSellerError('Email not found in system');
        }
      } else {
        setSellerValid(false);
        setSellerError(result.error || 'Error validating user');
      }
    } catch (error) {
      setSellerValid(false);
      setSellerError('Error connecting to server');
    } finally {
      setSellerLoading(false);
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 0) {
      // First step validation
      if (!data.payment_amount || !data.payment_description || !data.buyer_email || !data.seller_email) {
        alert('Por favor complete todos los campos obligatorios');
        return;
      }
      if (buyerValid !== true || sellerValid !== true) {
        alert('Por favor asegúrese de que el comprador y vendedor sean válidos');
        return;
      }
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    // Validate commission splits only if commission is enabled
    if (data.has_commission && data.total_commission_percentage && parseFloat(data.total_commission_percentage) > 0) {
      const totalBrokerPercentage = data.commission_recipients.reduce((sum, r) => sum + parseFloat(r.percentage || '0'), 0);
      
      if (totalBrokerPercentage > 100) {
        alert('El total de comisiones a brokers no puede exceder el 100%');
        setSubmitting(false);
        return;
      }
      
      // Check if all commission recipients have valid emails
      for (const recipient of data.commission_recipients) {
        if (!recipient.email || !recipient.percentage) {
          alert('Por favor complete todos los campos de comisiones');
          setSubmitting(false);
          return;
        }
      }
    }
    
    try {
      // Transform commission recipients to match backend validation format
      const transformedCommissionRecipients = data.commission_recipients.map(recipient => ({
        broker_email: recipient.email,
        broker_name: recipient.name || '',
        broker_percentage: parseFloat(recipient.percentage || '0')
      }));

      const payload = {
        payment_amount: parseFloat(data.payment_amount),
        payment_description: data.payment_description,
        buyer_email: data.buyer_email,
        seller_email: data.seller_email,
        broker_email: user?.email, // Current user is the broker creating the form
        payer_email: data.buyer_email, // The buyer who will pay
        payee_email: data.seller_email, // The seller who receives the payment
        total_commission_percentage: data.has_commission ? parseFloat(data.total_commission_percentage || '0') : 0,
        commission_recipients: data.has_commission ? transformedCommissionRecipients : [],
        custody_percent: parseFloat(data.custody_percent || '0'),
        custody_period: parseInt(data.custody_period || '0'),
        operation_type: data.operation_type,
        release_conditions: data.release_conditions,
        payment_type: 'cobro_inteligente',
        transaction_type: 'inmobiliaria',
        vertical: 'inmobiliaria'
      };

      const response = await authFetch('payments/cobro-inteligente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        // Redirect to success page or payment details
        router.push(`/dashboard/pagos/${result.payment.id}`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to create payment request'}`);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error creating payment request');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                💰 Monto del cobro
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="10000"
                  value={data.payment_amount}
                  onChange={(e) => setData({ ...data, payment_amount: e.target.value })}
                  className="w-full pl-8 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">MXN</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                📝 Descripción del cobro
              </label>
              <textarea
                placeholder="Ej: Apartado para casa en Polanco"
                value={data.payment_description}
                onChange={(e) => setData({ ...data, payment_description: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                👤 Email del comprador
              </label>
              <input
                type="email"
                placeholder="comprador@email.com"
                value={data.buyer_email}
                onChange={(e) => {
                  setData({ ...data, buyer_email: e.target.value });
                  // Validate buyer email after typing stops
                  if (e.target.value && e.target.value.includes('@')) {
                    const timeoutId = setTimeout(() => {
                      validateUser(e.target.value);
                    }, 500);
                    return () => clearTimeout(timeoutId);
                  }
                }}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              {buyerLoading && <p className="text-blue-600 text-sm mt-1">Validando usuario...</p>}
              {buyerValid === true && (
                <p className="text-green-600 text-sm mt-1">
                  ✓ Usuario válido {buyerVerified ? '(verificado)' : '(no verificado)'}
                </p>
              )}
              {buyerValid === false && (
                <p className="text-red-600 text-sm mt-1">✗ {buyerError}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                🏠 Email del vendedor (propietario)
              </label>
              <input
                type="email"
                placeholder="vendedor@email.com"
                value={data.seller_email}
                onChange={(e) => {
                  setData({ ...data, seller_email: e.target.value });
                  // Validate seller email after typing stops
                  if (e.target.value && e.target.value.includes('@')) {
                    const timeoutId = setTimeout(() => {
                      validateSeller(e.target.value);
                    }, 500);
                    return () => clearTimeout(timeoutId);
                  }
                }}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              {sellerLoading && <p className="text-blue-600 text-sm mt-1">Validando vendedor...</p>}
              {sellerValid === true && (
                <p className="text-green-600 text-sm mt-1">
                  ✓ Vendedor válido {sellerVerified ? '(verificado)' : '(no verificado)'}
                </p>
              )}
              {sellerValid === false && (
                <p className="text-red-600 text-sm mt-1">✗ {sellerError}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                El vendedor recibirá el monto neto (total - comisiones)
              </p>
            </div>

            {/* Broker Commission Section */}
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-blue-800">
                  🏢 Distribución de comisiones
                </h4>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {data.has_commission ? 'Con comisiones' : 'Venta directa'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.has_commission}
                      onChange={(e) => setData({ ...data, has_commission: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
               
              {data.has_commission ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                    <label className="block font-medium text-gray-700 mb-2">
                      💰 Porcentaje total de comisión
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="5.0"
                        min="0"
                        max="50"
                        step="0.1"
                        value={data.total_commission_percentage}
                        onChange={(e) => setData({ ...data, total_commission_percentage: e.target.value })}
                        className="w-full p-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Porcentaje total que se deducirá del monto y se distribuirá entre brokers
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-2">💡 Broker principal</p>
                    <p className="text-sm text-blue-600">Recibirás la comisión restante después de splits adicionales</p>
                  </div>
                  
                  {data.commission_recipients.map((recipient, index) => (
                    <div key={recipient.id} className="bg-white p-4 rounded-lg border-2 border-blue-200">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-medium text-gray-800">Broker adicional #{index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeCommissionRecipient(recipient.id)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          ✕ Eliminar
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-gray-700 mb-2">
                            📧 Email del broker
                          </label>
                          <input
                            type="email"
                            placeholder="broker@inmobiliaria.com"
                            value={recipient.email}
                            onChange={(e) => updateCommissionRecipient(recipient.id, 'email', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block font-medium text-gray-700 mb-2">
                            💰 Porcentaje de la comisión total
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              placeholder="50"
                              min="0"
                              max="100"
                              step="1"
                              value={recipient.percentage}
                              onChange={(e) => updateCommissionRecipient(recipient.id, 'percentage', e.target.value)}
                              className="w-full p-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Porcentaje de la comisión total que recibirá este broker
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addCommissionRecipient}
                    className="w-full p-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    ➕ Agregar broker adicional
                  </button>
                  
                  {data.commission_recipients.length > 0 && (
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium mb-1">📊 Resumen de comisiones:</p>
                      <div className="space-y-1">
                        {data.commission_recipients.map((recipient, index) => (
                          <p key={recipient.id} className="text-sm text-blue-600">
                            Broker #{index + 1}: {recipient.percentage}%
                          </p>
                        ))}
                        <p className="text-sm text-blue-700 font-medium border-t border-blue-200 pt-1">
                          Tu comisión: {(100 - data.commission_recipients.reduce((sum, r) => sum + parseFloat(r.percentage || '0'), 0)).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="font-medium text-green-800">Venta directa sin comisiones</p>
                      <p className="text-sm text-green-600">El vendedor recibirá el monto completo del pago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  🔒 Porcentaje en custodia
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="100"
                    value={data.custody_percent}
                    onChange={(e) => setData({ ...data, custody_percent: e.target.value })}
                    className="w-full p-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  ⏰ Período de custodia
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="30"
                    value={data.custody_period}
                    onChange={(e) => setData({ ...data, custody_period: e.target.value })}
                    className="w-full p-3 pr-16 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">días</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                🏠 Tipo de operación
              </label>
              <select
                value={data.operation_type}
                onChange={(e) => setData({ ...data, operation_type: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Selecciona el tipo de operación</option>
                <option value="Enganche">Enganche</option>
                <option value="Apartado">Apartado</option>
                <option value="Renta">Renta</option>
                <option value="Compra-venta">Compra-venta</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                📋 Condiciones de liberación y documentación
              </label>
              <textarea
                placeholder="Ejemplo: El pago se liberará cuando el contrato de compra-venta esté firmado por ambas partes y se haya entregado la documentación requerida (escrituras, identificaciones, etc.)"
                value={data.release_conditions}
                onChange={(e) => setData({ ...data, release_conditions: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                rows={6}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">📋 Resumen del cobro</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto total:</span>
                  <span className="font-semibold">${data.payment_amount} MXN</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Comprador:</span>
                  <span className="font-semibold">{data.buyer_email}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Vendedor:</span>
                  <span className="font-semibold">{data.seller_email}</span>
                </div>
                
                {data.has_commission ? (
                  data.total_commission_percentage && parseFloat(data.total_commission_percentage) > 0 && (
                    <div className="space-y-2 border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comisión total:</span>
                        <span className="font-semibold">{data.total_commission_percentage}% (${((parseFloat(data.payment_amount) * parseFloat(data.total_commission_percentage || '0')) / 100).toFixed(2)} MXN)</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monto neto al vendedor:</span>
                        <span className="font-semibold">${(parseFloat(data.payment_amount) - ((parseFloat(data.payment_amount) * parseFloat(data.total_commission_percentage || '0')) / 100)).toFixed(2)} MXN</span>
                      </div>
                      
                      <p className="text-gray-600 font-medium mt-3">Distribución de comisiones:</p>
                      {data.commission_recipients.map((recipient, index) => {
                        const brokerCommission = (parseFloat(data.payment_amount) * parseFloat(data.total_commission_percentage || '0') * parseFloat(recipient.percentage)) / 10000;
                        return (
                          <div key={recipient.id} className="flex justify-between ml-4">
                            <span className="text-gray-600">Broker #{index + 1}:</span>
                            <span className="font-semibold">{recipient.email} ({recipient.percentage}% = ${brokerCommission.toFixed(2)} MXN)</span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between ml-4 border-t pt-2">
                        <span className="text-gray-600">Tu comisión (broker principal):</span>
                        <span className="font-semibold">{(100 - data.commission_recipients.reduce((sum, r) => sum + parseFloat(r.percentage || '0'), 0)).toFixed(1)}% = ${((parseFloat(data.payment_amount) * parseFloat(data.total_commission_percentage || '0') * (100 - data.commission_recipients.reduce((sum, r) => sum + parseFloat(r.percentage || '0'), 0))) / 10000).toFixed(2)} MXN</span>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo de venta:</span>
                      <span className="font-semibold text-green-600">💰 Venta directa sin comisiones</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto al vendedor:</span>
                      <span className="font-semibold">${parseFloat(data.payment_amount).toFixed(2)} MXN (monto completo)</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Custodia:</span>
                  <span className="font-semibold">{data.custody_percent}% por {data.custody_period} días</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de operación:</span>
                  <span className="font-semibold">{data.operation_type}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-2">💡 ¿Qué sucede después?</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Se enviará una solicitud de pago al comprador</li>
                <li>• El comprador podrá pagar usando el link seguro</li>
                <li>• El dinero quedará en custodia hasta que se cumplan las condiciones</li>
                <li>• Ambas partes deben aprobar la liberación del pago</li>
                {data.has_commission && data.commission_recipients.length > 0 && <li>• La comisión se distribuirá automáticamente</li>}
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="page-title mb-4">
            🏠 Cobro Inmobiliario
          </h1>
          <p className="page-description">
            Crea una solicitud de pago para tu cliente con comisiones automáticas
          </p>
        </div>

        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 text-center ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="text-xs font-medium hidden sm:block">{step}</div>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-lg font-medium text-gray-800 mb-6">{steps[currentStep]}</h2>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => currentStep === 0 ? router.push('/dashboard/cobros/tipo') : handlePrev()}
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {currentStep === 0 ? 'Volver a tipos de movimiento' : 'Anterior'}
          </button>

          <div className="flex space-x-4">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && (!data.payment_amount || !data.payment_description || !data.buyer_email)) ||
                  (currentStep === 1 && !data.operation_type) ||
                  (currentStep === 2 && !data.release_conditions)
                }
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creando...' : 'Crear solicitud de pago'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
