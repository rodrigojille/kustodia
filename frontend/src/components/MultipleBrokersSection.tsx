import React from 'react';

type FormDataType = Record<string, any>;

interface MultipleBrokersSectionProps {
  data: FormDataType;
  setData: (data: FormDataType) => void;
  width: number;
}

export function MultipleBrokersSection({ data, setData, width }: MultipleBrokersSectionProps) {
  // Initialize commission_recipients if not exists
  const commissionRecipients = data.commission_recipients || [];
  
  const updateCommissionRecipients = (recipients: any[]) => {
    setData({ ...data, commission_recipients: recipients });
  };

  const addBroker = () => {
    const newRecipients = [...commissionRecipients, {
      broker_email: '',
      broker_name: '',
      broker_percentage: ''
    }];
    updateCommissionRecipients(newRecipients);
  };

  const removeBroker = (index: number) => {
    const newRecipients = commissionRecipients.filter((_: any, i: number) => i !== index);
    updateCommissionRecipients(newRecipients);
  };

  const updateBroker = (index: number, field: string, value: string) => {
    const newRecipients = [...commissionRecipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    updateCommissionRecipients(newRecipients);
  };

  // Calculate total commission percentage
  const totalCommission = commissionRecipients.reduce((sum: number, broker: any) => {
    return sum + (parseFloat(broker.broker_percentage) || 0);
  }, 0);

  const isOverLimit = totalCommission > 50;

  return (
    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', margin: 0 }}>
          🏢 Comisiones de asesores (opcional)
        </h4>
        <button
          type="button"
          onClick={addBroker}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ➕ Agregar asesor
        </button>
      </div>

      {commissionRecipients.length === 0 && (
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          No hay asesores agregados. Haz clic en "Agregar asesor" para incluir comisiones.
        </div>
      )}

      {commissionRecipients.map((broker: any, index: number) => (
        <div key={index} style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: 0 }}>
              Asesor {index + 1}
            </h5>
            <button
              type="button"
              onClick={() => removeBroker(index)}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              🗑️ Eliminar
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: width < 640 ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#374151', fontSize: '13px' }}>
                📧 Email del asesor *
              </label>
              <input
                type="email"
                placeholder="asesor@inmobiliaria.com"
                value={broker.broker_email || ''}
                onChange={(e) => updateBroker(index, 'broker_email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#374151', fontSize: '13px' }}>
                👤 Nombre del asesor
              </label>
              <input
                type="text"
                placeholder="Nombre completo"
                value={broker.broker_name || ''}
                onChange={(e) => updateBroker(index, 'broker_name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#374151', fontSize: '13px' }}>
              💰 Porcentaje de comisión *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                placeholder="5.5"
                min="0"
                max="50"
                step="0.1"
                value={broker.broker_percentage || ''}
                onChange={(e) => updateBroker(index, 'broker_percentage', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  paddingRight: '30px',
                  border: `1px solid ${parseFloat(broker.broker_percentage) > 50 ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                fontSize: '14px'
              }}>%</span>
            </div>
            {parseFloat(broker.broker_percentage) > 50 && (
              <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', margin: '4px 0 0 0' }}>
                ⚠️ El porcentaje no puede exceder 50%
              </p>
            )}
          </div>
        </div>
      ))}

      {commissionRecipients.length > 0 && (
        <div style={{
          backgroundColor: isOverLimit ? '#fef2f2' : '#f0f9ff',
          border: `1px solid ${isOverLimit ? '#fecaca' : '#bae6fd'}`,
          borderRadius: '8px',
          padding: '12px',
          marginTop: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: isOverLimit ? '#dc2626' : '#0369a1' }}>
              💰 Total de comisiones: {totalCommission.toFixed(1)}%
            </span>
            <span style={{ fontSize: '12px', color: isOverLimit ? '#dc2626' : '#0369a1' }}>
              {isOverLimit ? '⚠️ Excede el límite de 50%' : '✅ Dentro del límite'}
            </span>
          </div>
          {isOverLimit && (
            <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '8px', margin: '8px 0 0 0' }}>
              El total de comisiones no puede exceder el 50% del monto del pago.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
