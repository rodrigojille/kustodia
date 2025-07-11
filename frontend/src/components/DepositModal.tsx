"use client";
import React from 'react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  depositClabe: string;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, depositClabe }) => {
  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(depositClabe);
    alert('CLABE copiada al portapapeles');
  };

  return (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 m-4 max-w-md w-full shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Depositar a tu cuenta</h2>
        <p className="mb-4 text-gray-600">
          Para agregar fondos, realiza una transferencia SPEI a la siguiente CLABE desde tu app bancaria.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <div className="text-sm text-gray-500">Tu CLABE de depósito</div>
          <div className="text-lg font-mono text-gray-900 break-all">{depositClabe}</div>
        </div>
        <div className="flex gap-4">
          <button onClick={copyToClipboard} className="btn btn-primary w-full">Copiar CLABE</button>
          <button onClick={onClose} className="btn btn-secondary w-full">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
