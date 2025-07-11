-- Check Payment 87 and its escrow custody_end date
SELECT 
    p.id as payment_id,
    p.amount,
    p.currency,
    p.status as payment_status,
    p.deposit_clabe,
    p.created_at as payment_created,
    e.id as escrow_id,
    e.smart_contract_escrow_id,
    e.status as escrow_status,
    e.custody_percent,
    e.custody_amount,
    e.release_amount,
    e.custody_end,
    e.blockchain_tx_hash,
    e.created_at as escrow_created,
    e.updated_at as escrow_updated,
    -- Check if custody_end is null
    CASE 
        WHEN e.custody_end IS NULL THEN 'NULL - NEEDS FIX'
        WHEN e.custody_end < NOW() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as custody_status,
    -- Calculate what custody_end should be (payment created + 2 days)
    p.created_at + INTERVAL '2 days' as expected_custody_end
FROM payment p
LEFT JOIN escrow e ON p.escrow_id = e.id
WHERE p.id = 87;
