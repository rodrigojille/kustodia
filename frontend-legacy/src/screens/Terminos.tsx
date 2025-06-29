import React from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';

const Terminos: React.FC = () => (
  <ResponsiveLayout>
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <a href="/">
        <img src="/logo.svg" alt="Kustodia Logo" style={{ width: 56, height: 56, margin: '0 auto', display: 'block' }} />
      </a>
    </div>
    <h2 style={{ color: '#1A73E8', fontFamily: 'Montserrat, Arial, sans-serif' }}>Términos y Condiciones</h2>
<div className="mb-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-sm">
  <strong>Transparencia legal:</strong> Kustodia es una plataforma de automatización de pagos condicionales operada bajo una S.A.P.I. de C.V. No es entidad financiera, fiduciaria ni banco. No retiene fondos propios, ni ofrece servicios de almacenamiento de valor.
</div>
    <div className="max-w-screen-xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 p-10 text-gray-900 text-base text-left" style={{fontFamily: 'Montserrat, Arial, sans-serif'}}>
      <p>Bienvenido a Kustodia. Al utilizar nuestros servicios, aceptas los siguientes términos y condiciones conforme a la legislación mexicana.</p>
      <h3>1. Aceptación</h3>
      <p>El acceso y uso de Kustodia implica la aceptación de estos términos. Si no estás de acuerdo, no utilices nuestros servicios.</p>
      <h3>2. Modelo de Servicio y Uso de la Plataforma</h3>
      <p>Kustodia permite a los usuarios crear acuerdos de pago con condiciones automáticas. Actuamos únicamente como motor de reglas y eventos, no como entidad financiera ni fiduciaria. El dinero siempre permanece en cuentas a nombre del usuario y solo se libera bajo las condiciones que el usuario define.</p>
      <h3>3. No Custodia, No Entidad Financiera</h3>
      <p>Kustodia no retiene fondos propios, no ofrece servicios de almacenamiento de valor, ni se constituye como institución de custodia formal. Nuestro servicio es equiparable a un agregador de pagos o infraestructura programable, no a una entidad regulada por la Ley Fintech o la CNBV.</p>
      <h3>4. Pagos y CLABE</h3>
      <p>Los pagos se realizan a través de cuentas CLABE o STP proporcionadas por los usuarios. Es tu responsabilidad asegurarte de que los datos bancarios registrados sean correctos.</p>
      <h3>5. Escrow y Limitación de Responsabilidad</h3>
      <p>Kustodia automatiza la liberación de pagos bajo reglas predefinidas (escrow). No somos parte de los contratos entre usuarios. No nos responsabilizamos por acuerdos mal configurados, incumplimientos contractuales entre partes, ni por fraudes fuera de la plataforma. El usuario es responsable de definir correctamente las condiciones de pago.</p>
      <h3>6. Privacidad</h3>
      <p>Consulta nuestro <a href="/privacidad" className="underline text-indigo-700">Aviso de Privacidad</a> para conocer cómo protegemos tus datos personales.</p>
      <h3>7. Modificaciones</h3>
      <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones serán notificadas a través de la plataforma.</p>
      <h3>8. Legislación Aplicable</h3>
      <p>Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia será atendida en la Ciudad de México.</p>
      <div className="mt-8 text-center">
        <a href="/privacidad" style={{ color: '#1A73E8', textDecoration: 'underline', fontWeight: 500 }}>Aviso de Privacidad</a>
      </div>
    </div>
  </ResponsiveLayout>
);

export default Terminos;
