-- MIGRATION: Add payment_type column to payments table
-- This enables smart routing for nuevo-flujo tracker vs traditional payment detail
-- Execute via Heroku CLI: heroku pg:psql -a YOUR_APP_NAME < add_payment_type_to_payment.sql

-- ===== MIGRATION: Add payment_type column =====
-- Safe to run - column is nullable with sensible default

-- 1. Add payment_type column with default 'traditional'
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50) DEFAULT 'traditional';

-- 2. Update existing nuevo-flujo payments (if any exist)
-- This identifies payments created through the nuevo-flujo form
-- You may need to adjust this query based on your specific criteria
UPDATE payments 
SET payment_type = 'nuevo_flujo' 
WHERE description LIKE '%nuevo flujo%' 
   OR description LIKE '%nuevo-flujo%'
   OR (commission_percent IS NOT NULL AND commission_beneficiary_email IS NOT NULL);

-- ===== VERIFICATION QUERIES =====
-- Run these to verify the migration worked:

-- Check the new column exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND column_name = 'payment_type'
ORDER BY column_name;

-- Check payment type distribution
SELECT payment_type, COUNT(*) as count
FROM payments 
GROUP BY payment_type
ORDER BY count DESC;

-- Sample nuevo-flujo payments
SELECT id, amount, description, payment_type, commission_percent, created_at
FROM payments 
WHERE payment_type = 'nuevo_flujo'
ORDER BY created_at DESC
LIMIT 5;

-- Sample traditional payments  
SELECT id, amount, description, payment_type, created_at
FROM payments 
WHERE payment_type = 'traditional'
ORDER BY created_at DESC
LIMIT 5;

-- ===== ROLLBACK PLAN (if needed) =====
-- Only use if something goes wrong:

-- ALTER TABLE payments DROP COLUMN IF EXISTS payment_type;

-- ===== NOTES =====
-- 1. All existing payments will be marked as 'traditional' by default
-- 2. New payments from nuevo-flujo form should explicitly set payment_type = 'nuevo_flujo'
-- 3. This enables conditional UI rendering for tracker vs detail view
-- 4. No data loss - purely additive migration
