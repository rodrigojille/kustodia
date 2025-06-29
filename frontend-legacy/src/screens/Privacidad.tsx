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
    <div className="max-w-screen-xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 p-10 text-gray-900 text-base text-left" style={{fontFamily: 'Montserrat, Arial, sans-serif'}}>
      <p>En Kustodia, la protección de tus datos personales es prioritaria y cumplimos con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>
      <h3>1. Responsable y Modelo Legal</h3>
      <p>Kustodia, operada por una S.A.P.I. de C.V., es responsable del tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>
      <h3>2. Datos que Recabamos</h3>
      <p>Recabamos datos como nombre, correo electrónico, CLABE, datos bancarios, y los estrictamente necesarios para operar la plataforma y cumplir obligaciones legales.</p>
      <h3>3. Finalidad y Proveedores</h3>
      <p>Utilizamos tus datos para crear tu cuenta, operar pagos condicionales, validar identidad y cumplir obligaciones legales. Tus datos pueden ser compartidos únicamente con proveedores tecnológicos como MXNB, STP u otros bancos para procesar pagos, nunca para fines comerciales.</p>
      <h3>4. No Venta ni Transferencia Comercial</h3>
      <p>No vendemos, rentamos ni transferimos tus datos a terceros con fines comerciales. Solo compartimos información con autoridades cuando existe requerimiento legal.</p>
      <h3>5. Derechos ARCO</h3>
      <p>Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición enviando una solicitud a <a href="mailto:soporte@kustodia.mx" className="underline text-indigo-700">soporte@kustodia.mx</a>.</p>
      <h3>6. Consentimiento Explícito</h3>
      <p>Al registrarte y usar Kustodia, otorgas tu consentimiento explícito para el tratamiento de tus datos conforme a este aviso.</p>
      <h3>7. Seguridad</h3>
      <p>Implementamos medidas técnicas y administrativas para proteger tus datos contra acceso no autorizado.</p>
      <h3>8. Cambios al Aviso</h3>
      <p>Podemos actualizar este aviso. Notificaremos cambios importantes a través de la plataforma.</p>
      <div className="mt-8 text-center">
        <a href="/terminos" style={{ color: '#1A73E8', textDecoration: 'underline', fontWeight: 500 }}>Términos y Condiciones</a>
      </div>
    </div>
  </ResponsiveLayout>
);

export default Privacidad;
