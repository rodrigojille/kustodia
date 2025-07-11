-- Check current user
SELECT id, email, role, full_name FROM "user" WHERE email = 'rodrigojille6@gmail.com';

-- Update user role to admin
UPDATE "user" SET role = 'admin' WHERE email = 'rodrigojille6@gmail.com';

-- Verify the update
SELECT id, email, role, full_name FROM "user" WHERE email = 'rodrigojille6@gmail.com';
