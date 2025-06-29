import React, { useState } from 'react';
import axios from 'axios';
import DisputeTimeline from "./DisputeTimeline";


interface DisputeModalProps {
  escrowId: number;
  onClose: () => void;
  canReapply: boolean;
}

const DisputeModal: React.FC<DisputeModalProps> = ({ escrowId, onClose, canReapply }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [evidence, setEvidence] = useState<File | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');
    try {
      let finalEvidenceUrl = evidenceUrl;
      if (evidence && !evidenceUrl) {
        setUploading(true);
        const formData = new FormData();
        formData.append('evidence', evidence);
        const uploadRes = await axios.post('/api/evidence/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const uploadData = uploadRes.data as { url: string };
finalEvidenceUrl = uploadData.url;
        setEvidenceUrl(finalEvidenceUrl);
        setUploading(false);
      }
      await axios.post(`/api/dispute/${escrowId}/raise`, {
        reason,
        details,
        evidence: finalEvidenceUrl,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSubmitted(true);
      setStatus('Disputa enviada correctamente.');
    } catch (err: any) {
      setUploading(false);
      setError(err.response?.data?.error || 'Error al enviar la disputa');
    }
  };

  const handleEvidenceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setEvidence(file);
    setEvidenceUrl(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close">×</button>
        <h2 className="modal-title">Levantar Disputa</h2>
        {error && <div className="modal-error">{error}</div>}
        {status && <div className="modal-success">{status}</div>}
        <div className="modal-form-section">
          {(!submitted || canReapply) && (
            <form onSubmit={handleSubmit} className="modal-form">
              <label className="modal-label">
                Motivo:
                <input
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                  className="modal-input"
                  placeholder="Motivo de la disputa"
                />
              </label>
              <label className="modal-label">
                Detalles:
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  required
                  className="modal-input"
                  rows={3}
                  placeholder="Explica tu disputa con detalle"
                />
              </label>
              <label className="modal-label">
                Evidencia (opcional):
                <input
                  type="file"
                  onChange={handleEvidenceChange}
                  className="modal-file"
                  disabled={uploading}
                />
                {uploading && <span style={{ color: '#1A73E8', fontSize: 13 }}>Subiendo evidencia...</span>}
                {evidenceUrl && <span style={{ color: '#27ae60', fontSize: 13 }}>Archivo subido ✓</span>}
              </label>
            </form>
          )}
        </div>
        {/* Button always at bottom */}
        {(!submitted || canReapply) && (
          <button
            type="submit"
            className="modal-submit"
            onClick={handleSubmit}
          >
            Enviar Disputa
          </button>
        )}
        <DisputeTimeline escrowId={escrowId} />
      </div>
      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-content {
          background: #fff; border-radius: 20px; padding: 36px 28px 28px 28px; min-width: 320px; max-width: 420px; box-shadow: 0 4px 18px #E3EAFD; position: relative; font-family: 'Montserrat', Arial, sans-serif; display: flex; flex-direction: column; min-height: 420px;
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
        .modal-success {
          background: #e8fbe8; color: #27ae60; border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; font-weight: 600; font-size: 15px;
        }
        .modal-form-section {
          flex: 1 1 auto; display: flex; flex-direction: column; justify-content: flex-start; margin-bottom: 18px;
        }
        .modal-form {
          display: flex; flex-direction: column; gap: 18px;
        }
        .modal-label {
          color: #444; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; margin-bottom: 4px; display: flex; flex-direction: column; gap: 4px;
        }
        .modal-input {
          padding: 12px; border-radius: 8px; border: 1.5px solid #ddd; font-size: 15px; background: #fff; color: #222; font-family: 'Montserrat', Arial, sans-serif; outline: none; transition: border-color 0.2s;
        }
        .modal-input:focus {
          border-color: #1A73E8;
        }
        .modal-file {
          margin-top: 4px;
        }
        .modal-submit {
          width: 100%; background: #D32F2F; color: #fff; border: none; border-radius: 24px; padding: 14px 0; font-size: 18px; font-weight: 600; font-family: 'Montserrat', Arial, sans-serif; margin-top: auto; box-shadow: 0 1px 4px #E3EAFD; cursor: pointer; transition: background 0.2s;
        }
        .modal-submit:hover {
          background: #b71c1c;
        }
        @media (max-width: 500px) {
          .modal-content { min-width: 90vw; padding: 20px 6vw 18px 6vw; }
          .modal-submit { font-size: 16px; padding: 13px 0; }
        }
      `}</style>
    </div>
  );
};

export default DisputeModal;
