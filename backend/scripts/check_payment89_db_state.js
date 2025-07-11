const { Client } = require('pg');

async function checkPayment89DbState() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Direct SQL query to check Payment 89
    const result = await client.query(
      'SELECT id, status, reference, transaction_id, updated_at FROM payment WHERE id = $1',
      [89]
    );

    if (result.rows.length === 0) {
      console.log('❌ Payment 89 not found in database');
      return;
    }

    const payment = result.rows[0];
    console.log('\n🔍 Payment 89 Database State:');
    console.log(`  - ID: ${payment.id}`);
    console.log(`  - Status: ${payment.status}`);
    console.log(`  - Reference: ${payment.reference || 'NULL'}`);
    console.log(`  - Transaction ID: ${payment.transaction_id || 'NULL'}`);
    console.log(`  - Updated At: ${payment.updated_at}`);

    // Check events
    const eventsResult = await client.query(
      'SELECT type, description, created_at FROM payment_event WHERE "paymentId" = $1 ORDER BY created_at DESC LIMIT 5',
      [89]
    );

    console.log('\n📋 Recent Payment Events:');
    if (eventsResult.rows.length === 0) {
      console.log('  - No events found');
    } else {
      eventsResult.rows.forEach(event => {
        console.log(`  - ${event.created_at}: ${event.type} - ${event.description}`);
      });
    }

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

checkPayment89DbState().catch(console.error);
