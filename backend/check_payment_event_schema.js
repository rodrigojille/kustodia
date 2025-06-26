const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kustodia',
  password: '140290',
  port: 5432,
});

async function checkPaymentEventSchema() {
  const client = await pool.connect();
  
  try {
    // Check payment_event table structure
    const columnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'payment_event'
      ORDER BY ordinal_position;
    `;
    
    const columnsResult = await client.query(columnsQuery);
    console.log('📊 payment_event table structure:');
    columnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Get a sample of payment events for payment 83
    const sampleQuery = `SELECT * FROM payment_event WHERE payment_id = 83 LIMIT 3`;
    const sampleResult = await client.query(sampleQuery);
    
    console.log('\n📋 Sample payment events for payment 83:');
    if (sampleResult.rows.length > 0) {
      console.log('Found', sampleResult.rows.length, 'events');
      sampleResult.rows.forEach((row, index) => {
        console.log(`Event ${index + 1}:`, JSON.stringify(row, null, 2));
      });
    } else {
      console.log('No events found for payment 83');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

checkPaymentEventSchema();
