"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { authFetch } from "../../../utils/authFetch";
import { MultipleBrokersSection } from "../../../components/MultipleBrokersSection";
import { calculatePlatformCommission, formatCurrency } from "../../../utils/platformCommissionConfig";


// Minimal utility for fetch with auth from localStorage
type FetchOptions = RequestInit & { headers?: Record<string, string> };

const useCases = [
  {
    id: "inmobiliaria",
    key: "inmobiliaria",
    icon: "🏠",
    title: "Inmobiliarias y agentes",
    subtitle: "Propiedades y bienes raíces",
    description: "Cierra ventas más rápido y genera confianza con tus clientes usando pagos en custodia.",
    features: [
      "Protege anticipos y apartados",
      "Comisiones automáticas para brokers",
      "Documentación inmobiliaria integrada",
      "Liberación condicional de fondos"
    ],
    color: "from-blue-500 to-blue-600",
    available: true
  },
  {
    id: "freelancer",
    key: "freelancer",
    icon: "💻",
    title: "Freelancers y servicios",
    subtitle: "Servicios profesionales",
    description: "Asegura tu pago antes de comenzar a trabajar. El cliente deposita en custodia y tú entregas con tranquilidad.",
    features: [
      "Pago garantizado antes de trabajar",
      "Protección contra impagos",
      "Entregables verificables",
      "Liberación automática por tiempo"
    ],
    color: "from-purple-500 to-purple-600",
    available: true
  },
  {
    id: "ecommerce",
    key: "ecommerce",
    icon: "🛒",
    title: "E-commerce y ventas online",
    subtitle: "Tiendas en línea",
    description: "Ofrece máxima confianza a tus compradores. El pago queda protegido hasta que el producto llega en buen estado.",
    features: [
      "Protección del comprador",
      "Verificación de entrega",
      "Devoluciones seguras",
      "Integración con tiendas online"
    ],
    color: "from-green-500 to-green-600",
    available: true
  },
  {
    id: "particulares",
    key: "particulares",
    icon: "🤝",
    title: "Compra-venta entre particulares",
    subtitle: "Transacciones P2P",
    description: "Evita fraudes en ventas de autos, gadgets, muebles y más. El dinero solo se libera cuando se cumplen las condiciones.",
    features: [
      "Prevención de fraudes",
      "Verificación de productos",
      "Transacciones seguras P2P",
      "Múltiples categorías de productos"
    ],
    color: "from-orange-500 to-orange-600",
    available: true
  },
  {
    id: "b2b",
    key: "b2b",
    icon: "🏢",
    title: "Empresas B2B y control de entregas",
    subtitle: "Soluciones empresariales",
    description: "Gestiona proyectos empresariales con pagos por hitos y control de entregas.",
    features: [
      "Pagos por hitos y milestones",
      "Control de entregas por fases",
      "Verificación de calidad",
      "Proyectos largos y complejos"
    ],
    color: "from-indigo-500 to-indigo-600",
    available: true
  },
  {
    id: "marketplace",
    key: "marketplace",
    icon: "🌐",
    title: "Marketplaces de servicios",
    subtitle: "Plataformas de servicios",
    description: "Facilita pagos en custodia en marketplaces donde se ofrecen servicios y es fundamental asegurar la entrega.",
    features: [
      "Integración con marketplaces",
      "Verificación de servicios",
      "Satisfacción garantizada",
      "Conexión profesionales-clientes"
    ],
    color: "from-teal-500 to-teal-600",
    available: true
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
  particulares: [
    "Datos del pago y participantes",
    "Tipo de transacción",
    "Condiciones de liberación y entrega",
    "Resumen y creación"
  ],
  b2b: [
    "Datos del pago y participantes",
    "Configuración de hitos y pagos parciales",
    "Condiciones de liberación y control de entregas",
    "Resumen y creación"
  ],
  ecommerce: [
    "Datos del pago y participantes",
    "Tipo de producto",
    "Condiciones de liberación y entrega",
    "Resumen y creación"
  ],
  marketplace: [
    "Datos del pago y participantes",
    "Tipo de servicio en marketplace",
    "Condiciones de liberación y satisfacción",
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
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          💡 Monto base de la transacción antes de comisiones. Se agregará la comisión de plataforma al total.
        </p>
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
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          📋 Describe claramente qué se está pagando. Esta información será visible para ambas partes.
        </p>
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
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          👤 El beneficiario debe estar registrado en Kustodia. Si no tiene cuenta, recibirá instrucciones por email.
        </p>
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

      {/* Multiple brokers commission fields for inmobiliaria */}
      {vertical === 'inmobiliaria' && (
        <MultipleBrokersSection data={data} setData={setData} width={width} />
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
  const stepInputs: Record<string, { type: string; label: string; options?: string[]; placeholder?: string; min?: number; max?: number; step?: number; suffix?: string; helperText?: string }> = {
    // Inmobiliaria
    inmobiliaria_step_1: { 
      type: 'select', 
      label: 'Tipo de operación', 
      options: ['Enganche', 'Apartado', 'Renta', 'Compra-venta'],
      helperText: '🏠 Selecciona el tipo de transacción inmobiliaria. Esto ayuda a personalizar las condiciones de liberación.'
    },
    inmobiliaria_step_2: { 
      type: 'textarea', 
      label: 'Condiciones de liberación y documentación', 
      placeholder: 'Ejemplo: El pago se liberará cuando el contrato de compra-venta esté firmado por ambas partes y se haya entregado la documentación requerida (escrituras, identificaciones, etc.)',
      helperText: '📋 Define claramente qué debe suceder para liberar el pago. Incluye documentos necesarios y condiciones específicas.'
    },
    
    // Freelancer
    freelancer_step_1: { 
      type: 'select', 
      label: 'Tipo de servicio', 
      options: ['Desarrollo web', 'Diseño gráfico', 'Marketing digital', 'Redacción', 'Consultoría', 'Otro'],
      helperText: '💻 Categoriza tu servicio profesional. Esto ayuda a establecer expectativas claras sobre los entregables.'
    },
    freelancer_step_2: { 
      type: 'textarea', 
      label: 'Condiciones de liberación y entregables', 
      placeholder: 'Ejemplo: El pago se liberará cuando se entregue el sitio web completamente funcional, con diseño responsive y cumpliendo todos los requisitos especificados en el brief.',
      helperText: '✅ Especifica exactamente qué entregarás y cuándo se considerará completado el trabajo. Sé específico para evitar malentendidos.'
    },
    
    // Particulares
    particulares_step_1: { 
      type: 'select', 
      label: 'Tipo de producto', 
      options: ['Compra-venta de vehículo', 'Venta de vehículo', 'Electrónicos', 'Electrodomésticos', 'Muebles', 'Otro'],
      helperText: '🛍️ Categoriza el producto que estás vendiendo. Esto ayuda a establecer condiciones apropiadas para la transacción.'
    },
    particulares_step_2: { 
      type: 'textarea', 
      label: 'Condiciones de liberación', 
      placeholder: 'Ejemplo: El pago se liberará cuando el producto sea entregado en las condiciones acordadas y el comprador confirme que está satisfecho con la compra.',
      helperText: '🤝 Define cuándo y cómo se liberará el pago. Incluye condiciones de entrega, inspección y aceptación del producto.'
    },
    
    // B2B
    b2b_step_1: { 
      type: 'select', 
      label: 'Configuración de hitos', 
      options: ['Pago único (100%)', 'Dos hitos (50% - 50%)', 'Tres hitos (40% - 30% - 30%)', 'Cuatro hitos (25% cada uno)', 'Configuración personalizada'],
      helperText: '🏢 Divide el proyecto en hitos para pagos parciales. Esto reduce riesgo y mejora el flujo de caja para ambas partes.'
    },
    b2b_step_2: { 
      type: 'textarea', 
      label: 'Condiciones de liberación y control de entregas', 
      placeholder: 'Ejemplo: Hito 1: Entrega de diseños y wireframes aprobados. Hito 2: Desarrollo completado y testing exitoso. Hito 3: Implementación en producción y capacitación del equipo.',
      helperText: '📊 Define claramente cada hito del proyecto y qué debe completarse para liberar cada pago. Sé específico en los entregables.'
    },

    // E-commerce
    ecommerce_step_1: {
      type: 'select',
      label: 'Tipo de producto',
      options: ['Electrónicos', 'Ropa y accesorios', 'Hogar y jardín', 'Deportes', 'Libros y medios', 'Otro'],
      helperText: '🛒 Categoriza tu producto para establecer condiciones de entrega y verificación apropiadas.'
    },
    ecommerce_step_2: {
      type: 'textarea',
      label: 'Condiciones de liberación y entrega',
      placeholder: 'Ejemplo: El pago se liberará cuando el producto sea entregado al comprador, verificado en buen estado y sin daños, con un período de 3 días para reportar cualquier problema.',
      helperText: '📦 Define las condiciones de entrega, verificación del producto y período de gracia para reclamos.'
    },

    // Marketplace
    marketplace_step_1: {
      type: 'select',
      label: 'Tipo de servicio en marketplace',
      options: ['Servicios profesionales', 'Servicios creativos', 'Servicios técnicos', 'Consultoría', 'Educación y tutorías', 'Otro'],
      helperText: '🌐 Especifica el tipo de servicio que ofreces en el marketplace para personalizar las condiciones.'
    },
    marketplace_step_2: {
      type: 'textarea',
      label: 'Condiciones de liberación y satisfacción',
      placeholder: 'Ejemplo: El pago se liberará cuando el servicio sea completado según las especificaciones acordadas y el cliente confirme su satisfacción dentro de 5 días hábiles.',
      helperText: '⭐ Define claramente cuándo se considera completado el servicio y el proceso de confirmación de satisfacción del cliente.'
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
      {stepConfig.helperText && (
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', lineHeight: '1.4' }}>
          {stepConfig.helperText}
        </p>
      )}
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
      // Add commission fields - support both single broker (legacy) and multiple brokers
      ...(data.commission_recipients && data.commission_recipients.length > 0 ? {
        commission_recipients: data.commission_recipients.map((broker: any) => ({
          broker_email: broker.broker_email,
          broker_name: broker.broker_name || '',
          broker_percentage: Number(broker.broker_percentage)
        }))
      } : data.broker_email && data.broker_commission ? {
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
  
  // Calculate platform commission
  const platformCommission = data.payment_amount 
    ? calculatePlatformCommission(parseFloat(data.payment_amount), 'nuevo_flujo')
    : { percent: 0, amount: 0, totalAmountToPay: 0 };
  
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
        
        {/* Platform Commission Breakdown */}
        {data.payment_amount && parseFloat(data.payment_amount) > 0 && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af', marginBottom: '8px' }}>
              💰 Desglose de Pago Transparente
            </div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Monto base:</span>
                <span style={{ fontWeight: 500 }}>{formatCurrency(parseFloat(data.payment_amount))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Comisión plataforma ({platformCommission.percent}%):</span>
                <span style={{ fontWeight: 500 }}>{formatCurrency(platformCommission.amount)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                borderTop: '1px solid #bfdbfe', 
                paddingTop: '4px', 
                marginTop: '8px',
                fontWeight: 600,
                color: '#1e40af'
              }}>
                <span>Total a pagar:</span>
                <span>{formatCurrency(platformCommission.totalAmountToPay)}</span>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
              ℹ️ Comisión por servicio de custodia digital.
            </div>
          </div>
        )}
        
        <div style={{ marginBottom: '12px' }}>
          <strong style={{ color: '#374151' }}>👤 Beneficiario:</strong> 
          <span style={{ marginLeft: '8px', color: '#6b7280' }}>{data.payee_email}</span>
        </div>

        {/* Multiple Brokers Support */}
        {vertical === 'inmobiliaria' && data.commission_recipients && data.commission_recipients.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>🏠 Asesores inmobiliarios:</strong>
            <div style={{ marginLeft: '8px', marginTop: '8px' }}>
              {data.commission_recipients.map((broker: any, index: number) => (
                <div key={index} style={{ 
                  backgroundColor: '#f9fafb', 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  marginBottom: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}>
                    {broker.broker_name || broker.broker_email} - {broker.broker_percentage}%
                  </div>
                  {broker.broker_name && (
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      {broker.broker_email}
                    </div>
                  )}
                </div>
              ))}
              <div style={{ 
                fontSize: '12px', 
                color: '#059669', 
                fontWeight: 600, 
                marginTop: '8px' 
              }}>
                💰 Total comisiones: {data.commission_recipients.reduce((sum: number, broker: any) => sum + (Number(broker.broker_percentage) || 0), 0).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
        
        {/* Legacy Single Broker Support */}
        {vertical === 'inmobiliaria' && !data.commission_recipients && data.broker_email && (
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>🏠 Asesor inmobiliario:</strong> 
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>{data.broker_email}</span>
          </div>
        )}
        {vertical === 'inmobiliaria' && !data.commission_recipients && data.broker_commission && (
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
    <div style={{ 
      maxWidth: width < 1024 ? "100%" : "1200px", 
      margin: "2rem auto", 
      padding: width < 640 ? "1rem" : "1.5rem" 
    }}>
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
        Volver a tipos de movimiento
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
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: width < 640 ? '0 16px' : '0 24px'
          }}>
            {/* Page Header */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: width < 640 ? '32px' : '48px'
            }}>
              <p style={{
                fontSize: width < 640 ? '16px' : width < 1024 ? '18px' : '20px',
                color: '#6b7280',
                lineHeight: '1.6',
                maxWidth: '768px',
                margin: '0 auto',
                padding: '0 16px'
              }}>
                Selecciona el tipo de transacción que mejor se adapte a tu negocio. 
                Cada opción está optimizada para diferentes industrias.
              </p>
            </div>

            {/* Transaction Types Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: width < 768 ? '1fr' : 'repeat(2, 1fr)',
              gap: width < 640 ? '20px' : '24px',
              marginBottom: width < 640 ? '40px' : '48px',
              alignItems: 'stretch'
            }}>
              {useCases.filter(c => c.key !== 'ecommerce' && c.key !== 'marketplace').map((useCase) => (
                <div
                  key={useCase.id}
                  style={{
                    position: 'relative',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e5e7eb',
                    padding: width < 640 ? '20px' : '24px',
                    cursor: useCase.available ? 'pointer' : 'not-allowed',
                    opacity: useCase.available ? 1 : 0.6,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: width < 640 ? '320px' : '380px'
                  }}
                  onClick={() => {
                    if (useCase.available) {
                      setSelected(useCase.key);
                      setStep(2);
                      setWizardStep(0);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (useCase.available) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (useCase.available) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Icon and Title */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px', 
                      marginBottom: '16px' 
                    }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: (() => {
                          const colors: { [key: string]: string } = {
                            'from-blue-500 to-blue-600': 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            'from-purple-500 to-purple-600': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            'from-orange-500 to-orange-600': 'linear-gradient(135deg, #f97316, #ea580c)',
                            'from-indigo-500 to-indigo-600': 'linear-gradient(135deg, #6366f1, #4f46e5)'
                          };
                          return colors[useCase.color] || '#3b82f6';
                        })(),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        flexShrink: 0
                      }}>
                        <span style={{ color: 'white' }}>{useCase.icon}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          fontSize: width < 640 ? '18px' : '20px',
                          fontWeight: '700',
                          color: '#111827',
                          marginBottom: '4px',
                          lineHeight: '1.2'
                        }}>
                          {useCase.title}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: 0
                        }}>
                          {useCase.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{
                        fontSize: '14px',
                        color: '#374151',
                        lineHeight: '1.5',
                        margin: 0
                      }}>
                        {useCase.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div style={{ 
                      marginBottom: '24px',
                      flex: 1
                    }}>
                      {useCase.features.map((feature: string, index: number) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#10b981',
                            borderRadius: '50%',
                            flexShrink: 0
                          }}></div>
                          <span style={{
                            fontSize: '14px',
                            color: '#374151',
                            lineHeight: '1.4'
                          }}>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div style={{ marginTop: 'auto' }}>
                      <button
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '14px',
                          border: 'none',
                          cursor: useCase.available ? 'pointer' : 'not-allowed',
                          background: useCase.available 
                            ? (() => {
                                const colors: { [key: string]: string } = {
                                  'from-blue-500 to-blue-600': 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                  'from-purple-500 to-purple-600': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                  'from-orange-500 to-orange-600': 'linear-gradient(135deg, #f97316, #ea580c)',
                                  'from-indigo-500 to-indigo-600': 'linear-gradient(135deg, #6366f1, #4f46e5)'
                                };
                                return colors[useCase.color] || '#3b82f6';
                              })()
                            : '#e5e7eb',
                          color: useCase.available ? 'white' : '#9ca3af',
                          transition: 'all 0.2s ease',
                          boxShadow: useCase.available ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
                        }}
                        disabled={!useCase.available}
                        onClick={() => {
                          if (useCase.available) {
                            setSelected(useCase.key);
                            setStep(2);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (useCase.available) {
                            e.currentTarget.style.opacity = '0.9';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (useCase.available) {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                          }
                        }}
                      >
                        {useCase.available ? 'Seleccionar' : 'Próximamente'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Help Section */}
            <div style={{
              marginTop: width < 640 ? '48px' : '64px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e5e7eb',
              padding: width < 640 ? '24px' : '32px'
            }}>
              <div style={{ 
                textAlign: 'center', 
                marginBottom: width < 640 ? '24px' : '32px' 
              }}>
                <h2 style={{
                  fontSize: width < 640 ? '20px' : '24px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '16px',
                  margin: 0
                }}>
                  ¿Cuál es la diferencia?
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  maxWidth: '512px',
                  margin: '16px auto 0',
                  lineHeight: '1.5'
                }}>
                  Cada tipo de transacción tiene campos específicos y configuraciones optimizadas para diferentes industrias.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: width < 640 ? '1fr' : 'repeat(2, 1fr)',
                gap: width < 640 ? '24px' : '32px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '24px'
                  }}>
                    <span>🏠</span>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                  }}>Inmobiliaria</h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.4',
                    margin: 0
                  }}>
                    Campos específicos para propiedades, comisiones de brokers y documentación inmobiliaria.
                  </p>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#f3e8ff',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '24px'
                  }}>
                    <span>💻</span>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                  }}>Freelancers</h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.4',
                    margin: 0
                  }}>
                    Servicios profesionales con entregables verificables y protección de pagos.
                  </p>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#fed7aa',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '24px'
                  }}>
                    <span>🤝</span>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                  }}>Particulares</h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.4',
                    margin: 0
                  }}>
                    Transacciones P2P seguras con verificación de productos y prevención de fraudes.
                  </p>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#e0e7ff',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '24px'
                  }}>
                    <span>🏢</span>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                  }}>B2B</h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.4',
                    margin: 0
                  }}>
                    Proyectos empresariales con pagos por hitos y control de entregas por fases.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {isWizard && (
        <div style={{ 
          maxWidth: width < 640 ? "100%" : width < 1024 ? "720px" : "800px", 
          margin: "32px auto", 
          background: "#fff", 
          borderRadius: 16, 
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", 
          padding: width < 640 ? "20px" : width < 1024 ? "32px" : "40px", 
          textAlign: "left" 
        }}>
          {/* Form Header */}
          <div style={{ 
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "24px",
            marginBottom: "32px"
          }}>
            <h2 style={{ 
              fontSize: width < 640 ? "1.25rem" : "1.5rem",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "8px"
            }}>
              {useCases.find(c => c.key === selected)?.title}
            </h2>
            {/* Numbered Circle Progress Bar */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              marginBottom: "16px" 
            }}>
              {currentSteps.slice(0, -1).map((stepTitle, index) => (
                <div key={index} style={{
                  flex: 1,
                  textAlign: "center",
                  color: index <= wizardStep ? "#2e7ef7" : "#9ca3af"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    margin: "0 auto 8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: index <= wizardStep ? "#2e7ef7" : "#e5e7eb",
                    color: index <= wizardStep ? "#ffffff" : "#9ca3af",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}>
                    {index + 1}
                  </div>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: "500",
                    display: width < 640 ? "none" : "block"
                  }}>
                    {stepTitle.length > 20 ? stepTitle.substring(0, 20) + "..." : stepTitle}
                  </div>
                </div>
              ))}
            </div>
            {/* Horizontal Progress Bar */}
            <div style={{
              width: "100%",
              backgroundColor: "#e5e7eb",
              borderRadius: "4px",
              height: "8px",
              marginBottom: "16px"
            }}>
              <div style={{
                backgroundColor: "#2e7ef7",
                height: "8px",
                borderRadius: "4px",
                transition: "width 0.3s ease",
                width: `${((wizardStep + 1) / (currentSteps.length - 1)) * 100}%`
              }} />
            </div>
            <h3 style={{ 
              fontSize: width < 640 ? "16px" : "18px",
              fontWeight: "500",
              color: "#374151",
              lineHeight: "1.4"
            }}>
              {currentSteps[wizardStep]}
            </h3>
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
                borderRadius: "8px",
                padding: "12px 24px",
                fontWeight: "600",
                fontSize: "16px",
                cursor: "pointer",
                minWidth: "140px",
                transition: "all 0.2s ease"
              }}
            >
              {wizardStep === 0 ? "← Volver a tipos de movimiento" : "← Anterior"}
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
                  borderRadius: "8px",
                  padding: "12px 24px",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: (wizardStep === 0 && !isStep0Valid(formData)) ? "not-allowed" : "pointer",
                  minWidth: "140px",
                  transition: "all 0.2s ease"
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
