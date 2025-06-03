# Kustodia Escrow Automation & Product Roadmap

## Resumen Técnico y de Roadmap

### Overview
Kustodia es una plataforma de pagos P2P con custodia cripto (MXNB) y split automático entre payout inmediato y periodo de custodia, integrando smart contracts en Arbitrum y APIs bancarias (Juno/Bitso).

---

## Roadmap y Epics

### Backend
- [ ] Esperar respuesta de soporte Juno/Bitso para habilitar endpoint de plataforma y API Key válida.
- [ ] Implementar lógica de emisión/redención de MXNbs vía API/custodio autorizado.
- [ ] Implementar split automático del monto recibido: calcular % payout inmediato vs % custodia.
- [ ] Integrar lógica de bloqueo y liberación de MXNbs en smart contract (Arbitrum).
- [ ] Añadir endpoints y eventos para monitorear el estado de la custodia y liberar payout tras periodo/reclamos.
- [ ] Registrar todos los movimientos (emisión, bloqueo, redención, payout) en la base de datos.

### Frontend
- [ ] Mostrar ambos CLABEs y explicar el split de pagos en la UI.
- [ ] Reflejar en el dashboard los estados de payout inmediato y en custodia.
- [ ] Añadir notificaciones sobre liberación de fondos y payout final.

### Integración y QA
- [ ] Pruebas E2E del flujo completo: pago, split, custodia, liberación y payout.
- [ ] Validar que nunca se expongan MXNbs al usuario final.
- [ ] Actualizar documentación y diagramas según feedback de QA y soporte.

### Roadmap y Epics
- [ ] Mantener actualizado el roadmap con los avances y bloqueos.
- [ ] Revisar y ajustar el split (%) según necesidades de negocio y feedback de usuarios.

---

## Automatización de Escrow: Resumen del Flujo

### 1. Fondeo de Escrow
- Automatizado en Arbitrum Sepolia.
- El script registra el escrowId retornado y el periodo de custodia.

### 2. Liberación de Custodia
- Script robusto, acepta cualquier escrowId (incluyendo 0).
- El release solo es posible tras terminar el periodo de custodia.

### 3. Consulta de Tiempo Restante
- Script: `src/scripts/queryEscrowTime.ts`
- Muestra tiempo restante, fecha/hora de inicio y fin del periodo de custodia (local y UTC).
- Uso:
  ```bash
  npx ts-node src/scripts/queryEscrowTime.ts <escrowId>
  ```

### 4. Variables de Entorno
- Todos los scripts cargan `.env` automáticamente.
- Ejemplo de variables requeridas:
  - `ETH_RPC_URL`
  - `MOCK_ERC20_ADDRESS`
  - `ESCROW_CONTRACT_ADDRESS`
  - `ESCROW_PRIVATE_KEY`
  - `ESCROW_BRIDGE_WALLET`
  - `JUNO_STAGE_API_KEY`
  - `JUNO_STAGE_API_SECRET`

---

## Ejemplo de salida del script de consulta
```
Faltan 71h 59m 59s para que termine el periodo de custodia del escrowId 0.
Fecha/hora inicio (local): 27/05/2025, 18:59:08
Fecha/hora inicio (UTC):   2025-05-27T23:59:08.000Z
Fecha/hora fin (local):    30/05/2025, 18:59:08
Fecha/hora fin (UTC):      2025-05-30T23:59:08.000Z
```

---

## Avances de Mayo 2025

---

## Flujo End-to-End: Pago, Custodia, Redención y Payout

### Explicación paso a paso

