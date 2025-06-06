import React from "react";
import { FaUser, FaLock, FaMoneyBillWave } from "react-icons/fa";

export default function SmartContractInfo() {
  return (
    <section className="bg-white rounded-3xl shadow-xl max-w-3xl w-full px-4 sm:px-8 md:px-10 py-8 md:py-12 mx-auto mb-8 sm:mb-12 flex flex-col items-center" style={{ background: '#f5f8fe' }}>
      <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-700 mb-6 text-center">
        ¿Qué es MXNB y cómo funcionan los smart contracts?
      </h2>
      <p className="text-gray-800 text-base sm:text-lg mb-4 text-center md:text-left max-w-full sm:max-w-2xl">
        MXNB es una moneda digital estable, respaldada 1:1 con pesos mexicanos, que permite realizar pagos y custodia de dinero de forma segura, rápida y transparente. En Kustodia, usamos smart contracts para garantizar que los fondos solo se liberen cuando ambas partes cumplen lo acordado, brindando máxima protección y confianza en cada operación.
      </p>
      <ul className="list-disc text-gray-800 mb-6 ml-5 max-w-full sm:max-w-xl text-left">
        <li><span className="font-semibold text-blue-700">Transparencia:</span> Puedes verificar en todo momento la existencia y respaldo de MXNB.</li>
        <li><span className="font-semibold text-blue-700">Automatización:</span> Los smart contracts aseguran que los pagos se liberen solo cuando se cumplen las condiciones pactadas.</li>
        <li><span className="font-semibold text-blue-700">Seguridad:</span> Tus fondos están protegidos y custodiados hasta que ambas partes estén de acuerdo.</li>
        <li>Las reglas se cumplen solas, sin personas de por medio.</li>
        <li>No hay trucos ni sorpresas: todo es automático y transparente.</li>
      </ul>
      <div className="flex flex-row justify-center items-center gap-6 bg-blue-50 rounded-xl py-4 px-2 w-full max-w-full sm:max-w-md mb-6">
        <div className="flex flex-col items-center min-w-[56px] sm:min-w-[72px]">
          <FaUser size={28} className="text-indigo-600 mb-1" />
          <span className="font-bold text-indigo-700 text-sm sm:text-base">Tú</span>
        </div>
        <span className="text-2xl text-indigo-600">→</span>
        <a href="https://sepolia.arbiscan.io/token/0x82b9e52b26a2954e113f94ff26647754d5a4247d?a=0xc09b02ddb3bbcc78fc47446d8d74e677ba8db3e8" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center min-w-[72px] sm:min-w-[92px] group focus:outline-none">
          <FaLock size={28} className="text-indigo-600 mb-1 group-hover:text-blue-800 transition" />
          <span className="font-bold text-indigo-700 text-sm sm:text-base text-center w-full block">En custodia</span>
          <span className="text-indigo-500 text-xs text-center w-full block">(Smart Contract)</span>
        </a>
        <span className="text-2xl text-indigo-600">→</span>
        <div className="flex flex-col items-center min-w-[72px] sm:min-w-[92px]">
          <FaMoneyBillWave size={28} className="text-indigo-600 mb-1" />
          <span className="font-bold text-indigo-700 text-sm sm:text-base">Liberado</span>
        </div>
      </div>
      <a
        href="https://mxnb.mx/es-MX/transparencia"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-700 text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow hover:bg-blue-800 transition mb-2 mt-2 w-full sm:w-auto text-base sm:text-lg"
      >
        Más sobre transparencia de MXNB
      </a>
    </section>
  );
}
