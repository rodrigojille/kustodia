-- Fix escrow 73 to use the correct smart contract escrow ID (1 instead of 5)
UPDATE escrow 
SET smart_contract_escrow_id = '1'
WHERE id = 73;

-- Verify the update
SELECT id, smart_contract_escrow_id, status, blockchain_tx_hash 
FROM escrow 
WHERE id = 73;
