-- Add missing Google SSO columns to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "googleId" character varying;
ALTER TABLE "user" ADD CONSTRAINT IF NOT EXISTS "UQ_470355432cc67b2c470c30bef7c" UNIQUE ("googleId");
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "googleAccessToken" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "googleRefreshToken" text;
