-- Payment Events Migration
-- Generated on 2025-07-15T00:35:26.232Z
-- Total records: 394

INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (1, 'initiated', 'Pago iniciado', false, '2025-05-23T12:07:39.073Z', 58);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (2, 'escrow_created', 'Escrow/custodia creado', false, '2025-05-23T12:07:39.104Z', 58);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (3, 'deposit_received', 'Depósito confirmado por Juno', false, '2025-05-23T12:10:26.483Z', 58);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (4, 'payout_released', 'Monto liberado al vendedor', false, '2025-05-23T12:10:26.532Z', 58);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (5, 'redemption_failed', 'Redención MXNB fallida: Invalid API request data', false, '2025-05-23T12:30:14.525Z', 58);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (6, 'redemption_failed', 'Redención MXNB fallida: Invalid API request data', false, '2025-05-23T12:32:08.527Z', 58);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (7, 'redemption_failed', 'Redención MXNB fallida: Invalid API request data', false, '2025-05-23T12:34:06.354Z', 58);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (8, 'initiated', 'Pago iniciado', false, '2025-05-25T21:53:04.048Z', 59);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (9, 'escrow_created', 'Escrow/custodia creado', false, '2025-05-25T21:53:04.078Z', 59);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (10, 'initiated', 'Pago iniciado', false, '2025-05-25T23:28:00.713Z', 61);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (11, 'escrow_created', '🔒 Custodia creada', false, '2025-05-25T23:28:00.731Z', 61);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (12, 'redemption_initiated', 'Initiating MXNB redemption to seller payout_clabe: 002668900881819471', false, '2025-05-29T21:55:55.779Z', 61);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (13, 'redemption_failed', 'MXNB redemption failed: {"success":false,"error":{"message":"Request validation failed","code":"32002","details":[{"localized_message":"must be a valid UUID","code_message":"32002","type":"VALIDATION","path":"destinationBankAccountId"}],"error_data":null}}', false, '2025-05-29T21:55:56.271Z', 61);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (14, 'redemption_initiated', 'Initiating MXNB redemption to seller payout_clabe: 002668900881819471', false, '2025-05-29T21:56:24.744Z', 61);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (15, 'redemption_initiated', 'Initiating MXNB redemption to seller payout_clabe: 002668900881819471', false, '2025-05-29T21:56:47.447Z', 61);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (16, 'redemption_failed', 'MXNB redemption failed: {"responseData":{"success":false,"error":{"message":"Request validation failed","code":"32002","details":[{"localized_message":"must be a valid UUID","code_message":"32002","type":"VALIDATION","path":"destinationBankAccountId"}],"error_data":null}},"message":"Request failed with status code 400","stack":"AxiosError: Request failed with status code 400\n    at settle (C:\\Users\\rojll\\Kustodia\\backend\\node_modules\\axios\\lib\\core\\settle.js:19:12)\n    at IncomingMessage.handleStreamEnd (C:\\Users\\rojll\\Kustodia\\backend\\node_modules\\axios\\lib\\adapters\\http.js:599:11)\n    at IncomingMessage.emit (node:events:529:35)\n    at IncomingMessage.emit (node:domain:489:12)\n    at endReadableNT (node:internal/streams/readable:1400:12)\n    at processTicksAndRejections (node:internal/process/task_queues:82:21)\n    at Axios.request (C:\\Users\\rojll\\Kustodia\\backend\\node_modules\\axios\\lib\\core\\Axios.js:45:41)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async redeemMXNBToMXNAndPayout (C:\\Users\\rojll\\Kustodia\\backend\\src\\services\\payoutService.ts:163:22)\n    at async main (C:\\Users\\rojll\\Kustodia\\backend\\src\\scripts\\testRedemption.ts:13:20)"}', false, '2025-05-29T21:56:47.842Z', 61);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (17, 'redemption_initiated', 'Initiating MXNB redemption to seller Juno bank account UUID: f14bdec6-45ba-4e55-8c42-599df650c8cf', false, '2025-05-29T22:09:42.887Z', 61);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (18, 'redemption_success', 'MXNB redemption successful. Juno ref: 70517ff3-a451-4095-93a6-c3dc1ad5a71e', false, '2025-05-29T22:09:46.474Z', 61);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (19, 'payout_completed', 'Redemption and payout to seller completed.', false, '2025-05-29T22:09:46.492Z', 61);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (20, 'initiated', 'Pago iniciado', false, '2025-06-07T14:54:51.245Z', 69);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (21, 'escrow_created', '🔒 Custodia creada', false, '2025-06-07T14:54:51.268Z', 69);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (22, 'initiated', 'Pago iniciado', false, '2025-06-07T17:05:54.222Z', 70);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (23, 'escrow_created', '🔒 Custodia creada', false, '2025-06-07T17:05:54.245Z', 70);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (24, 'initiated', 'Pago iniciado', false, '2025-06-07T17:35:55.078Z', 71);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (25, 'funded', 'Evento retroactivo: Pago fondeado (sincronización SPEI)', false, '2025-06-08T00:06:58.824Z', 18);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (26, 'funded', 'Evento retroactivo: Pago fondeado (sincronización SPEI)', false, '2025-06-08T00:06:58.838Z', 14);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (27, 'funded', 'Evento retroactivo: Pago fondeado (sincronización SPEI)', false, '2025-06-08T00:06:58.841Z', 33);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (28, 'funded', 'Evento retroactivo: Pago fondeado (sincronización SPEI)', false, '2025-06-08T00:06:58.846Z', 34);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (29, 'funded', 'Evento retroactivo: Pago fondeado (sincronización SPEI)', false, '2025-06-08T00:06:58.852Z', 35);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (30, 'funded', 'Evento retroactivo: Pago fondeado (sincronización SPEI)', false, '2025-06-08T00:06:58.855Z', 36);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (31, 'funded', 'Evento retroactivo: Pago fondeado (sincronización SPEI)', false, '2025-06-08T00:06:58.858Z', 58);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (32, 'funded', 'Evento retroactivo: Pago fondeado (sincronización SPEI)', false, '2025-06-08T00:06:58.861Z', 60);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (33, 'funded', 'Evento retroactivo: Pago fondeado (sincronización SPEI)', false, '2025-06-08T00:06:58.865Z', 61);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (34, 'funded', 'Evento retroactivo: Pago fondeado (sincronización SPEI)', false, '2025-06-08T00:06:58.869Z', 70);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (35, 'funded', 'Evento retroactivo: Pago fondeado (sincronización SPEI)', false, '2025-06-08T00:06:58.872Z', 71);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (36, 'redemption_initiated', 'Redención MXNB iniciada. Juno redemption ID: f4ea8ce7-c753-45a0-b942-e08e70ddcdc5', false, '2025-06-08T00:31:34.250Z', 71);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (37, 'payout_initiated', 'Pago SPEI al vendedor iniciado. Monto: $1000 MXN', false, '2025-06-08T00:31:34.253Z', 71);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (38, 'escrow_funded_onchain', 'MXNB bloqueados en escrow on-chain. TxHash: 0xc3d13d1bdf92e8c056bb7657786fde56e276c465ba32b553b95829919b228133', false, '2025-06-08T00:45:00.296Z', 71);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (39, 'dispute_raised', 'Disputa iniciada por el usuario. Motivo: Item not delivered', false, '2025-06-09T00:17:35.254Z', 71);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (40, 'initiated', 'Pago iniciado', false, '2025-06-12T00:20:08.090Z', 72);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (41, 'created', 'Pago creado con CLABE única', false, '2025-06-12T00:20:08.114Z', 72);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (42, 'initiated', 'Pago iniciado', false, '2025-06-12T00:22:37.014Z', 73);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (43, 'created', 'Pago creado con CLABE única', false, '2025-06-12T00:22:37.026Z', 73);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (44, 'funded', 'Evento retroactivo: Pago fondeado (sincronización SPEI)', false, '2025-06-12T00:41:10.828Z', 73);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (45, 'redemption_initiated', 'Redención MXNB iniciada. Juno redemption ID: 1c1fd202-7331-49be-a9dd-971241e58060', false, '2025-06-12T01:00:12.054Z', 73);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (46, 'payout_initiated', 'Pago SPEI al vendedor iniciado. Monto: $2500 MXN', false, '2025-06-12T01:00:12.058Z', 73);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (47, 'escrow_funded_onchain', 'MXNB bloqueados en escrow on-chain. TxHash: 0x59540ead7978f862f8ce4466eb38d2a516c9d991e8f6ed43fd8ae4b3a6c648ad', false, '2025-06-12T01:25:58.639Z', 73);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (48, 'payout_completed', 'Payout of 1000 MXNB to Juno wallet for escrow 59 (blockchain escrow 1). ReleaseTx: 0xc8b0422b33..., PayoutTx: 0x9e906eb3b03f4161f512322b82279874b9bc725f966bdb4b3cfc102bd0ad7446', false, '2025-06-12T23:20:00.706Z', 71);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (49, 'redemption_initiated', 'Redención MXNB iniciada. Juno redemption ID: e456cfa2-1813-43b4-ad7d-4b7bef10d47f', false, '2025-06-12T23:23:51.774Z', 71);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (50, 'payout_initiated', 'Pago SPEI al vendedor iniciado. Monto: $1000 MXN', false, '2025-06-12T23:23:51.781Z', 71);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (51, 'initiated', 'Pago iniciado', false, '2025-06-14T01:52:40.398Z', 74);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (52, 'created', 'Pago creado con CLABE única', false, '2025-06-14T01:52:40.420Z', 74);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (53, 'initiated', 'Pago iniciado', false, '2025-06-14T02:01:48.727Z', 75);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (54, 'created', 'Pago creado con CLABE única', false, '2025-06-14T02:01:48.739Z', 75);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (56, 'escrow_released', 'MXNB released from escrow to bridge wallet. Tx: 0x9d8cc8483db87ae5527e2ca70fa2e622b9a80e8fbc9e729be13af41bd7dc99fd', false, '2025-06-17T02:43:02.441Z', 73);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (57, 'mxnb_sent_to_juno', 'MXNB sent from bridge wallet to Juno platform wallet. Tx: 0x7eb23bb6df9491c3f7823f4fcf2bf4bec2e63ab7619324465816133fb24f494d', false, '2025-06-17T02:43:02.441Z', 73);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (58, 'payout_initiated', 'Pago SPEI al vendedor iniciado. Monto: $2500 MXN', false, '2025-06-17T16:06:29.266Z', 73);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (59, 'redemption_initiated', 'Redención MXNB iniciada. Juno redemption ID: 40da4d07-0819-4ce7-a64f-7eb376c09a10', false, '2025-06-17T16:07:11.730Z', 73);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (60, 'initiated', 'Pago iniciado', false, '2025-06-17T19:44:49.362Z', 81);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (61, 'created', 'Pago creado con CLABE única', false, '2025-06-17T19:44:49.380Z', 81);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (62, 'funded', 'Pago fondeado vía depósito SPEI Juno. ID de depósito: c0ddfc46beb24e838f793da514d7d06f', false, '2025-06-17T19:58:46.401Z', 81);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (63, 'redemption_initiated', 'Redención MXNB iniciada. Juno redemption ID: 2c64a4a9-88ef-455e-9252-939f156f1f31', false, '2025-06-17T20:06:19.229Z', 81);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (64, 'payout_initiated', 'Pago SPEI al vendedor iniciado. Monto: $1000 MXN', false, '2025-06-17T20:06:19.233Z', 81);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (65, 'initiated', 'Pago iniciado', false, '2025-06-17T21:42:46.327Z', 82);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (66, 'created', 'Pago creado con CLABE única', false, '2025-06-17T21:42:46.344Z', 82);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (67, 'escrow_funded_onchain', 'MXNB bloqueados en escrow on-chain. EscrowId: 69, TxHash: 0x605519dbd29bafdab81933238c49978c2c1cdbc041ff2b1b235e243cf0ed6112', false, '2025-06-18T01:36:26.412Z', 81);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (68, 'initiated', '💳 Pago iniciado - CLABE única: 710969000000396022', false, '2025-06-23T03:10:21.115Z', 83);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (69, 'funded', 'Pago fondeado vía depósito SPEI Juno. Deposit ID: 4f70e12b0890471997650980969c9fd2', false, '2025-06-23T15:49:26.265Z', 83);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (70, 'escrow_created_onchain', 'MXNB bloqueados en escrow on-chain. Escrow ID: 3, TxHash: 0x564b84efbf446ef3e3d802e38b0f3b5dce92f32d1bf3daf21859673f0e7d468b', false, '2025-06-23T16:02:29.275Z', 83);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (71, 'fondos_custodia_liberados', 'Escrow funds released back to Bridge Wallet via smart contract', false, '2025-06-23T16:22:15.542Z', 81);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (72, 'mxnb_canjeados', 'Canje exitoso de 1000 MXNB a MXN vía Juno. ID de canje: N/A', false, '2025-06-23T16:23:25.477Z', 81);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (73, 'pago_completado', 'Pago completado exitosamente. Pago SPEI a 002668900881819471 for test-seller@kustodia.mx', false, '2025-06-23T16:23:25.484Z', 81);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (74, 'status_actualizado_legacy', 'Estado actualizado de ''paid'' a ''completed''. Custodia expirada y procesada manualmente antes de automatización', false, '2025-06-23T22:21:57.546Z', 71);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (75, 'status_actualizado_legacy', 'Estado actualizado de ''paid'' a ''completed''. Procesado manualmente antes de automatización', false, '2025-06-23T22:21:57.566Z', 73);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (76, 'initiated', '💳 Pago iniciado - CLABE única: 710969000000396640', false, '2025-06-24T23:02:43.768Z', 84);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (77, 'funded', 'Pago fondeado vía depósito SPEI Juno. Deposit ID: 8b1a274d347c4e97822a2fd506043e85', false, '2025-06-25T18:18:23.554Z', 84);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (78, 'escrow_created_onchain', 'MXNB bloqueados en escrow on-chain. Escrow ID: 4, TxHash: 0x7c984b5747d0aac591e0fd01fa4ad4e326060e7349adc1ca3d365fb478cc32fd', false, '2025-06-25T18:27:48.978Z', 84);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (79, 'escrow_funded', 'Escrow 4 funded with 5000.00 MXNB. TxHash: 0x7bdf1f669f8725f18c07d9fae4d340567becdc4b9ef7cf26379a4cdfa14614e4', false, '2025-06-25T20:48:32.180Z', 84);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (80, 'mxnb_redemption', 'MXNB redeemed to MXN: 1000.00 (manual completion)', false, '2025-06-26T20:22:26.883Z', 83);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (81, 'spei_sent', 'SPEI sent to 002668900881819471: 1000.00 MXN (manual completion)', false, '2025-06-26T20:22:26.898Z', 83);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (82, 'payment_completed', 'Payment manually completed - status updated (simulation)', false, '2025-06-26T20:22:26.903Z', 83);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (83, 'escrow_released_onchain_simulated', 'Liberación de fondos simulada.', false, '2025-07-02T20:55:59.686Z', 84);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (89, 'redemption_initiated', 'Redención MXNB iniciada. Juno redemption ID: 2c0935f1-5a91-4a3b-a167-cba284d7c386', false, '2025-07-02T21:25:11.471Z', 84);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (90, 'payout_initiated', 'Pago SPEI al vendedor iniciado. Monto: $1000 MXN', false, '2025-07-02T21:25:11.476Z', 84);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (91, 'redemption_initiated', 'Redención MXNB iniciada. Juno redemption ID: 6f9ef859-c93b-48b0-93d2-1af549be7079', false, '2025-07-02T21:25:47.720Z', 84);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (92, 'payout_initiated', 'Pago SPEI al vendedor iniciado. Monto: $1000 MXN', false, '2025-07-02T21:25:47.724Z', 84);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (93, 'redemption_initiated', 'Redención MXNB iniciada. Juno redemption ID: 49206644-b931-47f2-8508-cc27693b5a03', false, '2025-07-02T21:32:02.187Z', 84);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (94, 'payout_initiated', 'Pago SPEI al vendedor iniciado. Monto: $3000 MXN', false, '2025-07-02T21:32:02.195Z', 84);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (95, 'initiated', '💳 Pago iniciado - CLABE única: 710969000000400730', false, '2025-07-04T00:58:38.975Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (96, 'funded', 'Pago fondeado vía depósito SPEI Juno. Deposit ID: fd7a3a104c7541f0baf612573a1843c0', false, '2025-07-04T01:18:15.716Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (99, 'juno_withdrawal', 'MXNB withdrawn from Juno to bridge wallet: 1000.00 to 0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b', false, '2025-07-04T01:38:24.680Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (100, 'escrow_created', '🔒 Custodia creada en blockchain (Escrow ID: 1)', false, '2025-07-04T02:34:14.499Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (101, 'escrow_funded', '💰 Custodia fondeada con 1000 MXNB', false, '2025-07-04T02:34:14.499Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (102, 'initiated', '💳 Pago iniciado - CLABE única: 710969000000400785', false, '2025-07-04T16:02:00.423Z', 86);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (103, 'payment_created', 'Tu pago ha sido creado exitosamente', false, '2025-07-04T16:02:00.450Z', 86);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (104, 'initiated', '💳 Pago iniciado - CLABE única: 710969000000400853', false, '2025-07-04T16:59:45.509Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (105, 'payment_created', 'Tu pago ha sido creado exitosamente', false, '2025-07-04T16:59:45.537Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (106, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:14:00.537Z', 14);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (107, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:14:00.903Z', 33);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (108, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:14:01.299Z', 58);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (109, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:14:01.665Z', 18);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (110, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:14:02.044Z', 34);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (111, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:14:02.433Z', 35);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (112, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:14:02.798Z', 36);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (113, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:14:03.165Z', 60);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (114, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:14:03.517Z', 61);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (115, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:14:03.874Z', 70);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (116, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:21:00.601Z', 14);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (117, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:21:01.051Z', 33);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (118, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:21:01.439Z', 58);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (119, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:21:01.854Z', 18);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (120, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:21:02.241Z', 34);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (121, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:21:02.639Z', 35);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (122, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:21:03.030Z', 36);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (123, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:21:03.407Z', 60);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (124, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:21:03.774Z', 61);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (125, 'juno_withdrawal_error', 'Error en retiro Juno: Request failed with status code 404', false, '2025-07-04T17:21:04.159Z', 70);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (126, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:00.603Z', 25);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (127, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c90000000000000000000000000000000000000000000000000000000003197500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:01.115Z', 19);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (128, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:01.574Z', 27);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (129, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:02.060Z', 29);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (130, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:02.518Z', 28);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (131, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:03.004Z', 30);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (132, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:03.484Z', 31);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (133, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:03.969Z', 32);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (134, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:04.448Z', 24);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (135, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:04.957Z', 26);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (136, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:05.461Z', 37);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (137, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:05.945Z', 47);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (138, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:06.466Z', 38);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (139, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:06.964Z', 39);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (140, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:07.415Z', 48);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (141, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:07.926Z', 50);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (142, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:08.381Z', 54);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (143, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:08.817Z', 52);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (144, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:09.276Z', 44);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (145, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:09.761Z', 49);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (146, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:10.285Z', 40);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (147, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:10.842Z', 41);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (148, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:11.296Z', 45);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (149, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:11.768Z', 42);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (150, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:12.478Z', 43);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (151, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:13.222Z', 46);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (152, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:13.921Z', 56);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (153, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000003b9aca00", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:24:14.604Z', 81);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (154, 'error_pago_final', 'Error en el flujo de pago final: Connection "default" was not found.', false, '2025-07-04T17:24:18.254Z', 84);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (155, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000003b9aca00", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:00.505Z', 81);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (156, 'error_pago_final', 'Error en el flujo de pago final: Connection "default" was not found.', false, '2025-07-04T17:32:07.071Z', 84);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (157, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:07.481Z', 25);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (158, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c90000000000000000000000000000000000000000000000000000000003197500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:07.869Z', 19);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (159, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:08.286Z', 27);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (160, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:08.667Z', 29);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (161, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:09.091Z', 28);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (162, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:09.512Z', 30);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (163, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:09.921Z', 31);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (164, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:10.311Z', 32);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (165, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:10.698Z', 24);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (166, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:11.113Z', 26);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (167, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:11.510Z', 37);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (168, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:12.154Z', 47);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (169, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:12.594Z', 38);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (170, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:13.058Z', 39);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (171, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:13.514Z', 48);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (172, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:13.957Z', 50);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (173, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:14.422Z', 54);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (174, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:14.867Z', 52);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (175, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:15.294Z', 44);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (176, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:15.758Z', 49);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (177, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:16.205Z', 40);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (178, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:16.654Z', 41);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (179, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:17.093Z', 45);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (180, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:17.597Z', 42);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (181, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:18.034Z', 43);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (182, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:18.502Z', 46);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (183, 'error_pago_final', 'Error en el flujo de pago final: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c9000000000000000000000000000000000000000000000000000000001dcd6500", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T17:32:18.954Z', 56);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (184, 'deposito_detectado', 'Depósito SPEI detectado con FID: fc1d0a370c29471cbf274c63ca249d19', false, '2025-07-04T18:37:00.603Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (185, 'spei_redemption_initiated', 'SPEI redemption of 500 MXN to 002668900881819471, Transaction ID: ab8a5807-6d22-43b2-8fec-01db0f7b9ca7', false, '2025-07-04T18:58:39.105Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (186, 'bridge_withdrawal_initiated', 'MXNB withdrawal of 500 to bridge wallet 0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b, Transaction ID: 763f29ca-8103-41bf-b3d3-d3a9e7840ffb', false, '2025-07-04T18:58:46.528Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (187, 'escrow_error', 'Escrow creation/funding failed: Cannot convert undefined to a BigInt', false, '2025-07-04T18:59:16.954Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (188, 'automation_error', 'Automation failed: Cannot convert undefined to a BigInt', false, '2025-07-04T18:59:16.964Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (189, 'spei_redemption_initiated', 'SPEI redemption of 500 MXN to 002668900881819471, Transaction ID: c999aa62-4089-4679-88bd-c69b13c8caea', false, '2025-07-04T18:59:25.843Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (190, 'bridge_withdrawal_initiated', 'MXNB withdrawal of 500 to bridge wallet 0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b, Transaction ID: e22d761b-084f-47ef-b4be-820e3445c060', false, '2025-07-04T18:59:35.422Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (191, 'manual_fix', 'Fixed undefined values that caused BigInt error in escrow creation', false, '2025-07-04T21:43:55.350Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (192, 'manual_fix', 'Fixed undefined values that caused BigInt error in escrow creation', false, '2025-07-04T21:45:28.726Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (193, 'manual_fix', 'Fixed undefined values that caused BigInt error in escrow creation', false, '2025-07-04T21:53:51.104Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (194, 'manual_fix', 'Fixed undefined values that caused BigInt error in escrow creation', false, '2025-07-04T21:54:54.697Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (195, 'manual_escrow_creation_attempt', 'Manual escrow creation initiated for custody amount: 500.00 MXN', false, '2025-07-04T21:58:09.132Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (196, 'manual_escrow_creation_failed', '❌ Manual escrow creation failed: Cannot convert 500.00 to a BigInt', false, '2025-07-04T21:58:09.490Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (197, 'manual_escrow_creation_attempt', 'Manual escrow creation initiated for custody amount: 500.00 MXN', false, '2025-07-04T22:02:52.349Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (198, 'manual_escrow_creation_failed', '❌ Manual escrow creation failed: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xc9c31af50000000000000000000000000000000000000000000000000000000000000002", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0xEcfd7d23488Fb05834f6dD0390CD2E158a0B5d15" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-04T22:03:06.061Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (199, 'manual_escrow_creation_attempt', 'Manual escrow creation initiated for custody amount: 500.00 MXN', false, '2025-07-04T22:08:25.374Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (200, 'escrow_created', '✅ Escrow created successfully - ID: 3, TX: 0x8b139b4a39132d2aac241fdc5af76b87b589a168db58da96d10c9d821fdcd3fd', false, '2025-07-04T22:08:38.599Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (201, 'database_cleanup', 'Payment marked as failed due to missing CLABE - cannot be matched to deposits', false, '2025-07-04T22:25:54.028Z', 15);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (202, 'database_cleanup', 'Payment marked as failed due to missing CLABE - cannot be matched to deposits', false, '2025-07-04T22:25:54.042Z', 16);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (203, 'database_cleanup', 'Payment marked as failed due to missing CLABE - cannot be matched to deposits', false, '2025-07-04T22:25:54.052Z', 17);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (204, 'database_cleanup', 'Payment status updated to match escrow state: pending', false, '2025-07-04T22:25:54.060Z', 20);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (205, 'database_cleanup', 'Payment status updated to match escrow state: pending', false, '2025-07-04T22:25:54.069Z', 21);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (206, 'database_cleanup', 'Payment status updated to match escrow state: pending', false, '2025-07-04T22:25:54.078Z', 22);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (207, 'database_cleanup', 'Payment status updated to match escrow state: pending', false, '2025-07-04T22:25:54.086Z', 23);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (208, 'database_cleanup', 'Payment status updated to match escrow state: pending', false, '2025-07-04T22:25:54.093Z', 59);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (209, 'database_cleanup', 'Payment status updated to match escrow state: pending', false, '2025-07-04T22:25:54.101Z', 69);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (210, 'database_cleanup', 'Payment status updated to match escrow state: pending', false, '2025-07-04T22:25:54.110Z', 72);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (211, 'database_cleanup', 'Payment status updated to match escrow state: pending', false, '2025-07-04T22:25:54.118Z', 74);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (212, 'database_cleanup', 'Payment status updated to match escrow state: pending', false, '2025-07-04T22:25:54.125Z', 75);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (213, 'database_cleanup', 'Payment status updated to match escrow state: pending', false, '2025-07-04T22:25:54.133Z', 82);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (214, 'database_cleanup', 'Payment marked as failed due to missing CLABE - cannot be matched to deposits', false, '2025-07-04T22:25:54.140Z', 80);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (215, 'database_cleanup', 'Payment marked as failed due to missing CLABE - cannot be matched to deposits', false, '2025-07-04T22:25:54.147Z', 79);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (216, 'database_cleanup', 'Payment marked as failed due to missing CLABE - cannot be matched to deposits', false, '2025-07-04T22:25:54.154Z', 78);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (217, 'database_cleanup', 'Payment marked as failed due to missing CLABE - cannot be matched to deposits', false, '2025-07-04T22:25:54.161Z', 77);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (218, 'database_cleanup', 'Payment marked as failed due to missing CLABE - cannot be matched to deposits', false, '2025-07-04T22:25:54.168Z', 76);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (219, 'database_cleanup', 'Payment marked as failed due to missing CLABE - cannot be matched to deposits', false, '2025-07-04T22:25:54.174Z', 12);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (220, 'database_cleanup', 'Payment marked as failed due to missing CLABE - cannot be matched to deposits', false, '2025-07-04T22:25:54.182Z', 11);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (221, 'database_cleanup', 'Payment marked as failed due to missing CLABE - cannot be matched to deposits', false, '2025-07-04T22:25:54.188Z', 10);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (222, 'database_cleanup', 'Payment marked as failed due to missing CLABE - cannot be matched to deposits', false, '2025-07-04T22:25:54.194Z', 7);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (223, 'database_cleanup', 'Payment marked as failed due to missing CLABE - cannot be matched to deposits', false, '2025-07-04T22:25:54.200Z', 6);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (224, 'juno_withdrawal', 'MXNB withdrawn from Juno to bridge wallet: 1000.00', false, '2025-07-04T22:27:00.059Z', 20);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (225, 'juno_withdrawal', 'MXNB withdrawn from Juno to bridge wallet: 1500.00', false, '2025-07-04T22:27:00.071Z', 21);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (226, 'juno_withdrawal', 'MXNB withdrawn from Juno to bridge wallet: 1000.00', false, '2025-07-04T22:27:00.080Z', 22);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (227, 'juno_withdrawal', 'MXNB withdrawn from Juno to bridge wallet: 1000.00', false, '2025-07-04T22:27:00.088Z', 23);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (228, 'juno_withdrawal', 'MXNB withdrawn from Juno to bridge wallet: 1500.00', false, '2025-07-04T22:27:00.097Z', 59);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (229, 'juno_withdrawal', 'MXNB withdrawn from Juno to bridge wallet: 1000.00', false, '2025-07-04T22:27:00.105Z', 69);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (230, 'juno_withdrawal', 'MXNB withdrawn from Juno to bridge wallet: 10000.00', false, '2025-07-04T22:27:00.113Z', 72);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (231, 'juno_withdrawal', 'MXNB withdrawn from Juno to bridge wallet: 1000.00', false, '2025-07-04T22:27:00.121Z', 74);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (232, 'juno_withdrawal', 'MXNB withdrawn from Juno to bridge wallet: 1000.00', false, '2025-07-04T22:27:00.128Z', 75);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (233, 'juno_withdrawal', 'MXNB withdrawn from Juno to bridge wallet: 1000.00', false, '2025-07-04T22:27:00.136Z', 82);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (234, 'initiated', '💳 Pago iniciado - CLABE única: 710969000000401108', false, '2025-07-04T22:50:25.036Z', 88);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (235, 'payment_created', 'Tu pago ha sido creado exitosamente', false, '2025-07-04T22:50:25.070Z', 88);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (236, 'deposito_detectado', 'Depósito SPEI detectado con FID: 9b35cc1fdfc84d639395e79ee935b66a', false, '2025-07-04T23:04:00.490Z', 88);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (237, 'spei_redemption_initiated', 'SPEI redemption of 500 MXN to 002668900881819471, Transaction ID: 583b88b6-52e3-4be3-9aef-55111147c3c7', false, '2025-07-04T23:04:10.576Z', 88);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (238, 'bridge_withdrawal_initiated', 'MXNB withdrawal of 500 to bridge wallet 0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b, Transaction ID: 5a20a4e0-44b1-432f-ab9b-4f526f7bada7', false, '2025-07-04T23:04:17.145Z', 88);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (239, 'escrow_creation_initiated', 'Starting escrow creation for custody amount: 500 MXNB', false, '2025-07-04T23:04:17.152Z', 88);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (240, 'escrow_created', 'Escrow contract created with ID 4, TX: 0x40346b2b6e108b6f433b6878d497987f3b890785e1bae11aa5a374973af9c9be', false, '2025-07-04T23:05:01.162Z', 88);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (242, 'escrow_auto_liberado', 'Custodia liberada on-chain automáticamente al vencer el período.', false, '2025-07-07T15:40:02.944Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (243, 'escrow_auto_liberado', 'Custodia liberada on-chain automáticamente al vencer el período.', false, '2025-07-07T15:40:09.882Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (244, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500.00', false, '2025-07-07T15:42:06.819Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (245, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T15:42:37.249Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (246, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 0.00', false, '2025-07-07T15:42:44.497Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (247, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T15:43:15.549Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (248, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500.00', false, '2025-07-07T15:44:03.824Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (249, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T15:44:34.182Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (250, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 0.00', false, '2025-07-07T15:44:40.534Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (251, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T15:45:10.924Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (252, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500.00', false, '2025-07-07T15:46:07.000Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (253, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T15:46:37.611Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (254, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 0.00', false, '2025-07-07T15:46:44.424Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (255, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T15:47:14.844Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (256, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500.00', false, '2025-07-07T15:48:07.663Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (257, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T15:48:38.086Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (258, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 0.00', false, '2025-07-07T15:48:44.839Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (259, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T15:49:15.284Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (260, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500.00', false, '2025-07-07T15:50:06.607Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (261, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T15:50:37.008Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (262, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 0.00', false, '2025-07-07T15:50:43.948Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (263, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T15:51:14.291Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (264, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500.00', false, '2025-07-07T15:52:06.749Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (265, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500.00', false, '2025-07-07T16:54:07.373Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (266, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T16:54:38.223Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (267, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 0.00', false, '2025-07-07T16:54:44.708Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (268, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T16:55:15.117Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (269, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500.00', false, '2025-07-07T16:56:06.717Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (270, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500.00', false, '2025-07-07T16:58:06.769Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (271, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500.00', false, '2025-07-07T17:00:06.731Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (272, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T17:00:37.513Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (273, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 0.00', false, '2025-07-07T17:00:43.801Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (274, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T17:01:14.228Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (275, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500.00', false, '2025-07-07T17:02:07.696Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (276, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T17:02:38.888Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (277, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 0.00', false, '2025-07-07T17:02:41.709Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (278, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T17:03:12.399Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (279, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500.00', false, '2025-07-07T17:18:15.812Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (280, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T17:18:46.700Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (281, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 0.00', false, '2025-07-07T17:18:53.466Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (282, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T17:19:24.404Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (283, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500', false, '2025-07-07T17:23:15.043Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (284, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T17:23:45.778Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (285, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 1000', false, '2025-07-07T17:23:52.272Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (286, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T17:24:22.933Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (287, 'escrow_auto_liberado', 'Custodia liberada on-chain automáticamente al vencer el período.', false, '2025-07-07T19:50:06.772Z', 88);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (288, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500', false, '2025-07-07T19:52:06.395Z', 88);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (289, 'error_pago_final', 'Error en el flujo de pago final: Juno redemption failed: [object Object]', false, '2025-07-07T19:52:37.057Z', 88);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (290, 'bridge_to_juno_transfer', 'MXNB transferido del bridge a Juno: 500', false, '2025-07-07T20:56:06.755Z', 88);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (291, 'payout_processed', 'Redención y envío SPEI procesado a 002668900881819471', false, '2025-07-07T20:56:50.252Z', 88);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (292, 'payment_released', 'El pago ha sido liberado y transferido', false, '2025-07-07T20:56:50.272Z', 88);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (293, 'initiated', '💳 Pago iniciado - CLABE única: 710969000000401438', false, '2025-07-07T22:24:48.070Z', 89);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (294, 'payment_created', 'Tu pago ha sido creado exitosamente', false, '2025-07-07T22:24:48.111Z', 89);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (301, 'deposito_detectado', 'Depósito SPEI detectado con FID: 5a5128675a4f4c7682e326a0c559e939', false, '2025-07-07T22:44:00.568Z', 89);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (302, 'funds_received', 'Los fondos han sido recibidos en la custodia', false, '2025-07-07T22:44:00.608Z', 89);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (303, 'bridge_withdrawal_initiated', 'MXNB withdrawal of 5000 to bridge wallet 0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b, Transaction ID: 950e490b-06b3-4c83-b274-73b76a2849c0', false, '2025-07-07T22:44:08.745Z', 89);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (304, 'escrow_creation_initiated', 'Starting escrow creation for custody amount: 5000 MXNB', false, '2025-07-07T22:44:08.755Z', 89);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (305, 'escrow_created', 'Escrow contract created with ID 5, TX: 0x7b7e4a94c523f2d5e62ca9f3ce8c07f17e183c5ff1b1520598f10f4e918fef54', false, '2025-07-07T22:44:52.107Z', 89);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (306, 'escrow_created', 'La custodia ha sido creada y está activa', false, '2025-07-07T22:44:52.125Z', 89);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (307, 'initiated', '💳 Pago iniciado - CLABE única: 710969000000401454', false, '2025-07-08T00:11:46.910Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (308, 'payment_created', 'Tu pago ha sido creado exitosamente', false, '2025-07-08T00:11:46.944Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (309, 'deposito_detectado', 'Depósito SPEI detectado con FID: 499e6107a4064360aecc8376fd3cddb4', false, '2025-07-08T00:21:00.424Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (310, 'funds_received', 'Los fondos han sido recibidos en la custodia', false, '2025-07-08T00:21:00.450Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (313, 'bridge_withdrawal_initiated', 'MXNB withdrawal of 30000 to bridge wallet 0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b, Transaction ID: 1e0e0791-ce96-4f0a-86a1-eaa6c844a0de', false, '2025-07-08T00:36:24.272Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (314, 'escrow_creation_initiated', 'Starting escrow creation for custody amount: 30000 MXNB', false, '2025-07-08T00:36:24.292Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (315, 'escrow_created', 'Escrow contract created with ID 6, TX: 0xac418864b7aebb0e17c764c5ff015d6b8bf74e5524e80eb5b554c8895e5f0ccb', false, '2025-07-08T00:37:08.010Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (316, 'escrow_created', 'La custodia ha sido creada y está activa', false, '2025-07-08T00:37:08.027Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (317, 'payment_initiated', 'Web3 payment initiated. Awaiting on-chain creation.', false, '2025-07-09T00:33:03.905Z', 91);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (318, 'payment_failed', 'no matching fragment (operation="fragment", info={ "args": [ "0x82B9e52b26A2954E113F94Ff26647754d5a4247D", 100000000, "0xce1ff3cd93d88d300b4090dc15393b3e4efeb7a2", "w2w-payment" ], "key": "createEscrow" }, code=UNSUPPORTED_OPERATION, version=6.15.0)', false, '2025-07-09T00:33:03.967Z', 91);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (319, 'payment_initiated', 'Web3 payment initiated. Awaiting on-chain creation.', false, '2025-07-09T00:41:04.551Z', 92);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (320, 'payment_failed', 'execution reverted: "Approve tokens first" (action="estimateGas", data="0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000014417070726f766520746f6b656e73206669727374000000000000000000000000", reason="Approve tokens first", transaction={ "data": "0x42eea5cb000000000000000000000000ce1ff3cd93d88d300b4090dc15393b3e4efeb7a20000000000000000000000000000000000000000000000000000000005f5e1000000000000000000000000000000000000000000000000000000000005f5e10000000000000000000000000000000000000000000000000000000000000151800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0xeD766f75738C77179448A5BB98850358801B16e3" }, invocation=null, revert={ "args": [ "Approve tokens first" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-09T00:41:05.119Z', 92);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (321, 'payment_initiated', 'Web3 payment initiated. Awaiting on-chain creation.', false, '2025-07-09T01:00:31.622Z', 93);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (322, 'payment_failed', 'execution reverted: "Approve tokens first" (action="estimateGas", data="0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000014417070726f766520746f6b656e73206669727374000000000000000000000000", reason="Approve tokens first", transaction={ "data": "0x42eea5cb000000000000000000000000ce1ff3cd93d88d300b4090dc15393b3e4efeb7a20000000000000000000000000000000000000000000000000000000005f5e1000000000000000000000000000000000000000000000000000000000005f5e10000000000000000000000000000000000000000000000000000000000000151800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0xeD766f75738C77179448A5BB98850358801B16e3" }, invocation=null, revert={ "args": [ "Approve tokens first" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-09T01:00:32.085Z', 93);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (323, 'payment_initiated', 'Web3 payment initiated via Portal SDK.', false, '2025-07-09T03:55:06.063Z', 94);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (324, 'escrow_created', 'On-chain escrow created via frontend. Tx: undefined', false, '2025-07-09T03:55:06.069Z', 94);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (325, 'escrow_funded', 'Escrow successfully funded and in custody.', false, '2025-07-09T03:55:06.073Z', 94);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (326, 'escrow_funded', 'Tu pago ha sido fondeado en la custodia on-chain exitosamente', false, '2025-07-09T03:55:06.088Z', 94);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (327, 'payment_initiated', 'Web3 payment initiated via Portal SDK.', false, '2025-07-09T04:02:24.602Z', 95);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (328, 'escrow_created', 'On-chain escrow created via frontend. Tx: undefined', false, '2025-07-09T04:02:24.607Z', 95);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (329, 'escrow_funded', 'Escrow successfully funded and in custody.', false, '2025-07-09T04:02:24.610Z', 95);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (330, 'escrow_funded', 'Tu pago ha sido fondeado en la custodia on-chain exitosamente', false, '2025-07-09T04:02:24.624Z', 95);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (331, 'escrow_auto_liberado', 'Custodia liberada on-chain automáticamente al vencer el período.', false, '2025-07-09T22:40:07.368Z', 89);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (332, 'payout_recovered', 'Redención y SPEI recuperados manualmente. Juno Payment ID: c67ea8ed-47a4-4c83-94fe-4e6d8354aa88', false, '2025-07-09T22:53:15.687Z', 89);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (333, 'payout_processing_error', 'Failed to process payout for escrow 75: processSellerRedemption is not defined', false, '2025-07-09T23:38:00.068Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (334, 'payout_processing_error', 'Failed to process payout for escrow 73: processSellerRedemption is not defined', false, '2025-07-09T23:38:00.093Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (335, 'spei_redemption_initiated', 'SPEI redemption of 500 MXN to 002668900881819471. Tx ID: 2fdc7199-eb17-4803-8ae2-c9493e9ec460', false, '2025-07-09T23:40:12.194Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (336, 'payout_completed', 'Payout completed successfully. SPEI sent to recipient.', false, '2025-07-09T23:40:12.217Z', 87);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (337, 'spei_redemption_initiated', 'SPEI redemption of 1000 MXN to 002668900881819471. Tx ID: cf9bd9ba-ac65-4d05-b09b-aa652b6ca84e', false, '2025-07-09T23:40:20.244Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (338, 'payout_completed', 'Payout completed successfully. SPEI sent to recipient.', false, '2025-07-09T23:40:20.261Z', 85);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (339, 'payer_approved', 'Pagador aprobó la liberación', false, '2025-07-11T00:03:41.729Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (340, 'payee_approved', 'Beneficiario aprobó la liberación', false, '2025-07-11T00:07:28.005Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (341, 'onchain_release_success', 'Escrow 6 released from contract.', false, '2025-07-11T00:07:34.360Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (342, 'escrow_release_error', 'Failed to release escrow 78: execution reverted: "Not funded" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a4e6f742066756e64656400000000000000000000000000000000000000000000", reason="Not funded", transaction={ "data": "0x37bdc99b0000000000000000000000000000000000000000000000000000000000000006", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0xEcfd7d23488Fb05834f6dD0390CD2E158a0B5d15" }, invocation=null, revert={ "args": [ "Not funded" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-11T00:20:00.575Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (344, 'payout_error', 'Payout failed: Juno redemption failed: [object Object]', false, '2025-07-11T00:30:09.997Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (345, 'payout_error', 'Payout failed: Juno redemption failed: [object Object]', false, '2025-07-11T00:34:16.247Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (346, 'payout_error', 'Payout failed: Juno redemption failed: [object Object]', false, '2025-07-11T00:36:10.970Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (347, 'payout_error', 'Payout failed: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c900000000000000000000000000000000000000000000065a4da25d3016c00000", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-11T00:38:00.738Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (348, 'payout_error', 'Payout failed: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c900000000000000000000000000000000000000000000065a4da25d3016c00000", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-11T00:40:00.614Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (349, 'payout_error', 'Payout failed: execution reverted: "ERC20: transfer amount exceeds balance" (action="estimateGas", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002645524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e63650000000000000000000000000000000000000000000000000000", reason="ERC20: transfer amount exceeds balance", transaction={ "data": "0xa9059cbb000000000000000000000000b9cbea875dcbb3efd42d36c04cdd6c122ed0c7c900000000000000000000000000000000000000000000065a4da25d3016c00000", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" }, invocation=null, revert={ "args": [ "ERC20: transfer amount exceeds balance" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-11T00:42:00.442Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (350, 'bridge_to_juno_transfer', 'Transferred 30000 MXNB from bridge wallet to Juno wallet. TX: 0x258430bee032f6569b2212945a02bffede44e5a38ff4512452aa95848bb370bf', false, '2025-07-11T00:44:04.975Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (351, 'spei_redemption_initiated', 'SPEI redemption of 30000 MXN to 002668900881819471. Tx ID: 7ab1f6f3-5ea4-462b-878a-c620cd9f5392', false, '2025-07-11T00:44:18.698Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (352, 'payout_completed', 'Payout completed successfully. SPEI sent to recipient.', false, '2025-07-11T00:44:18.718Z', 90);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (353, 'payment_created', 'Pago directo iniciado por rodrigojille6@gmail.com a test-seller@kustodia.mx', false, '2025-07-12T19:38:32.051Z', 104);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (354, 'escrow_created', 'Custodia creada con 1000 MXN por 5 días', false, '2025-07-12T19:38:32.057Z', 104);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (355, 'payment_created', 'Pago directo iniciado por rodrigojille6@gmail.com a test-seller@kustodia.mx', false, '2025-07-12T19:44:50.399Z', 105);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (356, 'payment_created', 'Pago directo iniciado por rodrigojille6@gmail.com a test-seller@kustodia.mx', false, '2025-07-12T21:25:24.610Z', 106);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (357, 'payment_created', 'Pago directo iniciado por rodrigojille6@gmail.com a test-seller@kustodia.mx', false, '2025-07-12T21:29:46.322Z', 107);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (358, 'payment_created', 'Pago directo iniciado por rodrigojille6@gmail.com a test-seller@kustodia.mx', false, '2025-07-12T21:36:42.490Z', 108);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (359, 'payment_created', 'Pago directo iniciado por rodrigojille6@gmail.com a test-seller@kustodia.mx', false, '2025-07-12T21:38:26.623Z', 109);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (360, 'payment_created', 'Pago directo iniciado por rodrigojille6@gmail.com a test-seller@kustodia.mx', false, '2025-07-12T21:51:38.284Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (361, 'deposito_detectado', 'Depósito SPEI detectado con FID: 5002a090cd634246806f5a6530538805', false, '2025-07-12T22:22:00.525Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (362, 'funds_received', 'Los fondos han sido recibidos en la custodia', false, '2025-07-12T22:22:00.568Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (363, 'bridge_withdrawal_initiated', 'Withdrawal of 1000 MXNB to bridge wallet initiated.', true, '2025-07-12T22:22:10.820Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (364, 'escrow_error', 'Escrow creation failed: unsupported addressable value (argument="target", value=null, code=INVALID_ARGUMENT, version=6.15.0)', true, '2025-07-12T22:22:11.106Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (365, 'automation_error', 'Automation failed: unsupported addressable value (argument="target", value=null, code=INVALID_ARGUMENT, version=6.15.0)', false, '2025-07-12T22:22:11.109Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (366, 'automation_error', 'Automation failed: The "key" argument must be of type string or an instance of ArrayBuffer, Buffer, TypedArray, DataView, KeyObject, or CryptoKey. Received undefined', false, '2025-07-12T22:36:17.610Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (367, 'bridge_withdrawal_initiated', 'Withdrawal of 1000 MXNB to bridge wallet initiated.', true, '2025-07-12T22:38:17.080Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (368, 'escrow_error', 'Escrow creation failed: unsupported addressable value (argument="target", value=null, code=INVALID_ARGUMENT, version=6.15.0)', true, '2025-07-12T22:38:17.459Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (369, 'automation_error', 'Automation failed: unsupported addressable value (argument="target", value=null, code=INVALID_ARGUMENT, version=6.15.0)', false, '2025-07-12T22:38:17.466Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (370, 'bridge_withdrawal_initiated', 'Withdrawal of 1000 MXNB to bridge wallet initiated.', true, '2025-07-12T22:39:55.136Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (371, 'escrow_created', 'Escrow 7 created. Tx: 0x59dbca8157b98f82df5d8f6c18c4e9c0d0c9c416a9d461928fcd9b94021fb1ee', true, '2025-07-12T22:40:01.431Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (372, 'escrow_created', 'La custodia ha sido creada y está activa', false, '2025-07-12T22:40:01.450Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (373, 'payment_created', 'Pago directo iniciado por rodrigojille6@gmail.com a test-seller@kustodia.mx', false, '2025-07-12T22:41:49.014Z', 111);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (374, 'deposito_detectado', 'Depósito SPEI detectado con FID: 1e31f30483214316ace68699e30bd662', false, '2025-07-12T22:43:00.413Z', 111);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (375, 'funds_received', 'Los fondos han sido recibidos en la custodia', false, '2025-07-12T22:43:00.443Z', 111);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (376, 'bridge_withdrawal_initiated', 'Withdrawal of 1000 MXNB to bridge wallet initiated.', true, '2025-07-12T22:43:14.215Z', 111);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (377, 'escrow_created', 'Escrow 8 created. Tx: 0x839191f8dfd7d420d71d2f40a777457737e1ca660c8ebbe1cf107bcb0c493375', true, '2025-07-12T22:43:28.272Z', 111);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (378, 'escrow_created', 'La custodia ha sido creada y está activa', false, '2025-07-12T22:43:28.290Z', 111);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (379, 'payment_created', 'Pago directo iniciado por rodrigojille6@gmail.com a test-seller@kustodia.mx', false, '2025-07-12T23:31:38.394Z', 112);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (380, 'deposito_detectado', 'Depósito SPEI detectado con FID: 25cb3a9b0348451a8476425c1c9fb593', false, '2025-07-12T23:35:00.391Z', 112);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (381, 'funds_received', 'Los fondos han sido recibidos en la custodia', false, '2025-07-12T23:35:00.418Z', 112);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (382, 'bridge_withdrawal_initiated', 'Withdrawal of 10000 MXNB to bridge wallet initiated.', true, '2025-07-12T23:35:07.874Z', 112);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (383, 'escrow_error', 'Escrow creation failed: execution reverted: "Invalid deadline" (action="estimateGas", data="0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010496e76616c696420646561646c696e6500000000000000000000000000000000", reason="Invalid deadline", transaction={ "data": "0x488ec89e000000000000000000000000a383c8843ad37b95c3ccef2d2f4ebf0f3b8bbd2b000000000000000000000000a383c8843ad37b95c3ccef2d2f4ebf0f3b8bbd2b00000000000000000000000082b9e52b26a2954e113f94ff26647754d5a4247d00000000000000000000000000000000000000000000000000000002540be400000000000000000000000000000000000000000000000000000000006872f05c000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000000000c696e6d6f62696c69617269610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001237313039363930303030303034313039393500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020466c6f7720313a20506c6174666f726d2d6d616e6167656420637573746f6479", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0xEcfd7d23488Fb05834f6dD0390CD2E158a0B5d15" }, invocation=null, revert={ "args": [ "Invalid deadline" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', true, '2025-07-12T23:35:08.720Z', 112);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (384, 'automation_error', 'Automation failed: execution reverted: "Invalid deadline" (action="estimateGas", data="0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010496e76616c696420646561646c696e6500000000000000000000000000000000", reason="Invalid deadline", transaction={ "data": "0x488ec89e000000000000000000000000a383c8843ad37b95c3ccef2d2f4ebf0f3b8bbd2b000000000000000000000000a383c8843ad37b95c3ccef2d2f4ebf0f3b8bbd2b00000000000000000000000082b9e52b26a2954e113f94ff26647754d5a4247d00000000000000000000000000000000000000000000000000000002540be400000000000000000000000000000000000000000000000000000000006872f05c000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000000000c696e6d6f62696c69617269610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001237313039363930303030303034313039393500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020466c6f7720313a20506c6174666f726d2d6d616e6167656420637573746f6479", "from": "0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b", "to": "0xEcfd7d23488Fb05834f6dD0390CD2E158a0B5d15" }, invocation=null, revert={ "args": [ "Invalid deadline" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.15.0)', false, '2025-07-12T23:35:08.727Z', 112);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (385, 'automation_error', 'Automation failed: Juno withdrawal failed: [object Object]', false, '2025-07-12T23:43:00.297Z', 112);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (386, 'escrow_created', 'Escrow 9 created. Tx: 0x63712a0d731c782349065b689868e5f750858f33782ee78b38932e907ae36e80', true, '2025-07-12T23:45:11.037Z', 112);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (387, 'escrow_created', 'La custodia ha sido creada y está activa', false, '2025-07-12T23:45:11.055Z', 112);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (388, 'payment_created', 'Pago directo iniciado por rodrigojille6@gmail.com a test-seller@kustodia.mx', false, '2025-07-12T23:56:04.159Z', 113);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (389, 'deposito_detectado', 'Depósito SPEI detectado con FID: 7a93aa14fd31496fb574ed3ea6edd63f', false, '2025-07-13T00:05:00.471Z', 113);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (390, 'funds_received', 'Los fondos han sido recibidos en la custodia', false, '2025-07-13T00:05:00.505Z', 113);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (391, 'bridge_withdrawal_success', 'Withdrawal of 1000 MXNB to bridge wallet completed successfully. Withdrawal ID: 6cdbb4d0-b2f0-4432-b653-95cc22918e62', true, '2025-07-13T00:05:09.988Z', 113);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (392, 'escrow_created', 'Escrow 10 created. Tx: 0xbb7970d7149473365bc6ed6f0bfd77b25009f83a96b2ae0482ead6465cd95b43', true, '2025-07-13T00:05:31.923Z', 113);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (393, 'escrow_created', 'La custodia ha sido creada y está activa', false, '2025-07-13T00:05:31.946Z', 113);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (394, 'escrow_released', 'Escrow 97 released automatically. TX: 0x5e526f473fbe83a4df76e6be737a511f3e00acc04884e88232c6647deaed794d', false, '2025-07-13T22:20:06.886Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (395, 'bridge_to_juno_transfer', 'Transferred 1000 MXNB from bridge wallet to Juno wallet. TX: 0xb6dc0f7111cd1d0db2f3a4f994631c86e665a99543a6eabd1193209101c0f159', false, '2025-07-13T22:22:06.519Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (396, 'payout_error', 'Payout failed: Payment 110 has no seller associated', true, '2025-07-13T22:22:11.541Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (397, 'bridge_to_juno_transfer', 'Transferred 1000 MXNB from bridge wallet to Juno wallet. TX: 0x3813faf3b8df7eed6f669fa903bbb865d2567aaa6d45a9f1c34bd88f3b18ea38', false, '2025-07-13T22:24:06.694Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (398, 'payout_error', 'Payout failed: Payment 110 has no seller associated', true, '2025-07-13T22:24:11.722Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (399, 'bridge_to_juno_transfer', 'Transferred 1000 MXNB from bridge wallet to Juno wallet. TX: 0x15a6f31485ec2225a350734c20187ccfbf1a08d44bc4ef8b66e5350c29fed045', false, '2025-07-13T22:26:06.706Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (400, 'payout_error', 'Payout failed: Payment 110 has no seller associated', true, '2025-07-13T22:26:11.726Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (401, 'bridge_to_juno_transfer', 'Transferred 1000 MXNB from bridge wallet to Juno wallet. TX: 0xd15e81412e0097eab1fa594b1be65a72e9fa8d0de31507c35124629213598394', false, '2025-07-13T22:28:06.723Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (402, 'spei_redemption_initiated', 'SPEI redemption of 1000 MXN to 002668900881819471. Tx ID: 4c1cad8a-ede0-4e0d-a809-55dfa05c6a6e', false, '2025-07-13T22:28:17.608Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (403, 'payout_completed', 'Payout completed successfully. SPEI sent to recipient.', false, '2025-07-13T22:28:17.636Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (404, 'payment_released', 'El pago ha sido liberado y transferido', false, '2025-07-13T22:28:17.653Z', 110);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (405, 'escrow_released', 'Escrow 98 released automatically. TX: 0x09e09f062d9e73030d7457d5af0670e0fe5225b63023e187ede5bd9b93509d78', false, '2025-07-13T22:50:07.201Z', 111);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (406, 'bridge_to_juno_transfer', 'Transferred 1000 MXNB from bridge wallet to Juno wallet. TX: 0xcdc268a0b0f5be92de28391101843a22b22094731ab44a5ed91dbf5b3fbfac03', false, '2025-07-13T22:52:06.766Z', 111);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (407, 'spei_redemption_initiated', 'SPEI redemption of 1000 MXN to 002668900881819471. Tx ID: f3f6df33-d181-47a4-a2b8-af09a28688a6', false, '2025-07-13T22:52:18.586Z', 111);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (408, 'payout_completed', 'Payout completed successfully. SPEI sent to recipient.', false, '2025-07-13T22:52:18.606Z', 111);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (409, 'payment_released', 'El pago ha sido liberado y transferido', false, '2025-07-13T22:52:18.618Z', 111);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (410, 'payment_created', 'Pago directo iniciado por rodrigojille6@gmail.com a test-seller@kustodia.mx', false, '2025-07-14T00:01:30.946Z', 114);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (411, 'payment_created', 'Pago directo iniciado por rodrigojille6@gmail.com a test-seller@kustodia.mx', false, '2025-07-14T17:30:28.660Z', 115);
INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (412, 'payment_created', 'Pago directo iniciado por rodrigojille6@gmail.com a test-seller@kustodia.mx', false, '2025-07-14T17:31:17.433Z', 116);

-- Reset payment_event sequence
SELECT setval('payment_event_id_seq', (SELECT MAX(id) FROM payment_event));

-- Verification: Check migrated payment events
SELECT id, type, description, is_automatic, "paymentId" FROM payment_event ORDER BY id LIMIT 20;

-- Count verification
SELECT COUNT(*) as total_payment_events FROM payment_event;
