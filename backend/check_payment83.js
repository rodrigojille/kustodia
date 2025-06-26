const ormconfig = require('./src/ormconfig').default;

async function checkPayment83() {
  console.log('=== PAYMENT 83 STATUS CHECK ===');
  console.log('Current time:', new Date().toISOString());
  console.log('');
  
  try {
    // Get payment details
    const paymentQuery = `
      SELECT p.*, u.email as user_email, u.full_name as user_name
      FROM payments p 
      LEFT JOIN users u ON p.user_id = u.id 
      WHERE p.id = 83
    `;
    
    const escrowQuery = `
      SELECT * FROM escrows WHERE payment_id = 83
    `;
    
    const eventsQuery = `
      SELECT * FROM payment_events 
      WHERE payment_id = 83 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    const paymentResult = await ormconfig.query(paymentQuery);
    const escrowResult = await ormconfig.query(escrowQuery);
    const eventsResult = await ormconfig.query(eventsQuery);
    
    if (paymentResult.length === 0) {
      console.log('❌ Payment 83 not found');
      return;
    }
    
    const payment = paymentResult[0];
    
    console.log('📊 PAYMENT DETAILS:');
    console.log('ID:', payment.id);
    console.log('Status:', payment.status);
    console.log('Amount:', payment.amount);
    console.log('Currency:', payment.currency);
    console.log('Recipient:', payment.recipient_email);
    console.log('Payer:', payment.payer_email);
    console.log('Created:', payment.created_at);
    console.log('Updated:', payment.updated_at);
    console.log('Deposit CLABE:', payment.deposit_clabe);
    console.log('Payout CLABE:', payment.payout_clabe);
    console.log('');
    
    if (escrowResult.length > 0) {
      const escrow = escrowResult[0];
      console.log('🔒 ESCROW DETAILS:');
      console.log('ID:', escrow.id);
      console.log('Status:', escrow.status);
      console.log('Custody Amount:', escrow.custody_amount);
      console.log('Release Amount:', escrow.release_amount);
      console.log('Custody Percent:', escrow.custody_percent);
      console.log('Custody Start:', escrow.custody_start);
      console.log('Custody End:', escrow.custody_end);
      console.log('Blockchain Hash:', escrow.blockchain_hash);
      console.log('Contract ID:', escrow.contract_id);
      
      // Check if custody period has expired
      const now = new Date();
      const custodyEnd = new Date(escrow.custody_end);
      const daysDiff = Math.floor((now - custodyEnd) / (1000 * 60 * 60 * 24));
      const hoursDiff = Math.floor((now - custodyEnd) / (1000 * 60 * 60));
      
      console.log('');
      console.log('⏰ TIMING ANALYSIS:');
      console.log('Current time:', now.toISOString());
      console.log('Custody end time:', custodyEnd.toISOString());
      console.log('Hours past custody end:', hoursDiff);
      console.log('Days past custody end:', daysDiff);
      console.log('Should be released?', daysDiff >= 0 ? '✅ YES' : '❌ NO');
      console.log('');
    } else {
      console.log('❌ No escrow found for payment 83');
      console.log('');
    }
    
    console.log('📋 RECENT EVENTS:');
    if (eventsResult.length > 0) {
      eventsResult.forEach(event => {
        console.log(`- ${event.created_at}: ${event.type} - ${event.description}`);
      });
    } else {
      console.log('No events found for payment 83');
    }
    
    // Check blockchain status if we have a contract ID
    if (escrowResult.length > 0 && escrowResult[0].contract_id) {
      console.log('');
      console.log('🔗 BLOCKCHAIN STATUS:');
      console.log('Contract ID:', escrowResult[0].contract_id);
      console.log('Blockchain Hash:', escrowResult[0].blockchain_hash);
      console.log('Note: Manual blockchain check may be needed');
    }
    
  } catch (error) {
    console.error('Error checking payment:', error);
  } finally {
    process.exit(0);
  }
}

checkPayment83();
