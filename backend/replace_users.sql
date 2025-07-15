-- Step 1: Clear user table completely
DELETE FROM "user";

-- Step 2: Reset user ID sequence
ALTER SEQUENCE user_id_seq RESTART WITH 1;

-- Step 3: Insert all local users with correct IDs (using snake_case for production)
-- User ID 1: testuser@example.com
INSERT INTO "user" (id, email, full_name, kyc_status, wallet_address, deposit_clabe, payout_clabe, password_hash, created_at, updated_at)
VALUES (1, 'testuser@example.com', 'Test User', 'approved', '0x2844e4b078bb3ef07cc4c251d090ebc32c9e9f05', '', '002668900881819471', '$2b$10$eOM1MyOF..9snGWtvzZFKO6YuvlvUyo2Cd0I0bthWMd3WgPfVUjYu', '2025-07-14T23:40:32.416Z', '2025-07-14T23:40:32.416Z');

-- User ID 2: rodrigojille6@gmail.com
INSERT INTO "user" (id, email, full_name, kyc_status, wallet_address, deposit_clabe, payout_clabe, password_hash, created_at, updated_at)
VALUES (2, 'rodrigojille6@gmail.com', 'Rodrigo Jimenez', 'approved', '0x486B88Ca87533294FB45247387169f081f3102ff', '710969000000351083', '002668900881819471', '$2b$10$96gDAT/uUHWPK8Ifqab2yefb82yaNeAmAjylXoM55A/DKSNpsrWnC', '2025-07-14T23:40:32.416Z', '2025-07-14T23:40:32.416Z');

-- User ID 3: test-seller@kustodia.mx
INSERT INTO "user" (id, email, full_name, kyc_status, wallet_address, deposit_clabe, payout_clabe, password_hash, created_at, updated_at)
VALUES (3, 'test-seller@kustodia.mx', 'Test Seller', 'approved', '0xce1ff3cd93d88d300b4090dc15393b3e4efeb7a2', '710969000000351106', '002668900881819471', '$2b$10$9CXO2kDWV5zX5Y6YulGqSevsv155RhcxjUkCr3/w.YUtKxsn7qrlC', '2025-07-14T23:40:32.417Z', '2025-07-14T23:40:32.417Z');

-- User ID 4: rodrigo.jimenez@crehana.com
INSERT INTO "user" (id, email, full_name, kyc_status, wallet_address, deposit_clabe, payout_clabe, password_hash, created_at, updated_at)
VALUES (4, 'rodrigo.jimenez@crehana.com', 'Rodrigo Jimenez', 'pending', '0x2ecaf2bc0e7bb2f9ad4a7303c58be19c16c7e00b', '', '002668900881819471', '$2b$10$yDYFR1bOgN0dXyRi1J76SODUKQqSUEqvgnExVPIrLnIJ5ilnBqC5.', '2025-07-14T23:40:32.417Z', '2025-07-14T23:40:32.417Z');

-- Step 4: Update sequence to continue from correct number
SELECT setval('user_id_seq', 4);

-- Step 5: Verify the migration
SELECT id, email, full_name FROM "user" ORDER BY id;
