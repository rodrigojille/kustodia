-- 🔍 STEP 1: CHECK CURRENT STATUS (Run this first)
-- Copy and paste this query into Heroku Data to see current status

SELECT 
    p.id as payment_id,
    p.status as payment_status,
    p.payer_approval,
    p.payee_approval,
    e.status as escrow_status,
    e.release_tx_hash,
    e.smart_contract_escrow_id
FROM payment p
LEFT JOIN escrow e ON p.id = e.payment_id
WHERE p.id IN (112, 113)
ORDER BY p.id;

-- ========================================
-- 🚀 STEP 2: EXECUTE MIGRATION (Run this after checking status)
-- Copy and paste this entire block into Heroku Data
-- ========================================

-- Payment 112 Migration
UPDATE payment SET status = 'completed', payer_approval = true, payee_approval = true, updated_at = NOW() WHERE id = 112;
UPDATE escrow SET status = 'completed', release_tx_hash = '0x1917e76262e46cd27aa80cf702e1ae204f0c37936ce9c45e115298ac4e1cd35d', smart_contract_escrow_id = '9', updated_at = NOW() WHERE payment_id = 112;
INSERT INTO payment_event (payment_id, type, description, is_automatic, created_at) VALUES (112, 'production_migration', 'Estado migrado desde desarrollo - Payment 112 completado con custodia liberada', true, NOW());

-- Payment 113 Migration  
UPDATE payment SET status = 'completed', payer_approval = true, payee_approval = true, updated_at = NOW() WHERE id = 113;
UPDATE escrow SET status = 'completed', release_tx_hash = '0x41da5b7d6b5f08596c04c798409723e20361acd25430b0f058b7e6970fa38531', smart_contract_escrow_id = '10', updated_at = NOW() WHERE payment_id = 113;
INSERT INTO payment_event (payment_id, type, description, is_automatic, created_at) VALUES (113, 'production_migration', 'Estado migrado desde desarrollo - Payment 113 completado con custodia liberada', true, NOW());

-- ========================================
-- ✅ STEP 3: VERIFY MIGRATION (Run this to confirm changes)
-- ========================================

SELECT 
    'AFTER MIGRATION' as status,
    p.id as payment_id,
    p.status as payment_status,
    p.payer_approval,
    p.payee_approval,
    e.status as escrow_status,
    CASE 
        WHEN e.release_tx_hash IS NOT NULL THEN 'YES' 
        ELSE 'NO' 
    END as has_release_tx,
    e.smart_contract_escrow_id
FROM payment p
LEFT JOIN escrow e ON p.id = e.payment_id
WHERE p.id IN (112, 113)
ORDER BY p.id;
