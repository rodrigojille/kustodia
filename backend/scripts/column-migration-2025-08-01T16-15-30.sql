-- 🔧 COLUMN MIGRATION SCRIPT FOR HEROKU
-- Generated: 2025-08-01T16:15:30.086Z
-- Execute these commands on Heroku Postgres to add missing columns

-- ⚠️  BACKUP FIRST: heroku pg:backups:capture --app your-app-name

-- ===== MISSING COLUMN ADDITIONS =====

ALTER TABLE user ADD COLUMN IF NOT EXISTS googleid VARCHAR(255);
ALTER TABLE user ADD COLUMN IF NOT EXISTS googleaccesstoken TEXT;
ALTER TABLE user ADD COLUMN IF NOT EXISTS googlerefreshtoken TEXT;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS transaction_category VARCHAR(50);
ALTER TABLE payment ADD COLUMN IF NOT EXISTS broker_email VARCHAR(255);
ALTER TABLE payment ADD COLUMN IF NOT EXISTS seller_email VARCHAR(255);
ALTER TABLE payment ADD COLUMN IF NOT EXISTS total_commission_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS total_commission_amount DECIMAL(15,2) DEFAULT 0;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS net_amount DECIMAL(15,2);
ALTER TABLE payment ADD COLUMN IF NOT EXISTS custody_percent DECIMAL(5,2) DEFAULT 100;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS custody_period INTEGER DEFAULT 30;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS routing_decision VARCHAR(20) DEFAULT '''bridge''::character varying';
ALTER TABLE payment ADD COLUMN IF NOT EXISTS routing_reason VARCHAR(100);
ALTER TABLE notification ADD COLUMN IF NOT EXISTS userId INTEGER;

-- ===== VERIFICATION QUERIES =====
-- Run these after migration to verify columns were added:


-- Check user columns
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user' 
ORDER BY ordinal_position;

-- Check payment columns
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'payment' 
ORDER BY ordinal_position;

-- Check notification columns
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notification' 
ORDER BY ordinal_position;

-- ===== ROLLBACK PLAN (if needed) =====
-- Uncomment and run these ONLY if you need to rollback:

-- ALTER TABLE user DROP COLUMN IF EXISTS googleid;
-- ALTER TABLE user DROP COLUMN IF EXISTS googleaccesstoken;
-- ALTER TABLE user DROP COLUMN IF EXISTS googlerefreshtoken;
-- ALTER TABLE payment DROP COLUMN IF EXISTS transaction_category;
-- ALTER TABLE payment DROP COLUMN IF EXISTS broker_email;
-- ALTER TABLE payment DROP COLUMN IF EXISTS seller_email;
-- ALTER TABLE payment DROP COLUMN IF EXISTS total_commission_percentage;
-- ALTER TABLE payment DROP COLUMN IF EXISTS total_commission_amount;
-- ALTER TABLE payment DROP COLUMN IF EXISTS net_amount;
-- ALTER TABLE payment DROP COLUMN IF EXISTS custody_percent;
-- ALTER TABLE payment DROP COLUMN IF EXISTS custody_period;
-- ALTER TABLE payment DROP COLUMN IF EXISTS routing_decision;
-- ALTER TABLE payment DROP COLUMN IF EXISTS routing_reason;
-- ALTER TABLE notification DROP COLUMN IF EXISTS userId;