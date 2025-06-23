-- Add portal_share and role columns to user table
ALTER TABLE "user" ADD COLUMN "portal_share" VARCHAR(128);
ALTER TABLE "user" ADD COLUMN "role" VARCHAR(50) NOT NULL DEFAULT 'user';

-- Create index on role for better performance
CREATE INDEX idx_user_role ON "user"(role);
