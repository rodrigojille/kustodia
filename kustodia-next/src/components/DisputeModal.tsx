import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface DisputeModalProps {
  escrowId: number;
  onClose: () => void;
  canReapply: boolean;
}

interface DisputeDetail {
  id?: number;
  status?: string;
  reason?: string;
  details?: string;
  evidence?: string | string[];
  created_at?: string;
}

const DisputeModal: React.FC<DisputeModalProps> = ({ escrowId, onClose }) => {
  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDispute = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/escrow/${escrowId}/timeline`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const timeline = res.data.timeline || [];
        // Find latest dispute action
        const latestDispute = [...timeline].reverse().find((t: any) => t.action === 'pending' || t.action === 'resolved' || t.action === 'dismissed');
        if (latestDispute) {
          setDispute({
            id: latestDispute.id,
            status: latestDispute.action,
            reason: latestDispute.reason,
            details: latestDispute.details,
            evidence: latestDispute.evidence,
            created_at: latestDispute.at
          });
        } else {
          setDispute(null);
        }
      } catch (err: any) {
        setError('Error al obtener detalles de la disputa');
      }
      setLoading(false);
    };
    fetchDispute();
  }, [escrowId]);

  const statusLabel = (status?: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'resolved': return 'Resuelta';
      case 'dismissed': return 'Descartada';
      default: return status || '';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close">×</button>
        <h2 className="modal-title">Detalle de Disputa</h2>
        {error && <div className="modal-error" style={{ textAlign: 'center' }}>{error}</div>}
        {loading ? (
          <div style={{ textAlign: 'center', margin: '32px 0' }}>Cargando...</div>
        ) : dispute ? (
          <div className="modal-form-section" style={{ gap: 16 }}>
            <div className="modal-label"><b>Estado:</b> {statusLabel(dispute.status)}</div>
            <div className="modal-label"><b>Motivo:</b> {dispute.reason}</div>
            <div className="modal-label"><b>Detalles:</b> {dispute.details}</div>
            <div className="modal-label"><b>Fecha de creación:</b> {dispute.created_at ? new Date(dispute.created_at).toLocaleString('es-MX') : ''}</div>
            <div className="modal-label"><b>Evidencia:</b> {dispute.evidence ? (
              Array.isArray(dispute.evidence)
                ? dispute.evidence.map((url, idx) => <div key={idx}><a href={url} target="_blank" rel="noopener noreferrer">Archivo {idx + 1}</a></div>)
                : <a href={dispute.evidence} target="_blank" rel="noopener noreferrer">Ver archivo</a>
            ) : 'No hay evidencia'}</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', margin: '32px 0' }}>No hay disputa para este escrow.</div>
        )}
        <style>{`
          .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000;
          }
          .modal-content {
            background: #fff; border-radius: 20px; padding: 36px 28px 28px 28px; min-width: 320px; max-width: 420px; box-shadow: 0 4px 18px #E3EAFD; position: relative; font-family: 'Montserrat', Arial, sans-serif; display: flex; flex-direction: column; min-height: 320px;
          }
          .modal-title {
            color: #1A73E8; font-family: 'Montserrat', Arial, sans-serif; font-weight: 700; margin: 0 0 18px 0; font-size: 1.6rem; text-align: left;
          }
          .modal-close {
            position: absolute; top: 18px; right: 18px; background: #F3F3F3; border: none; border-radius: 10px; width: 36px; height: 36px; font-size: 20px; font-weight: 700; color: #222; cursor: pointer; display: flex; align-items: center; justify-content: center;
          }
          .modal-error {
            background: #fff4f4; color: #D32F2F; border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; font-weight: 600; font-size: 15px;
          }
          .modal-form-section {
            flex: 1 1 auto; display: flex; flex-direction: column; justify-content: flex-start; margin-bottom: 18px;
          }
          .modal-label {
            color: #444; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; margin-bottom: 4px; display: flex; flex-direction: column; gap: 4px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default DisputeModal;
