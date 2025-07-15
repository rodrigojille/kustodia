#!/usr/bin/env node

/**
 * 🧪 STEP 1: Migrate Users First
 * 
 * CRITICAL STRATEGY:
 * - Update rodrigojille6@gmail.com with local data
 * - Add other local users safely
 * - Preserve existing production user ID
 */

const { Client } = require('pg');
require('dotenv').config();

const LOCAL_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'kustodia',
  user: 'postgres',
  password: '140290'
};

async function migrateUsersFirst() {
  const localClient = new Client(LOCAL_DB_CONFIG);
  
  try {
    await localClient.connect();
    console.log('🔗 Connected to local database\n');

    // Get all local users
    const localUsers = await localClient.query('SELECT * FROM "user" ORDER BY id');
    
    console.log(`👥 Found ${localUsers.rows.length} local users:\n`);
    
    for (const user of localUsers.rows) {
      console.log('--- USER DATA ---');
      console.log(`Local ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.full_name || 'N/A'}`);
      console.log(`KYC Status: ${user.kyc_status || 'N/A'}`);
      console.log(`Wallet: ${user.wallet_address || 'N/A'}`);
      console.log(`Created: ${user.createdAt}`);
      console.log('');

      // Generate SQL based on email
      if (user.email === 'rodrigojille6@gmail.com') {
        console.log('🔄 UPDATE EXISTING PRODUCTION USER:');
        const updateSQL = `UPDATE "user" SET 
  full_name = '${user.full_name || ''}',
  kyc_status = '${user.kyc_status || 'pending'}',
  wallet_address = '${user.wallet_address || ''}',
  deposit_clabe = '${user.deposit_clabe || ''}',
  payout_clabe = '${user.payout_clabe || ''}',
  password_hash = '${user.password_hash || ''}',
  "updatedAt" = '${new Date().toISOString()}'
WHERE email = 'rodrigojille6@gmail.com'
RETURNING id, email, full_name;`;
        
        console.log(updateSQL);
        console.log('');
        
      } else {
        console.log('➕ INSERT NEW USER:');
        const createdAt = user.createdAt ? user.createdAt.toISOString() : new Date().toISOString();
        const updatedAt = user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString();
        
        const insertSQL = `INSERT INTO "user" (email, full_name, kyc_status, wallet_address, deposit_clabe, payout_clabe, password_hash, "createdAt", "updatedAt") 
VALUES ('${user.email}', '${user.full_name || ''}', '${user.kyc_status || 'pending'}', '${user.wallet_address || ''}', '${user.deposit_clabe || ''}', '${user.payout_clabe || ''}', '${user.password_hash || ''}', '${createdAt}', '${updatedAt}') 
ON CONFLICT (email) DO NOTHING
RETURNING id, email, full_name;`;
        
        console.log(insertSQL);
        console.log('');
      }
    }

    console.log('🎯 EXECUTE STEPS:');
    console.log('1. Copy each SQL command above');
    console.log('2. Run: heroku pg:psql -a kustodia-backend -c "PASTE_SQL_HERE"');
    console.log('3. Verify: heroku pg:psql -a kustodia-backend -c "SELECT id, email, full_name FROM \\"user\\" ORDER BY id"');
    console.log('4. Note the user IDs for mapping in dependent tables');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await localClient.end();
  }
}

migrateUsersFirst();
