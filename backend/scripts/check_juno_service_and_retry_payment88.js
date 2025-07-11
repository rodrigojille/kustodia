require('dotenv').config();
const axios = require('axios');

const JUNO_API_BASE = 'https://sandbox-api.juno.com.mx';
const JUNO_API_KEY = process.env.JUNO_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_API_SECRET;
const PAYMENT_API_BASE_URL = process.env.PAYMENT_API_BASE_URL || 'http://localhost:4000';

// Create Juno auth token
function createJunoAuthToken() {
  const credentials = Buffer.from(`${JUNO_API_KEY}:${JUNO_API_SECRET}`).toString('base64');
  return `Basic ${credentials}`;
}

async function checkJunoServiceStatus() {
  console.log('🔍 CHECKING JUNO SERVICE STATUS\n');
  
  try {
    // Test Juno API health/connection
    const response = await axios.get(`${JUNO_API_BASE}/v2/bank_accounts`, {
      headers: {
        'Authorization': createJunoAuthToken(),
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ JUNO SERVICE STATUS: ONLINE');
    console.log(`   Response Status: ${response.status}`);
    console.log(`   Response Time: ${Date.now() - start}ms`);
    return true;
    
  } catch (error) {
    console.log('❌ JUNO SERVICE STATUS: DOWN/UNREACHABLE');
    console.log(`   Error: ${error.code || error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   🔴 Connection refused - Service likely down');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('   ⏰ Timeout - Service unresponsive');
    } else if (error.response) {
      console.log(`   📡 HTTP ${error.response.status}: ${error.response.statusText}`);
    }
    return false;
  }
}

async function checkPayment88Status() {
  console.log('\n📊 CHECKING PAYMENT 88 STATUS\n');
  
  try {
    const response = await axios.get(`${PAYMENT_API_BASE_URL}/api/payments/88`);
    const payment = response.data.payment;
    const escrow = payment.escrow;
    
    console.log(`Payment Status: ${payment.status}`);
    console.log(`Escrow Status: ${escrow.status}`);
    console.log(`Amount: ${payment.amount} MXN`);
    console.log(`Juno UUID: ${payment.payout_juno_bank_account_id || 'NOT SET'}`);
    
    return {
      payment_status: payment.status,
      escrow_status: escrow.status,
      amount: payment.amount,
      juno_uuid: payment.payout_juno_bank_account_id,
      ready_for_retry: escrow.status === 'released' && payment.status === 'failed'
    };
    
  } catch (error) {
    console.error('❌ Error checking payment status:', error.response?.data || error.message);
    return null;
  }
}

async function triggerPaymentRetry() {
  console.log('\n🔄 TRIGGERING PAYMENT RETRY AUTOMATION\n');
  
  try {
    // Try to trigger automation to retry failed payment
    const response = await axios.post(`${PAYMENT_API_BASE_URL}/api/admin/automation/trigger`, {
      action: 'processPayoutsAndRedemptions'
    });
    
    console.log('✅ Automation trigger sent successfully');
    console.log('   The system will retry redemption for Payment 88');
    
  } catch (error) {
    console.log('⚠️  Automation trigger failed (might need JWT auth)');
    console.log('   💡 Manual retry: restart PaymentAutomationService');
  }
}

async function main() {
  const start = Date.now();
  
  console.log('🏥 JUNO SERVICE HEALTH CHECK & PAYMENT 88 RETRY\n');
  console.log(`Current Time: ${new Date().toISOString()}`);
  
  // Check Juno service status
  const junoOnline = await checkJunoServiceStatus();
  
  // Check Payment 88 current status
  const paymentStatus = await checkPayment88Status();
  
  if (!paymentStatus) {
    console.log('\n❌ Cannot proceed - Payment status unavailable');
    return;
  }
  
  console.log('\n🎯 ANALYSIS & RECOMMENDATIONS:\n');
  
  if (junoOnline && paymentStatus.ready_for_retry) {
    console.log('✅ READY FOR RETRY:');
    console.log('   - Juno service is back online');
    console.log('   - Escrow is released (funds ready)');
    console.log('   - Payment status is failed (needs retry)');
    console.log('');
    
    await triggerPaymentRetry();
    
    console.log('\n⏱️  WAIT 2-5 MINUTES then check Payment 88 status again');
    console.log('   Expected: Payment status should change to "completed"');
    
  } else if (!junoOnline && paymentStatus.ready_for_retry) {
    console.log('⏳ WAITING FOR JUNO SERVICE:');
    console.log('   - Juno service is still down');
    console.log('   - Escrow is released (funds ready)');
    console.log('   - Payment will auto-retry when Juno comes back online');
    console.log('');
    console.log('💡 RECOMMENDATION: Run this script periodically until Juno is back');
    
  } else if (paymentStatus.payment_status === 'completed') {
    console.log('🎉 PAYMENT COMPLETED:');
    console.log('   - Payment 88 has been successfully processed');
    console.log('   - No further action needed');
    
  } else {
    console.log('🤔 UNEXPECTED STATE:');
    console.log(`   - Payment Status: ${paymentStatus.payment_status}`);
    console.log(`   - Escrow Status: ${paymentStatus.escrow_status}`);
    console.log('   - Manual investigation may be needed');
  }
  
  console.log(`\n⏱️  Total execution time: ${Date.now() - start}ms`);
}

// Run the health check
main().catch(console.error);
