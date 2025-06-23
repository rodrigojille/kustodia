require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function quickCheck() {
  try {
    await client.connect();
    
    // Check escrow values
    const escrowResult = await client.query(`
      SELECT 
        e.custody_amount, 
        e.release_amount, 
        e.status as escrow_status,
        p.status as payment_status,
        p.amount as payment_amount
      FROM escrow e 
      JOIN payment p ON p.id = e.payment_id 
      WHERE e.payment_id = 81
    `);
    
    console.log('🔍 DATABASE VALUES:');
    const row = escrowResult.rows[0];
    console.log(`Payment Status: ${row.payment_status}`);
    console.log(`Payment Amount: ${row.payment_amount}`);
    console.log(`Escrow Status: ${row.escrow_status}`);
    console.log(`Custody Amount: ${row.custody_amount}`);
    console.log(`Release Amount: ${row.release_amount}`);
    
    const montoPorPagar = parseFloat(row.custody_amount) - parseFloat(row.release_amount || 0);
    console.log(`Calculated Monto Por Pagar: ${montoPorPagar}`);
    
    // Check some recent events
    const eventsResult = await client.query(`
      SELECT type, description
      FROM payment_event
      WHERE "paymentId" = 81
      ORDER BY created_at DESC
      LIMIT 3
    `);
    
    console.log('\n📋 RECENT EVENTS:');
    eventsResult.rows.forEach((event, i) => {
      console.log(`${i+1}. ${event.type}: ${event.description || 'No description'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

quickCheck();
