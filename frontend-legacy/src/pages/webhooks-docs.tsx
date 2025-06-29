import { useState } from 'react';

export default function WebhooksDocs() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Define your password here (should be stored securely in env in production)
  const REAL_PASSWORD = 'bitso2025';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === REAL_PASSWORD) {
      setAuthed(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'Montserrat, Arial, sans-serif', background: '#f6f8fc', padding: 32, borderRadius: 12 }}>
      <h1 style={{ color: '#2e7ef7' }}>Manual de Webhooks Kustodia</h1>
      {!authed ? (
        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <label>
            Contraseña de acceso:
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ marginLeft: 12, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </label>
          <button type="submit" style={{ marginLeft: 16, padding: '6px 18px', background: '#2e7ef7', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold' }}>
            Acceder
          </button>
          {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        </form>
      ) : (
        <div style={{ marginTop: 32 }}>
          <h2>Webhook de Notificación de Pagos</h2>
          <p>La integración de webhooks permite recibir notificaciones automáticas cuando cambia el estado de un pago.</p>
          <h3>Endpoint sugerido</h3>
          <pre style={{ background: '#fff', padding: 12, borderRadius: 6 }}>
            {`POST /api/webhooks/payment-update`}
          </pre>
          <h3>Ejemplo de payload</h3>
          <pre style={{ background: '#fff', padding: 12, borderRadius: 6 }}>
            {`{\n  "paymentId": "orden123",\n  "status": "COMPLETED",\n  "txHash": "0xabc...",\n  "amount": "100",\n  "currency": "MXNB",\n  "timestamp": "2025-05-20T12:50:00Z"\n}`}
          </pre>
          <h3>Seguridad</h3>
          <ul>
            <li>El webhook debe ir firmado con un token Bearer.</li>
            <li>Validar el timestamp para evitar replays.</li>
            <li>Responder 200 OK para confirmar recepción.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
