const mysql = require('mysql2/promise');

// Database config
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '140290',
  database: process.env.DB_NAME || 'kustodia_local'
};

async function checkDoubleRelease() {
  const pool = await mysql.createPool(dbConfig);
  
  try {
    console.log('🔍 Checking Payment #112 and Escrow #99 Status...\n');
    
    // Get payment and escrow details
    const [results] = await pool.execute(`
      SELECT 
        p.id as payment_id,
        p.status as payment_status,
        p.payer_approval,
        p.payee_approval,
        p.payer_approval_timestamp,
        p.payee_approval_timestamp,
        e.id as escrow_id,
        e.smart_contract_escrow_id,
        e.status as escrow_status,
        e.release_tx_hash,
        e.updated_at as escrow_updated
      FROM payment p
      JOIN escrow e ON p.escrow_id = e.id
      WHERE p.id = 112
    `);
    
    if (results.length > 0) {
      const data = results[0];
      console.log('📋 Current Database Status:');
      console.log('   Payment ID:', data.payment_id);
      console.log('   Payment Status:', data.payment_status);
      console.log('   Payer Approval:', data.payer_approval, '(at', data.payer_approval_timestamp, ')');
      console.log('   Payee Approval:', data.payee_approval, '(at', data.payee_approval_timestamp, ')');
      console.log('   Database Escrow ID:', data.escrow_id);
      console.log('   Smart Contract Escrow ID:', data.smart_contract_escrow_id);
      console.log('   Escrow Status:', data.escrow_status);
      console.log('   Release TX Hash:', data.release_tx_hash);
      console.log('   Escrow Last Updated:', data.escrow_updated);
    }
    
    // Check payment events
    console.log('\n📜 Payment Events Timeline:');
    const [events] = await pool.execute(`
      SELECT type, description, created_at, is_automatic
      FROM payment_event
      WHERE payment_id = 112
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    events.forEach(event => {
      const auto = event.is_automatic ? '[AUTO]' : '[MANUAL]';
      console.log(`   ${event.created_at} ${auto} ${event.type}: ${event.description}`);
    });
    
    // Analysis
    console.log('\n🔍 Analysis:');
    console.log('   - The escrow was released TWICE on the blockchain');
    console.log('   - First release: Manual trigger from approval controller');
    console.log('   - Second release: Automatic trigger from cron job');
    console.log('   - Root cause: Escrow status not updated to "released" after manual release');
    console.log('   - The automation found escrow still "active" with dual approval');
    
    // Check if we need to fix the status
    if (results.length > 0 && results[0].escrow_status !== 'released') {
      console.log('\n⚠️  Escrow status needs to be updated to "released"');
      console.log('   This will prevent further release attempts');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkDoubleRelease();
