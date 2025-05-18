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
    <div className="max-w-screen-xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 p-10 text-gray-900 text-base text-left" style={{fontFamily: 'Montserrat, Arial, sans-serif'}}>
      <p>Bienvenido a Kustodia. Al utilizar nuestros servicios, aceptas los siguientes términos y condiciones conforme a la legislación mexicana.</p>
      <h3>1. Aceptación</h3>
      <p>El acceso y uso de Kustodia implica la aceptación de estos términos. Si no estás de acuerdo, no utilices nuestros servicios.</p>
      <h3>2. Uso de la Plataforma</h3>
      <p>Debes ser mayor de edad y proporcionar información verídica. El uso indebido de la plataforma puede resultar en la suspensión de tu cuenta.</p>
      <h3>3. Pagos y CLABE</h3>
      <p>Los pagos se realizan a través de cuentas CLABE proporcionadas por los usuarios. Es tu responsabilidad asegurarte de que la CLABE registrada sea correcta.</p>
      <h3>4. Privacidad</h3>
      <p>Consulta nuestro aviso de privacidad para conocer cómo protegemos tus datos personales.</p>
      <h3>5. Responsabilidad</h3>
      <p>Kustodia no se hace responsable por errores en la CLABE proporcionada ni por el uso indebido de la plataforma.</p>
      <h3>6. Modificaciones</h3>
      <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones serán notificadas a través de la plataforma.</p>
      <h3>7. Ley Aplicable</h3>
      <p>Estos términos se rigen por las leyes de los Estados Unidos Mexicanos.</p>
      <div className="mt-8 text-center">
        <a href="/privacidad" style={{ color: '#1A73E8', textDecoration: 'underline', fontWeight: 500 }}>Aviso de Privacidad</a>
      </div>
    </div>
  </ResponsiveLayout>
);

export default Terminos;
