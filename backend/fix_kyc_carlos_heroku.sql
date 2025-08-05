-- 🚨 HEROKU PRODUCTION KYC FIX for carlosaguerof@gmail.com
-- Issue: Truora approved KYC but database not updated due to webhook failure

-- Check current status first
SELECT 'BEFORE UPDATE - Current KYC Status:' as status;
SELECT id, email, kyc_status, full_name, created_at, updated_at 
FROM users 
WHERE email = 'carlosaguerof@gmail.com';

-- Update KYC status to approved
UPDATE users 
SET 
    kyc_status = 'approved',
    updated_at = NOW()
WHERE email = 'carlosaguerof@gmail.com' 
  AND kyc_status = 'pending';

-- Verify the update
SELECT 'AFTER UPDATE - Updated KYC Status:' as status;
SELECT id, email, kyc_status, full_name, created_at, updated_at 
FROM users 
WHERE email = 'carlosaguerof@gmail.com';

-- Show affected rows
SELECT 'Update completed successfully!' as result;
