#!/usr/bin/env node

/**
 * 🧪 SAFE TEST: Export local tickets as INSERT statements
 * Then we can run them via Heroku CLI
 */

const { Client } = require('pg');

const LOCAL_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'kustodia',
  user: 'postgres',
  password: '140290'
};

async function exportLocalTickets() {
  const client = new Client(LOCAL_DB_CONFIG);
  
  try {
    await client.connect();
    console.log('🔗 Connected to local database\n');

    // Get local tickets
    const result = await client.query('SELECT * FROM tickets');
    
    if (result.rows.length === 0) {
      console.log('❌ No tickets found in local database');
      return;
    }

    console.log(`📋 Found ${result.rows.length} tickets to export:\n`);
    
    for (const ticket of result.rows) {
      // Debug: show all fields
      console.log('--- TICKET DATA ---');
      console.log('All fields:', Object.keys(ticket));
      console.log(`UUID (id field): ${ticket.id}`);
      console.log(`Subject: ${ticket.subject}`);
      console.log(`Message: ${ticket.message}`);
      console.log(`Status: ${ticket.status}`);
      console.log(`User ID: ${ticket.userId}`);
      console.log(`Created: ${ticket.createdAt}`);
      console.log(`Updated: ${ticket.updatedAt}`);
      console.log('');

      // Generate INSERT statement - id field IS the UUID
      const createdAt = ticket.createdAt ? ticket.createdAt.toISOString() : new Date().toISOString();
      const updatedAt = ticket.updatedAt ? ticket.updatedAt.toISOString() : new Date().toISOString();
      
      const insertSQL = `INSERT INTO tickets (id, subject, message, status, "userId", "createdAt", "updatedAt") 
VALUES ('${ticket.id}', '${ticket.subject}', '${ticket.message}', '${ticket.status}', ${ticket.userId}, '${createdAt}', '${updatedAt}') 
ON CONFLICT (id) DO NOTHING;`;

      console.log('🔧 SQL COMMAND TO RUN:');
      console.log(insertSQL);
      console.log('\n');
    }

    console.log('🎯 NEXT STEPS:');
    console.log('1. Copy the SQL command above');
    console.log('2. Run: heroku pg:psql -a kustodia-backend -c "PASTE_SQL_HERE"');
    console.log('3. Verify with: heroku pg:psql -a kustodia-backend -c "SELECT * FROM tickets"');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

exportLocalTickets();
