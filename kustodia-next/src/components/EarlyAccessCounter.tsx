import React, { useEffect, useState } from 'react';

export default function EarlyAccessCounter() {
  const [slots, setSlots] = useState<number|null>(null);
  useEffect(() => {
    let mounted = true;
    const fetchSlots = async () => {
      try {
        const res = await fetch('/api/early-access-counter/slots');
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
    <>
      <div className="mb-2 text-blue-700 font-semibold">
        {slots !== null ? (
          <>Quedan <span className="font-bold text-2xl">{slots}</span> lugares de acceso anticipado.</>
        ) : (
          <>Cargando registros…</>
        )}
      </div>
      <div className="text-xs text-blue-700 mb-4">
        Los primeros 100 registros tendrán 0% de comisión de por vida.
      </div>
    </>
  );
}
