'use client';
import React, { useState } from "react";

function ApiSneakPeek() {
  const [show, setShow] = useState(false);
  return (
    <>
      <div className="max-w-2xl mx-auto my-16 bg-white rounded-xl shadow-lg border border-blue-100 p-8 text-left">
        <h2 className="text-2xl font-bold mb-4 text-black flex items-center gap-2">
          <span role="img" aria-label="api">🔌</span> Sneak Peek del API
        </h2>
        <p className="text-black mb-4">Integra Kustodia fácilmente en tu plataforma o app. Nuestra API REST te permite iniciar pagos, consultar estados y recibir notificaciones webhooks.</p>
        <button onClick={() => setShow((v) => !v)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition mb-4">
          {show ? "Ocultar ejemplo" : "Ver ejemplo de API"}
        </button>
        {show && (
          <div className="bg-gray-50 border border-gray-200 rounded p-4 overflow-x-auto">
            <pre className="text-sm text-black mb-2">{`POST /api/payments/initiate
Content-Type: application/json
{
  "amount": "1000",
  "currency": "MXN",
  "receiver": "usuario@ejemplo.com",
  "reference": "orden123"
}`}</pre>
            <pre className="text-sm text-black bg-white p-2 rounded border border-gray-100">{`{
  "success": true,
  "paymentId": "orden123",
  "txHash": "0xabc...",
  "status": "PENDING"
}`}</pre>
          </div>
        )}
        <div className="mt-4 text-xs text-gray-500">¿Quieres acceso completo? <a href="#early-access" className="text-blue-600 underline">Solicita acceso a la documentación</a>.</div>
      </div>
    </>
  );
}

export default ApiSneakPeek;
