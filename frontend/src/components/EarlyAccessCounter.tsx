import React, { useEffect, useState } from 'react';

export default function EarlyAccessCounter() {
  const [slots, setSlots] = useState<number|null>(null);
  useEffect(() => {
    let mounted = true;
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://kustodia-backend-f991a7cb1824.herokuapp.com";
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
