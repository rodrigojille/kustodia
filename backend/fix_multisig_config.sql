-- Clean up fake multisig data and insert real Gnosis Safe configuration
-- Remove fake data
DELETE FROM multisig_wallet_owners;
DELETE FROM multisig_wallet_config;

-- Insert real wallet configuration from .env
-- Using a single config that handles both high-value and enterprise thresholds
INSERT INTO multisig_wallet_config (wallet_address, wallet_type, required_signatures, total_owners, threshold_min_usd, threshold_max_usd) 
VALUES 
    ('0xA8F1B1Bac8D3B1c5D28A7eD91fa01e96eDB6711c', 'enterprise', 2, 4, 1000.00, NULL);

-- Insert real wallet owners from HIGH_VALUE_MULTISIG_OWNERS
INSERT INTO multisig_wallet_owners (wallet_config_id, owner_address, owner_name, owner_email)
SELECT 
    wc.id,
    owner_addr,
    owner_name,
    owner_email
FROM multisig_wallet_config wc
CROSS JOIN (
    VALUES 
        ('0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b', 'Bridge Wallet Admin', 'admin@kustodia.mx'),
        ('0xE120E428b2bB7E28B21D2634ad1d601c6Cd6b33F', 'Multisig Admin 2', 'admin2@kustodia.mx'),
        ('0x342Fe8428e7eEF4A1047B3ba4A9a1a8DCD42b3c7', 'Multisig Admin 3', 'admin3@kustodia.mx'),
        ('0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F', 'Multisig Admin 4', 'admin4@kustodia.mx')
) AS owners(owner_addr, owner_name, owner_email)
WHERE wc.wallet_address = '0xA8F1B1Bac8D3B1c5D28A7eD91fa01e96eDB6711c';

-- Verify the data
SELECT 'Wallet Configs:' as info;
SELECT * FROM multisig_wallet_config;

SELECT 'Wallet Owners:' as info;
SELECT 
    mwo.id,
    mwc.wallet_type,
    mwc.wallet_address,
    mwo.owner_address,
    mwo.owner_name,
    mwo.owner_email
FROM multisig_wallet_owners mwo
JOIN multisig_wallet_config mwc ON mwo.wallet_config_id = mwc.id
ORDER BY mwc.wallet_type, mwo.id;
