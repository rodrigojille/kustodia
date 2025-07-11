-- Add missing googleId column to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "googleId" VARCHAR(255);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user' AND column_name = 'googleId';
