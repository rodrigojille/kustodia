require('dotenv').config();
const axios = require('axios');

const PAYMENT_API_BASE_URL = process.env.PAYMENT_API_BASE_URL || 'http://localhost:4000';

async function checkJunoServiceStatus() {
  try {
    const response = await axios.get('https://sandbox-api.juno.com.mx/v2/bank_accounts', {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.JUNO_API_KEY}:${process.env.JUNO_API_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ JUNO SERVICE: ONLINE');
    return true;
  } catch (error) {
    console.log('❌ JUNO SERVICE: STILL DOWN');
    console.log(`   Error: ${error.code || error.message}`);
    return false;
  }
}

async function getUser2Details() {
  try {
    const response = await axios.get(`${PAYMENT_API_BASE_URL}/api/payments/88`);
    const payment = response.data.payment;
    
    console.log('\n👤 USER 2 DETAILS:');
    console.log(`Email: ${payment.user?.email || 'NOT FOUND'}`);
    console.log(`Payout CLABE: ${payment.payout_clabe || 'NOT SET'}`);
    console.log(`Juno UUID: ${payment.payout_juno_bank_account_id || 'NOT SET'}`);
    
    return {
      userId: payment.user?.id,
      email: payment.user?.email,
      payoutClabe: payment.payout_clabe,
      junoUuid: payment.payout_juno_bank_account_id
    };
  } catch (error) {
    console.error('❌ Error getting user details:', error.response?.data || error.message);
    return null;
  }
}

async function registerUserClabeWithJuno(clabe) {
  console.log(`\n🔗 REGISTERING CLABE ${clabe} WITH JUNO...`);
  
  try {
    // This would call the actual Juno registration endpoint
    // For now, we'll just show the structure
    const registrationData = {
      account_number: clabe,
      bank_code: clabe.substring(0, 3),
      account_type: 'clabe'
    };
    
    console.log('📋 Registration payload:', registrationData);
    console.log('⚠️  MANUAL ACTION REQUIRED:');
    console.log('   1. Register this CLABE with Juno API');
    console.log('   2. Get the returned UUID');
    console.log('   3. Update Payment 88 with the UUID');
    console.log('   4. Reset payment status for retry');
    
    return null; // Would return actual UUID from Juno
  } catch (error) {
    console.error('❌ Error registering CLABE:', error.message);
    return null;
  }
}

async function resetPayment88ForRetry() {
  console.log('\n🔄 RESETTING PAYMENT 88 FOR RETRY...');
  
  try {
    // Reset payment status to allow automation retry
    const resetPayload = {
      payment_status: 'escrowed',
      escrow_status: 'released',
      clear_juno_payment_id: true
    };
    
    console.log('📋 Reset payload:', resetPayload);
    console.log('⚠️  MANUAL SQL REQUIRED:');
    console.log(`
    -- Reset Payment 88 for retry after Juno UUID is fixed
    UPDATE payments 
    SET status = 'escrowed', juno_payment_id = NULL 
    WHERE id = 88;
    
    UPDATE escrows 
    SET status = 'released' 
    WHERE id = 76;
    
    -- Log the retry attempt
    INSERT INTO payment_events (payment_id, event_type, description, success, created_at)
    VALUES (88, 'retry_after_juno_outage', 'Reset status for retry after Juno service recovery', true, NOW());
    `);
    
  } catch (error) {
    console.error('❌ Error resetting payment:', error.message);
  }
}

async function main() {
  console.log('🩺 PAYMENT 88 FIX READINESS CHECK\n');
  console.log(`Current Time: ${new Date().toISOString()}`);
  
  // Check if Juno is back online
  const junoOnline = await checkJunoServiceStatus();
  
  if (!junoOnline) {
    console.log('\n⏳ WAITING: Juno service still down');
    console.log('   Run this script again when Juno is back online');
    return;
  }
  
  // Get User 2 details
  const userDetails = await getUser2Details();
  
  if (!userDetails) {
    console.log('\n❌ Cannot proceed - User details unavailable');
    return;
  }
  
  console.log('\n🎯 ANALYSIS:');
  
  if (!userDetails.payoutClabe) {
    console.log('❌ BLOCKER: User 2 has no payout CLABE configured');
    console.log('   🔧 FIX: User needs to set up their bank account in the portal');
    return;
  }
  
  if (!userDetails.junoUuid) {
    console.log('⚠️  MISSING: User 2 has no Juno UUID');
    console.log('   🔧 FIX: Register their CLABE with Juno');
    await registerUserClabeWithJuno(userDetails.payoutClabe);
  } else {
    console.log('✅ READY: User 2 has Juno UUID');
    await resetPayment88ForRetry();
  }
  
  console.log('\n📋 FINAL STEPS AFTER UUID IS SET:');
  console.log('1. Update Payment 88 with Juno UUID');
  console.log('2. Reset payment and escrow statuses'); 
  console.log('3. Automation will retry automatically within 2 minutes');
  console.log('4. Monitor with: node scripts/monitor_payment88.js');
}

main().catch(console.error);