1. **El comprador realiza un pago en MXN** a la CLABE de depósito proporcionada por Juno.
2. **Juno notifica al backend** vía webhook que se ha recibido el pago.
3. **El backend registra el evento** `deposit_received` en la base de datos.
4. **El backend solicita a Juno la emisión de MXNBs** equivalentes al monto recibido.
5. **Juno emite los MXNBs** y los transfiere a la wallet “Platform Bridge” (wallet puente de la plataforma).
6. **El backend transfiere los MXNBs desde la wallet Platform Bridge al smart contract de escrow** en Arbitrum, bloqueando los fondos según el split configurado (payout inmediato y/o custodia).
7. **El smart contract confirma el bloqueo** y retorna el `escrowId` al backend.
8. **El backend registra el evento** `escrow_created` en la base de datos.
9. **(Si hay payout inmediato)** El backend solicita la redención de MXNBs a MXN usando el UUID de la cuenta bancaria (`juno_bank_account_id`) del vendedor, vía Juno.
10. **Juno realiza la redención** y transfiere los MXN al vendedor vía SPEI.
11. **El backend registra los eventos** `redemption_initiated`, `redemption_success` y `payout_completed` en la base de datos.
12. **El backend notifica al vendedor** que los fondos han sido recibidos.
13. **Cuando termina el periodo de custodia**, el backend libera los MXNBs del smart contract y los transfiere de regreso a la wallet Platform Bridge.
14. **El backend transfiere los MXNBs desde la wallet Platform Bridge a la wallet de Juno** (wallet custodio de la plataforma).
15. **El backend solicita la redención de MXNBs a MXN** (por el monto liberado de la custodia) usando el UUID de la cuenta bancaria del vendedor.
16. **Juno realiza la redención** y transfiere los MXN al vendedor vía SPEI.
17. **El backend registra todos los eventos** en la base de datos y los muestra en la timeline del usuario.

---

## Integración Bancaria y Autenticación

| Paso                   | Integración Técnica                                | Autenticación/Autorización                |
|------------------------|---------------------------------------------------|-------------------------------------------|
| Alta de cuenta CLABE   | API REST Juno (`/bank-accounts`)                  | API Key (Bearer) + Validación KYC         |
| Recepción de pagos     | Webhook Juno (`/webhook/payment`)                 | Webhook secret + Validación de payload     |
| Emisión/redención MXNB | API REST Juno (`/mxnb/issue`, `/mxnb/redeem`)     | API Key (Bearer) + UUID de cuenta Juno    |
| Payout SPEI            | API REST Juno (`/payouts`)                        | API Key (Bearer) + Validación de saldo    |
| Trigger de eventos     | Webhook + Polling                                 | Webhook secret + JWT interno              |

---

## Ejemplo de autenticación a Juno

```http
POST /mxnb/issue HTTP/1.1
Host: api.juno.com.mx
Authorization: Bearer TU_JUNO_API_KEY
Content-Type: application/json
```

---

## Diagrama End-to-End: Pago, Custodia, Redención y Payout

```mermaid
%% Todas las llamadas a Juno usan API Key (Bearer) en header HTTP.
%% Los webhooks de Juno se validan usando el secreto compartido.
%% La autorización de payout/redención requiere el UUID de la cuenta bancaria registrada.
%% El backend verifica la identidad del usuario y el estado KYC antes de autorizar la transacción.

sequenceDiagram
    participant Comprador
    participant Backend
    participant Juno
    participant PlatformBridge as Wallet Platform Bridge
    participant SmartContract
    participant DB as Base de Datos
    participant Vendedor

    Comprador->>Juno: 1. Realiza pago MXN a CLABE de depósito
    Juno-->>Backend: 2. Notifica webhook de pago recibido
    Backend->>DB: 3. Registra evento 'deposit_received'
    Juno-->>PlatformBridge: 4. Emite MXNBs a Platform Bridge (automático tras pago)
    alt Split de custodia y payout inmediato
        PlatformBridge->>SmartContract: 5a. Transfiere monto de custodia en MXNBs al smart contract (escrow)
        PlatformBridge->>Juno: 5b. Redime el resto de MXNBs a MXN y transfiere por SPEI al vendedor
        Juno-->>Backend: 6b. Confirma redención y transferencia SPEI (payout inmediato)
        Backend->>DB: 7b. Registra eventos 'redemption_initiated', 'redemption_success', 'payout_completed'
        Backend-->>Vendedor: 8b. Notifica fondos recibidos (payout inmediato)
    end
    SmartContract-->>Backend: 6a. Confirma bloqueo y escrowId
    Backend->>DB: 7a. Registra evento 'escrow_created'
    SmartContract->>PlatformBridge: 9. (Fin custodia) Libera MXNBs a Platform Bridge
    PlatformBridge->>Juno: 10. Transfiere MXNBs a wallet Juno para redención
    Backend->>Juno: 11. Solicita redención final de MXNBs a MXN al vendedor
    Juno-->>Backend: 12. Confirma redención y transferencia SPEI final
    Backend->>DB: 13. Registra toda la trazabilidad del flujo
    Note over Backend,DB: Todos los eventos quedan en la timeline para el usuario
```

---

## Flujo de Disputa

Durante una disputa, los fondos permanecen bloqueados en el smart contract hasta que un administrador resuelva el caso. El proceso es el siguiente:

