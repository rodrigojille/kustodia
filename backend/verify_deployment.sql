-- Verify deployment readiness
SELECT 'JUNO BANK ACCOUNT IDs' as check_type, COUNT(*) as count FROM "user" WHERE juno_bank_account_id IS NOT NULL;
SELECT 'ADMIN USERS' as check_type, COUNT(*) as count FROM "user" WHERE role = 'admin';
SELECT 'USERS WITH CLABE' as check_type, COUNT(*) as count FROM "user" WHERE payout_clabe IS NOT NULL;
