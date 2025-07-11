-- Fix remaining missing columns in database schema

-- Add missing columns to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS portal_client_id VARCHAR(255);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS portal_share TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS googleId VARCHAR(255);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS googleAccessToken TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS googleRefreshToken TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS mxnb_balance DECIMAL(18,6) DEFAULT 0;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS deposit_clabe VARCHAR(18);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS payout_clabe VARCHAR(18);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS juno_bank_account_id VARCHAR(36);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS truora_process_id VARCHAR(255);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add missing columns to notification table
ALTER TABLE notification ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE notification ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE notification ADD COLUMN IF NOT EXISTS "read" BOOLEAN DEFAULT false;
ALTER TABLE notification ADD COLUMN IF NOT EXISTS payment_id INTEGER;
ALTER TABLE notification ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add foreign key for payment_id in notification table
ALTER TABLE notification ADD CONSTRAINT fk_notification_payment 
FOREIGN KEY (payment_id) REFERENCES payment(id) ON DELETE CASCADE;

-- Verify the changes
SELECT 'User table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user' 
AND column_name IN ('portal_client_id', 'portal_share', 'role', 'mxnb_balance');

SELECT 'Notification table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notification' 
AND column_name IN ('type', 'category', 'read', 'createdAt');
