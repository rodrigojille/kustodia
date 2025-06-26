const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kustodia',
  password: '140290',
  port: 5432,
});

async function checkPayment83Status() {
  const client = await pool.connect();
  
  try {
    console.log('=== PAYMENT 83 STATUS VERIFICATION ===');
    console.log('Current time:', new Date().toISOString());
    console.log('');
    
    // Get payment details
    const paymentQuery = `
      SELECT p.*, u.email as user_email, u.full_name as user_name, u.wallet_address
      FROM payment p 
      LEFT JOIN "user" u ON p.user_id = u.id 
      WHERE p.id = 83
    `;
    
    const paymentResult = await client.query(paymentQuery);
    
    if (paymentResult.rows.length === 0) {
      console.log('❌ Payment 83 not found');
      return;
    }
    
    const payment = paymentResult.rows[0];
    
    console.log('📊 PAYMENT DETAILS:');
    console.log('ID:', payment.id);
    console.log('Status:', payment.status);
    console.log('Amount:', payment.amount, payment.currency);
    console.log('Type:', payment.payment_type);
    console.log('Recipient:', payment.recipient_email);
    console.log('Payer:', payment.payer_email);
    console.log('User:', payment.user_email);
    console.log('Created:', payment.created_at);
    console.log('Updated:', payment.updated_at);
    console.log('Deposit CLABE:', payment.deposit_clabe);
    console.log('Payout CLABE:', payment.payout_clabe);
    console.log('');
    
    // Get escrow details
    const escrowQuery = `SELECT * FROM escrow WHERE payment_id = 83`;
    const escrowResult = await client.query(escrowQuery);
    
    if (escrowResult.rows.length > 0) {
      const escrow = escrowResult.rows[0];
      console.log('🔒 ESCROW DETAILS:');
      console.log('ID:', escrow.id);
      console.log('Status:', escrow.status);
      console.log('Custody Amount:', escrow.custody_amount);
      console.log('Release Amount:', escrow.release_amount);
      console.log('Custody Percent:', escrow.custody_percent);
      console.log('Custody End:', escrow.custody_end);
      console.log('Blockchain TX Hash:', escrow.blockchain_tx_hash);
      console.log('Release TX Hash:', escrow.release_tx_hash);
      console.log('Smart Contract ID:', escrow.smart_contract_escrow_id);
      
      // Check if custody period has expired
      const now = new Date();
      const custodyEnd = new Date(escrow.custody_end);
      const timeDiff = now - custodyEnd;
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      
      console.log('');
      console.log('⏰ TIMING ANALYSIS:');
      console.log('Current time:', now.toISOString());
      console.log('Custody end time:', custodyEnd.toISOString());
      console.log('Time difference (ms):', timeDiff);
      console.log('Hours past custody end:', hoursDiff);
      console.log('Days past custody end:', daysDiff);
      console.log('Should be released?', daysDiff >= 0 ? '🚨 YES - OVERDUE!' : '❌ NO');
      
      if (daysDiff >= 0) {
        console.log('🚨 ALERT: This escrow is', Math.abs(daysDiff), 'days overdue for release!');
      }
      console.log('');
    } else {
      console.log('❌ No escrow found for payment 83');
      console.log('');
    }
    
    // Get payment events - using correct column name 'paymentId'
    const eventsQuery = `
      SELECT * FROM payment_event 
      WHERE "paymentId" = 83 
      ORDER BY created_at DESC 
      LIMIT 15
    `;
    
    const eventsResult = await client.query(eventsQuery);
    
    console.log('📋 PAYMENT EVENTS (most recent first):');
    if (eventsResult.rows.length > 0) {
      eventsResult.rows.forEach((event, index) => {
        console.log(`${index + 1}. ${event.created_at} | ${event.type} | ${event.description}`);
      });
    } else {
      console.log('No events found for payment 83');
    }
    console.log('');
    
    // Check for any Juno transactions
    const junoQuery = `
      SELECT * FROM juno_transaction 
      WHERE "paymentId" = 83
      ORDER BY created_at DESC
    `;
    
    const junoResult = await client.query(junoQuery);
    
    if (junoResult.rows.length > 0) {
      console.log('💳 JUNO TRANSACTIONS:');
      junoResult.rows.forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.created_at} | ID: ${tx.transaction_id} | Amount: ${tx.amount} | Status: ${tx.status}`);
      });
    } else {
      console.log('💳 JUNO TRANSACTIONS: None found');
    }
    console.log('');
    
    // Summary and recommendations
    console.log('📝 SUMMARY & RECOMMENDATIONS:');
    if (escrowResult.rows.length > 0) {
      const escrow = escrowResult.rows[0];
      const daysDiff = Math.floor((new Date() - new Date(escrow.custody_end)) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0) {
        console.log('🚨 URGENT: Escrow is', Math.abs(daysDiff), 'days overdue for release');
        console.log('📋 Next steps:');
        console.log('   1. Check if automation cron jobs are running');
        console.log('   2. Verify blockchain contract status');
        console.log('   3. Check if release transaction failed');
        console.log('   4. Review automation logs for errors');
        console.log('   5. Consider manual release process');
        
        if (escrow.status !== 'released') {
          console.log('');
          console.log('⚠️  Escrow status is:', escrow.status, '- should be "released"');
        }
        
        if (!escrow.release_tx_hash) {
          console.log('⚠️  No release transaction hash found - release may not have been executed');
        }
      } else {
        console.log('✅ Escrow is not yet due for release');
      }
    }
    
  } catch (error) {
    console.error('❌ Error verifying payment 83:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

checkPayment83Status();
