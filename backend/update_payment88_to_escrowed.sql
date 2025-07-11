-- Update payment 88 status to 'escrowed'
-- This will make the dispute button appear and show correct status

-- First, let's check current status
SELECT id, status, amount, created_at 
FROM payment 
WHERE id = 88;

-- Update the payment status to 'escrowed'
UPDATE payment 
SET status = 'escrowed', 
    updated_at = NOW()
WHERE id = 88;

-- Verify the update
SELECT id, status, amount, created_at, updated_at 
FROM payment 
WHERE id = 88;

-- Optional: Check if there's an associated escrow
SELECT e.id, e.status, e.custody_amount, e.smart_contract_escrow_id
FROM escrow e
INNER JOIN payment p ON p.escrow_id = e.id
WHERE p.id = 88;
