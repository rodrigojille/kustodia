import React, { useEffect, useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function EarlyAccessCounter() {
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
    <div className="mb-4 text-blue-700 font-semibold">
      {slots !== null ? (
        <>Quedan <span className="font-bold text-2xl">{slots}</span> lugares disponibles</>
      ) : (
        <>Cargando registros…</>
      )}
    </div>
  );
}
