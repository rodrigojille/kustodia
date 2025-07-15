#!/usr/bin/env node

/**
 * 🔍 Check Local Database Tables and Data
 */

const { Client } = require('pg');

const LOCAL_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'kustodia',
  user: 'postgres',
  password: '140290'
};

async function checkLocalDatabase() {
  const client = new Client(LOCAL_DB_CONFIG);
  
  try {
    await client.connect();
    console.log('🔗 Connected to local PostgreSQL database\n');

    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📊 LOCAL DATABASE TABLES:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Get row counts for main tables
    const mainTables = ['user', 'payment', 'escrow', 'notification', 'early_access_counter'];
    
    console.log('\n📈 TABLE ROW COUNTS:');
    for (const table of mainTables) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM "${table}"`);
        console.log(`  - ${table}: ${countResult.rows[0].count} rows`);
      } catch (error) {
        console.log(`  - ${table}: Table not found or error`);
      }
    }

    // Sample payment data
    try {
      const samplePayments = await client.query('SELECT id, sender_email, receiver_email, amount_mxn, status, created_at FROM "payment" ORDER BY created_at DESC LIMIT 3');
      console.log('\n💳 SAMPLE PAYMENTS:');
      samplePayments.rows.forEach(payment => {
        console.log(`  - ID: ${payment.id}, Amount: ${payment.amount_mxn} MXN, Status: ${payment.status}`);
      });
    } catch (error) {
      console.log('\n💳 No payment data found');
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await client.end();
  }
}

checkLocalDatabase();
