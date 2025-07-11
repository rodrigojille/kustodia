-- Make rodrigojille6@gmail.com an admin
UPDATE "user" 
SET role = 'admin' 
WHERE email = 'rodrigojille6@gmail.com';

-- Check the result
SELECT id, email, role, full_name 
FROM "user" 
WHERE email = 'rodrigojille6@gmail.com';
