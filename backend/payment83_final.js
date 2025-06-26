const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kustodia',
  password: '140290',
  port: 5432,
});

async function checkPayment83() {
  const client = await pool.connect();
  
  try {
    console.log('=== PAYMENT 83 COMPLETE STATUS ===');
    console.log('Current time:', new Date().toISOString());
    console.log('');
    
    // Payment details
    const payment = await client.query('SELECT * FROM payment WHERE id = 83');
    if (payment.rows.length === 0) {
      console.log('❌ Payment 83 not found');
      return;
    }
    
    const p = payment.rows[0];
    console.log('📊 PAYMENT:');
    console.log('ID:', p.id, '| Status:', p.status);
    console.log('Amount:', p.amount, p.currency);
    console.log('Created:', p.created_at);
    console.log('Deposit CLABE:', p.deposit_clabe);
    console.log('Payout CLABE:', p.payout_clabe);
    console.log('');
    
    // Escrow details
    const escrow = await client.query('SELECT * FROM escrow WHERE payment_id = 83');
    if (escrow.rows.length > 0) {
      const e = escrow.rows[0];
      console.log('🔒 ESCROW:');
      console.log('ID:', e.id, '| Status:', e.status);
      console.log('Custody Amount:', e.custody_amount);
      console.log('Custody End:', e.custody_end);
      console.log('Contract ID:', e.smart_contract_escrow_id);
      
      const now = new Date();
      const custodyEnd = new Date(e.custody_end);
      const daysDiff = Math.floor((now - custodyEnd) / (1000 * 60 * 60 * 24));
      
      console.log('');
      console.log('⏰ TIMING:');
      console.log('Custody end:', custodyEnd.toISOString());
      console.log('Days overdue:', daysDiff);
      console.log(daysDiff > 0 ? '🚨 OVERDUE FOR RELEASE!' : '⏳ Not yet due');
      console.log('');
    }
    
    // Recent events
    const events = await client.query('SELECT * FROM payment_event WHERE "paymentId" = 83 ORDER BY created_at DESC LIMIT 5');
    console.log('📋 RECENT EVENTS:');
    events.rows.forEach((event, i) => {
      console.log(`${i+1}. ${event.created_at} | ${event.type} | ${event.description}`);
    });
    
    console.log('');
    console.log('🎯 SUMMARY:');
    if (escrow.rows.length > 0) {
      const daysDiff = Math.floor((new Date() - new Date(escrow.rows[0].custody_end)) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0) {
        console.log(`🚨 Payment 83 escrow is ${daysDiff} days overdue for release!`);
        console.log('📋 Immediate actions needed:');
        console.log('   1. Check automation cron jobs');
        console.log('   2. Verify blockchain contract status');
        console.log('   3. Review release process logs');
        console.log('   4. Consider manual intervention');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

checkPayment83();
