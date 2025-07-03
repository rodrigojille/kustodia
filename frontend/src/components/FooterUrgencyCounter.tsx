import React, { useEffect, useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function FooterUrgencyCounter() {
  const [slots, setSlots] = useState<number|null>(null);
  
  useEffect(() => {
    let mounted = true;
    
    
    const fetchSlots = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/early-access-counter/slots`);
        const data = await res.json();
        if (mounted) setSlots(data.slots);
      } catch {
        if (mounted) setSlots(null);
      }
    };
    
    fetchSlots();
    const interval = setInterval(fetchSlots, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4 mb-6 max-w-lg mx-auto">
      <div className="flex items-center justify-center gap-3 mb-2">
        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        <span className="text-red-700 font-bold text-lg">¡Últimos espacios disponibles!</span>
      </div>
      <div className="text-red-600 text-sm font-medium">
        {slots !== null ? (
          <>Solo quedan {slots} lugares con 0% comisión de por vida</>
        ) : (
          <>Cargando espacios disponibles...</>
        )}
      </div>
    </div>
  );
}
