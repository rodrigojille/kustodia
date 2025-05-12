import React from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';

const Privacidad: React.FC = () => (
  <ResponsiveLayout>
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <a href="/">
        <img src="/logo.svg" alt="Kustodia Logo" style={{ width: 56, height: 56, margin: '0 auto', display: 'block' }} />
      </a>
    </div>
    <h2 style={{ color: '#1A73E8', fontFamily: 'Montserrat, Arial, sans-serif' }}>Aviso de Privacidad</h2>
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #E3EAFD', fontFamily: 'Montserrat, Arial, sans-serif', color: '#222', margin: '0 auto', maxWidth: 700, fontSize: 16, textAlign: 'left' }}>
      <p>En Kustodia, la protección de tus datos personales es prioritaria y cumplimos con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>
      <h3>1. Responsable</h3>
      <p>Kustodia es responsable del tratamiento de tus datos personales.</p>
      <h3>2. Datos Recabados</h3>
      <p>Recabamos datos como nombre, correo electrónico, CLABE y otros necesarios para ofrecer nuestros servicios.</p>
      <h3>3. Finalidad</h3>
      <p>Utilizamos tus datos para proveer servicios, procesar pagos y cumplir obligaciones legales.</p>
      <h3>4. Derechos ARCO</h3>
      <p>Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición enviando una solicitud a soporte@kustodia.app.</p>
      <h3>5. Transferencias</h3>
      <p>No compartimos tus datos con terceros sin tu consentimiento, salvo obligación legal.</p>
      <h3>6. Seguridad</h3>
      <p>Implementamos medidas para proteger tus datos contra acceso no autorizado.</p>
      <h3>7. Cambios al Aviso</h3>
      <p>Podemos actualizar este aviso. Notificaremos cambios importantes a través de la plataforma.</p>
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <a href="/terminos" style={{ color: '#1A73E8', textDecoration: 'underline', fontWeight: 500 }}>Términos y Condiciones</a>
      </div>
    </div>
  </ResponsiveLayout>
);

export default Privacidad;
