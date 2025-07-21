# Kustodia API – Documentación Técnica

## Introducción
Kustodia API permite a cualquier plataforma integrar pagos protegidos (escrow) en sus flujos de pago. Es ideal para marketplaces, SaaS y plataformas que buscan seguridad, control y notificaciones en tiempo real, reemplazando soluciones como Mercado Pago o Stripe, pero con custodia y liberación de fondos bajo condiciones claras.

**Ventajas:**
- Solicita o inicia pagos protegidos con una simple llamada.
- Recibe notificaciones automáticas de cada evento relevante (webhooks).
- Control total sobre cuándo se libera el dinero.
- Transparencia en comisiones y movimientos.

---

## Autenticación

Incluye tu API Key en cada request HTTP usando el header:

```http
Authorization: Bearer TU_API_KEY_AQUI
```

---

## Guía de Inicio Rápido

### 1. Solicita tu acceso
- Regístrate en el portal de desarrolladores de Kustodia.
- Obtén tu API Key de sandbox para pruebas.

### 2. Crea tu primer pago protegido
- Realiza un POST a `/api/payment-requests` con tu API Key y los datos del pago.
- Recibe en la respuesta el `payment_url` para que tu usuario realice el pago.

### 3. Configura tu endpoint de webhook
- Implementa un endpoint HTTP POST en tu backend para recibir notificaciones de Kustodia.
- Valida la firma HMAC recibida en el header `X-Kustodia-Signature`.

### 4. Recibe y procesa eventos en tiempo real
- Cuando el usuario pague o el estado cambie, recibirás un webhook con el evento y los datos del pago.
- Procesa el evento según tu lógica de negocio (ejemplo: actualizar el pedido, liberar el producto, etc).

### 5. Pasa a producción
- Cuando tu integración esté lista y probada en sandbox, solicita acceso a producción.
- Recibe tu API Key definitiva y cambia la URL de sandbox por la de producción.

---

## Comisiones

---

## Ejemplos de recepción de webhooks por stack

### Node.js (Express)
```js
const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

const KUSTODIA_SECRET = 'TU_SECRETO_WEBHOOK';

app.post('/webhook/kustodia', (req, res) => {
  const signature = req.headers['x-kustodia-signature'];
  const payload = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha256', KUSTODIA_SECRET).update(payload).digest('hex');
  if (signature !== expected) {
    return res.status(401).send('Firma inválida');
  }
  // Procesa el evento
  console.log('Evento recibido:', req.body.event, req.body.data);
  res.sendStatus(200);
});
```

### Python (Flask)
```python
from flask import Flask, request, abort
import hmac
import hashlib

app = Flask(__name__)
KUSTODIA_SECRET = b'TU_SECRETO_WEBHOOK'

@app.route('/webhook/kustodia', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Kustodia-Signature')
    expected = hmac.new(KUSTODIA_SECRET, request.data, hashlib.sha256).hexdigest()
    if signature != expected:
        abort(401)
    data = request.json
    print('Evento recibido:', data['event'], data['data'])
    return '', 200
```

### PHP
```php
<?php
$secret = 'TU_SECRETO_WEBHOOK';
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_KUSTODIA_SIGNATURE'] ?? '';
$expected = hash_hmac('sha256', $payload, $secret);
if ($signature !== $expected) {
    http_response_code(401);
    exit('Firma inválida');
}
$data = json_decode($payload, true);
// Procesa el evento
file_put_contents('kustodia.log', print_r($data, true), FILE_APPEND);
http_response_code(200);
```

### Ruby (Sinatra)
```ruby
require 'sinatra'
require 'openssl'
require 'json'

SECRET = 'TU_SECRETO_WEBHOOK'

post '/webhook/kustodia' do
  request.body.rewind
  payload = request.body.read
  signature = request.env['HTTP_X_KUSTODIA_SIGNATURE']
  expected = OpenSSL::HMAC.hexdigest('sha256', SECRET, payload)
  halt 401, 'Firma inválida' unless signature == expected
  data = JSON.parse(payload)
  puts "Evento recibido: #{data['event']} #{data['data']}"
  status 200
end
```

