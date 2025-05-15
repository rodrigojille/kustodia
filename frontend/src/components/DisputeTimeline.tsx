import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface DisputeTimelineProps {
  escrowId: number;
}

const DisputeTimeline: React.FC<DisputeTimelineProps> = ({ escrowId }) => {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/dispute/${escrowId}/timeline`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setTimeline((res.data as { timeline: any[] }).timeline || []))
      .catch(() => setError('Error al cargar la línea de tiempo de disputa'))
      .then(() => setLoading(false));
  }, [escrowId]);

  if (loading) return <div>Cargando línea de tiempo...</div>;
  if (error) return <div style={{ color: '#D32F2F' }}>{error}</div>;
  if (!timeline.length) return <div>No hay eventos de disputa aún.</div>;

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Línea de tiempo de disputa</h3>
      <ul style={{ paddingLeft: 16 }}>
        {timeline.map((item, i) => (
          <li key={i} style={{ marginBottom: 10 }}>
            <strong>{item.action}</strong> por {item.by} el {item.at ? new Date(item.at).toLocaleString('es-MX') : ''}
            {item.reason && <div>Motivo: {item.reason}</div>}
            {item.details && <div>Detalles: {item.details}</div>}
            {item.notes && <div>Notas: {item.notes}</div>}
            {item.evidence && <div>Evidencia: {item.evidence}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DisputeTimeline;
