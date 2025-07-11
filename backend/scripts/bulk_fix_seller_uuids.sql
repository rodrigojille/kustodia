-- BULK FIX: Copy seller UUIDs to legacy payments
-- Based on validation results from validate_seller_uuid_mappings.js

-- Fix test-seller@kustodia.mx payments (has UUID: f14bdec6-45ba-4e55-8c42-599df650c8cf)
UPDATE payments 
SET payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf' 
WHERE recipient_email = 'test-seller@kustodia.mx' 
  AND payout_juno_bank_account_id IS NULL;

-- NOTE: rodrigojille6@gmail.com has NULL UUID - needs CLABE registration first
-- UPDATE payments 
-- SET payout_juno_bank_account_id = (SELECT juno_bank_account_id FROM users WHERE email = 'rodrigojille6@gmail.com') 
-- WHERE recipient_email = 'rodrigojille6@gmail.com' 
--   AND payout_juno_bank_account_id IS NULL
--   AND (SELECT juno_bank_account_id FROM users WHERE email = 'rodrigojille6@gmail.com') IS NOT NULL;

-- Verification query - check results
SELECT 
  recipient_email,
  COUNT(*) as total_payments,
  SUM(CASE WHEN payout_juno_bank_account_id IS NOT NULL THEN 1 ELSE 0 END) as with_uuid,
  SUM(CASE WHEN payout_juno_bank_account_id IS NULL THEN 1 ELSE 0 END) as missing_uuid
FROM payments 
WHERE recipient_email IN ('test-seller@kustodia.mx', 'rodrigojille6@gmail.com')
GROUP BY recipient_email;

-- Check specific status distribution
SELECT 
  recipient_email,
  status,
  COUNT(*) as count,
  SUM(CASE WHEN payout_juno_bank_account_id IS NOT NULL THEN 1 ELSE 0 END) as fixed
FROM payments 
WHERE recipient_email IN ('test-seller@kustodia.mx', 'rodrigojille6@gmail.com')
GROUP BY recipient_email, status
ORDER BY recipient_email, status;