### Java (Spring Boot)
```java
@RestController
public class KustodiaWebhookController {
    private static final String SECRET = "TU_SECRETO_WEBHOOK";

    @PostMapping("/webhook/kustodia")
    public ResponseEntity<String> receive(@RequestBody String payload, @RequestHeader("X-Kustodia-Signature") String signature) {
        String expected = org.apache.commons.codec.digest.HmacUtils.hmacSha256Hex(SECRET, payload);
        if (!expected.equals(signature)) {
            return ResponseEntity.status(401).body("Firma inválida");
        }
        // Procesa el evento
        System.out.println("Evento recibido: " + payload);
        return ResponseEntity.ok().build();
    }
}
```

### cURL (para pruebas manuales)
```bash
curl -X POST https://tuapp.com/webhook/kustodia \
  -H "Content-Type: application/json" \
  -H "X-Kustodia-Signature: <firma>" \
  -d '{ "event": "payment.paid", "data": { ... }'
```

---
Kustodia cobra una comisión por cada transacción procesada vía API. El monto puede ser fijo o un porcentaje, según tu acuerdo comercial. La comisión se muestra en la respuesta de la API y en los webhooks de eventos de pago.

---

## Seguridad
- **API Key única por integrador**
- **Rate limiting** para evitar abuso
- **Validación y sanitización de datos**
- **HTTPS obligatorio**
- **Logs y alertas de seguridad**
- **Webhooks firmados (HMAC SHA256)**
- **Reintentos automáticos y logs de entrega de webhooks**

---

## Errores estándar

| Código HTTP | code                | message                                 |
|-------------|---------------------|-----------------------------------------|
| 400         | invalid_request     | Parámetros inválidos o faltantes        |
| 401         | unauthorized        | API Key inválida o ausente              |
| 403         | forbidden           | No tienes permisos para esta acción     |
| 404         | not_found           | Recurso no encontrado                   |
| 409         | conflict            | Estado inválido para la operación       |
| 429         | rate_limit_exceeded | Límite de peticiones excedido           |
| 500         | internal_error      | Error interno del servidor              |

**Ejemplo:**
```json
{
  "error": {
    "code": "invalid_request",
    "message": "El campo 'amount' es requerido"
  }
}
```

---

## Endpoints principales

### 1. Crear solicitud de pago
**POST** `/api/payment-requests`

```json
{
  "amount": 1500.00,
  "currency": "MXN",
  "description": "Pago renta junio",
  "payer": { "email": "cliente@email.com", "name": "Juan Pérez" },
  "payee": { "email": "inmobiliaria@email.com", "name": "Inmobiliaria S.A." },
  "external_id": "order_12345",
  "callback_url": "https://tuapp.com/webhook/kustodia",
  "metadata": { "departamento": "B-402" }
}
```

**Response:**
```json
{
  "id": "req_abc123",
  "status": "requested",
  "amount": 1500.00,
  "currency": "MXN",
  "commission": 30.00,
  "payment_url": "https://app.kustodia.mx/pay/req_abc123",
  "created_at": "2025-06-04T10:00:00Z"
}
```

### 2. Consultar estado de pago
**GET** `/api/payment-requests/{id}`

**Response:**
```json
{
  "id": "req_abc123",
  "status": "paid",
  "amount": 1500.00,
  "currency": "MXN",
  "commission": 30.00,
  "payer": { "email": "...", "name": "..." },
  "payee": { "email": "...", "name": "..." },
  "external_id": "order_12345",
  "metadata": { "departamento": "B-402" },
  "events": [
    { "type": "created", "timestamp": "2025-06-04T10:00:00Z" },
    { "type": "paid", "timestamp": "2025-06-04T10:05:00Z" }
  ]
}
```

### 3. Webhooks

**Formato general:**
```json
{
  "event": "payment.paid",
  "data": {
    "id": "req_abc123",
    "external_id": "order_12345",
    "amount": 1500.00,
    "currency": "MXN",
    "commission": 30.00,
    "status": "paid",
    "timestamp": "2025-06-04T10:05:00Z"
  }
}
```

**Header de seguridad:**
`X-Kustodia-Signature: <firma_hmac_sha256_del_body>`

#### Tabla de eventos
| Evento                | Descripción                                     |
|-----------------------|-------------------------------------------------|
| payment.requested     | Solicitud de pago creada                        |
| payment.paid          | El usuario pagó la solicitud                    |
| payment.released      | Fondos liberados al beneficiario                |
| payment.rejected      | Solicitud rechazada por el pagador              |
| payment.cancelled     | Solicitud cancelada (por integrador o sistema)  |

---

