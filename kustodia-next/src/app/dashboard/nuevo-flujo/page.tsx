"use client";
import { useState } from "react";

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
    "Tipo de operación (Anticipo, Apartado, Renta, Compra-venta)",
    "Monto y condiciones de liberación",
    "¿Requiere documentación?",
    "Liberación del pago"
  ],
  freelancer: [
    "Tipo de servicio (proyecto, horas, milestones)",
    "¿Requiere anticipo?",
    "Entrega y evidencia",
    "Liberación del pago"
  ],
  ecommerce: [
    "Tipo de producto (físico/digital)",
    "Condición de entrega",
    "¿Periodo de disputa?",
    "Liberación del pago"
  ],
  particulares: [
    "Tipo de bien (auto, gadget, mueble, etc.)",
    "Condiciones de entrega",
    "Liberación del pago"
  ],
  b2b: [
    "Tipo de compra (producto, servicio, lote)",
    "¿Requiere evidencia de entrega?",
    "¿Pagos parciales/milestones?",
    "Liberación del pago"
  ],
  marketplace: [
    "Tipo de servicio",
    "¿Marketplace valida la entrega?",
    "¿Requiere feedback/calificación?",
    "Liberación del pago"
  ]
};

type FormDataType = Record<string, any>;

function getStepKey(vertical: string, stepIndex: number) {
  return `${vertical}_step_${stepIndex}`;
}

