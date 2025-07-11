const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'kustodia',
  user: 'postgres',
  password: '140290'
});

async function checkPayment85() {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking payment 85 details for dispute testing...\n');
    
    // Get payment details
    const payment = await client.query(`
      SELECT p.id, p.status, p.amount, p.escrow_id, p.payer_email, p.recipient_email, p.description
      FROM payment p 
      WHERE p.id = 85
    `);
    
    if (payment.rows.length === 0) {
      console.log('❌ Payment 85 not found');
      return;
    }
    
    console.log('📋 Payment 85 Details:');
    console.log(payment.rows[0]);
    console.log('');
    
    // Check if it has an escrow
    if (payment.rows[0].escrow_id) {
      const escrow = await client.query(`
        SELECT id, status, dispute_status, custody_end, custody_percent, custody_amount, release_amount
        FROM escrow 
        WHERE id = $1
      `, [payment.rows[0].escrow_id]);
      
      if (escrow.rows.length > 0) {
        console.log('🔐 Associated Escrow:');
        console.log(escrow.rows[0]);
        console.log('');
        
        // Check existing disputes
        const disputes = await client.query(`
          SELECT id, status, reason, details, evidence_url, created_at
          FROM dispute 
          WHERE escrow_id = $1
          ORDER BY created_at DESC
        `, [payment.rows[0].escrow_id]);
        
        if (disputes.rows.length > 0) {
          console.log('⚠️ Existing Disputes:');
          disputes.rows.forEach((dispute, index) => {
            console.log(`${index + 1}. ID: ${dispute.id}, Status: ${dispute.status}, Reason: ${dispute.reason}`);
          });
        } else {
          console.log('✅ No existing disputes - ready for dispute testing');
        }
      }
    } else {
      console.log('❌ Payment 85 has no associated escrow - cannot create dispute');
    }
    
    // Determine if payment is ready for dispute testing
    const paymentStatus = payment.rows[0].status;
    const canDispute = ['funded', 'escrowed', 'paid', 'active'].includes(paymentStatus);
    
    console.log('\n📊 Dispute Testing Status:');
    console.log(`Payment Status: ${paymentStatus}`);
    console.log(`Can Create Dispute: ${canDispute ? '✅ YES' : '❌ NO'}`);
    
    if (!canDispute && !payment.rows[0].escrow_id) {
      console.log('\n💡 To enable dispute testing:');
      console.log('1. Update payment status to "escrowed"');
      console.log('2. Ensure escrow is associated with payment');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkPayment85();
