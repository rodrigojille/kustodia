-- CRITICAL PRODUCTION FIX - Update Juno Bank Account IDs
-- Fix Payment 121 payout failure

-- Update rodrigo@kustodia.mx with correct Juno bank account ID
UPDATE "user" SET juno_bank_account_id = 'e782bf90-75bb-455e-8c09-a8d2013dcfac' WHERE email = 'rodrigo@kustodia.mx';

-- Verify both updates
SELECT email, juno_bank_account_id, payout_clabe FROM "user" WHERE email IN ('rodrigojille6@gmail.com', 'rodrigo@kustodia.mx') ORDER BY email;

-- Check Payment 121 seller details
SELECT p.id, u.email, u.juno_bank_account_id, u.payout_clabe FROM payment p JOIN "user" u ON p.seller_id = u.id WHERE p.id = 121;