function StepInputs({ vertical, stepIndex, data, setData }: {
  vertical: string;
  stepIndex: number;
  data: FormDataType;
  setData: (d: FormDataType) => void;
}) {
  // Define the input type and label for each step of each vertical
  // For MVP: text, select, checkbox, file (if needed)
  // You can expand this logic for richer forms later
  const stepInputs: Record<string, { type: string; label: string; options?: string[] }> = {
    // Inmobiliaria
    inmobiliaria_step_0: { type: 'select', label: 'Tipo de operación', options: ['Anticipo', 'Apartado', 'Renta', 'Compra-venta'] },
    inmobiliaria_step_1: { type: 'text', label: 'Monto o condiciones (ej. $10,000 o “al firmar contrato”)' },
    inmobiliaria_step_2: { type: 'checkbox', label: '¿Requiere subir contrato/evidencia?' },
    inmobiliaria_step_3: { type: 'text', label: 'Condición para liberar el pago' },
    // Freelancer
    freelancer_step_0: { type: 'select', label: 'Tipo de servicio', options: ['Proyecto único', 'Por horas', 'Por milestones'] },
    freelancer_step_1: { type: 'checkbox', label: '¿Se requiere anticipo?' },
    freelancer_step_2: { type: 'text', label: '¿Qué evidencia se requiere para liberar el pago?' },
    freelancer_step_3: { type: 'text', label: 'Condición para liberar el pago' },
    // Ecommerce
    ecommerce_step_0: { type: 'select', label: 'Tipo de producto', options: ['Físico', 'Digital'] },
    ecommerce_step_1: { type: 'text', label: 'Condición de entrega (ej. “recibido por cliente”)' },
    ecommerce_step_2: { type: 'checkbox', label: '¿Hay periodo de disputa antes de liberar?' },
    ecommerce_step_3: { type: 'text', label: 'Condición para liberar el pago' },
    // Particulares
    particulares_step_0: { type: 'text', label: 'Tipo de bien (ej. auto, gadget, mueble)' },
    particulares_step_1: { type: 'text', label: 'Condiciones de entrega' },
    particulares_step_2: { type: 'text', label: 'Condición para liberar el pago' },
    // B2B
    b2b_step_0: { type: 'select', label: 'Tipo de compra', options: ['Producto', 'Servicio', 'Lote'] },
    b2b_step_1: { type: 'checkbox', label: '¿Requiere evidencia de entrega?' },
    b2b_step_2: { type: 'checkbox', label: '¿Pagos parciales/milestones?' },
    b2b_step_3: { type: 'text', label: 'Condición para liberar el pago' },
    // Marketplace
    marketplace_step_0: { type: 'text', label: 'Tipo de servicio' },
    marketplace_step_1: { type: 'checkbox', label: '¿Marketplace valida la entrega?' },
    marketplace_step_2: { type: 'checkbox', label: '¿Requiere feedback/calificación?' },
    marketplace_step_3: { type: 'text', label: 'Condición para liberar el pago' },
  };
  const stepKey = getStepKey(vertical, stepIndex);
  const input = stepInputs[stepKey];
  if (!input) return null;
  const value = data[stepKey] ?? (input.type === 'checkbox' ? false : '');
  return (
    <div style={{ margin: '24px 0' }}>
      <label style={{ fontWeight: 500, fontSize: 16, display: 'block', marginBottom: 8 }}>{input.label}</label>
      {input.type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={e => setData({ ...data, [stepKey]: e.target.value })}
          style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #c6d2e6' }}
        />
      )}
      {input.type === 'select' && input.options && (
        <select
          value={value}
          onChange={e => setData({ ...data, [stepKey]: e.target.value })}
          style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #c6d2e6' }}
        >
          <option value="">Selecciona una opción</option>
          {input.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
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
    </div>
  );
}

function SummaryView({ vertical, data }: { vertical: string; data: FormDataType }) {
  const steps = stepsByVertical[vertical] || [];
  return (
    <ol style={{ paddingLeft: 18 }}>
      {steps.map((label, idx) => {
        const stepKey = getStepKey(vertical, idx);
        const value = data[stepKey];
        let displayValue = value;
        if (typeof value === 'boolean') displayValue = value ? 'Sí' : 'No';
        if (value === undefined || value === '') displayValue = <span style={{ color: '#aaa' }}>No especificado</span>;
        return (
          <li key={stepKey} style={{ marginBottom: 10 }}>
            <strong>{label}:</strong> {displayValue}
          </li>
        );
      })}
    </ol>
  );
}

export default function NuevoFlujoPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1 = selección vertical, 2+ = pasos del wizard
  const [wizardStep, setWizardStep] = useState(0); // 0 = primer paso del wizard
  const [formData, setFormData] = useState<FormDataType>({});

  const currentSteps = selected ? stepsByVertical[selected] : [];
  const isWizard = step === 2 && selected;

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", marginBottom: 32 }}>
        Nuevo flujo de pago
      </h1>
      {step === 1 && (
        <>
          <h2 style={{ textAlign: "center", marginBottom: 24 }}>¿Para qué quieres usar Kustodia?</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
            {useCases.map((c) => (
              <div
                key={c.key}
                onClick={() => setSelected(c.key)}
                style={{
                  cursor: "pointer",
                  border: selected === c.key ? "2px solid #2e7ef7" : "1px solid #e3e9f8",
                  borderRadius: 16,
                  background: selected === c.key ? "#e8f0fe" : "#fff",
                  boxShadow: selected === c.key ? "0 2px 12px #2e7ef733" : "0 2px 12px #0001",
                  padding: 24,
                  width: 250,
                  minHeight: 210,
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{c.title}</div>
                <div style={{ color: "#444", fontSize: 15 }}>{c.desc}</div>
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
                padding: "12px 32px",
                fontWeight: 700,
                fontSize: 17,
                cursor: selected ? "pointer" : "not-allowed"
              }}
            >
              Continuar
            </button>
          </div>
        </>
      )}
      {isWizard && (
        <div style={{ maxWidth: 480, margin: "32px auto", background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px #0001", padding: 32, textAlign: "center" }}>
          <h2 style={{ marginBottom: 24, color: "#2e7ef7" }}>{useCases.find(c => c.key === selected)?.title}</h2>
          <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 18 }}>
            Paso {wizardStep + 1} de {currentSteps.length}
          </div>
          {/* Paso actual */}
          <div style={{ fontSize: 20, marginBottom: 32 }}>
            {currentSteps[wizardStep]}
          </div>

          {/* Inputs dinámicos por vertical y paso */}
          <StepInputs
            vertical={selected as string}
            stepIndex={wizardStep}
            data={formData}
            setData={setFormData}
          />

          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 32 }}>
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
                fontSize: 16,
                cursor: "pointer"
              }}
            >
              {wizardStep === 0 ? "← Cambiar vertical" : "← Anterior"}
            </button>
            <button
              disabled={wizardStep === currentSteps.length - 1}
              onClick={() => setWizardStep(wizardStep + 1)}
              style={{
                background: wizardStep === currentSteps.length - 1 ? "#b8c6e6" : "#2e7ef7",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 28px",
                fontWeight: 700,
                fontSize: 16,
                cursor: wizardStep === currentSteps.length - 1 ? "not-allowed" : "pointer"
              }}
            >
              Siguiente →
            </button>
          </div>

          {/* Resumen al final */}
          {wizardStep === currentSteps.length - 1 && (
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

