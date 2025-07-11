const { Client } = require('pg');
require('dotenv').config();

async function deleteAutomationStartedEvent() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'kustodia',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '140290'
  });

  try {
    await client.connect();
    console.log('🔗 Connected to database');

    // First, let's see what events exist for payment 88
    console.log('\n📋 Current events for payment 88:');
    const currentEvents = await client.query(`
      SELECT id, type, description, created_at 
      FROM payment_event 
      WHERE "paymentId" = 88 
      ORDER BY created_at ASC
    `);
    
    currentEvents.rows.forEach((event, index) => {
      console.log(`${index + 1}. [${event.id}] ${event.type}: ${event.description || 'No description'} (${event.created_at})`);
    });

    // Delete the automation started event
    console.log('\n🗑️ Deleting "Automation started" events...');
    const deleteResult = await client.query(`
      DELETE FROM payment_event 
      WHERE "paymentId" = 88 
      AND (
        type = 'automation_triggered' 
        OR description LIKE '%Automation started%'
        OR description LIKE '%automation started%'
      )
      RETURNING id, type, description
    `);

    if (deleteResult.rows.length > 0) {
      console.log(`✅ Deleted ${deleteResult.rows.length} event(s):`);
      deleteResult.rows.forEach(event => {
        console.log(`   - [${event.id}] ${event.type}: ${event.description}`);
      });
    } else {
      console.log('ℹ️ No "Automation started" events found for payment 88');
    }

    // Show remaining events
    console.log('\n📋 Remaining events for payment 88:');
    const remainingEvents = await client.query(`
      SELECT id, type, description, created_at 
      FROM payment_event 
      WHERE "paymentId" = 88 
      ORDER BY created_at ASC
    `);
    
    remainingEvents.rows.forEach((event, index) => {
      console.log(`${index + 1}. [${event.id}] ${event.type}: ${event.description || 'No description'} (${event.created_at})`);
    });

    console.log('\n🎉 Operation completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

deleteAutomationStartedEvent();
