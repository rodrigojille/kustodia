const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'kustodia',
  user: 'postgres',
  password: '140290'
});

async function updatePayment87() {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking payment 87 current status...');
    
    const payment = await client.query('SELECT id, status, amount, escrow_id FROM payment WHERE id = 87');
    if (payment.rows.length === 0) {
      console.log('❌ Payment 87 not found');
      return;
    }
    
    console.log('📋 Payment 87 before update:', payment.rows[0]);
    
    if (payment.rows[0].escrow_id) {
      const escrow = await client.query('SELECT id, status, dispute_status FROM escrow WHERE id = $1', [payment.rows[0].escrow_id]);
      if (escrow.rows.length > 0) {
        console.log('🔐 Associated escrow:', escrow.rows[0]);
        
        // Update payment status to escrowed
        console.log('🔄 Updating payment 87 status to escrowed...');
        await client.query('UPDATE payment SET status = $1 WHERE id = $2', ['escrowed', 87]);
        
        console.log('✅ Payment 87 updated to escrowed status');
        
        // Verify update
        const updated = await client.query('SELECT id, status FROM payment WHERE id = 87');
        console.log('📋 Payment 87 after update:', updated.rows[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updatePayment87();
