-- Add missing Google-related columns to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "googleId" VARCHAR(255);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "googleAccessToken" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "googleRefreshToken" TEXT;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user' AND column_name IN ('googleId', 'googleAccessToken', 'googleRefreshToken')
ORDER BY column_name;
