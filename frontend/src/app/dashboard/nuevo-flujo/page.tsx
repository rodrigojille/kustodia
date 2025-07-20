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

// Product-specific fields component
function ProductSpecificFields({ transactionType, data, setData, width }: {
  transactionType: string;
  data: FormDataType;
  setData: (d: FormDataType) => void;
  width: number;
}) {
  const isVehicle = transactionType.toLowerCase().includes('vehículo');
  const isElectronics = transactionType === 'Electrónicos';
  const isAppliances = transactionType === 'Electrodomésticos';
  const isFurniture = transactionType === 'Muebles';

  return (
    <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
        📝 Información del producto
      </h4>
      
      {/* Transaction Type - Common for all categories */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Tipo de transacción</label>
        <select
          value={data['transaction_subtype'] || ''}
          onChange={e => setData({ ...data, transaction_subtype: e.target.value })}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '14px',
            borderRadius: '6px',
            border: '1px solid #d1d5db'
          }}
        >
          <option value="">Selecciona el tipo</option>
          <option value="Apartado">Apartado</option>
          <option value="Enganche">Enganche</option>
          <option value="Compraventa">Compraventa</option>
        </select>
      </div>
      
      {/* Vehicle-specific fields */}
      {isVehicle && (
        <div style={{ display: 'grid', gridTemplateColumns: width < 768 ? '1fr' : '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Marca</label>
            <select
              value={data['vehicle_brand'] || ''}
              onChange={e => setData({ ...data, vehicle_brand: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
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
              <option value="Volkswagen">Volkswagen</option>
              <option value="BMW">BMW</option>
              <option value="Mercedes-Benz">Mercedes-Benz</option>
              <option value="Audi">Audi</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Modelo</label>
            <input
              type="text"
              value={data['vehicle_model'] || ''}
              onChange={e => setData({ ...data, vehicle_model: e.target.value })}
              placeholder="Ej: Corolla, Civic, F-150"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            />
          </div>
          
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Año</label>
            <input
              type="number"
              value={data['vehicle_year'] || ''}
              onChange={e => setData({ ...data, vehicle_year: e.target.value })}
              placeholder="2020"
              min="1990"
              max="2025"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            />
          </div>
          
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Kilometraje</label>
            <input
              type="number"
              value={data['vehicle_mileage'] || ''}
              onChange={e => setData({ ...data, vehicle_mileage: e.target.value })}
              placeholder="50000"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            />
          </div>
          
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Condición</label>
            <select
              value={data['vehicle_condition'] || ''}
              onChange={e => setData({ ...data, vehicle_condition: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            >
              <option value="">Selecciona</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Seminuevo">Seminuevo</option>
              <option value="Usado">Usado</option>
              <option value="Para reparar">Para reparar</option>
            </select>
          </div>
          
          <div style={{ gridColumn: width < 768 ? '1' : '1 / -1' }}>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Número de serie/VIN</label>
            <input
              type="text"
              value={data['vehicle_serial'] || ''}
              onChange={e => setData({ ...data, vehicle_serial: e.target.value.toUpperCase() })}
              placeholder="Ej: 1HGBH41JXMN109186"
              maxLength={17}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontFamily: 'monospace'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Electronics-specific fields */}
      {isElectronics && (
        <div style={{ display: 'grid', gridTemplateColumns: width < 768 ? '1fr' : '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Marca</label>
            <input
              type="text"
              value={data['electronics_brand'] || ''}
              onChange={e => setData({ ...data, electronics_brand: e.target.value })}
              placeholder="Ej: Apple, Samsung, Sony"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            />
          </div>
          
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Modelo</label>
            <input
              type="text"
              value={data['electronics_model'] || ''}
              onChange={e => setData({ ...data, electronics_model: e.target.value })}
              placeholder="Ej: iPhone 15, Galaxy S24"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            />
          </div>
          
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Condición</label>
            <select
              value={data['electronics_condition'] || ''}
              onChange={e => setData({ ...data, electronics_condition: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            >
              <option value="">Selecciona</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Como nuevo">Como nuevo</option>
              <option value="Muy bueno">Muy bueno</option>
              <option value="Bueno">Bueno</option>
              <option value="Usado">Usado</option>
            </select>
          </div>
          
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Garantía</label>
            <select
              value={data['electronics_warranty'] || ''}
              onChange={e => setData({ ...data, electronics_warranty: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            >
              <option value="">Selecciona</option>
              <option value="Sin garantía">Sin garantía</option>
              <option value="Garantía del fabricante">Garantía del fabricante</option>
              <option value="Garantía extendida">Garantía extendida</option>
            </select>
          </div>
          
          <div style={{ gridColumn: width < 768 ? '1' : '1 / -1' }}>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Número de serie</label>
            <input
              type="text"
              value={data['electronics_serial'] || ''}
              onChange={e => setData({ ...data, electronics_serial: e.target.value })}
              placeholder="Ej: ABC123456789"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontFamily: 'monospace'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Appliances-specific fields */}
      {isAppliances && (
        <div style={{ display: 'grid', gridTemplateColumns: width < 768 ? '1fr' : '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Tipo de electrodoméstico</label>
            <select
              value={data['appliance_type'] || ''}
              onChange={e => setData({ ...data, appliance_type: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            >
              <option value="">Selecciona</option>
              <option value="Refrigerador">Refrigerador</option>
              <option value="Lavadora">Lavadora</option>
              <option value="Secadora">Secadora</option>
              <option value="Lavavajillas">Lavavajillas</option>
              <option value="Microondas">Microondas</option>
              <option value="Estufa">Estufa</option>
              <option value="Horno">Horno</option>
              <option value="Aire acondicionado">Aire acondicionado</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Marca</label>
            <input
              type="text"
              value={data['appliance_brand'] || ''}
              onChange={e => setData({ ...data, appliance_brand: e.target.value })}
              placeholder="Ej: LG, Samsung, Whirlpool"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            />
          </div>
          
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Años de uso</label>
            <input
              type="number"
              value={data['appliance_age'] || ''}
              onChange={e => setData({ ...data, appliance_age: e.target.value })}
              placeholder="2"
              min="0"
              max="20"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            />
          </div>
          
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Eficiencia energética</label>
            <select
              value={data['appliance_efficiency'] || ''}
              onChange={e => setData({ ...data, appliance_efficiency: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            >
              <option value="">Selecciona</option>
              <option value="A++">A++</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="No aplica">No aplica</option>
            </select>
          </div>
          
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Condición</label>
            <select
              value={data['appliance_condition'] || ''}
              onChange={e => setData({ ...data, appliance_condition: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            >
              <option value="">Selecciona</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Como nuevo">Como nuevo</option>
              <option value="Muy bueno">Muy bueno</option>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Necesita reparación">Necesita reparación</option>
            </select>
          </div>
          
          <div style={{ gridColumn: width < 768 ? '1' : '1 / -1' }}>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Número de serie/modelo</label>
            <input
              type="text"
              value={data['appliance_serial'] || ''}
              onChange={e => setData({ ...data, appliance_serial: e.target.value })}
              placeholder="Ej: LG12345ABC789"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontFamily: 'monospace'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Furniture-specific fields */}
      {isFurniture && (
        <div style={{ display: 'grid', gridTemplateColumns: width < 768 ? '1fr' : '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Tipo de mueble</label>
            <select
              value={data['furniture_type'] || ''}
              onChange={e => setData({ ...data, furniture_type: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            >
              <option value="">Selecciona</option>
              <option value="Sofá">Sofá</option>
              <option value="Mesa">Mesa</option>
              <option value="Silla">Silla</option>
              <option value="Cama">Cama</option>
              <option value="Armario">Armario</option>
              <option value="Librero">Librero</option>
              <option value="Escritorio">Escritorio</option>
              <option value="Cómoda">Cómoda</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Material</label>
            <select
              value={data['furniture_material'] || ''}
              onChange={e => setData({ ...data, furniture_material: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            >
              <option value="">Selecciona</option>
              <option value="Madera">Madera</option>
              <option value="Metal">Metal</option>
              <option value="Plástico">Plástico</option>
              <option value="Vidrio">Vidrio</option>
              <option value="Tela">Tela</option>
              <option value="Cuero">Cuero</option>
              <option value="Mixto">Mixto</option>
            </select>
          </div>
          
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Dimensiones (aprox.)</label>
            <input
              type="text"
              value={data['furniture_dimensions'] || ''}
              onChange={e => setData({ ...data, furniture_dimensions: e.target.value })}
              placeholder="Ej: 200x100x80 cm"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            />
          </div>
          
          <div>
            <label style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 6, color: '#374151' }}>Condición</label>
            <select
              value={data['furniture_condition'] || ''}
              onChange={e => setData({ ...data, furniture_condition: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            >
              <option value="">Selecciona</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Como nuevo">Como nuevo</option>
              <option value="Muy bueno">Muy bueno</option>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Necesita reparación">Necesita reparación</option>
            </select>
          </div>
        </div>
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
  // For MVP: text, select, checkbox, file (if needed)
  // You can expand this logic for richer forms later
  const stepInputs: Record<string, { type: string; label: string; options?: string[]; placeholder?: string; min?: number; max?: number; step?: number; suffix?: string }> = {
    // Inmobiliaria
    inmobiliaria_step_1: { type: 'select', label: 'Tipo de operación', options: ['Enganche', 'Apartado', 'Renta', 'Compra-venta'] },
    inmobiliaria_step_2: { 
      type: 'textarea', 
      label: 'Condiciones de liberación y documentación', 
      placeholder: 'Ejemplo: El pago se liberará cuando el contrato de compra-venta esté firmado por ambas partes y se haya entregado la documentación requerida (escrituras, identificaciones, etc.)'
    },
    // Removed inmobiliaria_step_3 and inmobiliaria_step_4
  
    // Freelancer
    freelancer_step_1: { type: 'select', label: 'Tipo de servicio', options: ['Desarrollo web', 'Diseño gráfico', 'Marketing digital', 'Redacción', 'Consultoría', 'Otro'] },
    freelancer_step_2: { 
      type: 'textarea', 
      label: 'Condiciones de liberación y entregables', 
      placeholder: 'Ejemplo: El pago se liberará cuando se entregue el sitio web completamente funcional, con diseño responsive y cumpliendo todos los requisitos especificados en el brief.'
    },
  
    // E-commerce
    ecommerce_step_1: { type: 'select', label: 'Tipo de producto/servicio', options: ['Producto físico', 'Producto digital', 'Suscripción', 'Servicio'] },
    ecommerce_step_2: { 
      type: 'textarea', 
      label: 'Condiciones de liberación y entrega', 
      placeholder: 'Ejemplo: El pago se liberará cuando el comprador confirme que recibió el producto en buen estado y cumple con las especificaciones descritas.'
    },
  
    // Particulares
    particulares_step_1: { type: 'select', label: 'Tipo de transacción', options: ['Compra-venta de vehículo', 'Venta de vehículo', 'Electrodomésticos', 'Muebles', 'Electrónicos', 'Otro'] },
    particulares_step_2: { 
      type: 'textarea', 
      label: 'Condiciones de liberación y entrega', 
      placeholder: 'Ejemplo: El pago se liberará cuando se haga la entrega física del artículo y el comprador verifique que está en las condiciones acordadas.'
    },
  
    // B2B
    b2b_step_1: { type: 'select', label: 'Tipo de servicio empresarial', options: ['Consultoría', 'Software/IT', 'Logística', 'Marketing', 'Legal', 'Contabilidad'] },
    b2b_step_2: { 
      type: 'textarea', 
      label: 'Condiciones de liberación y entregables', 
      placeholder: 'Ejemplo: El pago se liberará cuando se complete la implementación del sistema y se proporcione la capacitación acordada al equipo.'
    },
  
    // Marketplace
    marketplace_step_1: { type: 'select', label: 'Categoría del servicio', options: ['Servicios domésticos', 'Profesionales', 'Creativos', 'Técnicos', 'Educativos'] },
    marketplace_step_2: { 
      type: 'textarea', 
      label: 'Condiciones de liberación y servicio', 
      placeholder: 'Ejemplo: El pago se liberará cuando el servicio sea completado satisfactoriamente según los términos acordados y el cliente confirme su satisfacción.'
    }
  };
  const stepKey = getStepKey(vertical, stepIndex);
  const input = stepInputs[stepKey];
  if (!input) return null;
  const value = data[stepKey] ?? (input.type === 'checkbox' ? false : '');
  
  // Get the selected transaction type for particulares to show conditional fields
  const transactionType = vertical === 'particulares' && stepIndex === 1 ? data['particulares_step_1'] : null;
  
  return (
    <div style={{ margin: '24px 0' }}>
      <label style={{ fontWeight: 500, fontSize: 16, display: 'block', marginBottom: 8 }}>{input.label}</label>
      {input.type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={e => setData({ ...data, [stepKey]: e.target.value })}
          style={{
            width: '100%',
            padding: width < 640 ? '14px' : '12px',
            fontSize: width < 640 ? '16px' : '16px',
            borderRadius: '8px',
            border: '1px solid #c6d2e6'
          }}
        />
      )}
      {input.type === 'select' && input.options && (
        <select
          value={value}
          onChange={e => setData({ ...data, [stepKey]: e.target.value })}
          style={{
            width: '100%',
            padding: width < 640 ? '14px' : '12px',
            fontSize: width < 640 ? '16px' : '16px',
            borderRadius: '8px',
            border: '1px solid #c6d2e6'
          }}
        >
          <option value="">Selecciona una opción</option>
          {input.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
      {input.type === 'textarea' && (
        <textarea
          value={value}
          onChange={e => setData({ ...data, [stepKey]: e.target.value })}
          style={{
            width: '100%',
            padding: width < 640 ? '14px' : '12px',
            fontSize: width < 640 ? '16px' : '16px',
            borderRadius: '8px',
            border: '1px solid #c6d2e6',
            minHeight: width < 640 ? '120px' : '120px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
          placeholder={input.placeholder}
          rows={5}
        />
      )}
      {input.type === 'checkbox' && (
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => setData({ ...data, [stepKey]: e.target.checked })}
          />
          Sí
        </label>
      )}
      {input.type === 'email' && (
        <input
          type="email"
          value={value}
          onChange={e => setData({ ...data, [stepKey]: e.target.value })}
          style={{
            width: '100%',
            padding: width < 640 ? '14px' : '12px',
            fontSize: width < 640 ? '16px' : '16px',
            borderRadius: '8px',
            border: '1px solid #c6d2e6'
          }}
          placeholder={input.placeholder}
        />
      )}
      {input.type === 'number' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="number"
            min={input.min}
            max={input.max}
            step={input.step}
            value={value}
            onChange={e => setData({ ...data, [stepKey]: e.target.value })}
            style={{
              width: '100%',
              padding: width < 640 ? '14px' : '12px',
              fontSize: width < 640 ? '16px' : '16px',
              borderRadius: '8px',
              border: '1px solid #c6d2e6'
            }}
            placeholder={input.placeholder}
          />
          <span style={{ fontSize: '16px', color: '#6b7280', fontWeight: 500 }}>{input.suffix}</span>
        </div>
      )}
      
      {/* Product-specific fields for particulares vertical */}
      {vertical === 'particulares' && stepIndex === 1 && transactionType && (
        <ProductSpecificFields 
          transactionType={transactionType} 
          data={data} 
          setData={setData} 
          width={width}
        />
      )}
    </div>
  );
}

// Product summary component for particulares
function ProductSummary({ data, transactionType }: { data: FormDataType; transactionType: string }) {
  const isVehicle = transactionType.toLowerCase().includes('vehículo');
  const isElectronics = transactionType === 'Electrónicos';
  const isAppliances = transactionType === 'Electrodomésticos';
  const isFurniture = transactionType === 'Muebles';
  
  const hasProductInfo = (
    (isVehicle && (data['vehicle_brand'] || data['vehicle_model'])) ||
    (isElectronics && (data['electronics_brand'] || data['electronics_model'])) ||
    (isAppliances && (data['appliance_type'] || data['appliance_brand'])) ||
    (isFurniture && (data['furniture_type'] || data['furniture_material']))
  );
  
  if (!hasProductInfo) return null;
  
  return (
    <div style={{
      marginTop: '16px',
      padding: '16px',
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #bae6fd'
    }}>
      <h4 style={{ 
        fontSize: '16px', 
        fontWeight: '600', 
        marginBottom: '12px', 
        color: '#0c4a6e',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        📝 Información del producto
      </h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
        {/* Transaction Type - Always show if present */}
        {data['transaction_subtype'] && (
          <div style={{ gridColumn: '1 / -1', marginBottom: '8px', padding: '8px', backgroundColor: '#dbeafe', borderRadius: '4px' }}>
            <strong>💳 Tipo de transacción:</strong> {data['transaction_subtype']}
          </div>
        )}
        
        {/* Vehicle info */}
        {isVehicle && (
          <>
            {data['vehicle_brand'] && (
              <div><strong>Marca:</strong> {data['vehicle_brand']}</div>
            )}
            {data['vehicle_model'] && (
              <div><strong>Modelo:</strong> {data['vehicle_model']}</div>
            )}
            {data['vehicle_year'] && (
              <div><strong>Año:</strong> {data['vehicle_year']}</div>
            )}
            {data['vehicle_mileage'] && (
              <div><strong>Kilometraje:</strong> {Number(data['vehicle_mileage']).toLocaleString()} km</div>
            )}
            {data['vehicle_condition'] && (
              <div><strong>Condición:</strong> {data['vehicle_condition']}</div>
            )}
            {data['vehicle_serial'] && (
              <div style={{ gridColumn: '1 / -1', fontFamily: 'monospace' }}><strong>VIN/Serie:</strong> {data['vehicle_serial']}</div>
            )}
          </>
        )}
        
        {/* Electronics info */}
        {isElectronics && (
          <>
            {data['electronics_brand'] && (
              <div><strong>Marca:</strong> {data['electronics_brand']}</div>
            )}
            {data['electronics_model'] && (
              <div><strong>Modelo:</strong> {data['electronics_model']}</div>
            )}
            {data['electronics_condition'] && (
              <div><strong>Condición:</strong> {data['electronics_condition']}</div>
            )}
            {data['electronics_warranty'] && (
              <div><strong>Garantía:</strong> {data['electronics_warranty']}</div>
            )}
            {data['electronics_serial'] && (
              <div style={{ gridColumn: '1 / -1', fontFamily: 'monospace' }}><strong>Número de serie:</strong> {data['electronics_serial']}</div>
            )}
          </>
        )}
        
        {/* Appliances info */}
        {isAppliances && (
          <>
            {data['appliance_type'] && (
              <div><strong>Tipo:</strong> {data['appliance_type']}</div>
            )}
            {data['appliance_brand'] && (
              <div><strong>Marca:</strong> {data['appliance_brand']}</div>
            )}
            {data['appliance_age'] && (
              <div><strong>Años de uso:</strong> {data['appliance_age']}</div>
            )}
            {data['appliance_efficiency'] && (
              <div><strong>Eficiencia:</strong> {data['appliance_efficiency']}</div>
            )}
            {data['appliance_condition'] && (
              <div><strong>Condición:</strong> {data['appliance_condition']}</div>
            )}
            {data['appliance_serial'] && (
              <div style={{ gridColumn: '1 / -1', fontFamily: 'monospace' }}><strong>Número de serie:</strong> {data['appliance_serial']}</div>
            )}
          </>
        )}
        
        {/* Furniture info */}
        {isFurniture && (
          <>
            {data['furniture_type'] && (
              <div><strong>Tipo:</strong> {data['furniture_type']}</div>
            )}
            {data['furniture_material'] && (
              <div><strong>Material:</strong> {data['furniture_material']}</div>
            )}
            {data['furniture_dimensions'] && (
              <div><strong>Dimensiones:</strong> {data['furniture_dimensions']}</div>
            )}
            {data['furniture_condition'] && (
              <div><strong>Condición:</strong> {data['furniture_condition']}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryView({ vertical, data }: { vertical: string; data: FormDataType }) {
  const steps = stepsByVertical[vertical] || [];
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#1e40af' }}>
        ✅ Configuración completada
      </h2>
      
      {/* Payment Summary */}
      <PaymentSummary data={data} vertical={vertical} />

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
            const stepKey = getStepKey(vertical, idx);
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
        
        {/* Product-specific information for particulares vertical */}
        {vertical === 'particulares' && data['particulares_step_1'] && (
          <ProductSummary data={data} transactionType={data['particulares_step_1']} />
        )}
      </div>
    </div>
  );
}

function getVerticalDisplayName(vertical: string) {
  const verticals: Record<string, string> = {
    inmobiliaria: 'Inmobiliarias y agentes',
    freelancer: 'Freelancers y servicios',
    ecommerce: 'E-commerce y ventas online',
    particulares: 'Compra-venta entre particulares',
    b2b: 'Empresas B2B y control de entregas',
    marketplace: 'Marketplaces de servicios'
  };
  return verticals[vertical] || 'Vertical no especificado';
}

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
      release_conditions: data[`${vertical}_step_2`] || null, // Release conditions are in step 2 for most verticals
      // Add commission fields if broker data exists
      ...(data.broker_email && data.broker_commission ? {
        commission_beneficiary_email: data.broker_email,
        commission_percent: Number(data.broker_commission)
      } : {}),
      // Add product-specific fields
      transaction_subtype: data.transaction_subtype || null,
      // Vehicle fields
      vehicle_brand: data.vehicle_brand || null,
      vehicle_model: data.vehicle_model || null,
      vehicle_year: data.vehicle_year ? Number(data.vehicle_year) : null,
      vehicle_vin: data.vehicle_vin || null,
      vehicle_mileage: data.vehicle_mileage ? Number(data.vehicle_mileage) : null,
      vehicle_condition: data.vehicle_condition || null,
      // Electronics fields
      electronics_brand: data.electronics_brand || null,
      electronics_model: data.electronics_model || null,
      electronics_condition: data.electronics_condition || null,
      electronics_warranty: data.electronics_warranty || null,
      electronics_serial: data.electronics_serial || null,
      // Appliance fields
      appliance_type: data.appliance_type || null,
      appliance_brand: data.appliance_brand || null,
      appliance_years_use: data.appliance_years_use ? Number(data.appliance_years_use) : null,
      appliance_efficiency: data.appliance_efficiency || null,
      appliance_condition: data.appliance_condition || null,
      appliance_serial: data.appliance_serial || null,
      // Furniture fields
      furniture_type: data.furniture_type || null,
      furniture_material: data.furniture_material || null,
      furniture_dimensions: data.furniture_dimensions || null,
      furniture_condition: data.furniture_condition || null
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

function PaymentSummary({ data, vertical }: { data: FormDataType; vertical: string }) {
  return (
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
        📋 Resumen del pago
      </h3>
      
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
        
        {data.warranty_percentage && (
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>Porcentaje en custodia:</strong> 
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>{data.warranty_percentage}%</span>
          </div>
        )}
        
        {data.timeline && (
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>Custodia:</strong> 
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>{data.timeline} días</span>
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '8px' 
        }}>
          <span style={{ fontSize: '20px', marginRight: '8px' }}>⚡</span>
          <strong style={{ color: '#92400e' }}>¡Listo para crear!</strong>
        </div>
        <p style={{ 
          margin: 0, 
          fontSize: '14px', 
          color: '#a16207' 
        }}>
          Una vez creado el pago, podrás hacer seguimiento del progreso y las condiciones de liberación desde el rastreador de pagos.
        </p>
      </div>
    </div>
  );
}

export default function NuevoFlujoPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1 = selección vertical, 2+ = pasos del wizard
  const [wizardStep, setWizardStep] = useState(0); // 0 = primer paso del wizard
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
