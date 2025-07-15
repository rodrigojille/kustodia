#!/usr/bin/env node

/**
 * 🔄 COMPLETE USER DATA SYNC
 * 
 * Fix all missing/incorrect user data in production
 * Sync ALL fields from local to production
 */

const { Client } = require('pg');

const LOCAL_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'kustodia',
  user: 'postgres',
  password: '140290'
};

async function completeUserSync() {
  const localClient = new Client(LOCAL_DB_CONFIG);
  
  try {
    await localClient.connect();
    console.log('🔗 Connected to local database\n');

    // Get ALL local user data with ALL fields
    const localUsers = await localClient.query('SELECT * FROM "user" ORDER BY id');
    
    console.log(`👥 Syncing ${localUsers.rows.length} users with COMPLETE data:\n`);

    for (const user of localUsers.rows) {
      console.log(`--- UPDATING USER ID ${user.id}: ${user.email} ---`);
      
      // Debug: show local data
      console.log('Local data:');
      console.log(`  Role: ${user.role || 'null'}`);
      console.log(`  Email verified: ${user.email_verified}`);
      console.log(`  Email token: ${user.email_verification_token || 'null'}`);
      console.log(`  Truora ID: ${user.truora_process_id || 'null'}`);
      console.log(`  Created: ${user.created_at}`);
      console.log(`  Updated: ${user.updated_at}`);
      console.log('');

      // Create comprehensive UPDATE statement
      const updateSQL = `UPDATE "user" SET 
  full_name = '${(user.full_name || '').replace(/'/g, "''")}',
  kyc_status = '${user.kyc_status || 'pending'}',
  wallet_address = '${user.wallet_address || ''}',
  deposit_clabe = '${user.deposit_clabe || ''}',
  payout_clabe = '${user.payout_clabe || ''}',
  password_hash = '${(user.password_hash || '').replace(/'/g, "''")}',
  email_verified = ${user.email_verified || false},
  email_verification_token = ${user.email_verification_token ? `'${user.email_verification_token}'` : 'NULL'},
  password_reset_token = ${user.password_reset_token ? `'${user.password_reset_token}'` : 'NULL'},
  password_reset_expires = ${user.password_reset_expires ? `'${user.password_reset_expires.toISOString()}'` : 'NULL'},
  truora_process_id = ${user.truora_process_id ? `'${user.truora_process_id}'` : 'NULL'},
  role = '${user.role || 'user'}',
  portal_share = ${user.portal_share ? `'${user.portal_share}'` : 'NULL'},
  juno_bank_account_id = ${user.juno_bank_account_id ? `'${user.juno_bank_account_id}'` : 'NULL'},
  portal_client_id = ${user.portal_client_id ? `'${user.portal_client_id}'` : 'NULL'},
  googleid = ${user.googleid ? `'${user.googleid}'` : 'NULL'},
  googleaccesstoken = ${user.googleaccesstoken ? `'${user.googleaccesstoken.replace(/'/g, "''")}'` : 'NULL'},
  googlerefreshtoken = ${user.googlerefreshtoken ? `'${user.googlerefreshtoken.replace(/'/g, "''")}'` : 'NULL'},
  mxnb_balance = ${user.mxnb_balance || 0},
  created_at = '${user.created_at ? user.created_at.toISOString() : new Date().toISOString()}',
  updated_at = '${user.updated_at ? user.updated_at.toISOString() : new Date().toISOString()}'
WHERE id = ${user.id};`;

      console.log('🔧 UPDATE SQL:');
      console.log(updateSQL);
      console.log('');
      console.log(`heroku pg:psql -a kustodia-backend -c "${updateSQL}"`);
      console.log('');
      console.log('---');
      console.log('');
    }

    console.log('🎯 EXECUTE ALL UPDATES ABOVE, THEN VERIFY:');
    console.log('heroku pg:psql -a kustodia-backend -c "SELECT id, email, role, email_verified, truora_process_id FROM \\"user\\" ORDER BY id;"');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await localClient.end();
  }
}

completeUserSync();
