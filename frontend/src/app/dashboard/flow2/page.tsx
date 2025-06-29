"use client";
import React from "react";

import PagoFormFull2 from "@/components/PagoFormFull2";

const Flow2Page = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Flow 2.0 — Custodial Wallet Payment Flow</h1>
      <p className="mb-6">
        Bienvenido a Flow 2.0. Aquí puedes iniciar un pago usando tu wallet custodio y CLABE única. Esta sección reutiliza la lógica del flujo tradicional pero con la nueva infraestructura de wallets.
      </p>
      <div className="bg-white rounded-xl shadow p-4 md:p-8 border border-blue-100">
        <h2 className="text-lg font-semibold mb-2 text-blue-700">Iniciar un nuevo pago</h2>
        <PagoFormFull2 />
      </div>
    </div>
  );
};

export default Flow2Page;
