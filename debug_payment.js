const { Pool } = require('pg');

async function checkPayment() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'kustodia',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    // Check payment ID 16 specifically
    const result = await pool.query(
      'SELECT id, payer_email, recipient_email, description, payment_type, amount, status FROM payment WHERE id = $1',
      [16]
    );
    
    console.log('=== Payment ID 16 from database ===');
    console.log(JSON.stringify(result.rows[0], null, 2));
    
    // Check table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'payment' 
      AND column_name IN ('payer_email', 'recipient_email', 'description', 'payment_type')
      ORDER BY column_name;
    `);
    
    console.log('\n=== Payment table structure ===');
    console.log(columns.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkPayment();