## Ejemplo de integración Webhook (Node.js)
```js
const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

const KUSTODIA_SECRET = 'TU_SECRETO_WEBHOOK';

app.post('/webhook/kustodia', (req, res) => {
  const signature = req.headers['x-kustodia-signature'];
  const payload = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha256', KUSTODIA_SECRET).update(payload).digest('hex');
  if (signature !== expected) {
    return res.status(401).send('Firma inválida');
  }
  // Procesa el evento
  console.log('Evento recibido:', req.body.event, req.body.data);
  res.sendStatus(200);
});
```

---

## Ejemplo de integración: Crear pago (Node.js)
```js
const axios = require('axios');

async function crearSolicitudPago() {
  const response = await axios.post(
    'https://api.kustodia.mx/v1/payment-requests',
    {
      amount: 1500,
      currency: 'MXN',
      description: 'Pago renta junio',
      payer: { email: 'cliente@email.com', name: 'Juan Pérez' },
      payee: { email: 'inmobiliaria@email.com', name: 'Inmobiliaria S.A.' },
      external_id: 'order_12345',
      callback_url: 'https://tuapp.com/webhook/kustodia'
    },
    {
      headers: { Authorization: 'Bearer TU_API_KEY_AQUI' }
    }
  );
  console.log(response.data);
}
```

---

## Ejemplo de integración: Consultar estado (Python)
```python
import requests

headers = {'Authorization': 'Bearer TU_API_KEY_AQUI'}
r = requests.get('https://api.kustodia.mx/v1/payment-requests/req_abc123', headers=headers)
print(r.json())
```

---

## Ejemplo de integración completa (Node.js)

A continuación se muestra cómo crear una solicitud de pago, recibir el webhook y actualizar el estado de una orden en tu sistema:

### 1. Crear solicitud de pago
```js
const axios = require('axios');

async function crearSolicitudPago() {
  const response = await axios.post(
    'https://sandbox.api.kustodia.mx/v1/payment-requests',
    {
      amount: 1500,
      currency: 'MXN',
      description: 'Pago renta junio',
      payer: { email: 'cliente@email.com', name: 'Juan Pérez' },
      payee: { email: 'inmobiliaria@email.com', name: 'Inmobiliaria S.A.' },
      external_id: 'order_12345',
      callback_url: 'https://tuapp.com/webhook/kustodia'
    },
    { headers: { Authorization: 'Bearer TU_API_KEY_AQUI' } }
  );
  // Guarda el payment_url y muestra al usuario
  console.log('Link de pago:', response.data.payment_url);
}
```

### 2. Recibir y procesar webhook de pago realizado
```js
const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

const KUSTODIA_SECRET = 'TU_SECRETO_WEBHOOK';

app.post('/webhook/kustodia', (req, res) => {
  const signature = req.headers['x-kustodia-signature'];
  const payload = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha256', KUSTODIA_SECRET).update(payload).digest('hex');
  if (signature !== expected) {
    return res.status(401).send('Firma inválida');
  }
  // Procesa el evento
  const { event, data } = req.body;
  if (event === 'payment.paid' && data.external_id) {
    // Actualiza el estado de la orden correspondiente en tu base de datos
    // (Ejemplo ficticio)
    actualizarOrdenComoPagada(data.external_id);
  }
  res.sendStatus(200);
});

function actualizarOrdenComoPagada(orderId) {
  // Aquí va tu lógica para actualizar la orden en tu sistema
  console.log(`Orden ${orderId} marcada como pagada.`);
}
```

---

## FAQs y mejores prácticas
- Valida siempre la firma de los webhooks
- Usa HTTPS en tus endpoints
- Maneja todos los posibles estados de pago
- Usa el ambiente sandbox antes de pasar a producción

---

## Sandbox y ambiente productivo
- **Sandbox:** https://sandbox.api.kustodia.mx
- **Producción:** https://api.kustodia.mx
- Puedes solicitar tu API Key de sandbox en el portal de desarrolladores

---

## Onboarding y Portal de Documentación
- Solicita acceso al portal de desarrolladores en [enlace]
- Obtén tu API Key de sandbox y prueba la integración
- Accede a ejemplos, documentación interactiva (Swagger), y soporte técnico
- Cuando estés listo, solicita acceso a producción y recibe tu API Key definitiva

---

## Soporte
- Email: soporte@kustodia.mx
- Slack/Discord: [enlace]
- Documentación interactiva: [enlace Swagger/Postman]

---

¿Tienes dudas o sugerencias? ¡Contáctanos y te ayudamos a integrar pagos protegidos en tu plataforma!
