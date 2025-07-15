-- Complete user data sync - CORRECT column names for production

-- User ID 1: testuser@example.com
UPDATE "user" SET 
  full_name = 'Test User',
  kyc_status = 'approved',
  wallet_address = '0x2844e4b078bb3ef07cc4c251d090ebc32c9e9f05',
  deposit_clabe = '',
  payout_clabe = '002668900881819471',
  password_hash = '$2b$10$eOM1MyOF..9snGWtvzZFKO6YuvlvUyo2Cd0I0bthWMd3WgPfVUjYu',
  email_verified = false,
  email_verification_token = NULL,
  password_reset_token = NULL,
  password_reset_expires = NULL,
  truora_process_id = NULL,
  role = 'user',
  portal_share = NULL,
  juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  portal_client_id = NULL,
  "googleId" = NULL,
  "googleAccessToken" = NULL,
  "googleRefreshToken" = NULL,
  mxnb_balance = 0.000000,
  created_at = '2025-05-01T16:49:25.386Z',
  updated_at = '2025-05-05T23:25:54.254Z'
WHERE id = 1;

-- User ID 2: rodrigojille6@gmail.com (ADMIN ROLE)
UPDATE "user" SET 
  full_name = 'Rodrigo Jimenez',
  kyc_status = 'approved',
  wallet_address = '0x486B88Ca87533294FB45247387169f081f3102ff',
  deposit_clabe = '710969000000351083',
  payout_clabe = '002668900881819471',
  password_hash = '$2b$10$96gDAT/uUHWPK8Ifqab2yefb82yaNeAmAjylXoM55A/DKSNpsrWnC',
  email_verified = true,
  email_verification_token = '81fd6366f57415fb822cdc57e23a93386c3ae9375252c4b7',
  password_reset_token = NULL,
  password_reset_expires = NULL,
  truora_process_id = 'IDP9451eb5b61ddcb3766ae7bc336c5024',
  role = 'admin',
  portal_share = NULL,
  juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  portal_client_id = NULL,
  "googleId" = NULL,
  "googleAccessToken" = NULL,
  "googleRefreshToken" = NULL,
  mxnb_balance = 0.000000,
  created_at = '2025-05-01T18:29:46.209Z',
  updated_at = '2025-07-10T21:47:27.798Z'
WHERE id = 2;

-- User ID 3: test-seller@kustodia.mx
UPDATE "user" SET 
  full_name = 'Test Seller',
  kyc_status = 'approved',
  wallet_address = '0xce1ff3cd93d88d300b4090dc15393b3e4efeb7a2',
  deposit_clabe = '710969000000351106',
  payout_clabe = '002668900881819471',
  password_hash = '$2b$10$9CXO2kDWV5zX5Y6YulGqSevsv155RhcxjUkCr3/w.YUtKxsn7qrlC',
  email_verified = true,
  email_verification_token = '81fd6366f57415fb822cdc57e23a93386c3ae9375252c4b7',
  password_reset_token = NULL,
  password_reset_expires = NULL,
  truora_process_id = 'IDP9451eb5b61ddcb3766ae7bc336c5024',
  role = 'user',
  portal_share = NULL,
  juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  portal_client_id = NULL,
  "googleId" = NULL,
  "googleAccessToken" = NULL,
  "googleRefreshToken" = NULL,
  mxnb_balance = 0.000000,
  created_at = '2025-05-02T00:33:47.366Z',
  updated_at = '2025-05-06T22:14:02.370Z'
WHERE id = 3;

-- User ID 4: rodrigo.jimenez@crehana.com
UPDATE "user" SET 
  full_name = 'Rodrigo Jimenez',
  kyc_status = 'pending',
  wallet_address = '0x2ecaf2bc0e7bb2f9ad4a7303c58be19c16c7e00b',
  deposit_clabe = '',
  payout_clabe = '002668900881819471',
  password_hash = '$2b$10$yDYFR1bOgN0dXyRi1J76SODUKQqSUEqvgnExVPIrLnIJ5ilnBqC5.',
  email_verified = true,
  email_verification_token = '240ce93d23dc4a1a03f94e3228a2d6b1682e2fc0ea520a65',
  password_reset_token = NULL,
  password_reset_expires = NULL,
  truora_process_id = NULL,
  role = 'user',
  portal_share = NULL,
  juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf',
  portal_client_id = NULL,
  "googleId" = NULL,
  "googleAccessToken" = NULL,
  "googleRefreshToken" = NULL,
  mxnb_balance = 0.000000,
  created_at = '2025-05-05T22:48:52.485Z',
  updated_at = '2025-05-06T01:59:25.731Z'
WHERE id = 4;

-- Verify the updates
SELECT id, email, role, email_verified, truora_process_id, kyc_status FROM "user" ORDER BY id;
