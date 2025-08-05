import React, { useEffect, useState } from "react";
import NotificationBell from './NotificationBell';
import { authFetch } from "../utils/authFetch";

type FintechDashboardHeaderProps = {
  onOpenSidebar?: () => void;
};

export default function FintechDashboardHeader(props: FintechDashboardHeaderProps) {
  const [automationActive, setAutomationActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAutomation = () => {
      authFetch('automation/status')
        .then(res => res.json())
        .then((data: { success: boolean; status: string }) => {
          setAutomationActive(data.success && data.status === 'running');
          setLoading(false);
        })
        .catch(() => {
          setAutomationActive(false);
          setLoading(false);
        });
    };

    checkAutomation();
    // Check every 30 seconds
    const interval = setInterval(checkAutomation, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center sm:justify-between border-b border-white/30">
  <div className="flex items-center w-full sm:w-auto justify-between">
    <div className="flex items-center gap-3">
      <span className="font-bold text-xl sm:text-2xl tracking-tight text-black">Kustodia</span>
      {/* Automation Status Indicator */}
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 hidden sm:inline">Verificando...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${automationActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-xs font-medium hidden sm:inline ${automationActive ? 'text-green-600' : 'text-red-600'}`}>
            {automationActive ? '🤖 Automatización activa' : '⚠️ Automatización inactiva'}
          </span>
        </div>
      )}
    </div>
    {/* Mobile menu toggle for user actions, visible on mobile only */}
    <div className="sm:hidden flex items-center">
      <button className="ml-2 p-2 rounded hover:bg-blue-50 transition" aria-label="Abrir menú" onClick={props.onOpenSidebar}>
        <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
    </div>
  </div>
  {/* Actions: hidden on mobile, flex on sm+ */}
  <div className="hidden sm:flex items-center gap-4 mt-2 sm:mt-0">
    <input
      className="rounded-lg border border-black px-3 py-1 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm w-32 md:w-64 transition"
      placeholder="Buscar transacción..."
    />
    <NotificationBell />
    <button 
      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md hover:scale-105 transition" 
      aria-label="Ir a configuración"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard/configuracion';
        }
      }}
    >
      <span className="text-lg">R</span>
    </button>

  </div>
</header>
  );
}
