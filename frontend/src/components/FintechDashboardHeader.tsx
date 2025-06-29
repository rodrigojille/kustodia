import React, { useEffect, useState } from "react";

type FintechDashboardHeaderProps = {
  onOpenSidebar?: () => void;
};

export default function FintechDashboardHeader(props: FintechDashboardHeaderProps) {
  const [automationActive, setAutomationActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAutomation = () => {
      fetch('http://localhost:4000/api/automation/status')
        .then(res => res.json())
        .then(data => {
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
    <button className="relative p-2 rounded-full hover:bg-blue-50 transition group" aria-label="Notificaciones">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-black group-hover:text-blue-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a2.25 2.25 0 01-4.714 0m8.486-3.29c-.806-.64-1.362-1.574-1.362-2.622V9.75a6 6 0 10-12 0v1.42c0 1.048-.556 1.981-1.362 2.622-.527.419-.838 1.06-.838 1.738v.174c0 .933.76 1.693 1.693 1.693h14.416c.933 0 1.693-.76 1.693-1.693v-.174c0-.678-.311-1.319-.838-1.738z" />
      </svg>
      <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
    </button>
    <button className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md hover:scale-105 transition" aria-label="Menú usuario">
      <span className="text-lg">N</span>
    </button>
    <button
      className="ml-2 p-2 rounded hover:bg-red-50 text-red-600 border border-red-100 transition"
      title="Cerrar sesión"
      onClick={() => {
        // Remove token/cookie if stored, then redirect
        if (typeof window !== 'undefined') {
          // Remove token if stored in localStorage
          localStorage.removeItem('token');
          // Remove session cookies if needed
          document.cookie = 'token=; Max-Age=0; path=/;';
          window.location.href = '/login';
        }
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m10.5 0a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0018.75 21H5.25A2.25 2.25 0 013 18.75v-7.5A2.25 2.25 0 015.25 9m13.5 0h-13.5" />
      </svg>
    </button>
  </div>
</header>
  );
}
