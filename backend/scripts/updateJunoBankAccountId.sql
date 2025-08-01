-- Update juno_bank_account_id for rodrigo@kustodia.mx 
-- This CLABE should already be registered in Juno, we need the actual bank account ID
-- For now, let's check the current state and then update with the correct ID

-- Check current state
SELECT id, email, full_name, payout_clabe, juno_bank_account_id 
FROM "user" 
WHERE email = 'rodrigo@kustodia.mx';

-- Update with the correct Juno bank account ID (replace with actual ID from Juno API)
-- UPDATE "user" 
-- SET juno_bank_account_id = 'ACTUAL_BANK_ACCOUNT_ID_FROM_JUNO'
-- WHERE email = 'rodrigo@kustodia.mx';
