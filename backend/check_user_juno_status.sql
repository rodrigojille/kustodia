-- Check current user's Juno bank account status
SELECT 
    id,
    email,
    full_name,
    payout_clabe,
    juno_bank_account_id,
    role,
    created_at
FROM "user" 
WHERE email = 'rodrigojille6@gmail.com';

-- Check if there are any users with juno_bank_account_id
SELECT 
    COUNT(*) as users_with_juno_id,
    COUNT(CASE WHEN juno_bank_account_id IS NOT NULL THEN 1 END) as users_with_juno_bank_account
FROM "user";

-- Check recent payment that might need Juno bank account
SELECT 
    p.id,
    p.payer_email,
    p.recipient_email,
    p.payout_clabe,
    p.payout_juno_bank_account_id,
    p.status,
    u.juno_bank_account_id as user_juno_id
FROM payment p
LEFT JOIN "user" u ON u.email = p.recipient_email
WHERE p.id = 90;
