-- Update escrow 73 with smart contract escrow ID 5
UPDATE escrows 
SET smart_contract_escrow_id = '5'
WHERE id = 73;

-- Verify the update
SELECT id, smart_contract_escrow_id, status, blockchain_tx_hash 
FROM escrows 
WHERE id = 73;
