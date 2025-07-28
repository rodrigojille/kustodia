"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { authFetch } from "../../../utils/authFetch";


// Minimal utility for fetch with auth from localStorage
type FetchOptions = RequestInit & { headers?: Record<string, string> };

const useCases = [
  {
    key: "inmobiliaria",
    icon: "🏠",
    title: "Inmobiliarias y agentes",
    desc: "Cierra ventas más rápido y genera confianza con tus clientes usando pagos en custodia. Protege anticipos, apartados y rentas: el dinero solo se libera cuando se cumplen las condiciones del pago."
  },
  {
    key: "freelancer",
    icon: "💻",
    title: "Freelancers y servicios",
    desc: "Asegura tu pago antes de comenzar a trabajar. El cliente deposita en custodia y tú entregas con tranquilidad. Sin riesgos de impago."
  },
  {
    key: "ecommerce",
    icon: "🛒",
    title: "E-commerce y ventas online",
    desc: "Ofrece máxima confianza a tus compradores. El pago queda protegido hasta que el producto llega en buen estado."
  },
  {
    key: "particulares",
    icon: "🤝",
    title: "Compra-venta entre particulares",
    desc: "Evita fraudes en ventas de autos, gadgets, muebles y más. El dinero solo se libera cuando se cumplen las condiciones del pago."
  },
  {
    key: "b2b",
    icon: "🏢",
    title: "Empresas B2B y control de entregas",
    desc: "Gestiona compras entre empresas con pagos protegidos: el dinero queda en custodia hasta que la entrega y la calidad sean verificadas. Ideal para plataformas de entregas, pagos por resultado y flujos largos de control."
  },
  {
    key: "marketplace",
    icon: "🌐",
    title: "Marketplaces de servicios",
    desc: "Facilita pagos en custodia en marketplaces donde se ofrecen servicios y es fundamental asegurar la entrega y satisfacción antes de liberar el pago. Ideal para plataformas que conectan profesionales y clientes, garantizando la completitud del servicio."
  }
];

// Paso 1: Selección de vertical
// Paso 2+: Wizard dinámico según vertical

const stepsByVertical: Record<string, string[]> = {
  inmobiliaria: [
    "Datos del pago y participantes",
    "Tipo de operación", 
    "Condiciones de liberación y documentación",
    "Resumen y creación"
  ],
  freelancer: [
    "Datos del pago y participantes",
    "Tipo de servicio",
    "Condiciones de liberación y entregables",
    "Resumen y creación"
  ],
  ecommerce: [
    "Datos del pago y participantes",
    "Tipo de producto/servicio",
    "Condiciones de liberación y entrega",
    "Resumen y creación"
  ],
  particulares: [
    "Datos del pago y participantes",
    "Tipo de transacción",
    "Condiciones de liberación y entrega",
    "Resumen y creación"
  ],
  b2b: [
    "Datos del pago y participantes",
    "Tipo de servicio empresarial",
    "Condiciones de liberación y entregables",
    "Resumen y creación"
  ],
  marketplace: [
    "Datos del pago y participantes",
    "Categoría del servicio",
    "Condiciones de liberación y servicio",
    "Resumen y creación"
  ]
};

type FormDataType = Record<string, any>;

function getStepKey(vertical: string, stepIndex: number): string {
  return `${vertical}_step_${stepIndex}`;
}

// NEW: Helper to find step index by purpose
function getStepIndex(vertical: string, purpose: string): number {
  const steps = stepsByVertical[vertical] || [];
  // For release conditions, it's typically step 2 (index 1) for most verticals
  if (purpose === 'release_conditions') {
    return 2; // This corresponds to step 3 (0-indexed), which is the release conditions step
  }
  return 1;
}

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
      handleResize(); // Call handler right away so state gets updated with initial window size
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return windowSize;
}

