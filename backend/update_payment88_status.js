const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '140290', // Using the same password from previous scripts
  database: 'kustodia'
});

async function updatePayment88Status() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking current status of payment 88...');
    
    // Check current status
    const currentStatus = await client.query(
      'SELECT id, status, amount, created_at FROM payment WHERE id = 88'
    );
    
    if (currentStatus.rows.length === 0) {
      console.log('❌ Payment 88 not found');
      return;
    }
    
    console.log('📋 Current payment 88 status:', currentStatus.rows[0]);
    
    // Update status to 'escrowed'
    console.log('🔄 Updating payment 88 status to "escrowed"...');
    
    const updateResult = await client.query(
      'UPDATE payment SET status = $1, updated_at = NOW() WHERE id = 88 RETURNING *',
      ['escrowed']
    );
    
    console.log('✅ Payment 88 updated successfully:', updateResult.rows[0]);
    
    // Check associated escrow
    console.log('🔍 Checking associated escrow...');
    const escrowCheck = await client.query(`
      SELECT e.id, e.status, e.custody_amount, e.smart_contract_escrow_id
      FROM escrow e
      INNER JOIN payment p ON p.escrow_id = e.id
      WHERE p.id = 88
    `);
    
    if (escrowCheck.rows.length > 0) {
      console.log('📋 Associated escrow:', escrowCheck.rows[0]);
    } else {
      console.log('⚠️ No associated escrow found');
    }
    
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updatePayment88Status();
