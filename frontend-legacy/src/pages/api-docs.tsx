import { useState } from 'react';

export default function ApiDocs() {
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
      <h1 style={{ color: '#2e7ef7' }}>Documentación API Kustodia</h1>
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
          <h2>Endpoints Principales</h2>
          <ul>
            <li><b>POST /api/payments/initiate</b> — Iniciar un pago</li>
            <li><b>GET /api/payments/:id/status</b> — Consultar estado de un pago</li>
            <li><b>POST /api/webhooks/payment-update</b> — Notificación de cambios de estado</li>
          </ul>
          <h3>Ejemplo de petición</h3>
          <pre style={{ background: '#fff', padding: 12, borderRadius: 6 }}>
            {`POST /api/payments/initiate\nContent-Type: application/json\n{\n  "amount": "100",\n  "currency": "MXNB",\n  "receiver": "0x...",\n  "reference": "orden123"\n}`}
          </pre>
          <h3>Respuesta esperada</h3>
          <pre style={{ background: '#fff', padding: 12, borderRadius: 6 }}>
            {`{\n  "success": true,\n  "paymentId": "orden123",\n  "txHash": "0xabc...",\n  "status": "PENDING"\n}`}
          </pre>
        </div>
      )}
    </div>
  );
}
