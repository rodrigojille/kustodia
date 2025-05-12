import React from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';

const ClaimSubmit: React.FC = () => (
  <ResponsiveLayout>
    <h2 style={{ color: '#1A73E8', marginTop: 0, fontFamily: 'Montserrat, Arial, sans-serif' }}>Enviar reclamación</h2>
    <p style={{ margin: '24px 0', color: '#444', fontFamily: 'Montserrat, Arial, sans-serif' }}>Completa el formulario para enviar una reclamación.</p>
    <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <input
        type="text"
        placeholder="Motivo de la reclamación"
        required
        style={{
          padding: 14,
          borderRadius: 8,
          border: '1.5px solid #ddd',
          fontSize: 16,
          background: '#fff',
          color: '#222',
          fontFamily: 'Montserrat, Arial, sans-serif',
          transition: 'border-color 0.2s',
          outline: 'none',
        }}
        onFocus={e => (e.target.style.borderColor = '#1A73E8')}
        onBlur={e => (e.target.style.borderColor = '#ddd')}
      />
      <textarea
        placeholder="Descripción"
        required
        rows={4}
        style={{
          padding: 14,
          borderRadius: 8,
          border: '1.5px solid #ddd',
          fontSize: 16,
          background: '#fff',
          color: '#222',
          fontFamily: 'Montserrat, Arial, sans-serif',
          transition: 'border-color 0.2s',
          outline: 'none',
          resize: 'vertical',
        }}
        onFocus={e => (e.target.style.borderColor = '#1A73E8')}
        onBlur={e => (e.target.style.borderColor = '#ddd')}
      />
      <label style={{ fontSize: 14, color: '#222', fontFamily: 'Montserrat, Arial, sans-serif', marginBottom: 4, marginTop: 8 }}>Adjuntar archivo (opcional)</label>
      <input
        type="file"
        style={{
          padding: 8,
          borderRadius: 8,
          border: '1.5px solid #ddd',
          background: '#fff',
          fontFamily: 'Montserrat, Arial, sans-serif',
          outline: 'none',
        }}
        onFocus={e => (e.target.style.borderColor = '#1A73E8')}
        onBlur={e => (e.target.style.borderColor = '#ddd')}
      />
      <button
        type="submit"
        style={{ background: '#1A73E8', color: '#fff', padding: '14px 0', borderRadius: 24, fontSize: 18, border: 'none', marginTop: 18, cursor: 'pointer', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 600 }}
      >
        Enviar reclamación
      </button>
    </form>
  </ResponsiveLayout>
);

export default ClaimSubmit;
