-- Create EarlyAccessCounter table for production database
CREATE TABLE IF NOT EXISTS "early_access_counter" (
    "id" SERIAL PRIMARY KEY,
    "slots" INTEGER NOT NULL DEFAULT 100
);

-- Insert initial record if table is empty
INSERT INTO "early_access_counter" ("slots") 
SELECT 100 
WHERE NOT EXISTS (SELECT 1 FROM "early_access_counter");

-- Verify the table was created
SELECT * FROM "early_access_counter";
