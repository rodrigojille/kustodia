-- Migration: Make password_hash nullable for Google OAuth users
-- Date: 2025-08-01
-- Purpose: Allow users to register via Google OAuth without requiring a password

-- Make password_hash column nullable
ALTER TABLE "user" ALTER COLUMN "password_hash" DROP NOT NULL;

-- Optional: Add a comment to document the change
COMMENT ON COLUMN "user"."password_hash" IS 'Password hash for email/password login. NULL for OAuth users (Google, etc.)';

-- Verify the change
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'user' 
AND column_name = 'password_hash';
