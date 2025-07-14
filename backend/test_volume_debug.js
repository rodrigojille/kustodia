const { Client } = require('pg');

async function debugVolumeQuery() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Test the volume query directly
    const volumeQuery = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payment 
      WHERE user_id = $1 
      AND status = 'completed'
    `;

    console.log('Running volume query for user ID 2...');
    const result = await client.query(volumeQuery, [2]);
    console.log('Volume query result:', result.rows);

    // Let's also check what amounts look like
    const detailQuery = `
      SELECT id, amount, status, created_at
      FROM payment 
      WHERE user_id = $1 
      AND status = 'completed'
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log('\nCompleted payments with amounts:');
    const detailResult = await client.query(detailQuery, [2]);
    console.log(detailResult.rows);

    // Check all payment statuses
    const statusQuery = `
      SELECT status, COUNT(*), SUM(CAST(amount AS NUMERIC)) as total_amount
      FROM payment 
      WHERE user_id = $1
      GROUP BY status
      ORDER BY COUNT(*) DESC
    `;

    console.log('\nPayment status breakdown:');
    const statusResult = await client.query(statusQuery, [2]);
    console.log(statusResult.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();
debugVolumeQuery();
