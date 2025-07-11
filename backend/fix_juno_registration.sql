-- Fix missing Juno bank account IDs for existing users
-- This will show users who have payout_clabe but missing juno_bank_account_id

SELECT 
    id,
    email,
    full_name,
    payout_clabe,
    juno_bank_account_id,
    CASE 
        WHEN payout_clabe IS NOT NULL AND juno_bank_account_id IS NULL THEN 'NEEDS_JUNO_REGISTRATION'
        WHEN payout_clabe IS NOT NULL AND juno_bank_account_id IS NOT NULL THEN 'ALREADY_REGISTERED'
        ELSE 'NO_CLABE'
    END as registration_status
FROM "user" 
WHERE payout_clabe IS NOT NULL
ORDER BY id;
