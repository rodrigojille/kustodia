-- Multi-Signature Approval System Database Schema
-- Created: 2025-01-30
-- Purpose: Add multi-sig approval tracking and signature management

-- 1. Multi-Sig Approval Requests Table
CREATE TABLE IF NOT EXISTS multisig_approval_requests (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL REFERENCES payment(id) ON DELETE CASCADE,
    transaction_hash VARCHAR(66), -- Ethereum transaction hash
    wallet_address VARCHAR(42) NOT NULL, -- Multi-sig wallet address
    required_signatures INTEGER NOT NULL DEFAULT 2,
    current_signatures INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, expired
    approval_type VARCHAR(20) NOT NULL DEFAULT 'payment', -- payment, release, dispute
    amount DECIMAL(20,8) NOT NULL,
    amount_usd DECIMAL(20,8),
    recipient_address VARCHAR(42),
    transaction_data JSONB, -- Raw transaction data for signing
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100), -- Admin user who initiated
    metadata JSONB -- Additional context data
);

-- 2. Multi-Sig Signatures Table
CREATE TABLE IF NOT EXISTS multisig_signatures (
    id SERIAL PRIMARY KEY,
    approval_request_id INTEGER NOT NULL REFERENCES multisig_approval_requests(id) ON DELETE CASCADE,
    signer_address VARCHAR(42) NOT NULL,
    signature VARCHAR(132) NOT NULL, -- Ethereum signature (65 bytes hex)
    message_hash VARCHAR(66) NOT NULL, -- Hash of the signed message
    signed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_valid BOOLEAN NOT NULL DEFAULT TRUE,
    signature_type VARCHAR(20) NOT NULL DEFAULT 'approval', -- approval, rejection
    metadata JSONB
);

-- 3. Multi-Sig Wallet Configuration Table
CREATE TABLE IF NOT EXISTS multisig_wallet_config (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    wallet_type VARCHAR(20) NOT NULL, -- high_value, enterprise, emergency
    required_signatures INTEGER NOT NULL,
    total_owners INTEGER NOT NULL,
    threshold_min_usd DECIMAL(20,8) NOT NULL,
    threshold_max_usd DECIMAL(20,8),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Multi-Sig Wallet Owners Table
CREATE TABLE IF NOT EXISTS multisig_wallet_owners (
    id SERIAL PRIMARY KEY,
    wallet_config_id INTEGER NOT NULL REFERENCES multisig_wallet_config(id) ON DELETE CASCADE,
    owner_address VARCHAR(42) NOT NULL,
    owner_name VARCHAR(100),
    owner_email VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    added_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Multi-Sig Transaction Log Table
CREATE TABLE IF NOT EXISTS multisig_transaction_log (
    id SERIAL PRIMARY KEY,
    approval_request_id INTEGER NOT NULL REFERENCES multisig_approval_requests(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- created, signed, approved, rejected, executed, expired
    actor_address VARCHAR(42),
    actor_type VARCHAR(20), -- admin, signer, system
    details JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Add Multi-Sig fields to Payment table
ALTER TABLE payment 
ADD COLUMN IF NOT EXISTS multisig_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS multisig_approval_id INTEGER REFERENCES multisig_approval_requests(id),
ADD COLUMN IF NOT EXISTS multisig_status VARCHAR(20) DEFAULT 'none', -- none, pending, approved, rejected
ADD COLUMN IF NOT EXISTS routing_decision VARCHAR(20) DEFAULT 'bridge', -- bridge, multisig_high, multisig_enterprise
ADD COLUMN IF NOT EXISTS routing_reason VARCHAR(100); -- Amount threshold, manual override, etc.

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_multisig_approval_requests_payment_id ON multisig_approval_requests(payment_id);
CREATE INDEX IF NOT EXISTS idx_multisig_approval_requests_status ON multisig_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_multisig_approval_requests_expires_at ON multisig_approval_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_multisig_signatures_approval_request_id ON multisig_signatures(approval_request_id);
CREATE INDEX IF NOT EXISTS idx_multisig_signatures_signer_address ON multisig_signatures(signer_address);
CREATE INDEX IF NOT EXISTS idx_multisig_wallet_config_wallet_address ON multisig_wallet_config(wallet_address);
CREATE INDEX IF NOT EXISTS idx_payment_multisig_status ON payment(multisig_status);
CREATE INDEX IF NOT EXISTS idx_payment_routing_decision ON payment(routing_decision);

-- Insert default wallet configurations
INSERT INTO multisig_wallet_config (wallet_address, wallet_type, required_signatures, total_owners, threshold_min_usd, threshold_max_usd) 
VALUES 
    ('0xA8F1B1Bac8D3B1c5D28A7eD91fa01e96eDB6711c', 'high_value', 2, 4, 1000.00, 10000.00),
    ('0xA8F1B1Bac8D3B1c5D28A7eD91fa01e96eDB6711c', 'enterprise', 2, 4, 10000.00, NULL)
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert wallet owners (example addresses - replace with actual owner addresses)
INSERT INTO multisig_wallet_owners (wallet_config_id, owner_address, owner_name, owner_email)
SELECT 
    wc.id,
    owner_addr,
    owner_name,
    owner_email
FROM multisig_wallet_config wc
CROSS JOIN (
    VALUES 
        ('0x1234567890123456789012345678901234567890', 'Admin 1', 'admin1@kustodia.mx'),
        ('0x2345678901234567890123456789012345678901', 'Admin 2', 'admin2@kustodia.mx'),
        ('0x3456789012345678901234567890123456789012', 'Admin 3', 'admin3@kustodia.mx'),
        ('0x4567890123456789012345678901234567890123', 'Admin 4', 'admin4@kustodia.mx')
) AS owners(owner_addr, owner_name, owner_email)
WHERE wc.wallet_address = '0xA8F1B1Bac8D3B1c5D28A7eD91fa01e96eDB6711c'
ON CONFLICT DO NOTHING;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_multisig_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_multisig_approval_requests_timestamp
    BEFORE UPDATE ON multisig_approval_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_multisig_timestamps();

CREATE TRIGGER update_multisig_wallet_config_timestamp
    BEFORE UPDATE ON multisig_wallet_config
    FOR EACH ROW
    EXECUTE FUNCTION update_multisig_timestamps();

COMMENT ON TABLE multisig_approval_requests IS 'Tracks multi-signature approval requests for high-value transactions';
COMMENT ON TABLE multisig_signatures IS 'Stores individual signatures from wallet owners for approval requests';
COMMENT ON TABLE multisig_wallet_config IS 'Configuration for multi-signature wallets including thresholds and requirements';
COMMENT ON TABLE multisig_wallet_owners IS 'List of authorized signers for each multi-signature wallet';
COMMENT ON TABLE multisig_transaction_log IS 'Audit trail of all multi-signature transaction activities';
