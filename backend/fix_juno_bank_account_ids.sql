-- Fix missing Juno bank account IDs
-- Based on the Juno interface screenshot, we can see the CLABE 002668900881819471 is registered

-- First, let's see what we have
SELECT 
    id, email, full_name, payout_clabe, juno_bank_account_id,
    CASE 
        WHEN payout_clabe IS NOT NULL AND juno_bank_account_id IS NULL THEN 'NEEDS_FIX'
        WHEN payout_clabe IS NOT NULL AND juno_bank_account_id IS NOT NULL THEN 'ALREADY_FIXED'
        ELSE 'NO_CLABE'
    END as status
FROM "user" 
WHERE payout_clabe IS NOT NULL
ORDER BY id;

-- From the Juno interface, we can see the bank account details
-- We need to get the actual Juno bank account ID from the API or interface
-- For now, let's prepare the update statement

-- STEP 1: Check which users need the fix
\echo 'Users needing Juno bank account ID fix:'
SELECT id, email, payout_clabe FROM "user" WHERE payout_clabe = '002668900881819471' AND juno_bank_account_id IS NULL;

-- STEP 2: Once we have the Juno bank account ID from the API, we can update
-- UPDATE "user" SET juno_bank_account_id = 'JUNO_BANK_ACCOUNT_ID_HERE' WHERE payout_clabe = '002668900881819471';

\echo 'Ready to update once we have the Juno bank account ID from the API';
