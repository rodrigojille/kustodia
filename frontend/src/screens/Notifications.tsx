import React from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';

const Notifications: React.FC = () => (
  <ResponsiveLayout>
    <h2 style={{ color: '#1A73E8', marginTop: 0, fontFamily: 'Montserrat, Arial, sans-serif' }}>Notificaciones</h2>
    <p style={{ margin: '24px 0', color: '#444', fontFamily: 'Montserrat, Arial, sans-serif' }}>Tus notificaciones recientes aparecerán aquí.</p>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      <li style={{ background: '#E3EAFD', borderRadius: 8, padding: 16, marginBottom: 12, color: '#1A73E8', fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif' }}>
        Nuevo pago recibido de Juan Pérez
      </li>
      <li style={{ background: '#fffbe6', borderRadius: 8, padding: 16, marginBottom: 12, color: '#FFC107', fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif' }}>
        Tu verificación KYC está pendiente
      </li>
      <li style={{ background: '#F3F3F3', borderRadius: 8, padding: 16, marginBottom: 12, color: '#444', fontFamily: 'Montserrat, Arial, sans-serif' }}>
        No tienes notificaciones nuevas
      </li>
    </ul>
  </ResponsiveLayout>
);

export default Notifications;
