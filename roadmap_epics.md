# Product Roadmap & Epics for MXNB P2P Payment Solution

_Last updated: 2025-04-29_

## Overview
This roadmap outlines the major phases (epics) and key tasks for building a secure, scalable, and user-friendly P2P payment platform using MXNB. The plan covers frontend, backend, integrations, compliance, and design system foundations.

---

## Epic 1: Design System & Wireframes
- [x] Create mobile-first SVG wireframes for all core user flows
- [x] Develop a UI kit (buttons, inputs, badges, cards, modals, stepper)
- [x] Prepare brand assets (color palette, typography, logo placeholder)
- [x] Gather feedback and iterate on designs

## Epic 2: Frontend Implementation
- [x] Set up React/React Native project structure
- [x] Implement onboarding, KYC, dashboard, payment, and claim screens
- [x] Build reusable UI components from the design system
- [x] Integrate navigation and state management
- [x] Add legal footers and accessibility features

## Epic 3: Backend & API Development
- [x] Define backend architecture and database schema
- [x] Implement user authentication and KYC flows
- [x] Develop endpoints for payments, escrow, and transaction history
- [x] Integrate with Juno (or other CLABE/payment APIs)
- [ ] Set up admin dashboard and dispute management endpoints
- [x] Environment variable management and API key integration (Truora)
- [x] Fix TypeORM entity and decorator errors
- [x] Test user registration and login endpoints

## Epic 4: Integration & Testing
- [ ] Connect frontend with backend APIs
- [ ] Implement payment status tracking and notifications
- [ ] Test all user flows (onboarding, payments, claims, admin)
- [ ] Perform security and compliance checks
- [ ] Gather user feedback and iterate

## Epic 5: Documentation & Launch Prep
- [ ] Document the technical roadmap, user stories, and requirements
- [ ] Prepare onboarding docs for developers and designers
- [ ] Create deployment and monitoring plans
- [ ] Plan for customer support and legal compliance

---

## Actionable Backend Checklist (May 2025)
- [x] Fix TypeORM entity and decorator errors
- [x] Ensure strict TypeScript type safety in entities and controllers
- [x] Set up and test environment variable management (.env)
- [x] Integrate and securely store Truora API key
- [x] Test registration and login endpoints (manual and via Postman)
- [ ] Add improved error logging and response details for all endpoints
- [ ] Expand API tests for payments, escrow, and admin flows
- [ ] Document API endpoints with example requests/responses
- [ ] Prepare for deployment (Docker, cloud, etc.)
- [ ] Finalize admin dashboard and dispute management endpoints

## Notes
- This roadmap is iterative: feedback and learnings will inform future updates.
- Future features (multi-currency, advanced analytics, etc.) can be added as new epics.

---

## Kustodia: Assessment y Plan de Acción (Mayo 2025)

## 1. Assessment: Nuevo Flow vs Setup Actual

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
    - **Payout inmediato (%):**
        - Redención de MXNbs y payout en MXN al deposit_clabe.
    - **Custodia (%):**
        - Bloqueo de MXNbs en smart contract (Arbitrum).
        - Tras el periodo de custodia y sin reclamos, redención de MXNbs y payout en MXN al payout_clabe.
- El usuario nunca recibe MXNb, solo MXN.
- Toda la lógica y persistencia está centralizada en el backend.
- Diagrama Mermaid actualizado para reflejar esta lógica.

## 2. Resumen de Implementaciones de Hoy
- Refactor de la lógica de creación de CLABE y autenticación HMAC para Juno.
- Debug y logs para diagnóstico de errores con la API Key/Secret.
- Actualización de roadmap y checklist para reflejar integración de ambos CLABEs y split de pagos.
- Diagramas Mermaid detallados para journey completo y split payout/custodia.
- Documentación de los roles de backend, Juno, MXNb y smart contracts en el flujo.

## 3. Actionable List / Plan de Acción

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

**Notas:**
- El sistema ya está listo para pruebas completas en cuanto se resuelva el acceso a la API de Juno.
- El siguiente gran hito es la integración y automatización de la emisión/redención de MXNbs y la custodia en Arbitrum.
- El diagrama Mermaid actualizado debe mantenerse en la documentación principal.

---

For detailed tasks, user stories, or to break down epics into sprints, please specify!
