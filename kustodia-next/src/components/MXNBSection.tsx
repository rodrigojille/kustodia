import React from 'react';

const MXNBSection: React.FC = () => (
  <section className="w-full max-w-3xl mx-auto my-16 bg-white rounded-2xl shadow-xl border border-blue-100 p-8 flex flex-col items-center text-center">
    <h2 className="text-3xl font-bold text-blue-700 mb-4">¿Qué es MXNB y cómo funcionan los smart contracts?</h2>
    <p className="text-gray-800 text-lg mb-6">
      MXNB es una moneda digital estable, respaldada 1:1 con pesos mexicanos, que permite realizar pagos y custodia de dinero de forma segura, rápida y transparente. 
      En Kustodia, usamos smart contracts para garantizar que los fondos solo se liberen cuando ambas partes cumplen lo acordado, brindando máxima protección y confianza en cada operación.
    </p>
    <a
      href="https://mxnb.mx/es-MX/transparencia"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-blue-700 text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-blue-800 transition mb-4"
    >
      Más sobre transparencia de MXNB
    </a>
    <ul className="list-disc list-inside text-left text-gray-700 mt-4">
      <li><span className="font-semibold text-blue-700">Transparencia:</span> Puedes verificar en todo momento la existencia y respaldo de MXNB.</li>
      <li><span className="font-semibold text-blue-700">Automatización:</span> Los smart contracts aseguran que los pagos se liberen solo cuando se cumplen las condiciones pactadas.</li>
      <li><span className="font-semibold text-blue-700">Seguridad:</span> Tus fondos están protegidos y custodiados hasta que ambas partes estén de acuerdo.</li>
      <li><span className="font-semibold text-blue-700">Autonomía:</span> Las reglas se cumplen solas, sin personas de por medio.</li>
      <li><span className="font-semibold text-blue-700">Fiabilidad:</span> No hay trucos ni sorpresas: todo es automático y transparente.</li>
    </ul>
    <div className="w-full flex flex-col items-center mt-10">
      <h3 className="text-xl font-bold text-blue-700 mb-2">Síguenos en Instagram</h3>
      <div className="w-full flex justify-center">
        <iframe
          src="https://www.instagram.com/kustodia.mx/embed"
          width="340"
          height="480"
          allowTransparency={true}
          frameBorder="0"
          scrolling="no"
          allow="encrypted-media"
          className="rounded-xl border border-gray-200 shadow"
          title="Instagram Kustodia"
        ></iframe>
      </div>
    </div>
  </section>
);

export default MXNBSection;
