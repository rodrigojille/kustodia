-- 🚀 HEROKU PRODUCTION MIGRATION SCRIPT
-- Generated: 2025-08-01
-- Execute these commands on Heroku Postgres to sync with local schema
-- 
-- ⚠️  IMPORTANT: BACKUP DATABASE BEFORE RUNNING
-- heroku pg:backups:capture --app your-app-name

-- ===== MISSING TABLES MIGRATION =====
-- These tables exist in local but not in production

-- 1. ETHERFUSE CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS etherfuse_customers (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. MULTISIG WALLET CONFIG TABLE
CREATE TABLE IF NOT EXISTS multisig_wallet_config (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    threshold INTEGER NOT NULL DEFAULT 2,
    owner_count INTEGER NOT NULL DEFAULT 3,
    network VARCHAR(50) DEFAULT 'arbitrum',
    status VARCHAR(50) DEFAULT 'active',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. MULTISIG WALLET OWNERS TABLE
CREATE TABLE IF NOT EXISTS multisig_wallet_owners (
    id SERIAL PRIMARY KEY,
    wallet_config_id INTEGER REFERENCES multisig_wallet_config(id) ON DELETE CASCADE,
    owner_address VARCHAR(42) NOT NULL,
    owner_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(wallet_config_id, owner_address)
);

-- 4. MULTISIG APPROVAL REQUESTS TABLE
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
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. MULTISIG SIGNATURES TABLE
CREATE TABLE IF NOT EXISTS multisig_signatures (
    id SERIAL PRIMARY KEY,
    approval_request_id INTEGER REFERENCES multisig_approval_requests(id) ON DELETE CASCADE,
    signer_address VARCHAR(42) NOT NULL,
    signature TEXT NOT NULL,
    signature_type VARCHAR(50) DEFAULT 'eth_sign',
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(approval_request_id, signer_address)
);

-- 6. MULTISIG TRANSACTION LOG TABLE
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

-- 7. YIELD ACTIVATIONS TABLE
CREATE TABLE IF NOT EXISTS yield_activations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(18,6) NOT NULL,
    currency VARCHAR(10) DEFAULT 'MXNB',
    apy_rate DECIMAL(5,2) NOT NULL,
    activation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    maturity_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active',
    blockchain_tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. YIELD EARNINGS TABLE
CREATE TABLE IF NOT EXISTS yield_earnings (
    id SERIAL PRIMARY KEY,
    activation_id INTEGER REFERENCES yield_activations(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    earning_amount DECIMAL(18,6) NOT NULL,
    currency VARCHAR(10) DEFAULT 'MXNB',
    earning_date DATE NOT NULL,
    daily_rate DECIMAL(8,6),
    compound_interest BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. YIELD PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS yield_payouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activation_id INTEGER REFERENCES yield_activations(id),
    total_amount DECIMAL(18,6) NOT NULL,
    principal_amount DECIMAL(18,6) NOT NULL,
    earnings_amount DECIMAL(18,6) NOT NULL,
    currency VARCHAR(10) DEFAULT 'MXNB',
    payout_method VARCHAR(50) DEFAULT 'wallet',
    destination_address VARCHAR(42),
    blockchain_tx_hash VARCHAR(66),
    status VARCHAR(50) DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===== CREATE INDEXES FOR PERFORMANCE =====

-- Multisig indexes
CREATE INDEX IF NOT EXISTS idx_multisig_wallet_config_address ON multisig_wallet_config(wallet_address);
CREATE INDEX IF NOT EXISTS idx_multisig_wallet_config_status ON multisig_wallet_config(status);
CREATE INDEX IF NOT EXISTS idx_multisig_owners_wallet_config ON multisig_wallet_owners(wallet_config_id);
CREATE INDEX IF NOT EXISTS idx_multisig_approvals_wallet_config ON multisig_approval_requests(wallet_config_id);
CREATE INDEX IF NOT EXISTS idx_multisig_approvals_status ON multisig_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_multisig_signatures_request ON multisig_signatures(approval_request_id);
CREATE INDEX IF NOT EXISTS idx_multisig_tx_log_wallet_config ON multisig_transaction_log(wallet_config_id);

-- Yield indexes
CREATE INDEX IF NOT EXISTS idx_yield_activations_user ON yield_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_yield_activations_status ON yield_activations(status);
CREATE INDEX IF NOT EXISTS idx_yield_earnings_activation ON yield_earnings(activation_id);
CREATE INDEX IF NOT EXISTS idx_yield_earnings_user ON yield_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_yield_earnings_date ON yield_earnings(earning_date);
CREATE INDEX IF NOT EXISTS idx_yield_payouts_user ON yield_payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_yield_payouts_status ON yield_payouts(status);

-- Etherfuse indexes
CREATE INDEX IF NOT EXISTS idx_etherfuse_customers_email ON etherfuse_customers(email);
CREATE INDEX IF NOT EXISTS idx_etherfuse_customers_status ON etherfuse_customers(status);

-- ===== COLUMN ADDITIONS TO EXISTING TABLES =====
-- Check if any columns need to be added to existing tables

-- Add any missing columns to users table (if needed)
ALTER TABLE users ADD COLUMN IF NOT EXISTS portal_share TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS juno_bank_account_id VARCHAR(64);

-- Add any missing columns to payments table (if needed)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS blockchain_tx_hash VARCHAR(66);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS juno_transaction_id INTEGER REFERENCES juno_transactions(id);

-- Add missing payment columns that are actually used in the codebase
ALTER TABLE payment ADD COLUMN IF NOT EXISTS broker_email VARCHAR(255);
ALTER TABLE payment ADD COLUMN IF NOT EXISTS seller_email VARCHAR(255);
ALTER TABLE payment ADD COLUMN IF NOT EXISTS total_commission_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS total_commission_amount DECIMAL(15,2) DEFAULT 0;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS net_amount DECIMAL(15,2);
-- Note: custody info is in escrow table; transaction_category, routing_decision/reason are not used

-- Add any missing columns to escrows table (if needed)
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS smart_contract_escrow_id VARCHAR(50);
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS blockchain_tx_hash VARCHAR(66);
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS release_tx_hash VARCHAR(66);
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS dispute_history JSONB;

-- ===== VERIFICATION QUERIES =====
-- Run these after migration to verify everything worked

-- Check all tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check row counts for new tables
SELECT 'etherfuse_customers' as table_name, COUNT(*) as row_count FROM etherfuse_customers

-- Verify payment table columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'payment'
AND column_name IN (
    'broker_email', 'seller_email',
    'total_commission_percentage', 'total_commission_amount', 'net_amount'
)
ORDER BY column_name;
UNION ALL
SELECT 'multisig_wallet_config', COUNT(*) FROM multisig_wallet_config
UNION ALL
SELECT 'multisig_wallet_owners', COUNT(*) FROM multisig_wallet_owners
UNION ALL
SELECT 'multisig_approval_requests', COUNT(*) FROM multisig_approval_requests
UNION ALL
SELECT 'multisig_signatures', COUNT(*) FROM multisig_signatures
UNION ALL
SELECT 'multisig_transaction_log', COUNT(*) FROM multisig_transaction_log
UNION ALL
SELECT 'yield_activations', COUNT(*) FROM yield_activations
UNION ALL
SELECT 'yield_earnings', COUNT(*) FROM yield_earnings
UNION ALL
SELECT 'yield_payouts', COUNT(*) FROM yield_payouts;

-- Check indexes were created
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND (indexname LIKE 'idx_multisig%' OR indexname LIKE 'idx_yield%' OR indexname LIKE 'idx_etherfuse%')
ORDER BY tablename, indexname;

-- ===== ROLLBACK PLAN (Emergency Use Only) =====
-- Uncomment and run these ONLY if you need to rollback the migration

/*
-- Drop new tables (in reverse dependency order)
DROP TABLE IF EXISTS yield_payouts CASCADE;
DROP TABLE IF EXISTS yield_earnings CASCADE;
DROP TABLE IF EXISTS yield_activations CASCADE;
DROP TABLE IF EXISTS multisig_transaction_log CASCADE;
DROP TABLE IF EXISTS multisig_signatures CASCADE;
DROP TABLE IF EXISTS multisig_approval_requests CASCADE;
DROP TABLE IF EXISTS multisig_wallet_owners CASCADE;
DROP TABLE IF EXISTS multisig_wallet_config CASCADE;
DROP TABLE IF EXISTS etherfuse_customers CASCADE;

-- Remove added columns (if needed)
ALTER TABLE users DROP COLUMN IF EXISTS portal_share;
ALTER TABLE users DROP COLUMN IF EXISTS role;
ALTER TABLE users DROP COLUMN IF EXISTS juno_bank_account_id;
ALTER TABLE payments DROP COLUMN IF EXISTS blockchain_tx_hash;
ALTER TABLE payments DROP COLUMN IF EXISTS juno_transaction_id;
ALTER TABLE escrows DROP COLUMN IF EXISTS smart_contract_escrow_id;
ALTER TABLE escrows DROP COLUMN IF EXISTS blockchain_tx_hash;
ALTER TABLE escrows DROP COLUMN IF EXISTS release_tx_hash;
ALTER TABLE escrows DROP COLUMN IF EXISTS dispute_history;
*/

-- ===== MIGRATION COMPLETE =====
-- 🎉 Migration script complete!
-- 
-- NEXT STEPS:
-- 1. Verify all tables and indexes were created successfully
-- 2. Run the verification queries above
-- 3. Test your application functionality
-- 4. Monitor for any errors in application logs
-- 5. Create a fresh backup after successful migration

SELECT 'Migration completed successfully! 🚀' as status;