// Payment Details Form Component
function PaymentDetailsForm({ data, setData, vertical }: { 
  data: FormDataType; 
  setData: (data: FormDataType) => void; 
  vertical: string; 
}) {
  const [payeeValid, setPayeeValid] = useState<boolean | undefined>(undefined);
  const [payeeVerified, setPayeeVerified] = useState<boolean | undefined>(undefined);
  const [payeeLoading, setPayeeLoading] = useState(false);
  const [payeeError, setPayeeError] = useState<string | null>(null);
  const [payeeWallet, setPayeeWallet] = useState<string | null>(null);

  // User validation function
  const validateUser = async (email: string, type: 'payee') => {
    const setLoading = setPayeeLoading;
    const setValid = setPayeeValid;
    const setVerified = setPayeeVerified;
    const setError = setPayeeError;
    const setWallet = setPayeeWallet;

    if (!email || !email.includes('@')) {
      setError('Email inválido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authFetch('/api/users/verify-recipient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (!result.exists) {
        setError('Usuario no encontrado en Kustodia');
        setValid(false);
      } else if (!result.verified) {
        setError('Usuario no ha verificado su email');
        setValid(true);
        setVerified(false);
      } else {
        // User exists and is verified - that's all we need
        setValid(true);
        setVerified(true);
        setError(null);
      }
    } catch (error) {
      setError('Error validando usuario');
      setValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePayeeBlur = () => {
    const email = data.payee_email;
    if (email && email.includes('@')) {
      validateUser(email, 'payee');
    }
  };

  const getPlaceholderForVertical = (vertical: string) => {
    const placeholders: Record<string, string> = {
      inmobiliaria: "Ej. Apartado de departamento en Roma Norte",
      freelancer: "Ej. Diseño de logotipo y manual de marca",
      ecommerce: "Ej. iPhone 15 Pro 256GB Azul Titanio",
      particulares: "Ej. Venta de Honda Civic 2020",
      b2b: "Ej. Implementación de sistema CRM",
      marketplace: "Ej. Consultoría en marketing digital"
    };
    return placeholders[vertical] || "Describe el pago";
  };

  const { width } = useWindowSize();

  return (
    <div style={{ display: 'grid', gap: 16, textAlign: 'left' }}>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          💰 Monto del pago (MXN) *
        </label>
        <input
          type="number"
          placeholder="50000"
          value={data.payment_amount || ''}
          onChange={(e) => setData({ ...data, payment_amount: e.target.value })}
          style={{
            width: '100%',
            padding: width < 640 ? '14px' : '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: width < 640 ? '16px' : '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          📝 Descripción del pago *
        </label>
        <input
          type="text"
          placeholder={getPlaceholderForVertical(vertical)}
          value={data.payment_description || ''}
          onChange={(e) => setData({ ...data, payment_description: e.target.value })}
          style={{
            width: '100%',
            padding: width < 640 ? '14px' : '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: width < 640 ? '16px' : '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          📧 Email del beneficiario (quien recibe el pago) *
        </label>
        <input
          type="email"
          placeholder="beneficiario@email.com"
          value={data.payee_email || ''}
          onChange={(e) => {
            setData({ ...data, payee_email: e.target.value });
            // Reset validation when typing
            setPayeeValid(undefined);
            setPayeeVerified(undefined);
            setPayeeError(null);
            setPayeeWallet(null);
          }}
          onBlur={handlePayeeBlur}
          style={{
            width: '100%',
            padding: width < 640 ? '14px' : '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: width < 640 ? '16px' : '16px',
            boxSizing: 'border-box'
          }}
        />
        {payeeLoading && <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Validando usuario...</div>}
        {payeeValid && payeeVerified && !payeeError && (
          <div style={{ color: '#34c759', fontSize: '14px', marginTop: '8px' }}>
            ✓ Usuario verificado
          </div>
        )}
        {payeeError && <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{payeeError}</div>}
      </div>

      {/* Advanced custody settings - Now available for ALL verticals */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '16px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
          ⚙️ Configuración de custodia *
        </h4>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '16px' 
        }}>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151' }}>
              🔒 Porcentaje en custodia *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                placeholder="Ej: 100 (recomendado)"
                min="1"
                max="100"
                required
                value={data.custody_percent || ''}
                onChange={(e) => setData({ ...data, custody_percent: e.target.value })}
                style={{
                  width: '100%',
                  padding: width < 640 ? '14px' : '12px',
                  paddingRight: '40px',
                  border: (!data.custody_percent || parseInt(data.custody_percent) < 1) 
                    ? '2px solid #ef4444' 
                    : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: width < 640 ? '16px' : '16px',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                fontSize: '16px'
              }}>%</span>
            </div>
            <p style={{ 
              fontSize: '12px', 
              color: (!data.custody_percent || parseInt(data.custody_percent) < 1) ? '#ef4444' : '#6b7280', 
              marginTop: '4px' 
            }}>
              {(!data.custody_percent || parseInt(data.custody_percent) < 1) 
                ? '⚠️ Ingresa un porcentaje entre 1-100%' 
                : 'Porcentaje del monto que se protege en custodia'}
            </p>
          </div>
          
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151' }}>
              ⏰ Plazo de custodia (días) *
            </label>
            <input
              type="number"
              placeholder="Ej: 30 (recomendado)"
              min="1"
              max="365"
              required
              value={data.custody_period || ''}
              onChange={(e) => setData({ ...data, custody_period: e.target.value })}
              style={{
                width: '100%',
                padding: width < 640 ? '14px' : '12px',
                border: (!data.custody_period || parseInt(data.custody_period) < 1) 
                  ? '2px solid #ef4444' 
                  : '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: width < 640 ? '16px' : '16px',
                boxSizing: 'border-box'
              }}
            />
            <p style={{ 
              fontSize: '12px', 
              color: (!data.custody_period || parseInt(data.custody_period) < 1) ? '#ef4444' : '#6b7280', 
              marginTop: '4px' 
            }}>
              {(!data.custody_period || parseInt(data.custody_period) < 1) 
                ? '⚠️ Ingresa un plazo entre 1-365 días' 
                : 'Tiempo máximo para liberar automáticamente'}
            </p>
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '12px'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '13px', 
            color: '#0369a1',
            lineHeight: '1.4'
          }}>
            💡 <strong>¿Qué valores elegir?</strong> Te recomendamos 100% en custodia para máxima protección y 30 días como plazo límite. El pago se puede liberar antes cuando se cumplan las condiciones acordadas.
          </p>
        </div>
      </div>

      {/* Optional broker commission fields for inmobiliaria */}
      {vertical === 'inmobiliaria' && (
        <>
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '8px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
              🏢 Comisión de asesor (opcional)
            </h4>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151' }}>
                📧 Email del asesor inmobiliario
              </label>
              <input
                type="email"
                placeholder="agente@inmobiliaria.com"
                value={data.broker_email || ''}
                onChange={(e) => setData({ ...data, broker_email: e.target.value })}
                style={{
                  width: '100%',
                  padding: width < 640 ? '14px' : '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: width < 640 ? '16px' : '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151' }}>
                💰 Porcentaje de comisión
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  placeholder="5.5"
                  min="0"
                  max="100"
                  step="0.1"
                  value={data.broker_commission || ''}
                  onChange={(e) => setData({ ...data, broker_commission: e.target.value })}
                  style={{
                    width: '100%',
                    padding: width < 640 ? '14px' : '12px',
                    paddingRight: '40px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: width < 640 ? '16px' : '16px',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  fontSize: '16px'
                }}>%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StepInputs({ vertical, stepIndex, data, setData }: {
  vertical: string;
  stepIndex: number;
  data: FormDataType;
  setData: (d: FormDataType) => void;
}) {
  const { width } = useWindowSize();

  // For the first step (payment details), use our special component
  if (stepIndex === 0) {
    return <PaymentDetailsForm data={data} setData={setData} vertical={vertical} />;
  }

  // Define the input type and label for each step of each vertical
  const stepInputs: Record<string, { type: string; label: string; options?: string[]; placeholder?: string; min?: number; max?: number; step?: number; suffix?: string }> = {
    // Inmobiliaria
    inmobiliaria_step_1: { type: 'select', label: 'Tipo de operación', options: ['Enganche', 'Apartado', 'Renta', 'Compra-venta'] },
    inmobiliaria_step_2: { 
      type: 'textarea', 
      label: 'Condiciones de liberación y documentación', 
      placeholder: 'Ejemplo: El pago se liberará cuando el contrato de compra-venta esté firmado por ambas partes y se haya entregado la documentación requerida (escrituras, identificaciones, etc.)'
    },
    
    // Freelancer
    freelancer_step_1: { type: 'select', label: 'Tipo de servicio', options: ['Desarrollo web', 'Diseño gráfico', 'Marketing digital', 'Redacción', 'Consultoría', 'Otro'] },
    freelancer_step_2: { 
      type: 'textarea', 
      label: 'Condiciones de liberación y entregables', 
      placeholder: 'Ejemplo: El pago se liberará cuando se entregue el sitio web completamente funcional, con diseño responsive y cumpliendo todos los requisitos especificados en el brief.'
    },
    
    // Particulares
    particulares_step_1: { type: 'select', label: 'Tipo de producto', options: ['Compra-venta de vehículo', 'Venta de vehículo', 'Electrónicos', 'Electrodomésticos', 'Muebles', 'Otro'] },
    particulares_step_2: { 
      type: 'textarea', 
      label: 'Condiciones de liberación', 
      placeholder: 'Ejemplo: El pago se liberará cuando el producto sea entregado en las condiciones acordadas y el comprador confirme que está satisfecho con la compra.'
    }
  };

  const stepKey = `${vertical}_step_${stepIndex}`;
  const stepConfig = stepInputs[stepKey];

  if (!stepConfig) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
        Configuración del paso no encontrada
      </div>
    );
  }

  const renderInput = () => {
    const baseStyle = {
      width: '100%',
      padding: '10px',
      fontSize: '14px',
      borderRadius: '6px',
      border: '1px solid #d1d5db'
    };

    switch (stepConfig.type) {
      case 'select':
        return (
          <select
            value={data[stepKey] || ''}
            onChange={e => setData({ ...data, [stepKey]: e.target.value })}
            style={baseStyle}
          >
            <option value="">Selecciona una opción</option>
            {stepConfig.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={data[stepKey] || ''}
            onChange={e => setData({ ...data, [stepKey]: e.target.value })}
            placeholder={stepConfig.placeholder}
            rows={4}
            style={{ ...baseStyle, resize: 'vertical' }}
          />
        );
      
      default:
        return (
          <input
            type={stepConfig.type || 'text'}
            value={data[stepKey] || ''}
            onChange={e => setData({ ...data, [stepKey]: e.target.value })}
            placeholder={stepConfig.placeholder}
            min={stepConfig.min}
            max={stepConfig.max}
            step={stepConfig.step}
            style={baseStyle}
          />
        );
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>
        {stepConfig.label}
      </label>
      {renderInput()}
      {stepConfig.suffix && (
        <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
          {stepConfig.suffix}
        </span>
      )}
    </div>
  );
}

// Helper function to handle payment creation
async function handleCreatePayment(vertical: string, data: FormDataType, router: any) {
  try {
    // Get current user
    const resUser = await authFetch('/api/users/me');
    
    if (!resUser.ok) {
      throw new Error("No se pudo obtener el usuario actual.");
    }
    
    const userData = await resUser.json();
    if (!userData.user?.id || !userData.user?.email) {
      throw new Error("Datos de usuario inválidos.");
    }

    // Prepare payload for bridge wallet payment
    const payload = {
      user_id: userData.user.id,
      payer_email: userData.user.email,
      recipient_email: data.payee_email,
      amount: Number(data.payment_amount),
      currency: 'MXN',
      description: data.payment_description,
      custody_percent: data.custody_percent ? Number(data.custody_percent) : null,
      custody_period: data.custody_period ? Number(data.custody_period) : null,
      // Add nuevo-flujo specific fields
      payment_type: 'nuevo_flujo',
      vertical_type: vertical,
      release_conditions: data[`${vertical}_step_2`] || null,
      // Add commission fields if broker data exists
      ...(data.broker_email && data.broker_commission ? {
        commission_beneficiary_email: data.broker_email,
        commission_percent: Number(data.broker_commission)
      } : {})
    };

    console.log('Creating nuevo-flujo payment with payload:', payload);
    
    // Submit payment via bridge wallet endpoint
    const res = await authFetch('payments/initiate', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseData = await res.json();
    
    if (res.ok && responseData.success) {
      // Redirect to instructions page
      const paymentId = responseData.payment?.id || responseData.id;
      if (paymentId) {
        router.push(`/dashboard/pagos/${paymentId}/instrucciones`);
      } else {
        alert("Pago creado exitosamente!");
        router.push('/dashboard/pagos');
      }
    } else {
      throw new Error(responseData.error || "No se pudo crear el pago.");
    }
  } catch (error: any) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

// Summary view component
function SummaryView({ vertical, data }: { vertical: string; data: FormDataType }) {
  const steps = stepsByVertical[vertical] || [];
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#1e40af' }}>
        ✅ Configuración completada
      </h2>
      
      {/* Payment Summary */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <div style={{ marginBottom: '12px' }}>
          <strong style={{ color: '#374151' }}>💰 Monto:</strong> 
          <span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 600, color: '#065f46' }}>
            ${Number(data.payment_amount || 0).toLocaleString('es-MX')} MXN
          </span>
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <strong style={{ color: '#374151' }}>👤 Beneficiario:</strong> 
          <span style={{ marginLeft: '8px', color: '#6b7280' }}>{data.payee_email}</span>
        </div>

        {vertical === 'inmobiliaria' && data.broker_email && (
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>🏠 Asesor inmobiliario:</strong> 
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>{data.broker_email}</span>
          </div>
        )}
        {vertical === 'inmobiliaria' && data.broker_commission && (
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>📊 % Comisión:</strong> 
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>{data.broker_commission}%</span>
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <strong style={{ color: '#374151' }}>🔒 Custodia:</strong> 
          <span style={{ marginLeft: '8px', color: '#6b7280' }}>
            {data.custody_percent || '100'}% por {data.custody_period || '30'} días máximo
          </span>
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <strong style={{ color: '#374151' }}>📝 Descripción:</strong> 
          <span style={{ marginLeft: '8px', color: '#6b7280' }}>{data.payment_description}</span>
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <strong style={{ color: '#374151' }}>🏭 Sector:</strong> 
          <span style={{ marginLeft: '8px', color: '#6b7280' }}>{getVerticalDisplayName(vertical)}</span>
        </div>
      </div>

      {/* Vertical Configuration Summary */}
      <div style={{ 
        backgroundColor: '#fafafa', 
        padding: 20, 
        borderRadius: 12, 
        border: '1px solid #e5e7eb',
        marginBottom: 24
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#374151' }}>
          🔧 Configuración del flujo {getVerticalDisplayName(vertical)}
        </h3>
        <ol style={{ paddingLeft: 18, margin: 0 }}>
          {steps.map((label, idx) => {
            // Skip payment details step (0) and summary step (last step)
            if (idx === 0 || idx === steps.length - 1) return null;
            const stepKey = `${vertical}_step_${idx}`;
            const value = data[stepKey];
            let displayValue = value;
            if (typeof value === 'boolean') {
              displayValue = value ? 'Sí' : 'No';
            }
            return (
              <li key={idx} style={{ marginBottom: 8, fontSize: 14 }}>
                <strong>{label}:</strong> {displayValue || 'No especificado'}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

// Helper function to get vertical display name
function getVerticalDisplayName(vertical: string) {
  const verticals: Record<string, string> = {
    inmobiliaria: 'Inmobiliarias y agentes',
    freelancer: 'Freelancers y servicios',
    particulares: 'Compra-venta entre particulares'
  };
  return verticals[vertical] || 'Vertical no especificado';
}

export default function NuevoFlujoPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [wizardStep, setWizardStep] = useState(0);
  const [formData, setFormData] = useState<FormDataType>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const currentSteps = selected ? stepsByVertical[selected] : [];
  const isWizard = step === 2 && selected;
  const { width } = useWindowSize();

  function isStep0Valid(data: FormDataType) {
    return data.payment_amount && data.payee_email && data.payment_description;
  }

  function isFormValid(data: FormDataType) {
    return isStep0Valid(data) && data.custody_percent && data.custody_period;
  }

  const handleSubmit = async () => {
    if (!isFormValid(formData)) {
      alert('Por favor completa todos los campos obligatorios incluyendo la configuración de custodia.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await handleCreatePayment(selected as string, formData, router);
    } catch (error) {
      setError('Error creando pago. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "1rem" }}>
      {/* Back Link */}
      <button 
        onClick={() => router.push('/dashboard/crear-pago')}
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px',
          padding: '8px 12px',
          backgroundColor: 'transparent',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          color: '#6b7280',
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        <span style={{ marginRight: '8px' }}>←</span>
        Volver a tipos de pago
      </button>

      <h1 style={{ 
        fontSize: width < 640 ? "1.5rem" : "2rem", 
        fontWeight: "bold", 
        textAlign: "center", 
        marginBottom: 32 
      }}>
        🎯 Pago Condicional Premium
      </h1>
      {step === 1 && (
        <>
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: width < 640 ? 16 : 24, 
            justifyContent: "center" 
          }}>
            {useCases.map((c) => (
              <div
                key={c.key}
                onClick={() => setSelected(c.key)}
                style={{
                  cursor: "pointer",
                  border: selected === c.key ? "2px solid #2e7ef7" : "1px solid #e3e9f8",
                  borderRadius: 16,
                  background: selected === c.key ? "#e8f0fe" : "#fff",
                  boxShadow: selected === c.key ? "0 2px 12px #2e7ef733" : "none",
                  padding: width < 640 ? 16 : 24,
                  width: width < 640 ? "calc(100% - 2rem)" : 250,
                  minHeight: width < 640 ? 160 : 210,
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontSize: width < 640 ? 32 : 40, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ 
                  fontWeight: 700, 
                  fontSize: width < 640 ? 16 : 18, 
                  marginBottom: 8 
                }}>{c.title}</div>
                <div style={{ 
                  color: "#444", 
                  fontSize: width < 640 ? 14 : 15,
                  lineHeight: 1.4
                }}>{c.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              disabled={!selected}
              onClick={() => {
                setStep(2);
                setWizardStep(0);
              }}
              style={{
                background: selected ? "#2e7ef7" : "#b8c6e6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: width < 640 ? "10px 24px" : "12px 32px",
                fontWeight: 700,
                fontSize: width < 640 ? 16 : 17,
                cursor: selected ? "pointer" : "not-allowed",
                width: width < 640 ? "100%" : "auto",
                maxWidth: "300px"
              }}
            >
              Continuar
            </button>
          </div>
        </>
      )}
      {isWizard && (
        <div style={{ 
          maxWidth: width < 640 ? "100%" : 480, 
          margin: "32px auto", 
          background: "#fff", 
          borderRadius: 16, 
          boxShadow: "0 2px 12px #0001", 
          padding: width < 640 ? 20 : 32, 
          textAlign: "center" 
        }}>
          <h2 style={{ 
            marginBottom: 24, 
            color: "#2e7ef7",
            fontSize: width < 640 ? "1.2rem" : "1.5rem"
          }}>
            {useCases.find(c => c.key === selected)?.title}
          </h2>
          <div style={{ 
            fontWeight: 600, 
            fontSize: width < 640 ? 16 : 17, 
            marginBottom: 18 
          }}>
            Paso {wizardStep + 1} de {currentSteps.length - 1}
          </div>
          {/* Paso actual */}
          <div style={{ 
            fontSize: width < 640 ? 18 : 20, 
            marginBottom: 32,
            lineHeight: 1.3
          }}>
            {currentSteps[wizardStep]}
          </div>

          {/* Inputs dinámicos por vertical y paso */}
          <StepInputs
            vertical={selected as string}
            stepIndex={wizardStep}
            data={formData}
            setData={setFormData}
          />

          <div style={{ 
            display: "flex", 
            flexDirection: width < 640 ? "column" : "row",
            justifyContent: "space-between", 
            gap: 16, 
            marginTop: 32 
          }}>
            <button
              onClick={() => {
                if (wizardStep === 0) {
                  setStep(1);
                  setSelected(null);
                } else {
                  setWizardStep(wizardStep - 1);
                }
              }}
              style={{
                background: "#e3e9f8",
                color: "#2e7ef7",
                border: "none",
                borderRadius: 8,
                padding: "10px 28px",
                fontWeight: 700,
                fontSize: width < 640 ? 16 : 17,
                cursor: "pointer",
                minWidth: "120px"
              }}
            >
              {wizardStep === 0 ? "← Cambiar vertical" : "← Anterior"}
            </button>
            
            {/* Show "Siguiente" button only if NOT on final step */}
            {wizardStep < currentSteps.length - 2 && (
              <button
                disabled={wizardStep === 0 && (!isStep0Valid(formData))}
                onClick={() => {
                  if (wizardStep === 0 && !isStep0Valid(formData)) {
                    alert('Por favor completa todos los campos obligatorios antes de continuar.');
                    return;
                  }
                  setWizardStep(wizardStep + 1);
                }}
                style={{
                  background: (wizardStep === 0 && !isStep0Valid(formData)) ? "#b8c6e6" : "#2e7ef7",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 28px",
                  fontWeight: 700,
                  fontSize: width < 640 ? 16 : 17,
                  cursor: (wizardStep === 0 && !isStep0Valid(formData)) ? "not-allowed" : "pointer",
                  minWidth: "120px"
                }}
              >
                Siguiente →
              </button>
            )}
            
            {/* Show "Crear pago" button only on final step */}
            {wizardStep === currentSteps.length - 2 && (
              <button
                onClick={handleSubmit}
                disabled={loading || !isFormValid(formData)}
                style={{
                  background: (isFormValid(formData) && !loading) ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "#e5e7eb",
                  color: (isFormValid(formData) && !loading) ? "#fff" : "#9ca3af",
                  border: "none",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: (isFormValid(formData) && !loading) ? "pointer" : "not-allowed",
                  transition: "all 0.3s ease",
                  boxShadow: (isFormValid(formData) && !loading) ? "0 2px 8px rgba(16, 185, 129, 0.3)" : "none",
                  minWidth: "140px",
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Creando...' : '🚀 Crear pago'}
              </button>
            )}
          </div>

          {/* Loading Modal Overlay */}
          {loading && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}>
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                maxWidth: '320px',
                width: '90%'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid #e5e7eb',
                  borderTop: '4px solid #2e7ef7',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }}></div>
                <h3 style={{
                  color: '#1f2937',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>Creando tu pago</h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  margin: 0
                }}>Por favor espera, estamos configurando tu pago con custodia segura...</p>
              </div>
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {/* Resumen al final */}
          {wizardStep === currentSteps.length - 2 && (
            <div style={{ marginTop: 40, background: '#f6f9ff', borderRadius: 12, padding: 24, textAlign: 'left' }}>
              <h3 style={{ color: '#2e7ef7', fontWeight: 700, marginBottom: 12 }}>Resumen del flujo</h3>
              <SummaryView vertical={selected as string} data={formData} />
            </div>
          )}

        </div>
      )}
    </div>
  );
}
