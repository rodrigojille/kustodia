"use client";
import React from "react";

interface PreparingDashboardModalProps {
  open: boolean;
}

const PreparingDashboardModal: React.FC<PreparingDashboardModalProps> = ({ open }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
      <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        <div className="text-lg font-semibold text-gray-800 mb-2">Estamos preparando tu dashboard...</div>
        <div className="text-gray-500">Por favor espera unos segundos mientras configuramos tu cuenta.</div>
      </div>
    </div>
  );
};

export default PreparingDashboardModal;
