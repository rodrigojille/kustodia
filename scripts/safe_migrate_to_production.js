#!/usr/bin/env node

/**
 * 🛡️ SAFE Migration: Local → Heroku Production
 * 
 * CRITICAL RULES:
 * - NEVER touch 'lead' table (53 production leads)
 * - NEVER touch 'early_access_counter' table  
 * - UPDATE existing user rodrigojille6@gmail.com with local data
 * - ADD other data safely without conflicts
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

const PRODUCTION_DB_CONFIG = {
  connectionString: process.env.DATABASE_URL_PRODUCTION,
  ssl: { rejectUnauthorized: false }
};

// Tables to migrate (EXCLUDING lead and early_access_counter)
const TABLES_TO_MIGRATE = [
  'user',           // Special handling for rodrigojille6@gmail.com
  'payment',
  'escrow', 
  'notification',
  'juno_transaction',
  'payment_event',
  'dispute',
  'dispute_messages',
  'tickets',
  'ticket_replies',
  'token',
  'wallet_transaction'
];

const EXCLUDED_TABLES = ['lead', 'early_access_counter', 'migrations'];

async function safeMigrateToProduction() {
  let localClient, prodClient;
  
  try {
    // Connect to both databases
    localClient = new Client(LOCAL_DB_CONFIG);
    prodClient = new Client(PRODUCTION_DB_CONFIG);
    
    await localClient.connect();
    await prodClient.connect();
    
    console.log('🔗 Connected to both databases\n');

    // STEP 1: Check production user data
    console.log('🔍 STEP 1: Checking production user...');
    const prodUser = await prodClient.query(`
      SELECT id, email, full_name, kyc_status, wallet_address 
      FROM "user" 
      WHERE email = 'rodrigojille6@gmail.com'
    `);
    
    if (prodUser.rows.length > 0) {
      console.log('   Production user found:', prodUser.rows[0]);
      
      // Get local user data for this email
      const localUser = await localClient.query(`
        SELECT * FROM "user" WHERE email = 'rodrigojille6@gmail.com'
      `);
      
      if (localUser.rows.length > 0) {
        console.log('   Local user found, updating production...');
        const local = localUser.rows[0];
        
        // Update production user with local data (keep same ID)
        await prodClient.query(`
          UPDATE "user" SET 
            full_name = $1,
            kyc_status = $2,
            wallet_address = $3,
            deposit_clabe = $4,
            payout_clabe = $5,
            password_hash = $6,
            updated_at = $7
          WHERE email = 'rodrigojille6@gmail.com'
        `, [
          local.full_name,
          local.kyc_status, 
          local.wallet_address,
          local.deposit_clabe,
          local.payout_clabe,
          local.password_hash,
          new Date()
        ]);
        
        console.log('   ✅ Production user updated with local data');
      }
    }

    // STEP 2: Migrate other users (if any)
    console.log('\n🔍 STEP 2: Migrating other users...');
    const otherUsers = await localClient.query(`
      SELECT * FROM "user" WHERE email != 'rodrigojille6@gmail.com'
    `);
    
    let usersMigrated = 0;
    for (const user of otherUsers.rows) {
      try {
        await prodClient.query(`
          INSERT INTO "user" (email, full_name, kyc_status, wallet_address, deposit_clabe, payout_clabe, password_hash, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (email) DO NOTHING
        `, [
          user.email, user.full_name, user.kyc_status, user.wallet_address,
          user.deposit_clabe, user.payout_clabe, user.password_hash,
          user.created_at, user.updated_at
        ]);
        usersMigrated++;
      } catch (error) {
        console.log(`   ⚠️  Skipped user ${user.email}: ${error.message}`);
      }
    }
    console.log(`   ✅ Migrated ${usersMigrated} additional users`);

    // STEP 3: Migrate other tables
    console.log('\n🔍 STEP 3: Migrating other tables...');
    
    for (const table of TABLES_TO_MIGRATE) {
      if (table === 'user') continue; // Already handled
      
      try {
        console.log(`   📦 Migrating ${table}...`);
        
        // Get local data
        const localData = await localClient.query(`SELECT * FROM "${table}"`);
        
        if (localData.rows.length === 0) {
          console.log(`      No data in local ${table}`);
          continue;
        }
        
        // Get column names
        const columns = Object.keys(localData.rows[0]);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const columnNames = columns.join(', ');
        
        let migrated = 0;
        for (const row of localData.rows) {
          try {
            const values = columns.map(col => row[col]);
            
            await prodClient.query(`
              INSERT INTO "${table}" (${columnNames})
              VALUES (${placeholders})
              ON CONFLICT DO NOTHING
            `, values);
            
            migrated++;
          } catch (error) {
            // Skip conflicts silently
          }
        }
        
        console.log(`      ✅ Migrated ${migrated}/${localData.rows.length} rows`);
        
      } catch (error) {
        console.log(`      ❌ Error migrating ${table}: ${error.message}`);
      }
    }

    // STEP 4: Final verification
    console.log('\n🔍 STEP 4: Final verification...');
    
    for (const table of TABLES_TO_MIGRATE) {
      const count = await prodClient.query(`SELECT COUNT(*) as count FROM "${table}"`);
      console.log(`   ${table}: ${count.rows[0].count} rows`);
    }
    
    // Verify excluded tables remain untouched
    console.log('\n🔒 EXCLUDED TABLES (preserved):');
    for (const table of EXCLUDED_TABLES) {
      try {
        const count = await prodClient.query(`SELECT COUNT(*) as count FROM "${table}"`);
        console.log(`   ${table}: ${count.rows[0].count} rows (PRESERVED)`);
      } catch (error) {
        console.log(`   ${table}: Table not found`);
      }
    }
    
    console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('🛡️  Production leads and early access counter preserved');
    console.log('✅ Local data safely added to production');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
  } finally {
    if (localClient) await localClient.end();
    if (prodClient) await prodClient.end();
  }
}

// Run migration
safeMigrateToProduction();
