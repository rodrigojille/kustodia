-- Migration: Add nuevo-flujo specific fields to payment table
-- Date: 2025-06-24

-- Add nuevo-flujo approval tracking fields
ALTER TABLE payment 
ADD COLUMN IF NOT EXISTS payer_approval BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payee_approval BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payer_approval_timestamp TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payee_approval_timestamp TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS release_conditions TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS vertical_type VARCHAR(100) DEFAULT NULL;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_payment_type ON payment(payment_type);
CREATE INDEX IF NOT EXISTS idx_payer_approval ON payment(payer_approval);
CREATE INDEX IF NOT EXISTS idx_payee_approval ON payment(payee_approval);

-- Update existing payment #84 to be nuevo_flujo type for testing
UPDATE payment 
SET payment_type = 'nuevo_flujo',
    vertical_type = 'freelance',
    release_conditions = 'El pago se liberará cuando ambas partes confirmen que las condiciones de entrega del proyecto freelance se han cumplido satisfactoriamente.'
WHERE id = 84;

COMMIT;
