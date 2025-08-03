require('dotenv').config({ path: '../.env' });
const AppDataSource = require('../dist/ormconfig').default;

async function setupMultisigWallets() {
  try {
    await AppDataSource.initialize();
    console.log('🔧 Setting up Multi-sig Wallet Configurations...\n');

    // Check if table exists
    const result = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'multisig_wallet_config'
    `);

    if (result.length === 0) {
      console.log('❌ Table multisig_wallet_config does not exist');
      console.log('Creating table...');
      
      await AppDataSource.query(`
        CREATE TABLE IF NOT EXISTS multisig_wallet_config (
          id SERIAL PRIMARY KEY,
          wallet_address VARCHAR(42) UNIQUE NOT NULL,
          wallet_type VARCHAR(50) DEFAULT 'high_value',
          required_signatures INTEGER DEFAULT 2,
          total_owners INTEGER DEFAULT 3,
          threshold_min_usd DECIMAL(15,2) DEFAULT 1000.00,
          threshold_max_usd DECIMAL(15,2),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      await AppDataSource.query(`
        CREATE TABLE IF NOT EXISTS multisig_wallet_owners (
          id SERIAL PRIMARY KEY,
          wallet_address VARCHAR(42) NOT NULL,
          owner_address VARCHAR(42) NOT NULL,
          owner_name VARCHAR(255),
          owner_email VARCHAR(255),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          FOREIGN KEY (wallet_address) REFERENCES multisig_wallet_config(wallet_address)
        )
      `);

      console.log('✅ Tables created successfully');
    }

    // Clear existing configurations
    await AppDataSource.query('DELETE FROM multisig_wallet_owners');
    await AppDataSource.query('DELETE FROM multisig_wallet_config');

    console.log('🗑️ Cleared existing configurations');

    // Insert wallet configurations
    const walletConfigs = [
      {
        address: '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b',
        type: 'standard',
        required_signatures: 1,
        total_owners: 1,
        threshold_min_usd: 0,
        threshold_max_usd: 500
      },
      {
        address: '0x1234567890123456789012345678901234567890',
        type: 'high_value',
        required_signatures: 2,
        total_owners: 3,
        threshold_min_usd: 500,
        threshold_max_usd: 5000
      },
      {
        address: '0x9876543210987654321098765432109876543210',
        type: 'enterprise',
        required_signatures: 3,
        total_owners: 5,
        threshold_min_usd: 5000,
        threshold_max_usd: null
      }
    ];

    for (const config of walletConfigs) {
      await AppDataSource.query(`
        INSERT INTO multisig_wallet_config (
          wallet_address, wallet_type, required_signatures, total_owners,
          threshold_min_usd, threshold_max_usd, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        config.address,
        config.type,
        config.required_signatures,
        config.total_owners,
        config.threshold_min_usd,
        config.threshold_max_usd,
        true
      ]);

      console.log(`✅ Created ${config.type} wallet config: ${config.address}`);
      console.log(`   Threshold: $${config.threshold_min_usd} - $${config.threshold_max_usd || '∞'} USD`);
      console.log(`   Signatures: ${config.required_signatures}/${config.total_owners}\n`);
    }

    // Add wallet owners
    const owners = [
      {
        wallet_address: '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b',
        owner_address: '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b',
        owner_name: 'Bridge Wallet Admin',
        owner_email: 'admin@kustodia.mx'
      },
      {
        wallet_address: '0x1234567890123456789012345678901234567890',
        owner_address: '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b',
        owner_name: 'Admin 1',
        owner_email: 'admin1@kustodia.mx'
      },
      {
        wallet_address: '0x1234567890123456789012345678901234567890',
        owner_address: '0x486B88Ca87533294FB45247387169f081f3102ff',
        owner_name: 'Admin 2',
        owner_email: 'admin2@kustodia.mx'
      }
    ];

    for (const owner of owners) {
      await AppDataSource.query(`
        INSERT INTO multisig_wallet_owners (
          wallet_address, owner_address, owner_name, owner_email, is_active
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        owner.wallet_address,
        owner.owner_address,
        owner.owner_name,
        owner.owner_email,
        true
      ]);
    }

    console.log('✅ Added wallet owners');

    // Test the configuration
    const testConfigs = await AppDataSource.query(`
      SELECT 
        mwc.*,
        array_agg(
          json_build_object(
            'address', mwo.owner_address,
            'name', mwo.owner_name,
            'email', mwo.owner_email
          )
        ) FILTER (WHERE mwo.owner_address IS NOT NULL) as owners
      FROM multisig_wallet_config mwc
      LEFT JOIN multisig_wallet_owners mwo ON mwc.wallet_address = mwo.wallet_address
      WHERE mwc.is_active = true
      GROUP BY mwc.id, mwc.wallet_address, mwc.wallet_type, mwc.required_signatures, 
               mwc.total_owners, mwc.threshold_min_usd, mwc.threshold_max_usd, mwc.is_active
      ORDER BY mwc.threshold_min_usd
    `);

    console.log('\n🎯 Final Configuration:');
    testConfigs.forEach(config => {
      console.log(`${config.wallet_type.toUpperCase()}: ${config.wallet_address}`);
      console.log(`  Threshold: $${config.threshold_min_usd} - $${config.threshold_max_usd || '∞'} USD`);
      console.log(`  Signatures: ${config.required_signatures}/${config.total_owners}`);
      console.log(`  Owners: ${config.owners?.length || 0}`);
      console.log('');
    });

    console.log('🚀 Multi-sig wallet configurations setup complete!');
    console.log('Now test with Payment 141 ($30,000 MXN = $1,500 USD)');

  } catch (error) {
    console.error('❌ Error setting up multi-sig wallets:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

setupMultisigWallets();
