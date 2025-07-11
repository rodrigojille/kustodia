-- Fix missing columns in database schema

-- Add missing columns to payment table
ALTER TABLE payment ADD COLUMN IF NOT EXISTS payout_juno_bank_account_id VARCHAR(36);
ALTER TABLE payment ADD COLUMN IF NOT EXISTS commission_beneficiary_juno_bank_account_id VARCHAR(36);

-- Add missing columns to notification table  
ALTER TABLE notification ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE notification ADD FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payment' 
AND column_name IN ('payout_juno_bank_account_id', 'commission_beneficiary_juno_bank_account_id');

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notification' 
AND column_name = 'user_id';
