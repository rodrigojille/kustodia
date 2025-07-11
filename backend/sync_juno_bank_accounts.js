/**
 * Sync missing juno_bank_account_id values from Juno API
 * This script will:
 * 1. Fetch all registered bank accounts from Juno
 * 2. Match them with users who have payout_clabe but missing juno_bank_account_id
 * 3. Update the database with the correct juno_bank_account_id
 */

const { DataSource } = require('typeorm');
const { getRegisteredBankAccounts } = require('./dist/services/junoService');

// Database configuration
const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '140290',
  database: 'kustodia',
  synchronize: false,
  logging: true,
  entities: ['src/entity/*.ts'],
});

async function syncJunoBankAccounts() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    
    console.log('🔄 Fetching registered bank accounts from Juno...');
    const junoBankAccounts = await getRegisteredBankAccounts();
    
    console.log(`✅ Found ${junoBankAccounts.length} registered bank accounts in Juno`);
    junoBankAccounts.forEach(account => {
      console.log(`  - CLABE: ${account.clabe}, ID: ${account.id}, Name: ${account.account_holder_name}`);
    });
    
    console.log('🔄 Fetching users with missing juno_bank_account_id...');
    const users = await AppDataSource.query(`
      SELECT id, email, full_name, payout_clabe, juno_bank_account_id 
      FROM "user" 
      WHERE payout_clabe IS NOT NULL AND juno_bank_account_id IS NULL
    `);
    
    console.log(`✅ Found ${users.length} users needing Juno bank account ID sync`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      // Find matching Juno bank account by CLABE
      const matchingJunoAccount = junoBankAccounts.find(
        account => account.clabe === user.payout_clabe
      );
      
      if (matchingJunoAccount) {
        console.log(`🔄 Updating user ${user.email} with Juno bank account ID: ${matchingJunoAccount.id}`);
        
        await AppDataSource.query(`
          UPDATE "user" 
          SET juno_bank_account_id = $1 
          WHERE id = $2
        `, [matchingJunoAccount.id, user.id]);
        
        updatedCount++;
        console.log(`✅ Updated user ${user.email}`);
      } else {
        console.log(`⚠️  No matching Juno bank account found for user ${user.email} with CLABE ${user.payout_clabe}`);
      }
    }
    
    console.log(`\n🎉 Sync completed! Updated ${updatedCount} users with Juno bank account IDs`);
    
    // Verify the updates
    console.log('🔍 Verifying updates...');
    const updatedUsers = await AppDataSource.query(`
      SELECT id, email, payout_clabe, juno_bank_account_id 
      FROM "user" 
      WHERE payout_clabe IS NOT NULL
    `);
    
    updatedUsers.forEach(user => {
      const status = user.juno_bank_account_id ? '✅ SYNCED' : '❌ MISSING';
      console.log(`  ${status} - ${user.email}: CLABE ${user.payout_clabe} -> Juno ID ${user.juno_bank_account_id || 'NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error during sync:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('🔄 Database connection closed');
  }
}

// Run the sync
syncJunoBankAccounts();
