-- Add missing is_automatic column to payment_event table
ALTER TABLE "payment_event" ADD COLUMN IF NOT EXISTS "is_automatic" BOOLEAN DEFAULT false;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'payment_event' AND column_name = 'is_automatic';
