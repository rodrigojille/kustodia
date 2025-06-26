-- Migration: Add EtherFuse Yield Generation Tables
-- Date: 2025-06-25
-- Description: Database schema for CETES yield generation integration

-- Table 1: EtherFuse Customer Management
CREATE TABLE IF NOT EXISTS etherfuse_customers (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    etherfuse_customer_id VARCHAR(255) UNIQUE,
    kyc_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, expired
    etherfuse_onboarded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_etherfuse_customers_user 
        FOREIGN KEY (user_email) REFERENCES "user"(email) ON DELETE CASCADE
);

-- Table 2: Yield Activation Tracking
CREATE TABLE IF NOT EXISTS yield_activations (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    etherfuse_order_id VARCHAR(255) UNIQUE,
    principal_amount DECIMAL(15,2) NOT NULL, -- Amount invested in CETES
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deactivated_at TIMESTAMP NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled, failed
    etherfuse_response JSONB, -- Store API response details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_yield_activations_payment 
        FOREIGN KEY (payment_id) REFERENCES payment(id) ON DELETE CASCADE,
    CONSTRAINT fk_yield_activations_user 
        FOREIGN KEY (user_email) REFERENCES "user"(email) ON DELETE CASCADE,
    
    -- Ensure one active yield per payment
    CONSTRAINT unique_active_yield_per_payment 
        UNIQUE (payment_id, status) 
        DEFERRABLE INITIALLY DEFERRED
);

-- Table 3: Daily Yield Earnings Tracking
CREATE TABLE IF NOT EXISTS yield_earnings (
    id SERIAL PRIMARY KEY,
    yield_activation_id INTEGER NOT NULL,
    payment_id INTEGER NOT NULL,
    earning_date DATE NOT NULL,
    daily_amount DECIMAL(15,2) NOT NULL, -- Daily yield amount in MXN
    cumulative_total DECIMAL(15,2) NOT NULL, -- Running total
    annual_rate DECIMAL(5,4) NOT NULL, -- Annual rate used (e.g., 0.0720 for 7.20%)
    calculation_method VARCHAR(50) DEFAULT 'compound_daily', -- compound_daily, simple
    etherfuse_data JSONB, -- Store EtherFuse earnings data
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_yield_earnings_activation 
        FOREIGN KEY (yield_activation_id) REFERENCES yield_activations(id) ON DELETE CASCADE,
    CONSTRAINT fk_yield_earnings_payment 
        FOREIGN KEY (payment_id) REFERENCES payment(id) ON DELETE CASCADE,
    
    -- Ensure one earning record per day per activation
    CONSTRAINT unique_earning_per_day_per_activation 
        UNIQUE (yield_activation_id, earning_date)
);

-- Table 4: Yield Payouts (When escrow completes)
CREATE TABLE IF NOT EXISTS yield_payouts (
    id SERIAL PRIMARY KEY,
    yield_activation_id INTEGER NOT NULL,
    payment_id INTEGER NOT NULL,
    total_yield_earned DECIMAL(15,2) NOT NULL,
    payer_amount DECIMAL(15,2) NOT NULL, -- 80% to payer
    platform_amount DECIMAL(15,2) NOT NULL, -- 20% to platform
    payout_type VARCHAR(50) NOT NULL, -- escrow_completion, dispute_resolution
    payout_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
    etherfuse_withdrawal_id VARCHAR(255),
    payout_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_yield_payouts_activation 
        FOREIGN KEY (yield_activation_id) REFERENCES yield_activations(id) ON DELETE CASCADE,
    CONSTRAINT fk_yield_payouts_payment 
        FOREIGN KEY (payment_id) REFERENCES payment(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_yield_activations_payment_id ON yield_activations(payment_id);
CREATE INDEX IF NOT EXISTS idx_yield_activations_user_email ON yield_activations(user_email);
CREATE INDEX IF NOT EXISTS idx_yield_activations_status ON yield_activations(status);

CREATE INDEX IF NOT EXISTS idx_yield_earnings_activation_id ON yield_earnings(yield_activation_id);
CREATE INDEX IF NOT EXISTS idx_yield_earnings_payment_id ON yield_earnings(payment_id);
CREATE INDEX IF NOT EXISTS idx_yield_earnings_date ON yield_earnings(earning_date);

CREATE INDEX IF NOT EXISTS idx_yield_payouts_payment_id ON yield_payouts(payment_id);
CREATE INDEX IF NOT EXISTS idx_yield_payouts_status ON yield_payouts(payout_status);

CREATE INDEX IF NOT EXISTS idx_etherfuse_customers_email ON etherfuse_customers(user_email);
CREATE INDEX IF NOT EXISTS idx_etherfuse_customers_etherfuse_id ON etherfuse_customers(etherfuse_customer_id);

-- Add updated_at trigger for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_etherfuse_customers_updated_at 
    BEFORE UPDATE ON etherfuse_customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_yield_activations_updated_at 
    BEFORE UPDATE ON yield_activations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_yield_payouts_updated_at 
    BEFORE UPDATE ON yield_payouts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE etherfuse_customers IS 'EtherFuse customer KYC and account management';
COMMENT ON TABLE yield_activations IS 'Track which payments have yield generation activated';
COMMENT ON TABLE yield_earnings IS 'Daily yield earnings calculation and tracking';
COMMENT ON TABLE yield_payouts IS 'Final yield distribution when escrow completes';

COMMENT ON COLUMN yield_activations.principal_amount IS 'Amount invested in CETES (may differ from payment amount due to fees)';
COMMENT ON COLUMN yield_earnings.annual_rate IS 'Annual yield rate used for calculation (stored for historical tracking)';
COMMENT ON COLUMN yield_payouts.payer_amount IS '80% of yield goes to payer';
COMMENT ON COLUMN yield_payouts.platform_amount IS '20% of yield goes to platform';

-- Example data for testing (commented out for production)
/*
-- Test data example:
INSERT INTO etherfuse_customers (user_email, etherfuse_customer_id, kyc_status, etherfuse_onboarded_at) 
VALUES ('test@kustodia.mx', 'ETF_CUST_12345', 'approved', CURRENT_TIMESTAMP);

INSERT INTO yield_activations (payment_id, user_email, etherfuse_order_id, principal_amount, status) 
VALUES (84, 'test@kustodia.mx', 'ETF_ORDER_67890', 25000.00, 'active');
*/
