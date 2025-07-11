"use client";
import React from "react";

import PagoFormFull2 from "@/components/PagoFormFull2";

const Flow2Page = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pagos Web3 — Flujo de Pago Wallet-to-Wallet</h1>
      <p className="mb-6">
        Inicia pagos seguros directamente desde tu wallet de Kustodia a otra. Esta funcionalidad aprovecha la infraestructura de Web3 para ofrecer transacciones directas, transparentes y con custodia.
      </p>
      <div className="bg-white rounded-xl shadow p-4 md:p-8 border border-blue-100">
        <h2 className="text-lg font-semibold mb-2 text-blue-700">Iniciar un nuevo pago</h2>
        <PagoFormFull2 />
      </div>
    </div>
  );
};

export default Flow2Page;