1. **El usuario (comprador o vendedor) levanta una disputa** sobre un escrow activo antes de que termine la custodia.
2. **El backend recibe la solicitud** con motivo, detalles y evidencia opcional.
3. **El backend llama al smart contract** para marcar el escrow como 'en disputa' en la blockchain.
4. **Se crea una entidad Dispute** en la base de datos, vinculada al escrow y al usuario que la levantó, con estatus `pending`.
5. **Se actualiza la entidad Escrow** para reflejar el estado de disputa y se agrega un registro en el historial de disputa.
6. **El backend expone el timeline de disputa** combinando la historia legacy y los eventos de la entidad Dispute.
7. **Un administrador puede resolver la disputa** indicando si se aprueba o se descarta:
    - Si **aprobada**: el escrow se marca como `reverted`, la disputa como `resolved`, y se registra el hash de la transacción de resolución en el smart contract.
    - Si **descartada**: la disputa se marca como `dismissed`, y el escrow puede volver a estado normal si aplica.
8. **Todos los eventos de disputa** quedan registrados y aparecen en la timeline del usuario.

**Nota:** Mientras el escrow está en disputa, los MXNBs permanecen bloqueados en el smart contract y no se puede liberar ni redimir la custodia hasta que la disputa sea resuelta por un administrador.

### Diagrama de flujo de disputa

```mermaid
sequenceDiagram
    participant Usuario
    participant Backend
    participant SmartContract
    participant Admin
    participant DB as Base de Datos

    Usuario->>Backend: 1. Solicita levantar disputa (motivo, detalles, evidencia)
    Backend->>SmartContract: 2. Marca escrow como 'en disputa'
    SmartContract-->>Backend: 3. Confirma disputa en blockchain
    Backend->>DB: 4. Crea entidad Dispute y actualiza Escrow
    Backend-->>Usuario: 5. Notifica disputa registrada
    Admin->>Backend: 6. Resuelve disputa (aprueba o descarta)
    Backend->>SmartContract: 7. Llama a resolución en smart contract
    SmartContract-->>Backend: 8. Confirma resolución
    Backend->>DB: 9. Actualiza estado de Dispute y Escrow
    Backend-->>Usuario: 10. Notifica resultado de la disputa
```

---

# Diagrama General de Flujos: KYC, Onboarding, Pagos, Custodia, Redención, Disputa

```mermaid
sequenceDiagram
    participant Usuario
    participant Frontend
    participant Backend
    participant KYC as Proveedor KYC
    participant Juno
    participant PlatformBridge as Wallet Platform Bridge
    participant SmartContract
    participant DB as Base de Datos
    participant Admin

    Usuario->>Frontend: 1. Registro y envío de datos personales
    Frontend->>Backend: 2. POST /user/onboard (datos usuario)
    Backend->>KYC: 3. Llama API KYC para verificación
    KYC-->>Backend: 4. Respuesta KYC (aprobado/rechazado)
    Backend->>DB: 5. Guarda estado KYC y usuario
    Backend-->>Frontend: 6. Notifica resultado KYC
    Frontend-->>Usuario: 7. Usuario puede iniciar operaciones si KYC aprobado
    Usuario->>Frontend: 8. Inicia flujo de pago
    Frontend->>Backend: 9. POST /payment/initiate (monto, destinatario)
    Backend->>Juno: 10. Solicita CLABE de depósito
    Juno-->>Backend: 11. Retorna CLABE y bank_account_id
    Backend-->>Frontend: 12. Retorna CLABE a usuario
    Usuario->>Juno: 13. Transfiere MXN a CLABE
    Juno-->>Backend: 14. Webhook notifica pago recibido
    Backend->>DB: 15. Registra evento 'deposit_received'
    Backend->>Juno: 16. Solicita emisión de MXNB
    Juno-->>PlatformBridge: 17. Emite MXNBs a Platform Bridge
    PlatformBridge->>SmartContract: 18. Transfiere MXNBs a smart contract (escrow)
    SmartContract-->>Backend: 19. Confirma bloqueo y escrowId
    Backend->>DB: 20. Registra evento 'escrow_created'
    Backend->>Juno: 21. (Si payout inmediato) Redime MXNB a MXN usando juno_bank_account_id
    Juno-->>Backend: 22. Confirma redención y transferencia SPEI
    Backend->>DB: 23. Registra eventos de payout/redención
    SmartContract->>PlatformBridge: 24. (Fin custodia) Libera MXNBs a Platform Bridge
    PlatformBridge->>Juno: 25. Transfiere MXNBs a wallet Juno para redención
    Backend->>Juno: 26. Solicita redención final de MXNBs a MXN
    Juno-->>Backend: 27. Confirma redención y transferencia SPEI final
    Backend->>DB: 28. Registra toda la trazabilidad
    Usuario->>Frontend: 29. Puede levantar disputa (si aplica)
    Frontend->>Backend: 30. POST /dispute/:escrowId/raise
    Backend->>SmartContract: 31. Marca escrow como 'en disputa'
    SmartContract-->>Backend: 32. Confirma disputa
    Backend->>DB: 33. Crea entidad Dispute
    Admin->>Backend: 34. POST /dispute/:escrowId/admin-resolve
    Backend->>SmartContract: 35. Llama a resolución
    SmartContract-->>Backend: 36. Confirma resolución
    Backend->>DB: 37. Actualiza estado de Dispute y Escrow
    Note over Backend,DB: Todos los eventos quedan en la timeline para el usuario
    KYC-->>Backend: 38. Si KYC fallido, usuario no puede operar
```

