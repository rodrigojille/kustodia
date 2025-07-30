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
  service_type: string;
  service_details: string;
  delivery_date: string;
  delivery_conditions: string;
  delivery_notes: string;
  has_commission: boolean;
  payer_email?: string;
  payee_email?: string;
};

export default function CobroOtrosPage() {
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
    service_type: '',
    service_details: '',
    delivery_date: '',
    delivery_conditions: '',
    delivery_notes: '',
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

  const steps: string[] = [
    "Datos del cobro y cliente",
    "Tipo de servicio",
    "Condiciones de entrega", 
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
        alert('Por favor asegúrese de que el cliente y proveedor sean válidos');
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
        alert('El total de comisiones a colaboradores no puede exceder el 100%');
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
      const payload = {
        ...data,
        payment_type: 'cobro_inteligente',
        transaction_type: 'otros',
        broker_email: user?.email,
        seller_email: data.seller_email,
        payer_email: data.buyer_email,
        payee_email: data.seller_email,
        vertical: 'otros',
        // Commission calculation - only calculate if commissions are enabled
        total_commission_amount: data.has_commission ? ((parseFloat(data.payment_amount) * parseFloat(data.total_commission_percentage || '0')) / 100) : 0,
        net_amount: data.has_commission ? (parseFloat(data.payment_amount) - ((parseFloat(data.payment_amount) * parseFloat(data.total_commission_percentage || '0')) / 100)) : parseFloat(data.payment_amount),
        // Add broker's commission percentage (only if commission is enabled)
        broker_commission_percentage: data.has_commission && data.total_commission_percentage ? (100 - data.commission_recipients.reduce((sum, r) => sum + parseFloat(r.percentage || '0'), 0)) : 0
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
                  placeholder="5000"
                  value={data.payment_amount}
                  onChange={(e) => setData({ ...data, payment_amount: e.target.value })}
                  className="w-full pl-8 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">MXN</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                📝 Descripción del servicio/producto
              </label>
              <textarea
                placeholder="Ej: Consultoría de marketing digital, Desarrollo de página web, Venta de equipo"
                value={data.payment_description}
                onChange={(e) => setData({ ...data, payment_description: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                👤 Email del cliente
              </label>
              <input
                type="email"
                placeholder="cliente@email.com"
                value={data.buyer_email}
                onChange={(e) => {
                  setData({ ...data, buyer_email: e.target.value });
                  if (e.target.value && e.target.value.includes('@')) {
                    const timeoutId = setTimeout(() => {
                      validateUser(e.target.value);
                    }, 500);
                    return () => clearTimeout(timeoutId);
                  }
                }}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              {buyerLoading && <p className="text-purple-600 text-sm mt-1">Validando usuario...</p>}
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
                🏢 Email del proveedor/vendedor
              </label>
              <input
                type="email"
                placeholder="proveedor@email.com"
                value={data.seller_email}
                onChange={(e) => {
                  setData({ ...data, seller_email: e.target.value });
                  if (e.target.value && e.target.value.includes('@')) {
                    const timeoutId = setTimeout(() => {
                      validateSeller(e.target.value);
                    }, 500);
                    return () => clearTimeout(timeoutId);
                  }
                }}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              {sellerLoading && <p className="text-purple-600 text-sm mt-1">Validando proveedor...</p>}
              {sellerValid === true && (
                <p className="text-green-600 text-sm mt-1">
                  ✓ Proveedor válido {sellerVerified ? '(verificado)' : '(no verificado)'}
                </p>
              )}
              {sellerValid === false && (
                <p className="text-red-600 text-sm mt-1">✗ {sellerError}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                El proveedor recibirá el monto neto (total - comisiones)
              </p>
            </div>

            {/* Commission Section with Toggle */}
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-purple-800">
                  📦 Distribución de comisiones
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
               
              {data.has_commission ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
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
                        className="w-full p-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Porcentaje total que se deducirá del monto y se distribuirá entre colaboradores
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <p className="text-sm text-purple-700 font-medium mb-2">💡 Colaborador principal</p>
                    <p className="text-sm text-purple-600">Recibirás la comisión restante después de splits adicionales</p>
                  </div>
                  
                  {data.commission_recipients.map((recipient, index) => (
                    <div key={recipient.id} className="bg-white p-4 rounded-lg border-2 border-purple-200">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-medium text-gray-800">Colaborador #{index + 1}</h5>
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
                            📧 Email del colaborador
                          </label>
                          <input
                            type="email"
                            placeholder="colaborador@empresa.com"
                            value={recipient.email}
                            onChange={(e) => updateCommissionRecipient(recipient.id, 'email', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
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
                              className="w-full p-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Porcentaje de la comisión total que recibirá este colaborador
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addCommissionRecipient}
                    className="w-full p-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-colors"
                  >
                    ➕ Agregar colaborador adicional
                  </button>
                  
                  {data.commission_recipients.length > 0 && (
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <p className="text-sm text-purple-700 font-medium mb-1">📊 Resumen de comisiones:</p>
                      <div className="space-y-1">
                        {data.commission_recipients.map((recipient, index) => (
                          <p key={recipient.id} className="text-sm text-purple-600">
                            Colaborador #{index + 1}: {recipient.percentage}%
                          </p>
                        ))}
                        <p className="text-sm text-purple-700 font-medium border-t border-purple-200 pt-1">
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
                      <p className="text-sm text-green-600">El proveedor recibirá el monto completo del pago</p>
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
                    className="w-full p-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
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
                    className="w-full p-3 pr-16 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
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
                🏷️ Tipo de servicio/producto
              </label>
              <select
                value={data.service_type}
                onChange={(e) => setData({ ...data, service_type: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="">Seleccionar tipo</option>
                <option value="consultoria">Consultoría</option>
                <option value="desarrollo">Desarrollo/Programación</option>
                <option value="diseno">Diseño</option>
                <option value="marketing">Marketing</option>
                <option value="producto_fisico">Producto físico</option>
                <option value="producto_digital">Producto digital</option>
                <option value="servicio_profesional">Servicio profesional</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                📝 Detalles adicionales del servicio/producto
              </label>
              <textarea
                placeholder="Describe las características específicas, entregables, alcance, etc."
                value={data.service_details}
                onChange={(e) => setData({ ...data, service_details: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                📅 Fecha estimada de entrega
              </label>
              <input
                type="date"
                value={data.delivery_date}
                onChange={(e) => setData({ ...data, delivery_date: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                🚚 Condiciones de entrega
              </label>
              <select
                value={data.delivery_conditions}
                onChange={(e) => setData({ ...data, delivery_conditions: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="">Seleccionar condición</option>
                <option value="entrega_inmediata">Entrega inmediata</option>
                <option value="entrega_programada">Entrega programada</option>
                <option value="entrega_por_fases">Entrega por fases</option>
                <option value="servicio_continuo">Servicio continuo</option>
                <option value="bajo_demanda">Bajo demanda</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                📋 Notas adicionales sobre la entrega
              </label>
              <textarea
                placeholder="Especifica cualquier detalle importante sobre la entrega, condiciones especiales, etc."
                value={data.delivery_notes}
                onChange={(e) => setData({ ...data, delivery_notes: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
              <h3 className="text-xl font-bold text-purple-800 mb-4">📊 Resumen del cobro</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-700">Monto total:</p>
                    <p className="text-2xl font-bold text-purple-600">${data.payment_amount} MXN</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-700">Descripción:</p>
                    <p className="text-gray-600">{data.payment_description}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-700">Tipo de servicio:</p>
                    <p className="text-gray-600">{data.service_type}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-700">Cliente:</p>
                    <p className="text-gray-600">{data.buyer_email}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-700">Proveedor:</p>
                    <p className="text-gray-600">{data.seller_email}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {data.has_commission ? (
                    <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-3">💰 Distribución de comisiones</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Comisión total ({data.total_commission_percentage}%):</span>
                          <span className="font-medium">${((parseFloat(data.payment_amount) * parseFloat(data.total_commission_percentage || '0')) / 100).toFixed(2)}</span>
                        </div>
                        
                        {data.commission_recipients.map((recipient, index) => (
                          <div key={recipient.id} className="flex justify-between text-sm">
                            <span className="text-gray-500">Colaborador #{index + 1} ({recipient.percentage}%):</span>
                            <span>${(((parseFloat(data.payment_amount) * parseFloat(data.total_commission_percentage || '0')) / 100) * (parseFloat(recipient.percentage || '0') / 100)).toFixed(2)}</span>
                          </div>
                        ))}
                        
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-purple-700 font-medium">Tu comisión:</span>
                          <span className="font-medium">${(((parseFloat(data.payment_amount) * parseFloat(data.total_commission_percentage || '0')) / 100) * ((100 - data.commission_recipients.reduce((sum, r) => sum + parseFloat(r.percentage || '0'), 0)) / 100)).toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between border-t pt-2 font-bold">
                          <span className="text-green-700">Monto neto al proveedor:</span>
                          <span className="text-green-700">${(parseFloat(data.payment_amount) - ((parseFloat(data.payment_amount) * parseFloat(data.total_commission_percentage || '0')) / 100)).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">💰</span>
                        <div>
                          <p className="font-medium text-green-800">Venta directa</p>
                          <p className="text-sm text-green-600">Sin comisiones</p>
                          <p className="text-lg font-bold text-green-700">${data.payment_amount} MXN al proveedor</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">🔒 Custodia</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-600">Porcentaje en custodia:</span>
                        <span className="font-medium">{data.custody_percent}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Período de custodia:</span>
                        <span className="font-medium">{data.custody_period} días</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">🔄 ¿Qué pasa después?</h4>
              <div className="space-y-2 text-sm text-yellow-700">
                <p>1. El cliente recibirá un enlace de pago seguro</p>
                <p>2. Una vez pagado, el dinero quedará en custodia segura</p>
                <p>3. Cuando se cumplan las condiciones, se liberará el pago</p>
                {data.has_commission && (
                  <p>4. Las comisiones se distribuirán automáticamente según lo configurado</p>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Step {currentStep + 1} content</div>;
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📦 Cobro Inteligente - Otros
            </h1>
            <p className="text-gray-600">
              Crea un cobro seguro para servicios y productos diversos
            </p>
          </div>

          {/* Step Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex-1 text-center ${
                    index <= currentStep ? 'text-purple-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      index <= currentStep
                        ? 'bg-purple-600 text-white'
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
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-6">{steps[currentStep]}</h2>

            {/* Step Content */}
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
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
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
      </div>
    </div>
  );
}
