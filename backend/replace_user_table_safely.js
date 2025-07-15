#!/usr/bin/env node

/**
 * 🛡️ SAFE USER TABLE REPLACEMENT
 * 
 * STRATEGY:
 * 1. Export all local users with their exact IDs
 * 2. Clear production user table completely
 * 3. Insert local users maintaining ID consistency
 * 4. This fixes the ID mismatch issue (local ID 2 = prod ID 1)
 */

const { Client } = require('pg');

const LOCAL_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'kustodia',
  user: 'postgres',
  password: '140290'
};

async function replaceUserTableSafely() {
  const localClient = new Client(LOCAL_DB_CONFIG);
  
  try {
    await localClient.connect();
    console.log('🔗 Connected to local database\n');

    // Get all local users
    const localUsers = await localClient.query('SELECT * FROM "user" ORDER BY id');
    
    console.log(`👥 Found ${localUsers.rows.length} local users to migrate\n`);

    console.log('🚨 CRITICAL PRODUCTION SAFETY STEPS:');
    console.log('');
    console.log('STEP 1: Backup production leads (CRITICAL - DO NOT SKIP)');
    console.log('heroku pg:psql -a kustodia-backend -c "CREATE TABLE lead_backup AS SELECT * FROM lead;"');
    console.log('');
    console.log('STEP 2: Backup early access counter (CRITICAL)');
    console.log('heroku pg:psql -a kustodia-backend -c "CREATE TABLE early_access_counter_backup AS SELECT * FROM early_access_counter;"');
    console.log('');
    console.log('STEP 3: Clear user table completely');
    console.log('heroku pg:psql -a kustodia-backend -c "DELETE FROM \\"user\\";"');
    console.log('');
    console.log('STEP 4: Reset user ID sequence');
    console.log('heroku pg:psql -a kustodia-backend -c "ALTER SEQUENCE user_id_seq RESTART WITH 1;"');
    console.log('');

    console.log('STEP 5: Insert all local users:');
    console.log('');

    for (const user of localUsers.rows) {
      const createdAt = user.createdAt ? user.createdAt.toISOString() : new Date().toISOString();
      const updatedAt = user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString();
      
      // Escape single quotes in strings
      const escapedName = (user.full_name || '').replace(/'/g, "''");
      const escapedHash = (user.password_hash || '').replace(/'/g, "''");
      
      console.log(`-- User ID ${user.id}: ${user.email}`);
      const insertSQL = `INSERT INTO "user" (id, email, full_name, kyc_status, wallet_address, deposit_clabe, payout_clabe, password_hash, "createdAt", "updatedAt") 
VALUES (${user.id}, '${user.email}', '${escapedName}', '${user.kyc_status || 'pending'}', '${user.wallet_address || ''}', '${user.deposit_clabe || ''}', '${user.payout_clabe || ''}', '${escapedHash}', '${createdAt}', '${updatedAt}');`;
      
      console.log(`heroku pg:psql -a kustodia-backend -c "${insertSQL}"`);
      console.log('');
    }

    console.log('STEP 6: Update sequence to continue from correct number');
    console.log(`heroku pg:psql -a kustodia-backend -c "SELECT setval('user_id_seq', ${Math.max(...localUsers.rows.map(u => u.id))});"`);
    console.log('');

    console.log('STEP 7: Verify migration');
    console.log('heroku pg:psql -a kustodia-backend -c "SELECT id, email, full_name FROM \\"user\\" ORDER BY id;"');
    console.log('');

    console.log('🎯 EXPECTED RESULT:');
    for (const user of localUsers.rows) {
      console.log(`  ID ${user.id}: ${user.email} (${user.full_name || 'No name'})`);
    }

    console.log('');
    console.log('⚠️  IMPORTANT NOTES:');
    console.log('- This completely replaces the user table');
    console.log('- Leads and early_access_counter are preserved');
    console.log('- User IDs will match local database exactly');
    console.log('- Foreign key relationships will work correctly');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await localClient.end();
  }
}

replaceUserTableSafely();
