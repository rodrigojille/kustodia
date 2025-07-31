-- Create blacklist table for AML compliance
CREATE TABLE IF NOT EXISTS blacklist (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('user', 'wallet_address', 'email', 'ip_address')),
    identifier VARCHAR(255) NOT NULL,
    reason VARCHAR(50) NOT NULL CHECK (reason IN (
        'money_laundering', 
        'fraud', 
        'suspicious_activity', 
        'regulatory_request', 
        'sanctions', 
        'high_risk_jurisdiction', 
        'manual_review', 
        'other'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'under_review')),
    description TEXT,
    reference_number VARCHAR(100),
    source VARCHAR(100),
    added_by_user_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
    reviewed_by_user_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
    review_date TIMESTAMP,
    review_notes TEXT,
    expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS IDX_BLACKLIST_TYPE_IDENTIFIER ON blacklist(type, identifier);
CREATE INDEX IF NOT EXISTS IDX_BLACKLIST_STATUS ON blacklist(status);
CREATE INDEX IF NOT EXISTS IDX_BLACKLIST_IDENTIFIER ON blacklist(identifier);
CREATE INDEX IF NOT EXISTS IDX_BLACKLIST_REASON ON blacklist(reason);
CREATE INDEX IF NOT EXISTS IDX_BLACKLIST_EXPIRY ON blacklist(expiry_date);
CREATE INDEX IF NOT EXISTS IDX_BLACKLIST_CREATED_AT ON blacklist(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blacklist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blacklist_updated_at
    BEFORE UPDATE ON blacklist
    FOR EACH ROW
    EXECUTE FUNCTION update_blacklist_updated_at();

-- Insert some sample data for testing (optional)
-- INSERT INTO blacklist (type, identifier, reason, description, source) VALUES
-- ('wallet_address', '0x1234567890123456789012345678901234567890', 'suspicious_activity', 'Flagged for unusual transaction patterns', 'Internal'),
-- ('email', 'suspicious@example.com', 'fraud', 'Associated with fraudulent activities', 'External Report');

COMMENT ON TABLE blacklist IS 'AML blacklist for compliance monitoring';
COMMENT ON COLUMN blacklist.type IS 'Type of identifier being blacklisted';
COMMENT ON COLUMN blacklist.identifier IS 'The actual value being blacklisted';
COMMENT ON COLUMN blacklist.reason IS 'Reason for blacklisting';
COMMENT ON COLUMN blacklist.status IS 'Current status of the blacklist entry';
COMMENT ON COLUMN blacklist.expiry_date IS 'Optional expiry date for temporary blacklists';
