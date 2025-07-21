# Kustodia CLABE/SPEI Escrow & Payout Automation

## Tabla de Scripts Principales

| Script                        | Paso(s) en el flujo                          | Propósito / Acción principal                                                            | ¿Esencial para automatización? | Observaciones clave                          |
|-------------------------------|----------------------------------------------|-----------------------------------------------------------------------------------------|-------------------------------|----------------------------------------------|
| **sync_juno_deposits.ts**     | 2-3                                         | Sincroniza depósitos SPEI detectados en Juno y los asocia con payments.                 | ✅                            | Primer paso tras depósito.                   |
| **sendEscrowFunds.ts**        | 5a                                          | Envía MXNBs de bridge wallet al escrow (custodia on-chain).                             | ✅                            | Fondeo de escrow, requiere bridge wallet.    |
| **releaseEscrowFunds.ts**     | 9                                            | Libera MXNBs del escrow al bridge wallet (fin de custodia).                             | ✅                            | Para liberar fondos tras fin de custodia.    |
| **sendFromBridgeToJuno.ts**   | 10                                           | Envía MXNBs del bridge wallet a la wallet Juno para redención.                          | ✅                            | Paso previo a redención final.               |
| **redeem_mxnb_to_fiat.ts**    | 11                                           | Redime MXNBs a MXN vía Juno y paga al vendedor (post-custodia).                         | ✅                            | Redención y payout final.                    |
| **redeemAndPayout.ts**        | 5b                                           | Redime y paga al vendedor (payout inmediato, split).                                    | Opcional                      | Solo si usas payout inmediato.               |

## Utilitarios y Test

- Ver tabla en documentación principal para scripts de soporte, mantenimiento y pruebas.

---

## Plan de Automatización End-to-End (Producción)

### 1. Prerrequisitos & Recursos Necesarios
- **Variables de entorno:** Configura `.env` con llaves de Juno, bridge wallet, smart contract, etc.
- **Compilación:** Usa `tsc` para compilar todos los scripts a `dist-scripts/`.
- **Base de datos:** PostgreSQL correctamente migrada y accesible.
- **Credenciales de Juno:** API Key/Secret, bank account UUIDs.
- **Bridge Wallet:** Llave privada segura y fondos suficientes de MXNB.
- **Smart Contract:** Dirección y ABI desplegada en Arbitrum.
- **Infraestructura:** Servidor seguro (idealmente Linux), Node.js >= 18, acceso a internet estable.

### 2. Secuencia Recomendada de Ejecución

1. **Sincronizar depósitos SPEI:**
   - Ejecuta: `node dist-scripts/scripts/sync_juno_deposits.js`
   - Resultado: Payments fondeados y asociados en DB.

2. **Fondear Escrow (custodia):**
   - Ejecuta: `node dist-scripts/scripts/sendEscrowFunds.js`
   - Resultado: MXNBs transferidos de bridge wallet al escrow (on-chain).

3. **Liberar Escrow (fin de custodia):**
   - Ejecuta: `node dist-scripts/scripts/releaseEscrowFunds.js`
   - Resultado: MXNBs liberados del escrow al bridge wallet.

4. **Enviar MXNBs a Juno para redención:**
   - Ejecuta: `node dist-scripts/scripts/sendFromBridgeToJuno.js`
   - Resultado: MXNBs transferidos a la wallet Juno.

5. **Redimir MXNBs y pagar al vendedor:**
   - Ejecuta: `node dist-scripts/scripts/redeem_mxnb_to_fiat.js`
   - Resultado: Redención y SPEI payout al vendedor.

6. **(Opcional) Payout inmediato:**
   - Ejecuta: `node dist-scripts/scripts/redeemAndPayout.js`
   - Resultado: Split y payout inmediato si aplica.

### 3. Notas y Buenas Prácticas
- Todos los eventos relevantes se registran en la base de datos y son visibles en la timeline del usuario.
- Los scripts deben ejecutarse en orden, y se recomienda automatizar la secuencia con un orquestador (cron job, workflow, o servicio backend).
- Mantén logs detallados y monitorea errores en cada paso.
- Elimina o archiva scripts `.js` antiguos si ya migraste a TypeScript.
- Mantén tus llaves y credenciales seguras y nunca las subas a repositorios públicos.

### 4. Recursos y Mantenimiento
- **Monitoreo:** Implementa alertas y dashboards para detectar fallos en cualquier paso del flujo.
- **Backups:** Realiza backups regulares de la base de datos.
- **QA:** Ejecuta scripts de test E2E periódicamente para asegurar la integridad del flujo.
- **Actualización:** Mantén dependencias y scripts actualizados, revisa cambios en APIs de Juno y contratos.

---

## Recomendación Final

Para producción, **automatiza el flujo completo** con un orquestador que ejecute cada script en orden y maneje errores, reintentos y notificaciones. Documenta cualquier cambio en este README y mantén la trazabilidad de todos los eventos en la base de datos.

---

¿Dudas o mejoras? Contacta al equipo de ingeniería de Kustodia para soporte.
