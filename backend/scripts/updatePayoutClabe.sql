-- Update payout_clabe for rodrigo@kustodia.mx to use the registered CLABE
UPDATE "user" 
SET payout_clabe = '710969000000351083'
WHERE email = 'rodrigo@kustodia.mx';

-- Verify the update
SELECT id, email, full_name, payout_clabe, juno_bank_account_id 
FROM "user" 
WHERE email = 'rodrigo@kustodia.mx';
