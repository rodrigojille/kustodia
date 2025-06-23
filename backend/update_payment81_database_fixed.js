require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function updatePayment81DatabaseFixed() {
  console.log('📝 UPDATING PAYMENT 81 DATABASE STATUS (FIXED)');
  console.log('==============================================');
  
  try {
    await client.connect();
    
    // Step 1: Update escrow status to released
    console.log('🔄 Updating escrow status to "released"...');
    const escrowUpdate = await client.query(`
      UPDATE escrow 
      SET 
        status = 'released',
        release_tx_hash = $1
      WHERE payment_id = 81
      RETURNING id, status, release_tx_hash
    `, ['smart_contract_escrow_released']);
    
    if (escrowUpdate.rows.length > 0) {
      const updated = escrowUpdate.rows[0];
      console.log('✅ Escrow status updated successfully');
      console.log(`✅ Escrow ID: ${updated.id}`);
      console.log(`✅ New Status: ${updated.status}`);
      console.log(`✅ Release TX Hash: ${updated.release_tx_hash}`);
    } else {
      throw new Error('No escrow updated - Payment 81 escrow not found');
    }
    
    // Step 2: Insert escrow release event (using correct column name)
    console.log('');
    console.log('📝 Logging escrow release event...');
    await client.query(`
      INSERT INTO payment_event ("paymentId", type, description, created_at)
      VALUES ($1, $2, $3, $4)
    `, [
      81, 
      'escrow_released', 
      'Escrow funds released back to Bridge Wallet via smart contract',
      new Date()
    ]);
    
    console.log('✅ Escrow release event logged');
    
    // Step 3: Verify final status
    console.log('');
    console.log('📋 Final Database Status:');
    const finalStatus = await client.query(`
      SELECT 
        p.id as payment_id,
        p.status as payment_status,
        p.amount,
        p.recipient_email,
        p.payout_clabe,
        e.id as escrow_id,
        e.status as escrow_status,
        e.custody_amount,
        e.release_tx_hash
      FROM payment p
      JOIN escrow e ON e.payment_id = p.id
      WHERE p.id = 81
    `);
    
    const final = finalStatus.rows[0];
    console.log(`Payment ID: ${final.payment_id}`);
    console.log(`Payment Status: ${final.payment_status}`);
    console.log(`Amount: ${final.amount} MXN`);
    console.log(`Recipient: ${final.recipient_email}`);
    console.log(`Payout CLABE: ${final.payout_clabe}`);
    console.log(`Escrow ID: ${final.escrow_id}`);
    console.log(`Escrow Status: ${final.escrow_status}`);
    console.log(`Custody Amount: ${final.custody_amount} MXNB`);
    console.log(`Release TX Hash: ${final.release_tx_hash}`);
    
    // Step 4: Check events
    console.log('');
    console.log('📋 Recent Payment Events:');
    const events = await client.query(`
      SELECT type, description, created_at
      FROM payment_event
      WHERE "paymentId" = 81
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    events.rows.forEach(event => {
      console.log(`${event.created_at.toISOString()}: ${event.type} - ${event.description || 'N/A'}`);
    });
    
    console.log('');
    console.log('🎯 DATABASE UPDATE COMPLETE!');
    console.log('✅ Escrow status: pending → released');
    console.log('✅ Release transaction hash added');
    console.log('✅ Escrow release event logged');
    console.log('🔄 Ready for MXNB redemption step');
    
    return {
      success: true,
      escrowStatus: final.escrow_status,
      paymentStatus: final.payment_status,
      readyForRedemption: true
    };
    
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

updatePayment81DatabaseFixed();
