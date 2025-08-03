const { Pool } = require('pg');
const { releaseEscrowAndPayout } = require('../src/services/PaymentAutomationService');
require('dotenv').config();

async function manualReleasePayment135() {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });

  try {
    console.log('🔧 MANUAL RELEASE FOR PAYMENT 135');
    console.log('=================================');

    // 1. Verify payment and escrow status
    const paymentQuery = `
      SELECT p.id, p.status, p.payer_approval, p.payee_approval, 
             p.amount, p.currency, p.escrow_id,
             e.id as escrow_id, e.status as escrow_status, 
             e.smart_contract_escrow_id
      FROM payments p
      LEFT JOIN escrows e ON p.escrow_id = e.id
      WHERE p.id = 135
    `;
    
    const result = await pool.query(paymentQuery);
    if (result.rows.length === 0) {
      console.log('❌ Payment 135 not found');
      return;
    }

    const payment = result.rows[0];
    console.log('\n📄 PAYMENT STATUS:');
    console.log('Payment ID:', payment.id);
    console.log('Status:', payment.status);
    console.log('Payer Approved:', payment.payer_approval);
    console.log('Payee Approved:', payment.payee_approval);
    console.log('Amount:', payment.amount, payment.currency);
    console.log('Escrow ID:', payment.escrow_id);
    console.log('Escrow Status:', payment.escrow_status);
    console.log('Smart Contract Escrow ID:', payment.smart_contract_escrow_id);

    // 2. Verify both approvals
    if (!payment.payer_approval || !payment.payee_approval) {
      console.log('❌ Both approvals are required. Current status:');
      console.log('  Payer approved:', payment.payer_approval);
      console.log('  Payee approved:', payment.payee_approval);
      return;
    }

    console.log('✅ Both parties have approved');

    // 3. Check if already released
    if (payment.status === 'completed' || payment.status === 'released') {
      console.log('✅ Payment already completed/released');
      return;
    }

    if (!payment.escrow_id) {
      console.log('❌ No escrow found for this payment');
      return;
    }

    // 4. Attempt manual release
    console.log('\n🚀 ATTEMPTING MANUAL RELEASE...');
    console.log('Escrow ID:', payment.escrow_id);
    
    try {
      // Import the PaymentAutomationService
      const { PaymentAutomationService } = require('../src/services/PaymentAutomationService');
      const automationService = new PaymentAutomationService();
      
      // Call the release function directly
      const releaseResult = await automationService.releaseEscrowAndPayout(payment.escrow_id);
      
      console.log('✅ RELEASE SUCCESSFUL!');
      console.log('Release result:', releaseResult);
      
      // 5. Verify the release in database
      const verifyQuery = `
        SELECT status, release_tx_hash, updated_at
        FROM escrows 
        WHERE id = $1
      `;
      
      const verifyResult = await pool.query(verifyQuery, [payment.escrow_id]);
      if (verifyResult.rows.length > 0) {
        const escrow = verifyResult.rows[0];
        console.log('\n📊 UPDATED ESCROW STATUS:');
        console.log('Status:', escrow.status);
        console.log('Release TX Hash:', escrow.release_tx_hash);
        console.log('Updated At:', escrow.updated_at);
      }
      
      // 6. Check payment status
      const paymentVerifyQuery = `
        SELECT status, updated_at
        FROM payments 
        WHERE id = 135
      `;
      
      const paymentVerifyResult = await pool.query(paymentVerifyQuery);
      if (paymentVerifyResult.rows.length > 0) {
        const updatedPayment = paymentVerifyResult.rows[0];
        console.log('\n📊 UPDATED PAYMENT STATUS:');
        console.log('Status:', updatedPayment.status);
        console.log('Updated At:', updatedPayment.updated_at);
      }
      
    } catch (releaseError) {
      console.error('❌ RELEASE FAILED:', releaseError.message);
      console.error('Full error:', releaseError);
      
      // Check if it's a blockchain issue
      if (releaseError.message.includes('revert') || releaseError.message.includes('gas')) {
        console.log('\n🔍 BLOCKCHAIN ERROR DETECTED');
        console.log('This might be due to:');
        console.log('- Insufficient gas');
        console.log('- Contract state issue');
        console.log('- Network congestion');
        console.log('- Escrow already released on-chain');
      }
    }

  } catch (error) {
    console.error('❌ SCRIPT ERROR:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  manualReleasePayment135()
    .then(() => {
      console.log('\n✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { manualReleasePayment135 };
