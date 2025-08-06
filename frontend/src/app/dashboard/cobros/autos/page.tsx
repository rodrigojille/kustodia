"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { authFetch } from "../../../../utils/authFetch";
import { DigitalTwinSelector } from "../../../../components/DigitalTwinSelector";
import { calculatePlatformCommission, formatCurrency } from "../../../../utils/platformCommissionConfig";

type CommissionRecipient = {
  id: string;
  broker_email: string;
  broker_name?: string;
  broker_percentage: string;
};

type FormDataType = {
  payment_amount: string;
  payment_description: string;
  buyer_email: string;
  seller_email: string;
  // Commission fields - now optional
  has_commission: boolean;
  total_commission_percentage: string;
  commission_recipients: CommissionRecipient[];
  custody_percent: string;
  custody_period: string;
  operation_type: string;
  release_conditions: string;
  payer_email?: string;
  payee_email?: string;
  // Automotive-specific fields
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_vin: string;
  vehicle_mileage: string;
  vehicle_condition: string;
  // Digital twin integration
  selected_digital_twin?: any;
  digital_twin_token_id?: string;
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

export default function CobroAutosPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<FormDataType>({
    payment_amount: '',
    payment_description: '',
    buyer_email: '',
    seller_email: '',
    // Commission fields - default to no commission
    has_commission: false,
    total_commission_percentage: '5',
    commission_recipients: [],
    custody_percent: '100',
    custody_period: '30',
    operation_type: '',
    release_conditions: '',
    // Automotive-specific fields
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_vin: '',
    vehicle_mileage: '',
    vehicle_condition: ''
  });
  const [buyerValid, setBuyerValid] = useState<boolean | undefined>(undefined);
  const [buyerVerified, setBuyerVerified] = useState<boolean | undefined>(undefined);
  const [buyerLoading, setBuyerLoading] = useState(false);
  const [buyerError, setBuyerError] = useState<string | null>(null);
  
  // Platform commission state
  const [platformCommission, setPlatformCommission] = useState({ percent: 0, amount: 0, totalAmountToPay: 0 });
  const [sellerValid, setSellerValid] = useState<boolean | undefined>(undefined);
  const [sellerVerified, setSellerVerified] = useState<boolean | undefined>(undefined);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerError, setSellerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { width } = useWindowSize();

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await authFetch('/api/users/me');
        if (response.ok) {
          const userData = await response.json();
          console.log('[COBROS DEBUG] Raw API response:', userData);
          console.log('[COBROS DEBUG] User wallet address:', userData?.user?.wallet_address);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Calculate platform commission when payment amount changes
  useEffect(() => {
    if (data.payment_amount) {
      const baseAmount = parseFloat(data.payment_amount);
      if (!isNaN(baseAmount) && baseAmount > 0) {
        const commission = calculatePlatformCommission(baseAmount, 'cobro_inteligente');
        setPlatformCommission(commission);
      } else {
        setPlatformCommission({ percent: 0, amount: 0, totalAmountToPay: 0 });
      }
    } else {
      setPlatformCommission({ percent: 0, amount: 0, totalAmountToPay: 0 });
    }
  }, [data.payment_amount]);

  const steps: string[] = [
    "Datos del cobro y comprador",
    "Información del vehículo",
    "Condiciones de liberación", 
    "Resumen y creación"
  ];

  // Helper functions for commission recipients
  const addCommissionRecipient = () => {
    const newRecipient: CommissionRecipient = {
      id: Date.now().toString(),
      broker_email: '',
      broker_name: '',
      broker_percentage: ''
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
    
    // Validate commission splits if commission is set
    if (data.has_commission && data.commission_recipients.length > 0) {
      const totalBrokerPercentage = data.commission_recipients.reduce((sum, r) => sum + parseFloat(r.broker_percentage || '0'), 0);
      
      if (totalBrokerPercentage > 50) {
        alert('El total de comisiones no puede exceder el 50%');
        setSubmitting(false);
        return;
      }
      
      // Check if all commission recipients have valid emails
      for (const recipient of data.commission_recipients) {
        if (!recipient.broker_email || !recipient.broker_percentage) {
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
        transaction_type: 'autos',
        broker_email: user?.email, // Current user is the broker creating the form
        seller_email: data.seller_email, // The vehicle owner who receives net payment
        payer_email: data.buyer_email, // The buyer who will pay
        payee_email: data.seller_email, // The seller who receives the payment
        vertical: 'autos',
        // Commission recipients (nuevo flujo style)
        commission_recipients: data.commission_recipients
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
                placeholder="Ej: Apartado para Toyota Corolla 2020"
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
                🚗 Email del vendedor (propietario del vehículo)
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

            {/* Commission Toggle */}
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">
                  🏢 Comisiones de brokers
                </h4>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.has_commission}
                    onChange={(e) => setData({ ...data, has_commission: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${
                    data.has_commission ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      data.has_commission ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {data.has_commission ? 'Activado' : 'Desactivado'}
                  </span>
                </label>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {data.has_commission 
                  ? '✅ Se aplicarán comisiones a este pago' 
                  : '💰 Venta directa sin comisiones - el vendedor recibe el 100% del monto'
                }
              </p>
              
              {!data.has_commission && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    💡 <strong>Venta directa:</strong> Ideal cuando vendes tu propio vehículo sin intermediarios. El comprador paga directamente al vendedor.
                  </p>
                </div>
              )}
            </div>

            {/* Broker Commission Section - Only show if commissions are enabled */}
            {data.has_commission && (
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-blue-800">
                    🏢 Comisiones de asesores
                  </h4>
                  <button
                    type="button"
                    onClick={addCommissionRecipient}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    ➕ Agregar asesor
                  </button>
                </div>
                
                <div className="space-y-4">
                  {data.commission_recipients.length === 0 && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 text-center text-gray-500">
                      No hay asesores agregados. El vendedor recibirá el 100% del monto.
                    </div>
                  )}
                  
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
                            📧 Email del asesor
                          </label>
                          <input
                            type="email"
                            placeholder="asesor@automotriz.com"
                            value={recipient.broker_email || ''}
                            onChange={(e) => updateCommissionRecipient(recipient.id, 'broker_email', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block font-medium text-gray-700 mb-2">
                            👤 Nombre del asesor (opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Juan Pérez"
                            value={recipient.broker_name || ''}
                            onChange={(e) => updateCommissionRecipient(recipient.id, 'broker_name', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block font-medium text-gray-700 mb-2">
                          💰 Porcentaje de comisión
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="5.0"
                            min="0"
                            max="50"
                            step="0.1"
                            value={recipient.broker_percentage || ''}
                            onChange={(e) => updateCommissionRecipient(recipient.id, 'broker_percentage', e.target.value)}
                            className="w-full p-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Porcentaje del monto total que recibirá este asesor
                        </p>
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
                            Asesor #{index + 1}: {recipient.broker_percentage}% - {recipient.broker_email}
                          </p>
                        ))}
                        <p className="text-sm text-blue-700 font-medium border-t border-blue-200 pt-1">
                          Total comisiones: {data.commission_recipients.reduce((sum, r) => sum + parseFloat(r.broker_percentage || '0'), 0).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
            {/* Digital Twin Selector */}
            <DigitalTwinSelector
              onVehicleSelect={(vehicle) => {
                if (vehicle) {
                  // Auto-fill form with digital twin data
                  setData({
                    ...data,
                    selected_digital_twin: vehicle,
                    digital_twin_token_id: vehicle.tokenId,
                    vehicle_brand: vehicle.metadata.make,
                    vehicle_model: vehicle.metadata.model,
                    vehicle_year: vehicle.metadata.year,
                    vehicle_vin: vehicle.metadata.vin,
                    vehicle_mileage: vehicle.metadata.currentMileage
                  });
                } else {
                  // Clear digital twin data but keep manual entries
                  setData({
                    ...data,
                    selected_digital_twin: undefined,
                    digital_twin_token_id: undefined
                  });
                }
              }}
              selectedVehicle={data.selected_digital_twin}
              userAddress={(() => {
                console.log('[COBROS DEBUG] Passing userAddress to DigitalTwinSelector:', user?.wallet_address);
                console.log('[COBROS DEBUG] Full user object:', user);
                console.log('[COBROS DEBUG] Loading state:', loading);
                return user?.wallet_address;
              })()}
              className="mb-6"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  🚗 Marca del vehículo {data.selected_digital_twin && <span className="text-green-600 text-sm">(desde gemelo digital)</span>}
                </label>
                <select
                  value={data.vehicle_brand}
                  onChange={(e) => setData({ ...data, vehicle_brand: e.target.value })}
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    data.selected_digital_twin 
                      ? 'border-green-500 bg-green-50 focus:border-green-600' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  disabled={!!data.selected_digital_twin}
                >
                  <option value="">Selecciona la marca</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Ford">Ford</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Kia">Kia</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Subaru">Subaru</option>
                  <option value="Mitsubishi">Mitsubishi</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Audi">Audi</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  📝 Modelo {data.selected_digital_twin && <span className="text-green-600 text-sm">(desde gemelo digital)</span>}
                </label>
                <input
                  type="text"
                  placeholder="Ej: Corolla, Civic, F-150"
                  value={data.vehicle_model}
                  onChange={(e) => setData({ ...data, vehicle_model: e.target.value })}
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    data.selected_digital_twin 
                      ? 'border-green-500 bg-green-50 focus:border-green-600' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  disabled={!!data.selected_digital_twin}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  📅 Año {data.selected_digital_twin && <span className="text-green-600 text-sm">(desde gemelo digital)</span>}
                </label>
                <input
                  type="number"
                  placeholder="2020"
                  min="1990"
                  max="2025"
                  value={data.vehicle_year}
                  onChange={(e) => setData({ ...data, vehicle_year: e.target.value })}
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    data.selected_digital_twin 
                      ? 'border-green-500 bg-green-50 focus:border-green-600' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  disabled={!!data.selected_digital_twin}
                />
              </div>
              
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  📊 Kilometraje {data.selected_digital_twin && <span className="text-green-600 text-sm">(desde gemelo digital)</span>}
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  value={data.vehicle_mileage}
                  onChange={(e) => setData({ ...data, vehicle_mileage: e.target.value })}
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    data.selected_digital_twin 
                      ? 'border-green-500 bg-green-50 focus:border-green-600' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  disabled={!!data.selected_digital_twin}
                />
              </div>
              
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  🔧 Condición
                </label>
                <select
                  value={data.vehicle_condition}
                  onChange={(e) => setData({ ...data, vehicle_condition: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Selecciona</option>
                  <option value="Nuevo">Nuevo</option>
                  <option value="Seminuevo">Seminuevo</option>
                  <option value="Usado">Usado</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                💳 Número de serie (VIN) {data.selected_digital_twin && <span className="text-green-600 text-sm">(desde gemelo digital)</span>}
              </label>
              <input
                type="text"
                placeholder="Ej: 1HGBH41JXMN109186"
                value={data.vehicle_vin}
                onChange={(e) => setData({ ...data, vehicle_vin: e.target.value.toUpperCase() })}
                className={`w-full p-3 border-2 rounded-lg focus:outline-none font-mono ${
                  data.selected_digital_twin 
                    ? 'border-green-500 bg-green-50 focus:border-green-600' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                maxLength={17}
                disabled={!!data.selected_digital_twin}
              />
              <p className={`text-sm mt-1 ${
                data.selected_digital_twin 
                  ? 'text-green-600' 
                  : 'text-gray-500'
              }`}>
                {data.selected_digital_twin 
                  ? '✓ VIN verificado desde gemelo digital blockchain' 
                  : 'El VIN debe tener 17 caracteres'
                }
              </p>
            </div>
            
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                🚗 Tipo de transacción
              </label>
              <select
                value={data.operation_type}
                onChange={(e) => setData({ ...data, operation_type: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Selecciona el tipo de transacción</option>
                <option value="Apartado">Apartado</option>
                <option value="Enganche">Enganche</option>
                <option value="Compra-venta">Compra-venta completa</option>
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
                placeholder="Ejemplo: El pago se liberará cuando se haya realizado la inspección del vehículo, se verifique la documentación legal (tarjeta de circulación, factura, verificación vehicular) y se firme el contrato de compra-venta por ambas partes."
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
                
                {/* Platform Commission Breakdown */}
                {data.payment_amount && parseFloat(data.payment_amount) > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">💰 Desglose de Pago Transparente</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Monto base:</span>
                        <span className="font-medium">{formatCurrency(parseFloat(data.payment_amount))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Comisión plataforma ({platformCommission.percent}%):</span>
                        <span className="font-medium">{formatCurrency(platformCommission.amount)}</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-300 pt-1 mt-2">
                        <span className="font-semibold text-blue-800">Total que pagará el comprador:</span>
                        <span className="font-bold text-blue-800">{formatCurrency(platformCommission.totalAmountToPay)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      ℹ️ Comisión por servicio de custodia digital.
                    </p>
                  </div>
                )}
                
                {data.vehicle_brand && data.vehicle_model && (
                  <div className="bg-green-50 p-4 rounded-lg border-t">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-900">🚗 Información del Vehículo</h4>
                      {data.selected_digital_twin && (
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                          🔗 Gemelo Digital NFT #{data.digital_twin_token_id}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehículo:</span>
                        <span className="font-semibold">{data.vehicle_brand} {data.vehicle_model}</span>
                      </div>
                      {data.vehicle_year && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Año:</span>
                          <span className="font-semibold">{data.vehicle_year}</span>
                        </div>
                      )}
                      {data.vehicle_condition && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Condición:</span>
                          <span className="font-semibold">{data.vehicle_condition}</span>
                        </div>
                      )}
                      {data.vehicle_mileage && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kilometraje:</span>
                          <span className="font-semibold">{Number(data.vehicle_mileage).toLocaleString()} km</span>
                        </div>
                      )}
                      {data.vehicle_vin && (
                        <div className="flex justify-between col-span-2">
                          <span className="text-gray-600">VIN:</span>
                          <span className="font-semibold font-mono">{data.vehicle_vin}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {data.has_commission && data.total_commission_percentage && parseFloat(data.total_commission_percentage) > 0 && (
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
                      const brokerCommission = (parseFloat(data.payment_amount) * parseFloat(recipient.broker_percentage || '0')) / 100;
                      return (
                        <div key={recipient.id} className="flex justify-between ml-4">
                          <span className="text-gray-600">Asesor #{index + 1}:</span>
                          <span className="font-semibold">{recipient.broker_email} ({recipient.broker_percentage}% = ${brokerCommission.toFixed(2)} MXN)</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Custodia:</span>
                  <span className="font-semibold">{data.custody_percent}% por {data.custody_period} días</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de transacción:</span>
                  <span className="font-semibold">{data.operation_type}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-2">💡 ¿Qué sucede después?</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Se enviará una solicitud de pago al comprador del vehículo</li>
                <li>• El comprador podrá pagar usando el link seguro</li>
                <li>• El dinero quedará en custodia hasta que se complete la inspección y documentación</li>
                <li>• Ambas partes deben aprobar la liberación del pago</li>
                <li>• Se verificará la documentación del vehículo (tarjeta de circulación, factura, etc.)</li>
                {data.commission_recipients.length > 0 && <li>• La comisión se distribuirá automáticamente</li>}
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
            🚗 Cobro Automotriz
          </h1>
          <p className="page-description">
            Crea una solicitud de pago para venta de vehículos con comisiones automáticas
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

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">{steps[currentStep]}</h2>
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
                  (currentStep === 1 && (!data.vehicle_brand || !data.vehicle_model || !data.vehicle_year || !data.operation_type)) ||
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
