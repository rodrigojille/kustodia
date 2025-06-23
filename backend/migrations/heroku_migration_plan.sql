-- HEROKU POSTGRES MIGRATION PLAN
-- New columns added to User entity that need production migration
-- Execute these commands via Heroku CLI or pgAdmin

-- ===== MIGRATION: Add new User columns =====
-- Safe to run - all columns are nullable or have defaults

-- 1. Add portal_share column (Portal SDK wallet recovery)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS portal_share VARCHAR(128);

-- 2. Add role column with default (user role management)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- 3. Add juno_bank_account_id column (Juno integration)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS juno_bank_account_id VARCHAR(64);

-- ===== VERIFICATION QUERIES =====
-- Run these to verify the migration worked:

-- Check new columns exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('portal_share', 'role', 'juno_bank_account_id')
ORDER BY column_name;

-- Check existing users got default role
SELECT id, email, role 
FROM users 
LIMIT 5;

-- ===== ROLLBACK PLAN (if needed) =====
-- Only use if something goes wrong:

-- ALTER TABLE users DROP COLUMN IF EXISTS portal_share;
-- ALTER TABLE users DROP COLUMN IF EXISTS role;
-- ALTER TABLE users DROP COLUMN IF EXISTS juno_bank_account_id;
