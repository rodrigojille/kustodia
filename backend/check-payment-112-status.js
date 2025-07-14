const { Pool } = require('pg');

async function checkPayment112Status() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'kustodia',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    console.log('📊 Checking Payment 112 status...');
    
    // Check payment status
    const paymentResult = await pool.query(`
      SELECT p.id, p.status, p.payment_type, p.vertical_type, p.amount, p.payer_approval, p.payee_approval,
             e.id as escrow_id, e.status as escrow_status, e.custody_end, e.smart_contract_escrow_id
      FROM payment p 
      LEFT JOIN escrow e ON p.escrow_id = e.id 
      WHERE p.id = 112
    `);
    
    if (paymentResult.rows.length > 0) {
      const payment = paymentResult.rows[0];
      console.log('💰 Payment Details:');
      console.log(`   ID: ${payment.id}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Type: ${payment.payment_type}`);
      console.log(`   Vertical: ${payment.vertical_type}`);
      console.log(`   Amount: $${payment.amount} MXN`);
      console.log(`   Payer Approval: ${payment.payer_approval}`);
      console.log(`   Payee Approval: ${payment.payee_approval}`);
      console.log('');
      console.log('🏦 Escrow Details:');
      console.log(`   Escrow ID: ${payment.escrow_id}`);
      console.log(`   Escrow Status: ${payment.escrow_status}`);
      console.log(`   Custody End: ${payment.custody_end}`);
      console.log(`   Smart Contract ID: ${payment.smart_contract_escrow_id}`);
      console.log('');
      
      // Check if deadline is in past
      if (payment.custody_end) {
        const now = new Date();
        const deadline = new Date(payment.custody_end);
        console.log(`⏰ Deadline Check:`);
        console.log(`   Current Time: ${now.toISOString()}`);
        console.log(`   Deadline: ${deadline.toISOString()}`);
        console.log(`   Is Past: ${deadline < now ? '❌ YES' : '✅ NO'}`);
      }
      
    } else {
      console.log('❌ Payment 112 not found');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

checkPayment112Status();
