-- Revert escrow 73 back to pending status and reset blockchain data
UPDATE escrow 
SET 
    status = 'pending',
    smart_contract_escrow_id = NULL,
    blockchain_tx_hash = NULL
WHERE id = 73;

-- Also revert payment 85 back to withdrawn status
UPDATE payment 
SET status = 'withdrawn'
WHERE id = 85;

-- Verify the updates
SELECT id, status, smart_contract_escrow_id, blockchain_tx_hash 
FROM escrow 
WHERE id = 73;

SELECT id, status 
FROM payment 
WHERE id = 85;