---

# Ejemplos de Endpoints y Payloads

## Onboarding y KYC

### Endpoint
```
POST /user/onboard
```
#### Payload ejemplo
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@correo.com",
  "telefono": "+5215555555555",
  "curp": "PEPJ800101HDFLLL01",
  "direccion": "Calle Falsa 123, CDMX",
  "banco_clabe": "032180000118359719",
  "rfc": "PEPJ800101AAA"
}
```
#### Respuesta posible
```json
{
  "success": true,
  "user_id": 123,
  "kyc_status": "approved"
}
```

## Inicio de Pago

### Endpoint
```
POST /payment/initiate
```
#### Payload ejemplo
```json
{
  "monto": 15000,
  "destinatario_id": 456
}
```
#### Respuesta posible
```json
{
  "success": true,
  "clabe": "646180157000000000",
  "bank_account_id": "uuid-juno-bank-account"
}
```

## Redención y Payout

### Endpoint (interno backend)
```
POST /payment/redeem
```
#### Payload ejemplo
```json
{
  "escrow_id": 789,
  "juno_bank_account_id": "uuid-juno-bank-account",
  "monto": 15000
}
```
#### Respuesta posible
```json
{
  "success": true,
  "status": "redemption_initiated",
  "juno_tx_id": "juno-redemption-tx-id"
}
```

## Disputa

### Endpoint
```
POST /dispute/:escrowId/raise
```
#### Payload ejemplo
```json
{
  "reason": "Producto no recibido",
  "details": "Han pasado 7 días y el vendedor no entrega.",
  "evidence": "https://url-a-evidencia.com/archivo.jpg"
}
```
#### Respuesta posible
```json
{
  "success": true,
  "message": "Disputa registrada",
  "dispute": { "status": "pending" }
}
```

## Resolución de Disputa (admin)

### Endpoint
```
POST /dispute/:escrowId/admin-resolve
```
#### Payload ejemplo
```json
{
  "resolution": "approved",
  "adminNotes": "El vendedor no entregó en tiempo. Se revierte el pago."
}
```
#### Respuesta posible
```json
{
  "success": true,
  "status": "resolved",
  "contractTxHash": "0xabc..."
}
```

---

Cada endpoint y payload está diseñado para facilitar la integración y automatización del flujo completo, incluyendo onboarding/KYC, pagos, custodia, redención, payout y disputa. Si necesitas ejemplos de respuestas de error, flujos alternativos o endpoints adicionales, avísame.

- La línea de tiempo de eventos de pago (frontend) ahora muestra íconos para todos los tipos de evento relevantes: redención, payout, disputa, etc.
- La entidad User en la base de datos ahora incluye el campo `juno_bank_account_id` para almacenar el UUID de la cuenta bancaria registrada en Juno.
- El flujo de redención y payout ahora utiliza el UUID de Juno (`juno_bank_account_id`) como destino, en vez del CLABE, cumpliendo con las mejores prácticas y requisitos de la API de Juno.
- Se mejoró el mapeo y automatización de usuarios con cuentas bancarias externas registradas en Juno.
- Próximo paso: ejecutar una prueba completa de pago end-to-end para validar toda la integración (escrow, redención, payout).

---

## Assessment y Plan de Acción (Mayo 2025)

### Flow Actual (antes de hoy)
- CLABE de depósito y payout generados y almacenados por usuario.
- El backend intentaba crear CLABE vía Juno, pero había problemas con la autenticación y el tipo de API key.
- Los pagos y payouts eran gestionados directamente en MXN vía Juno, sin integración real de custodia cripto ni MXNb.
- El frontend muestra ambos CLABEs, pero el flujo de pagos y custodia era lineal y sin split.
- No existía un split entre payout inmediato y monto en custodia.
- No había integración real con smart contracts de Arbitrum ni emisión/redención de MXNbs.

### Nuevo Flow Propuesto (post-implementación de hoy)
- Recepción del 100% del pago en el deposit_clabe vía Juno.
- Emisión de MXNbs equivalentes al monto recibido.
- Split automático:
    - **Payout inmediato (%):** Redención de MXNbs y payout en MXN al deposit_clabe.
    - **Custodia (%):** Bloqueo de MXNbs en smart contract (Arbitrum). Tras el periodo y sin reclamos, redención de MXNbs y payout en MXN al payout_clabe.
- El usuario nunca recibe MXNb, solo MXN.
- Toda la lógica y persistencia está centralizada en el backend.

---

## Contacto y soporte
Para dudas o soporte, contactar al equipo de desarrollo Kustodia.

---

## Diagrama de Relaciones de Tablas (ERD)

```mermaid
erDiagram
    USER {
        int id PK
        string email
    }
    PAYMENT {
        int id PK
        int user_id FK
        int escrow_id FK
        int juno_transaction_id FK
        string blockchain_tx_hash
    }
    ESCROW {
        int id PK
        int payment_id FK
        string smart_contract_escrow_id
        string blockchain_tx_hash
        string release_tx_hash
    }
    DISPUTE {
        int id PK
        int escrow_id FK
        int raised_by FK
        string contract_dispute_raised_tx
        string contract_dispute_resolved_tx
    }
    PAYMENT_EVENT {
        int id PK
        int paymentId FK
    }
    JUNOTRANSACTION {
        int id PK
        string tx_hash
    }

    USER ||--o{ PAYMENT : "hace"
    PAYMENT ||--|| ESCROW : "tiene"
    ESCROW ||--o{ DISPUTE : "puede tener"
    USER ||--o{ DISPUTE : "puede levantar"
    PAYMENT ||--o{ PAYMENT_EVENT : "genera"
    PAYMENT }o--|| JUNOTRANSACTION : "usa"
```

---


erDiagram
    USER {
        int id PK
        string email
        string password_hash
        string full_name
        string kyc_status
        string wallet_address
        string deposit_clabe
        string payout_clabe
        string juno_bank_account_id
        boolean email_verified
        string email_verification_token
        string password_reset_token
        string truora_process_id
        datetime password_reset_expires
        datetime created_at
        datetime updated_at
    }
    PAYMENT {
        int id PK
        int user_id FK
        string recipient_email
        decimal amount
        string currency
        string description
        string reference
        int juno_transaction_id FK
        string blockchain_tx_hash
        string bitso_tracking_number
        jsonb travel_rule_data
        string deposit_clabe
        string payout_clabe
        string status
        int escrow_id FK
        datetime created_at
        datetime updated_at
    }
    ESCROW {
        int id PK
        int payment_id FK
        string smart_contract_escrow_id
        string blockchain_tx_hash
        string release_tx_hash
        decimal custody_percent
        decimal custody_amount
        decimal release_amount
        string status
        string dispute_status
        string dispute_reason
        string dispute_details
        string dispute_evidence
        jsonb dispute_history
        datetime custody_end
        datetime created_at
        datetime updated_at
    }
    DISPUTE {
        int id PK
        int escrow_id FK
        int raised_by FK
        string reason
        string details
        string evidence_url
        string status
        string admin_notes
        string contract_dispute_raised_tx
        string contract_dispute_resolved_tx
        datetime created_at
        datetime updated_at
    }
    PAYMENT_EVENT {
        int id PK
        int paymentId FK
        string type
        string description
        datetime created_at
    }
    JUNOTRANSACTION {
        int id PK
        string type
        string reference
        decimal amount
        string status
        string tx_hash
        datetime created_at
        datetime updated_at
    }

    USER ||--o{ PAYMENT : "hace"
    PAYMENT ||--|| ESCROW : "tiene"
    ESCROW ||--o{ DISPUTE : "puede tener"
    USER ||--o{ DISPUTE : "puede levantar"
    PAYMENT ||--o{ PAYMENT_EVENT : "genera"
    PAYMENT }o--|| JUNOTRANSACTION : "usa"
```

---

## Diagrama End-to-End: Onboarding, Pagos, Custodia, Payout y Autenticación Bancaria

```mermaid
sequenceDiagram
    participant Usuario
    participant Frontend
    participant Backend
    participant KYC as Proveedor KYC
    participant Juno
    participant PlatformBridge as Wallet Platform Bridge
    participant SmartContract
    participant DB as Base de Datos
    participant Admin

    %% --- Onboarding y KYC ---
    Usuario->>Frontend: 1. Registro y envío de datos personales
    Frontend->>Backend: 2. POST /user/onboard (datos usuario)
    Backend->>KYC: 3. Llama API KYC para verificación
    KYC-->>Backend: 4. Respuesta KYC (aprobado/rechazado)
    Backend->>DB: 5. Guarda estado KYC y usuario

    %% --- Alta de cuenta bancaria (CLABE) ---
    Backend->>Juno: 6. POST /bank-accounts (alta CLABE)
    Juno-->>Backend: 7. Retorna CLABE y bank_account_id
    Backend->>DB: 8. Guarda CLABE y UUID Juno
    Backend-->>Frontend: 9. Retorna CLABE a usuario

    %% --- Pago y fondeo ---
    Usuario->>Juno: 10. Transfiere MXN a CLABE
    Juno-->>Backend: 11. Webhook notifica pago recibido
    Backend->>DB: 12. Registra evento 'deposit_received'
    %% Juno emite MXNBs automáticamente
    Juno-->>PlatformBridge: 13. Emite MXNBs a Platform Bridge (auto)
    %% Backend inicia TX en Arbitrum
    Backend->>PlatformBridge: 14. Instruye envío de MXNBs a smart contract (escrow)
    PlatformBridge->>SmartContract: 15. TX: Envía MXNBs a smart contract (escrow)
    SmartContract-->>Backend: 16. Confirma bloqueo y escrowId
    Backend->>DB: 17. Registra evento 'escrow_created'

    %% --- Split y payout inmediato ---
    alt Split con payout inmediato
        Backend->>Juno: 18a. Redime MXNB a MXN (payout inmediato) usando juno_bank_account_id
        Juno-->>Backend: 19a. Confirma redención y transferencia SPEI
        Backend->>DB: 20a. Registra eventos 'redemption_initiated', 'redemption_success', 'payout_completed'
        Backend-->>Usuario: 21a. Notifica fondos recibidos
    end

    %% --- Custodia y liberación ---
    SmartContract-->>Backend: 22. Fin de periodo de custodia, liberación posible
    Backend->>SmartContract: 23. TX: Solicita liberación de MXNBs
    SmartContract-->>PlatformBridge: 24. TX: Libera MXNBs a Platform Bridge
    PlatformBridge->>Juno: 25. Transfiere MXNBs a wallet Juno para redención
    Backend->>Juno: 26. Solicita redención final de MXNBs a MXN al vendedor
    Juno-->>Backend: 27. Confirma redención y transferencia SPEI final
    Backend->>DB: 28. Registra toda la trazabilidad

    %% --- Disputa (opcional) ---
    Usuario->>Frontend: 29. Puede levantar disputa (si aplica)
    Frontend->>Backend: 30. POST /dispute/:escrowId/raise
    Backend->>SmartContract: 31. TX: Marca escrow como 'en disputa'
    SmartContract-->>Backend: 32. Confirma disputa
    Backend->>DB: 33. Crea entidad Dispute
    Admin->>Backend: 34. POST /dispute/:escrowId/admin-resolve
    Backend->>SmartContract: 35. TX: Llama a resolución
    SmartContract-->>Backend: 36. Confirma resolución
    Backend->>DB: 37. Actualiza estado de Dispute y Escrow

    Note over Backend,Juno: Todas las llamadas a Juno usan API Key (Bearer) en header HTTP.
    Note over Backend,Juno: Los webhooks de Juno se validan usando el secreto compartido.
    Note over Backend,Juno: El payout/redención requiere el UUID de la cuenta bancaria registrada.
    Note over Backend,Juno: El backend verifica identidad y KYC antes de autorizar la transacción.
```
