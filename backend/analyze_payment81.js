require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function analyzePayment81() {
  await client.connect();
  
  console.log('🔍 ANALYZING PAYMENT 81 FOR RELEASE FLOW');
  console.log('=======================================');
  
  // Get payment details
  const payment = await client.query('SELECT * FROM payment WHERE id = 81');
  if (payment.rows.length === 0) {
    console.log('❌ Payment 81 not found');
    await client.end();
    return;
  }
  
  const p = payment.rows[0];
  console.log('✅ Payment 81 Details:');
  console.log(`ID: ${p.id}`);
  console.log(`Status: ${p.status}`);
  console.log(`Amount: ${p.amount}`);
  console.log(`Recipient Email: ${p.recipient_email}`);
  console.log(`Payout CLABE: ${p.payout_clabe}`);
  console.log(`Transaction ID: ${p.transaction_id}`);
  console.log('');
  
  // Get related escrow
  const escrow = await client.query('SELECT * FROM escrow WHERE payment_id = 81');
  if (escrow.rows.length === 0) {
    console.log('❌ No escrow found for Payment 81');
  } else {
    const e = escrow.rows[0];
    console.log('✅ Escrow Details:');
    console.log(`Escrow ID: ${e.id}`);
    console.log(`Status: ${e.status}`);
    console.log(`Custody Amount: ${e.custody_amount}`);
    console.log(`Custody End: ${e.custody_end}`);
    console.log(`Smart Contract Escrow ID: ${e.smart_contract_escrow_id}`);
    console.log(`Blockchain TX Hash: ${e.blockchain_tx_hash}`);
    console.log('');
    
    // Check if custody period has ended
    const now = new Date();
    const custodyEnd = new Date(e.custody_end);
    const canRelease = now >= custodyEnd;
    console.log('📅 Custody Period Analysis:');
    console.log(`Current Time: ${now.toISOString()}`);
    console.log(`Custody End: ${custodyEnd.toISOString()}`);
    console.log(`Can Release: ${canRelease ? '✅ YES' : '❌ NO'}`);
    
    if (canRelease) {
      console.log('\n🎯 READY FOR RELEASE FLOW');
    } else {
      const timeLeft = custodyEnd.getTime() - now.getTime();
      const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
      console.log(`⏳ Time remaining: ${hoursLeft} hours`);
    }
  }
  
  await client.end();
}

analyzePayment81().catch(console.error);
