-- Migration: Early Access Counter with direct lead relationship

-- 1. Create the early_access_counter table if it does not exist
CREATE TABLE IF NOT EXISTS "early_access_counter" (
  "id" SERIAL PRIMARY KEY,
  "slots" integer NOT NULL DEFAULT 90
);

-- 2. Add the foreign key to lead if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='lead' AND column_name='early_access_counter_id'
  ) THEN
    ALTER TABLE "lead"
    ADD COLUMN "early_access_counter_id" integer REFERENCES "early_access_counter"("id") ON DELETE SET NULL;
  END IF;
END$$;

-- 3. Insert initial counter row with 90 slots if table is empty
INSERT INTO "early_access_counter" ("slots")
SELECT 90
WHERE NOT EXISTS (SELECT 1 FROM "early_access_counter");
