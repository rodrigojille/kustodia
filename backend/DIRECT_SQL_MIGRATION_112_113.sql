-- 🚀 DIRECT SQL MIGRATION FOR PAYMENTS 112 & 113
-- Run this SQL directly in Heroku Data (Dataclips) or psql
-- This migrates payments 112 and 113 to completed status with escrow release data

-- ========================================
-- STEP 1: CHECK CURRENT STATUS
-- ========================================
SELECT 
    'CURRENT STATUS CHECK' as step,
    p.id as payment_id,
    p.status as payment_status,
    p.payer_approval,
    p.payee_approval,
    p.updated_at as payment_updated,
    e.status as escrow_status,
    e.release_tx_hash,
    e.smart_contract_escrow_id,
    e.updated_at as escrow_updated
FROM payment p
LEFT JOIN escrow e ON p.id = e.payment_id
WHERE p.id IN (112, 113)
ORDER BY p.id;

-- ========================================
-- STEP 2: MIGRATION EXECUTION
-- ========================================

-- Begin transaction for Payment 112
BEGIN;

-- Update Payment 112
UPDATE payment 
SET 
    status = 'completed',
    payer_approval = true,
    payee_approval = true,
    updated_at = NOW()
WHERE id = 112;

-- Update Escrow for Payment 112
UPDATE escrow 
SET 
    status = 'completed',
    release_tx_hash = '0x1917e76262e46cd27aa80cf702e1ae204f0c37936ce9c45e115298ac4e1cd35d',
    smart_contract_escrow_id = '9',
    updated_at = NOW()
WHERE payment_id = 112;

-- Add migration event for Payment 112
INSERT INTO payment_event (payment_id, type, description, is_automatic, created_at)
VALUES (
    112,
    'production_migration',
    'Estado migrado desde desarrollo - Payment 112 completado con custodia liberada (TX: 0x1917e76262e46cd27aa80cf702e1ae204f0c37936ce9c45e115298ac4e1cd35d)',
    true,
    NOW()
);

-- Commit Payment 112 transaction
COMMIT;

-- Begin transaction for Payment 113
BEGIN;

-- Update Payment 113
UPDATE payment 
SET 
    status = 'completed',
    payer_approval = true,
    payee_approval = true,
    updated_at = NOW()
WHERE id = 113;

-- Update Escrow for Payment 113
UPDATE escrow 
SET 
    status = 'completed',
    release_tx_hash = '0x41da5b7d6b5f08596c04c798409723e20361acd25430b0f058b7e6970fa38531',
    smart_contract_escrow_id = '10',
    updated_at = NOW()
WHERE payment_id = 113;

-- Add migration event for Payment 113
INSERT INTO payment_event (payment_id, type, description, is_automatic, created_at)
VALUES (
    113,
    'production_migration',
    'Estado migrado desde desarrollo - Payment 113 completado con custodia liberada (TX: 0x41da5b7d6b5f08596c04c798409723e20361acd25430b0f058b7e6970fa38531)',
    true,
    NOW()
);

-- Commit Payment 113 transaction
COMMIT;

-- ========================================
-- STEP 3: VERIFICATION
-- ========================================
SELECT 
    'FINAL VERIFICATION' as step,
    p.id as payment_id,
    p.status as payment_status,
    p.payer_approval,
    p.payee_approval,
    p.updated_at as payment_updated,
    e.status as escrow_status,
    e.release_tx_hash,
    e.smart_contract_escrow_id,
    e.updated_at as escrow_updated
FROM payment p
LEFT JOIN escrow e ON p.id = e.payment_id
WHERE p.id IN (112, 113)
ORDER BY p.id;

-- ========================================
-- STEP 4: CHECK MIGRATION EVENTS
-- ========================================
SELECT 
    'MIGRATION EVENTS' as step,
    pe.payment_id,
    pe.type,
    pe.description,
    pe.is_automatic,
    pe.created_at
FROM payment_event pe
WHERE pe.payment_id IN (112, 113)
    AND pe.type = 'production_migration'
ORDER BY pe.payment_id, pe.created_at DESC;
