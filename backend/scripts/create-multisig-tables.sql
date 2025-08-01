-- =====================================================
-- MULTISIG TABLES CREATION SCRIPT FOR PRODUCTION
-- =====================================================
-- This script creates all multisig-related tables in production
-- Safe to run multiple times (uses IF NOT EXISTS)

-- 1. MULTISIG WALLET CONFIG TABLE
CREATE TABLE IF NOT EXISTS multisig_wallet_config (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    threshold INTEGER NOT NULL DEFAULT 2,
    owner_count INTEGER NOT NULL DEFAULT 3,
    network VARCHAR(50) DEFAULT 'arbitrum',
    status VARCHAR(50) DEFAULT 'active',
    created_by INTEGER REFERENCES "user"(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. MULTISIG WALLET OWNERS TABLE
CREATE TABLE IF NOT EXISTS multisig_wallet_owners (
    id SERIAL PRIMARY KEY,
    wallet_config_id INTEGER REFERENCES multisig_wallet_config(id) ON DELETE CASCADE,
    owner_address VARCHAR(42) NOT NULL,
    owner_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(wallet_config_id, owner_address)
);

-- 3. MULTISIG APPROVAL REQUESTS TABLE
CREATE TABLE IF NOT EXISTS multisig_approval_requests (
    id SERIAL PRIMARY KEY,
    wallet_config_id INTEGER REFERENCES multisig_wallet_config(id) ON DELETE CASCADE,
    transaction_hash VARCHAR(66),
    safe_tx_hash VARCHAR(66),
    to_address VARCHAR(42) NOT NULL,
    value DECIMAL(18,6) DEFAULT 0,
    data TEXT,
    operation INTEGER DEFAULT 0,
    safe_tx_gas BIGINT DEFAULT 0,
    base_gas BIGINT DEFAULT 0,
    gas_price BIGINT DEFAULT 0,
    gas_token VARCHAR(42),
    refund_receiver VARCHAR(42),
    nonce INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_by INTEGER REFERENCES "user"(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. MULTISIG SIGNATURES TABLE
CREATE TABLE IF NOT EXISTS multisig_signatures (
    id SERIAL PRIMARY KEY,
    approval_request_id INTEGER REFERENCES multisig_approval_requests(id) ON DELETE CASCADE,
    signer_address VARCHAR(42) NOT NULL,
    signature TEXT NOT NULL,
    signature_type VARCHAR(50) DEFAULT 'eth_sign',
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(approval_request_id, signer_address)
);

-- 5. MULTISIG TRANSACTION LOG TABLE
CREATE TABLE IF NOT EXISTS multisig_transaction_log (
    id SERIAL PRIMARY KEY,
    wallet_config_id INTEGER REFERENCES multisig_wallet_config(id) ON DELETE CASCADE,
    approval_request_id INTEGER REFERENCES multisig_approval_requests(id),
    transaction_hash VARCHAR(66),
    safe_tx_hash VARCHAR(66),
    block_number BIGINT,
    gas_used BIGINT,
    gas_price BIGINT,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for multisig_wallet_config
CREATE INDEX IF NOT EXISTS idx_multisig_wallet_config_address ON multisig_wallet_config(wallet_address);
CREATE INDEX IF NOT EXISTS idx_multisig_wallet_config_status ON multisig_wallet_config(status);

-- Indexes for multisig_wallet_owners
CREATE INDEX IF NOT EXISTS idx_multisig_wallet_owners_config_id ON multisig_wallet_owners(wallet_config_id);
CREATE INDEX IF NOT EXISTS idx_multisig_wallet_owners_address ON multisig_wallet_owners(owner_address);

-- Indexes for multisig_approval_requests
CREATE INDEX IF NOT EXISTS idx_multisig_approval_requests_config_id ON multisig_approval_requests(wallet_config_id);
CREATE INDEX IF NOT EXISTS idx_multisig_approval_requests_status ON multisig_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_multisig_approval_requests_tx_hash ON multisig_approval_requests(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_multisig_approval_requests_safe_tx_hash ON multisig_approval_requests(safe_tx_hash);

-- Indexes for multisig_signatures
CREATE INDEX IF NOT EXISTS idx_multisig_signatures_approval_id ON multisig_signatures(approval_request_id);
CREATE INDEX IF NOT EXISTS idx_multisig_signatures_signer ON multisig_signatures(signer_address);

-- Indexes for multisig_transaction_log
CREATE INDEX IF NOT EXISTS idx_multisig_transaction_log_config_id ON multisig_transaction_log(wallet_config_id);
CREATE INDEX IF NOT EXISTS idx_multisig_transaction_log_approval_id ON multisig_transaction_log(approval_request_id);
CREATE INDEX IF NOT EXISTS idx_multisig_transaction_log_tx_hash ON multisig_transaction_log(transaction_hash);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all tables were created
SELECT 'Multisig tables created successfully!' as status;

-- Show all multisig tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%multisig%' 
ORDER BY tablename;

-- Show all multisig indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE '%multisig%' 
ORDER BY tablename, indexname;
