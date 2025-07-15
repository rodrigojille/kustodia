-- Phase 1: Insert payments without escrow_id references
TRUNCATE TABLE payment RESTART IDENTITY CASCADE;

INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (1, 3, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'paid', 'traditional', NULL, '2025-05-02T00:33:47.379Z', '2025-05-23T01:53:47.555Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (2, 3, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'paid', 'traditional', NULL, '2025-05-02T01:27:29.357Z', '2025-05-23T01:53:47.567Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (3, 3, 3, NULL, NULL, 'test-seller@kustodia.mx', 100.00, 'MXN', 'paid', 'traditional', NULL, '2025-05-02T01:31:27.668Z', '2025-05-23T01:53:47.577Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (4, 1, 3, NULL, NULL, 'test-seller@kustodia.mx', 101.00, 'MXN', 'paid', 'traditional', NULL, '2025-05-03T00:45:14.002Z', '2025-05-23T01:53:47.588Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (5, 1, 3, NULL, NULL, 'test-seller@kustodia.mx', 101.00, 'mxn', 'paid', 'traditional', NULL, '2025-05-03T01:34:42.596Z', '2025-05-03T01:55:54.163Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (6, 1, 3, NULL, NULL, 'test-seller@kustodia.mx', 100.00, 'MXN', 'failed', 'traditional', NULL, '2025-05-03T23:09:04.899Z', '2025-07-04T22:25:54.198Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (7, 1, 3, NULL, NULL, 'test-seller@kustodia.mx', 100.00, 'MXN', 'failed', 'traditional', NULL, '2025-05-03T23:15:05.660Z', '2025-07-04T22:25:54.191Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (8, 1, 3, NULL, NULL, 'test-seller@kustodia.mx', 105.00, 'MXN', 'paid', 'traditional', NULL, '2025-05-03T23:16:28.048Z', '2025-05-23T01:53:47.597Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (9, 1, 3, NULL, NULL, 'test-seller@kustodia.mx', 105.00, 'MXN', 'paid', 'traditional', NULL, '2025-05-03T23:16:35.179Z', '2025-05-23T01:53:47.606Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (10, 1, 3, NULL, NULL, 'test-seller@kustodia.mx', 105.00, 'MXN', 'failed', 'traditional', NULL, '2025-05-03T23:16:35.698Z', '2025-07-04T22:25:54.186Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (11, 1, 3, NULL, NULL, 'test-seller@kustodia.mx', 105.00, 'MXN', 'failed', 'traditional', NULL, '2025-05-03T23:16:36.291Z', '2025-07-04T22:25:54.179Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (12, 1, 3, NULL, NULL, 'test-seller@kustodia.mx', 105.00, 'MXN', 'failed', 'traditional', NULL, '2025-05-03T23:16:36.793Z', '2025-07-04T22:25:54.171Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (13, 1, 3, NULL, NULL, 'test-seller@kustodia.mx', 105.00, 'MXN', 'paid', 'traditional', NULL, '2025-05-03T23:29:55.184Z', '2025-05-04T01:44:22.930Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (14, 2, NULL, NULL, NULL, 'test-seller@example.com', 110.00, 'MXN', 'cancelled', 'traditional', NULL, '2025-05-05T21:17:44.162Z', '2025-05-05T22:31:32.928Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (15, 1, 3, NULL, NULL, 'test-seller@kustodia.mx', 105.00, 'MXN', 'failed', 'traditional', NULL, '2025-05-05T22:37:37.679Z', '2025-07-04T22:25:54.018Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (16, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 105.00, 'MXN', 'failed', 'traditional', NULL, '2025-05-06T02:41:16.002Z', '2025-07-04T22:25:54.039Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (17, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1500.00, 'MXN', 'failed', 'traditional', NULL, '2025-05-06T19:08:33.130Z', '2025-07-04T22:25:54.049Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (18, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 105.00, 'MXN', 'cancelled', 'traditional', NULL, '2025-05-06T22:15:34.839Z', '2025-05-07T00:29:31.011Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (19, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 105.00, 'MXN', 'cancelled', 'traditional', NULL, '2025-05-06T22:42:08.998Z', '2025-05-23T01:53:47.635Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (20, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'withdrawn', 'traditional', '{"purpose":"Escrow payment test","originator":{"name":"John Doe","address":"123 Main St, Mexico City","country":"MX","id_number":"A12345678"},"beneficiary":{"name":"Jane Seller","address":"456 Seller Ave, Mexico City","country":"MX","id_number":"B98765432"},"compliance_id":"dummy-travel-rule-001"}'::jsonb, '2025-05-09T01:12:05.593Z', '2025-07-04T22:27:00.049Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (21, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1500.00, 'MXN', 'withdrawn', 'traditional', NULL, '2025-05-10T04:38:00.190Z', '2025-07-04T22:27:00.069Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (22, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'withdrawn', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-10T22:35:13.810Z', '2025-07-04T22:27:00.077Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (23, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'withdrawn', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-10T22:35:29.089Z', '2025-07-04T22:27:00.085Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (24, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-10T22:39:01.913Z', '2025-06-23T15:18:49.170Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (25, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-10T22:39:54.587Z', '2025-06-25T18:19:36.169Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (26, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-10T22:43:05.390Z', '2025-05-23T01:53:47.616Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (27, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-10T22:47:16.142Z', '2025-05-23T01:53:47.652Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (28, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-10T22:49:14.680Z', '2025-05-23T01:53:47.670Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (29, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-10T22:57:18.614Z', '2025-05-23T01:53:47.662Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (30, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-10T23:00:28.155Z', '2025-05-23T01:53:47.678Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (31, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-10T23:03:10.514Z', '2025-05-23T01:53:47.687Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (32, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-11T04:41:31.477Z', '2025-05-23T01:53:47.694Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (33, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-21T18:44:32.693Z', '2025-05-21T18:44:46.093Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (34, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-21T19:52:23.927Z', '2025-05-21T19:52:26.329Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (35, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-21T19:53:36.121Z', '2025-05-21T19:53:38.681Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (36, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-21T20:06:08.306Z', '2025-05-21T20:06:11.699Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (37, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T01:39:26.642Z', '2025-05-23T01:53:47.704Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (38, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T01:57:56.538Z', '2025-05-23T02:04:00.817Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (39, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T02:03:48.358Z', '2025-05-23T02:04:00.830Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (40, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T02:39:57.002Z', '2025-05-23T03:54:30.177Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (41, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:27:29.982Z', '2025-05-23T03:54:30.193Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (42, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:33:31.511Z', '2025-05-23T03:54:30.221Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (43, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:36:44.816Z', '2025-05-23T03:54:30.235Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (44, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:37:38.586Z', '2025-05-23T03:54:30.144Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (45, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:39:10.076Z', '2025-05-23T03:54:30.207Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (46, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:40:28.801Z', '2025-05-23T03:54:30.249Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (47, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:41:19.987Z', '2025-05-23T03:54:30.266Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (48, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:42:12.236Z', '2025-05-23T03:54:30.278Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (49, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:50:57.563Z', '2025-05-23T03:54:30.161Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (50, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:52:58.229Z', '2025-05-23T03:54:30.290Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (51, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'paid', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:53:14.621Z', '2025-05-23T03:53:15.212Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (52, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:54:18.093Z', '2025-05-23T03:57:17.989Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (53, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'paid', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:54:30.364Z', '2025-05-23T03:54:31.088Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (54, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:57:04.538Z', '2025-05-23T03:57:17.968Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (55, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'paid', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:57:18.064Z', '2025-05-23T03:57:18.863Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (56, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:57:24.583Z', '2025-05-23T03:57:36.636Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (57, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'paid', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T03:57:36.709Z', '2025-05-23T03:57:37.789Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (58, 3, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'mxn', 'cancelled', 'traditional', '{"sender":"Test Buyer","receiver":"Test Seller"}'::jsonb, '2025-05-23T12:07:39.025Z', '2025-05-23T12:10:25.865Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (59, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1500.00, 'MXN', 'withdrawn', 'traditional', NULL, '2025-05-25T21:53:04.026Z', '2025-07-04T22:27:00.093Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (60, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 2000.00, 'MXN', 'cancelled', 'traditional', NULL, '2025-05-25T23:18:22.400Z', '2025-06-23T15:49:18.041Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (61, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 2000.00, 'MXN', 'cancelled', 'traditional', NULL, '2025-05-25T23:28:00.702Z', '2025-06-23T15:49:18.049Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (62, NULL, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 10000.00, 'MXN', 'requested', 'traditional', NULL, '2025-06-03T19:55:21.866Z', '2025-06-03T19:55:21.866Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (63, NULL, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'MXN', 'requested', 'traditional', NULL, '2025-06-03T20:15:46.975Z', '2025-06-03T20:15:46.975Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (64, NULL, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'MXN', 'requested', 'traditional', NULL, '2025-06-03T20:23:35.373Z', '2025-06-03T20:23:35.373Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (65, NULL, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 10000.00, 'MXN', 'requested', 'traditional', NULL, '2025-06-03T20:25:18.819Z', '2025-06-03T20:25:18.819Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (66, NULL, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'MXN', 'requested', 'traditional', NULL, '2025-06-03T20:29:40.208Z', '2025-06-03T20:29:40.208Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (67, NULL, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 1000.00, 'MXN', 'requested', 'traditional', NULL, '2025-06-03T20:37:02.117Z', '2025-06-03T20:37:02.117Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (68, NULL, NULL, NULL, NULL, 'rodrigojille6@gmail.com', 15000.00, 'MXN', 'requested', 'traditional', NULL, '2025-06-03T20:58:03.240Z', '2025-06-03T20:58:03.240Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (69, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'withdrawn', 'traditional', NULL, '2025-06-07T14:54:51.224Z', '2025-07-04T22:27:00.102Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (70, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 2000.00, 'MXN', 'cancelled', 'traditional', NULL, '2025-06-07T17:05:54.201Z', '2025-06-25T15:56:29.752Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (71, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 2000.00, 'MXN', 'completed', 'traditional', NULL, '2025-06-07T17:35:55.064Z', '2025-06-24T23:22:21.461Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (72, 3, 3, NULL, NULL, 'test-seller@kustodia.mx', 10000.00, 'MXN', 'withdrawn', 'traditional', NULL, '2025-06-12T00:20:08.068Z', '2025-07-04T22:27:00.110Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (73, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 5000.00, 'MXN', 'completed', 'traditional', NULL, '2025-06-12T00:22:37.009Z', '2025-06-24T23:53:27.191Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (74, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'withdrawn', 'traditional', NULL, '2025-06-14T01:52:40.373Z', '2025-07-04T22:27:00.119Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (75, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'withdrawn', 'traditional', NULL, '2025-06-14T02:01:48.721Z', '2025-07-04T22:27:00.126Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (76, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 500.00, 'MXNB', 'failed', 'traditional', NULL, '2025-06-16T23:38:23.235Z', '2025-07-04T22:25:54.165Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (77, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 500.00, 'MXNB', 'failed', 'traditional', NULL, '2025-06-16T23:46:51.252Z', '2025-07-04T22:25:54.158Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (78, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 500.00, 'MXNB', 'failed', 'traditional', NULL, '2025-06-16T23:50:54.500Z', '2025-07-04T22:25:54.151Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (79, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 500.00, 'MXNB', 'failed', 'traditional', NULL, '2025-06-17T00:02:12.044Z', '2025-07-04T22:25:54.144Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (80, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXNB', 'failed', 'traditional', NULL, '2025-06-17T00:16:14.692Z', '2025-07-04T22:25:54.137Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (81, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 2000.00, 'MXN', 'cancelled', 'traditional', NULL, '2025-06-17T19:44:49.349Z', '2025-06-25T18:19:36.148Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (82, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'withdrawn', 'traditional', '{"sender":"Test","receiver":"Test"}'::jsonb, '2025-06-17T21:42:46.314Z', '2025-07-04T22:27:00.134Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (83, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'completed', 'traditional', NULL, '2025-06-23T03:10:21.093Z', '2025-06-26T20:22:26.899Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (84, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 5000.00, 'MXN', 'cancelled', 'nuevo_flujo', NULL, '2025-06-24T23:02:43.748Z', '2025-07-02T21:54:49.055Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (85, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'completed', 'traditional', NULL, '2025-07-04T00:58:38.958Z', '2025-07-09T23:40:20.252Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (86, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'cancelled', 'traditional', NULL, '2025-07-04T16:02:00.405Z', '2025-07-04T16:02:00.442Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (87, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'completed', 'traditional', NULL, '2025-07-04T16:59:45.498Z', '2025-07-09T23:40:12.206Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (88, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'completed', 'traditional', NULL, '2025-07-04T22:50:25.018Z', '2025-07-07T20:56:50.237Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (89, 2, NULL, NULL, NULL, 'test-seller@kustodia.mx', 5000.00, 'MXN', 'completed', 'traditional', NULL, '2025-07-07T22:24:48.044Z', '2025-07-09T22:53:15.682Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (90, 2, NULL, NULL, NULL, 'test-seller@kustodia.mx', 30000.00, 'MXN', 'completed', 'nuevo_flujo', NULL, '2025-07-08T00:11:46.884Z', '2025-07-11T00:44:18.706Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (91, 2, NULL, NULL, NULL, 'test-seller@kustodia.mx', 100.00, 'MXNB', 'failed', 'web3', NULL, '2025-07-09T00:33:03.896Z', '2025-07-09T00:33:03.963Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (92, 2, NULL, NULL, NULL, 'test-seller@kustodia.mx', 100.00, 'MXNB', 'failed', 'web3', NULL, '2025-07-09T00:41:04.543Z', '2025-07-09T00:41:05.117Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (93, 2, NULL, NULL, NULL, 'test-seller@kustodia.mx', 100.00, 'MXNB', 'failed', 'web3', NULL, '2025-07-09T01:00:31.613Z', '2025-07-09T01:00:32.079Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (94, 2, NULL, NULL, NULL, 'test-seller@kustodia.mx', 100.00, 'MXNB', 'in_custody', 'web3', NULL, '2025-07-09T03:55:06.054Z', '2025-07-09T03:55:06.054Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (95, 2, NULL, NULL, NULL, 'test-seller@kustodia.mx', 100.00, 'MXNB', 'in_custody', 'web3', NULL, '2025-07-09T04:02:24.595Z', '2025-07-09T04:02:24.595Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (104, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'pending', 'traditional', NULL, '2025-07-12T19:38:32.026Z', '2025-07-12T19:38:32.026Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (105, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'pending', 'traditional', NULL, '2025-07-12T19:44:50.365Z', '2025-07-12T19:44:50.385Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (106, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'pending', 'traditional', NULL, '2025-07-12T21:25:24.572Z', '2025-07-12T21:25:24.597Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (107, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'pending', 'traditional', NULL, '2025-07-12T21:29:46.286Z', '2025-07-12T21:29:46.309Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (108, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 100.00, 'MXN', 'pending', 'traditional', NULL, '2025-07-12T21:36:42.449Z', '2025-07-12T21:36:42.485Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (109, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 100.00, 'MXN', 'pending', 'traditional', NULL, '2025-07-12T21:38:26.571Z', '2025-07-12T21:38:26.617Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (110, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'completed', 'traditional', NULL, '2025-07-12T21:51:38.243Z', '2025-07-13T22:28:17.622Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (111, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'completed', 'traditional', NULL, '2025-07-12T22:41:48.966Z', '2025-07-13T22:52:18.596Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (112, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 10000.00, 'MXN', 'escrowed', 'nuevo_flujo', NULL, '2025-07-12T23:31:38.349Z', '2025-07-12T23:45:11.034Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (113, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'escrowed', 'nuevo_flujo', NULL, '2025-07-12T23:56:04.126Z', '2025-07-13T00:05:31.919Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (114, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'pending', 'traditional', NULL, '2025-07-14T00:01:30.786Z', '2025-07-14T00:01:30.942Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (115, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'pending', 'traditional', NULL, '2025-07-14T17:30:28.602Z', '2025-07-14T17:30:28.656Z');
INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (116, 2, 3, NULL, NULL, 'test-seller@kustodia.mx', 1000.00, 'MXN', 'pending', 'nuevo_flujo', NULL, '2025-07-14T17:31:17.391Z', '2025-07-14T17:31:17.429Z');

-- Reset payment sequence
SELECT setval('payment_id_seq', (SELECT MAX(id) FROM payment));

-- Verify migration
SELECT id, user_id, seller_id, recipient_email, amount, currency, status, payment_type FROM payment ORDER BY id LIMIT 20;
