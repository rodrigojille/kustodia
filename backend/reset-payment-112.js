const { Pool } = require('pg');

async function resetPayment112() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'kustodia',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '140290',
  });

  try {
    console.log('🔄 Resetting Payment 112 for retry...');
    
    // Reset payment status back to funded so automation can retry
    await pool.query(`
      UPDATE payment 
      SET status = 'funded' 
      WHERE id = 112 AND status != 'escrowed'
    `);
    
    // Reset escrow status back to pending
    await pool.query(`
      UPDATE escrow 
      SET status = 'pending', smart_contract_escrow_id = NULL, blockchain_tx_hash = NULL
      WHERE payment_id = 112 AND status != 'active'
    `);
    
    // Check current status
    const result = await pool.query(`
      SELECT p.id, p.status, e.status as escrow_status, e.smart_contract_escrow_id
      FROM payment p 
      LEFT JOIN escrow e ON p.escrow_id = e.id 
      WHERE p.id = 112
    `);
    
    if (result.rows.length > 0) {
      const payment = result.rows[0];
      console.log('✅ Payment 112 reset complete:');
      console.log(`   Payment Status: ${payment.status}`);
      console.log(`   Escrow Status: ${payment.escrow_status}`);
      console.log(`   Smart Contract ID: ${payment.smart_contract_escrow_id || 'None'}`);
      console.log('');
      console.log('🚀 Ready for automation retry!');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

resetPayment112();
