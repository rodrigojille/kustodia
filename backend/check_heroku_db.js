#!/usr/bin/env node

/**
 * 🔍 Check Heroku Production Database Tables and Data
 * CRITICAL: We need to see what data already exists before migration
 */

const { Client } = require('pg');

// Load environment variables
require('dotenv').config();

const HEROKU_DB_CONFIG = {
  connectionString: process.env.DATABASE_URL_PRODUCTION,
  ssl: { rejectUnauthorized: false }
};

async function checkHerokuDatabase() {
  const client = new Client(HEROKU_DB_CONFIG);
  
  try {
    await client.connect();
    console.log('🔗 Connected to Heroku production database\n');

    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📊 HEROKU PRODUCTION TABLES:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Get row counts for ALL tables (not just main ones)
    console.log('\n📈 PRODUCTION TABLE ROW COUNTS:');
    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.table_name;
      try {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const count = countResult.rows[0].count;
        console.log(`  - ${tableName}: ${count} rows ${count > 0 ? '⚠️  HAS DATA' : '✅ EMPTY'}`);
      } catch (error) {
        console.log(`  - ${tableName}: Error reading table`);
      }
    }

    // CRITICAL: Check lead and early_access_counter specifically
    console.log('\n🚨 CRITICAL PRODUCTION DATA CHECK:');
    
    try {
      const leadCount = await client.query('SELECT COUNT(*) as count FROM "lead"');
      console.log(`  - LEAD TABLE: ${leadCount.rows[0].count} rows ${leadCount.rows[0].count > 0 ? '🔒 MUST PRESERVE' : '✅ Safe to add'}`);
      
      if (leadCount.rows[0].count > 0) {
        const sampleLeads = await client.query('SELECT id, email, created_at FROM "lead" ORDER BY created_at DESC LIMIT 3');
        console.log('    Recent leads:');
        sampleLeads.rows.forEach(lead => {
          console.log(`      - ${lead.email} (ID: ${lead.id}) - ${lead.created_at}`);
        });
      }
    } catch (error) {
      console.log('  - LEAD TABLE: Not found or error');
    }

    try {
      const eacCount = await client.query('SELECT COUNT(*) as count FROM "early_access_counter"');
      console.log(`  - EARLY ACCESS COUNTER: ${eacCount.rows[0].count} rows ${eacCount.rows[0].count > 0 ? '🔒 MUST PRESERVE' : '✅ Safe to add'}`);
      
      if (eacCount.rows[0].count > 0) {
        const eacData = await client.query('SELECT * FROM "early_access_counter" LIMIT 1');
        console.log('    Counter value:', eacData.rows[0]);
      }
    } catch (error) {
      console.log('  - EARLY ACCESS COUNTER: Not found or error');
    }

    // Check users (to avoid conflicts)
    try {
      const userCount = await client.query('SELECT COUNT(*) as count FROM "user"');
      console.log(`  - USER TABLE: ${userCount.rows[0].count} rows`);
      
      if (userCount.rows[0].count > 0) {
        const sampleUsers = await client.query('SELECT id, email, created_at FROM "user" ORDER BY created_at DESC LIMIT 3');
        console.log('    Recent users:');
        sampleUsers.rows.forEach(user => {
          console.log(`      - ${user.email} (ID: ${user.id})`);
        });
      }
    } catch (error) {
      console.log('  - USER TABLE: Not found or error');
    }

    console.log('\n🎯 MIGRATION STRATEGY RECOMMENDATIONS:');
    console.log('  - Use INSERT ... ON CONFLICT DO NOTHING for all tables');
    console.log('  - NEVER UPDATE existing lead or early_access_counter data');
    console.log('  - Check for email conflicts before user migration');
    console.log('  - Migrate payments/escrows only if they don\'t exist');

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('\n💡 Make sure DATABASE_URL is set in your environment variables');
  } finally {
    await client.end();
  }
}

checkHerokuDatabase();
