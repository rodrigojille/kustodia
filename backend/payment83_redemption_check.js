const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kustodia',
  password: '140290',
  port: 5432,
});

async function checkPayment83RedemptionFlow() {
  const client = await pool.connect();
  
  try {
    console.log('=== PAYMENT 83 REDEMPTION FLOW ANALYSIS ===');
    console.log('Current time:', new Date().toISOString());
    console.log('');
    
    // Get payment and escrow details
    const paymentQuery = 'SELECT * FROM payment WHERE id = 83';
    const escrowQuery = 'SELECT * FROM escrow WHERE payment_id = 83';
    
    const payment = await client.query(paymentQuery);
    const escrow = await client.query(escrowQuery);
    
    if (payment.rows.length === 0) {
      console.log('❌ Payment 83 not found');
      return;
    }
    
    const p = payment.rows[0];
    const e = escrow.rows[0];
    
    console.log('📊 CURRENT STATUS:');
    console.log('Payment Status:', p.status);
    console.log('Escrow Status:', e.status);
    console.log('Custody Amount:', e.custody_amount, 'MXN');
    console.log('Payout CLABE:', p.payout_clabe);
    console.log('Blockchain TX Hash:', e.blockchain_tx_hash);
    console.log('Release TX Hash:', e.release_tx_hash);
    console.log('');
    
    // Check what steps were completed
    console.log('🔍 REDEMPTION FLOW ANALYSIS:');
    console.log('1. ✅ Escrow Created - Contract ID:', e.smart_contract_escrow_id);
    console.log('2. ✅ Escrow Released - Status:', e.status);
    
    if (e.release_tx_hash) {
      console.log('3. ✅ Release Transaction Hash:', e.release_tx_hash);
    } else {
      console.log('3. ❌ No release transaction hash found');
    }
    
    // Check for Juno transactions (redemption attempts)
    try {
      const junoQuery = 'SELECT * FROM juno_transaction WHERE "paymentId" = 83 ORDER BY created_at DESC';
      const junoResult = await client.query(junoQuery);
      
      if (junoResult.rows.length > 0) {
        console.log('4. ✅ Juno Transactions Found:');
        junoResult.rows.forEach((tx, i) => {
          console.log(`   ${i+1}. ${tx.created_at} | ${tx.transaction_id} | ${tx.amount} MXN | Status: ${tx.status}`);
        });
      } else {
        console.log('4. ❌ No Juno transactions found - MXNB redemption not attempted');
      }
    } catch (err) {
      console.log('4. ❌ Could not check Juno transactions:', err.message);
    }
    
    console.log('');
    console.log('📋 MISSING STEPS TO COMPLETE PAYMENT 83:');
    console.log('   Step A: Transfer MXNB from escrow contract to bridge wallet');
    console.log('   Step B: Transfer MXNB from bridge wallet to Juno wallet');
    console.log('   Step C: Redeem MXNB to MXN via Juno API');
    console.log('   Step D: Send MXN payout to recipient CLABE:', p.payout_clabe);
    console.log('   Step E: Update payment status to "completed"');
    console.log('');
    
    // Check recent payment events to see where it stopped
    const eventsQuery = 'SELECT * FROM payment_event WHERE "paymentId" = 83 ORDER BY created_at DESC LIMIT 10';
    const events = await client.query(eventsQuery);
    
    console.log('📅 RECENT EVENTS (what happened):');
    events.rows.forEach((event, i) => {
      console.log(`${i+1}. ${event.created_at} | ${event.type} | ${event.description}`);
    });
    
    console.log('');
    console.log('🚨 CRITICAL ISSUE:');
    console.log('The recipient has NOT received their 1,000 MXN payment!');
    console.log('Escrow is released but redemption flow incomplete.');
    console.log('');
    console.log('🛠️  IMMEDIATE ACTION REQUIRED:');
    console.log('Run the automation script to complete the redemption process.');
    console.log('Or manually execute the missing steps A-E above.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

checkPayment83RedemptionFlow();
