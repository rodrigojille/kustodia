-- Dispute Migration SQL
-- Generated on 2025-07-15T00:41:42.138Z
-- Total disputes: 2

INSERT INTO dispute (
        id, 
        escrow_id, 
        raised_by, 
        reason, 
        details, 
        evidence_url, 
        status, 
        admin_notes, 
        contract_dispute_raised_tx, 
        contract_dispute_resolved_tx, 
        created_at, 
        updated_at
      ) VALUES (
        1,
        24,
        3,
        'Item not delivered',
        'The item was not delivered as promised.',
        NULL,
        'pending',
        NULL,
        'MOCK_TX_HASH',
        NULL,
        '2025-05-10T22:57:37.206Z',
        '2025-05-10T22:57:37.206Z'
      );

INSERT INTO dispute (
        id, 
        escrow_id, 
        raised_by, 
        reason, 
        details, 
        evidence_url, 
        status, 
        admin_notes, 
        contract_dispute_raised_tx, 
        contract_dispute_resolved_tx, 
        created_at, 
        updated_at
      ) VALUES (
        2,
        59,
        2,
        'test',
        'test',
        '{"/uploads/evidence/1749422289168-731210727-Kustodia_by_Czentral_(10).pdf"}',
        'pending',
        NULL,
        'MOCK_TX_HASH',
        NULL,
        '2025-06-08T22:38:09.207Z',
        '2025-06-08T22:38:09.207Z'
      );


-- Update sequence
SELECT setval('dispute_id_seq', 3, false);

-- Verification query
SELECT 
  COUNT(*) as total_disputes,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_disputes,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_disputes
FROM dispute;

-- Show sample data
SELECT id, escrow_id, raised_by, reason, status, created_at 
FROM dispute 
ORDER BY id 
LIMIT 10;
