import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4000';

interface PaymentResponse {
  payment: {
    id: number;
    reference: string;
    deposit_clabe: string;
    amount: number;
    currency: string;
    custody_percent: number;
    custody_period: number;
    status: string;
  };
  escrow: {
    id: number;
    payment_id: number;
    custody_amount: number;
    custody_end: string;
    status: string;
  };
}

async function testEscrowAutomation() {
  console.log('🚀 Testing Escrow Automation with Fixed ABI');
  console.log('='.repeat(50));

  // Test Payment Configuration
  const testPayment = {
    user_id: 3, // Valid test buyer
    recipient_email: 'rodrigojille6@gmail.com', // Valid test seller
    amount: 25000, // $25,000 MXN
    currency: 'mxn',
    description: 'Test Payment 143 - Escrow Automation Validation',
    custody_percent: 60, // 60% custody (15,000 MXN)
    custody_period: 432000, // 5 days in seconds
    travel_rule_data: {
      sender: 'Test Buyer - Escrow Automation',
      receiver: 'Test Seller - Rodrigo Jille'
    }
  };

  let paymentResponse: PaymentResponse;

  try {
    // Step 1: Create Payment
    console.log('📋 Step 1: Creating Payment...');
    const response = await axios.post(`${BASE_URL}/api/payments/initiate`, testPayment);
    paymentResponse = response.data;
    
    console.log('✅ Payment Created Successfully:');
    console.log(`   Payment ID: ${paymentResponse.payment.id}`);
    console.log(`   Reference: ${paymentResponse.payment.reference}`);
    console.log(`   Deposit CLABE: ${paymentResponse.payment.deposit_clabe}`);
    console.log(`   Amount: $${paymentResponse.payment.amount.toLocaleString()} ${paymentResponse.payment.currency.toUpperCase()}`);
    console.log(`   Custody: ${paymentResponse.payment.custody_percent}% (${paymentResponse.escrow.custody_amount.toLocaleString()} MXN)`);
    console.log(`   Custody Period: ${paymentResponse.payment.custody_period / 86400} days`);
    console.log(`   Escrow ID: ${paymentResponse.escrow.id}`);
    console.log(`   Custody End: ${new Date(paymentResponse.escrow.custody_end).toLocaleString()}`);

  } catch (error: any) {
    console.error('❌ Failed to create payment:', error.response?.data || error.message);
    return;
  }

  // Step 2: Simulate Juno Deposit Webhook
  console.log('\n💰 Step 2: Simulating Juno Deposit Webhook...');
  
  try {
    const webhookPayload = {
      transaction_id: `test-tx-${Date.now()}`, // Unique transaction ID
      amount: paymentResponse.payment.amount,
      clabe: paymentResponse.payment.deposit_clabe,
      status: 'completed',
      referencia: paymentResponse.payment.reference,
      // Additional webhook data
      sender_name: 'Test Buyer - Escrow Automation',
      sender_account: '1234567890123456',
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending webhook payload:');
    console.log(`   Transaction ID: ${webhookPayload.transaction_id}`);
    console.log(`   Amount: $${webhookPayload.amount.toLocaleString()}`);
    console.log(`   CLABE: ${webhookPayload.clabe}`);
    console.log(`   Reference: ${webhookPayload.referencia}`);

    const webhookResponse = await axios.post(`${BASE_URL}/api/payments/webhook/juno`, webhookPayload);
    
    console.log('✅ Webhook processed successfully:');
    console.log('   Response:', webhookResponse.data);

  } catch (error: any) {
    console.error('❌ Webhook processing failed:', error.response?.data || error.message);
    return;
  }

  // Step 3: Monitor Automation Progress
  console.log('\n🔄 Step 3: Monitoring Automation Progress...');
  console.log('   This will trigger the following automated processes:');
  console.log('   1. Payment funding confirmation');
  console.log('   2. Seller payout (immediate release amount)');
  console.log('   3. Bridge wallet withdrawal (custody amount)');
  console.log('   4. Smart contract escrow creation');
  console.log('\n⏱️  Waiting for automation to complete...');

  // Monitor payment status for 5 minutes
  const maxWaitTime = 5 * 60 * 1000; // 5 minutes
  const checkInterval = 10 * 1000; // 10 seconds
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    try {
      // Check payment status
      const statusResponse = await axios.get(`${BASE_URL}/api/payments/${paymentResponse.payment.id}`);
      const payment = statusResponse.data.payment;
      const escrow = statusResponse.data.escrow;

      console.log(`\n📊 Status Check (${Math.round((Date.now() - startTime) / 1000)}s elapsed):`);
      console.log(`   Payment Status: ${payment.status}`);
      console.log(`   Escrow Status: ${escrow?.status || 'N/A'}`);
      
      if (escrow?.smart_contract_escrow_id) {
        console.log(`   Smart Contract Escrow ID: ${escrow.smart_contract_escrow_id}`);
      }
      
      if (escrow?.blockchain_tx_hash) {
        console.log(`   Blockchain TX Hash: ${escrow.blockchain_tx_hash}`);
      }

      // Check if automation completed successfully
      if (payment.status === 'escrowed' && escrow?.status === 'active') {
        console.log('\n🎉 ESCROW AUTOMATION COMPLETED SUCCESSFULLY!');
        console.log('✅ All systems working correctly:');
        console.log('   ✓ Payment funded');
        console.log('   ✓ Seller payout processed');
        console.log('   ✓ Bridge withdrawal completed');
        console.log('   ✓ Smart contract escrow created');
        console.log('   ✓ ABI compatibility confirmed');
        break;
      }

      // Check for failures
      if (payment.status === 'failed' || escrow?.status === 'failed') {
        console.log('\n❌ AUTOMATION FAILED');
        console.log('   Check the Operations Control Room for details');
        console.log(`   Payment Status: ${payment.status}`);
        console.log(`   Escrow Status: ${escrow?.status}`);
        break;
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, checkInterval));

    } catch (error: any) {
      console.error('❌ Error checking status:', error.response?.data || error.message);
      break;
    }
  }

  // Final Summary
  console.log('\n' + '='.repeat(50));
  console.log('🏁 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Payment ID: ${paymentResponse.payment.id}`);
  console.log(`Reference: ${paymentResponse.payment.reference}`);
  console.log(`Test Duration: ${Math.round((Date.now() - startTime) / 1000)} seconds`);
  console.log('\n📋 Next Steps:');
  console.log('1. Check the Operations Control Room at /admin/operations');
  console.log('2. Monitor blockchain transaction confirmations');
  console.log('3. Verify escrow release after custody period expires');
  console.log('4. Test manual intervention features if needed');
  
  console.log('\n🔗 Useful Links:');
  console.log(`   Operations Control Room: ${BASE_URL.replace('4000', '3000')}/admin/operations`);
  console.log(`   Payment Details: ${BASE_URL.replace('4000', '3000')}/dashboard/payment/${paymentResponse.payment.id}`);
}

// Run the test
testEscrowAutomation().catch(console.error);
