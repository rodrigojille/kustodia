-- Migration: Add empresa, telefono, and vertical columns to lead table
-- Date: 2025-01-22
-- Description: Add new optional columns to support enhanced lead capture

-- Add empresa column (company name, optional)
ALTER TABLE "lead" ADD COLUMN IF NOT EXISTS "empresa" VARCHAR(100);

-- Add telefono column (phone number, optional)  
ALTER TABLE "lead" ADD COLUMN IF NOT EXISTS "telefono" VARCHAR(20);

-- Add vertical column (business vertical for analytics, optional)
ALTER TABLE "lead" ADD COLUMN IF NOT EXISTS "vertical" VARCHAR(50);

-- Create index on vertical for analytics queries
CREATE INDEX IF NOT EXISTS "idx_lead_vertical" ON "lead" ("vertical");

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS "idx_lead_created_at" ON "lead" ("created_at");

-- Verify the migration
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lead' 
ORDER BY ordinal_position;
