require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function updatePayment81Database() {
  console.log('📝 UPDATING PAYMENT 81 DATABASE STATUS');
  console.log('=====================================');
  
  try {
    await client.connect();
    
    // Step 1: Check current status
    console.log('📋 Current Database Status:');
    const currentStatus = await client.query(`
      SELECT 
        p.id as payment_id,
        p.status as payment_status,
        p.amount,
        p.recipient_email,
        e.id as escrow_id,
        e.status as escrow_status,
        e.custody_amount,
        e.release_tx_hash
      FROM payment p
      JOIN escrow e ON e.payment_id = p.id
      WHERE p.id = 81
    `);
    
    if (currentStatus.rows.length === 0) {
      throw new Error('Payment 81 not found');
    }
    
    const current = currentStatus.rows[0];
    console.log(`Payment Status: ${current.payment_status}`);
    console.log(`Escrow Status: ${current.escrow_status}`);
    console.log(`Amount: ${current.amount} MXN`);
    console.log(`Custody Amount: ${current.custody_amount} MXNB`);
    console.log(`Release TX Hash: ${current.release_tx_hash || 'None'}`);
    console.log('');
    
    // Step 2: Update escrow status to released
    console.log('🔄 Updating escrow status to "released"...');
    await client.query(`
      UPDATE escrow 
      SET 
        status = 'released',
        release_tx_hash = $1
      WHERE payment_id = 81
    `, ['blockchain_released_via_smart_contract']);
    
    console.log('✅ Escrow status updated to "released"');
    
    // Step 3: Insert escrow release event
    console.log('📝 Logging escrow release event...');
    await client.query(`
      INSERT INTO payment_event (payment_id, type, timestamp)
      VALUES ($1, $2, $3)
    `, [81, 'escrow_released', new Date()]);
    
    console.log('✅ Escrow release event logged');
    
    // Step 4: Verify updates
    console.log('');
    console.log('📋 Updated Database Status:');
    const updatedStatus = await client.query(`
      SELECT 
        p.id as payment_id,
        p.status as payment_status,
        e.status as escrow_status,
        e.release_tx_hash
      FROM payment p
      JOIN escrow e ON e.payment_id = p.id
      WHERE p.id = 81
    `);
    
    const updated = updatedStatus.rows[0];
    console.log(`Payment Status: ${updated.payment_status}`);
    console.log(`Escrow Status: ${updated.escrow_status}`);
    console.log(`Release TX Hash: ${updated.release_tx_hash}`);
    
    console.log('');
    console.log('🎯 DATABASE UPDATE SUMMARY:');
    console.log('✅ Escrow status: pending → released');
    console.log('✅ Release transaction hash added');
    console.log('✅ Escrow release event logged');
    console.log('✅ Ready for MXNB redemption');
    
    return {
      success: true,
      escrowStatus: updated.escrow_status,
      paymentStatus: updated.payment_status
    };
    
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

updatePayment81Database().then(result => {
  console.log('\n📊 UPDATE RESULT:');
  console.log(JSON.stringify(result, null, 2));
});
