-- Fix platform_commission_percent column type from integer to decimal
-- This migration fixes the payment creation error where decimal values 
-- were being inserted into an integer column

-- Change platform_commission_percent from integer to decimal(5,2)
ALTER TABLE payment 
ALTER COLUMN platform_commission_percent TYPE DECIMAL(5,2);

-- Add comment for clarity
COMMENT ON COLUMN payment.platform_commission_percent IS 'Platform commission percentage (e.g., 2.5 for 2.5%)';
