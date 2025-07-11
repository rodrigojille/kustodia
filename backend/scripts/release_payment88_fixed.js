require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.PAYMENT_API_BASE_URL || 'http://localhost:4000';

async function fixPayment88Escrow() {
  try {
    console.log('=== PAYMENT 88 ESCROW DIAGNOSTIC & FIX ===\n');
    
    // 1. Check current payment status via API
    console.log('1. Checking payment 88 via API...');
    const paymentResponse = await axios.get(`${BASE_URL}/api/payments/88`);
    const payment = paymentResponse.data.payment;
    const escrow = payment.escrow;
    
    if (!escrow) {
      console.log('❌ No escrow found for payment 88');
      return;
    }
    
    console.log(`   Payment ID: ${payment.id}`);
    console.log(`   Payment Status: ${payment.status}`);
    console.log(`   Escrow ID: ${escrow.id}`);
    console.log(`   Escrow Status: ${escrow.status}`);
    console.log(`   Custody End: ${escrow.custody_end}`);
    console.log(`   Amount: ${escrow.custody_amount}`);
    
    // 2. Check if escrow needs status fix
    const now = new Date();
    const custodyEnd = new Date(escrow.custody_end);
    const isExpired = now > custodyEnd;
    
    console.log(`\n2. Escrow analysis:`);
    console.log(`   Is expired: ${isExpired}`);
    console.log(`   Current status: ${escrow.status}`);
    console.log(`   Expected for automation: 'active'`);
    
    // 3. Determine what action to take
    if (escrow.status === 'funded') {
      console.log(`\n⚠️  ISSUE IDENTIFIED: Escrow status is 'funded' but should be 'active'`);
      console.log(`   The PaymentAutomationService.releaseExpiredCustodies() only processes escrows with status='active'`);
      console.log(`   Payment 88 escrow needs status update to be processed by automation.`);
      
      console.log(`\n📋 RECOMMENDED FIXES:`);
      console.log(`   1. UPDATE DATABASE: Set escrow status from 'funded' to 'active'`);
      console.log(`   2. TRIGGER AUTOMATION: Run releaseExpiredCustodies() to process the escrow`);
      console.log(`   3. VERIFY RESULT: Check that escrow status becomes 'released'`);
    } else if (escrow.status === 'active' && isExpired) {
      console.log(`\n✅ Escrow is properly configured and expired - ready for automation`);
    } else if (escrow.status === 'released') {
      console.log(`\n🎉 Escrow has already been released!`);
    } else {
      console.log(`\n🤔 Escrow status: ${escrow.status} - May need manual review`);
    }
    
    // 4. Trigger automation via admin endpoint
    console.log(`\n3. Triggering PaymentAutomationService...`);
    try {
      const automationResponse = await axios.post(`${BASE_URL}/api/admin/automation/trigger`, {
        action: 'releaseExpiredCustodies'
      });
      console.log(`   ✅ Automation triggered successfully`);
      console.log(`   Response: ${automationResponse.data.message || 'Automation started'}`);
    } catch (automationError) {
      console.log(`   ⚠️  Automation trigger failed:`, automationError.response?.data || automationError.message);
      console.log(`   💡 This may be normal if admin routes require JWT authentication`);
      console.log(`   💡 The automation service should be running via cron jobs automatically`);
    }
    
    // 5. Final status check
    console.log(`\n4. Final status check...`);
    const finalResponse = await axios.get(`${BASE_URL}/api/payments/88`);
    const finalPayment = finalResponse.data.payment;
    const finalEscrow = finalPayment.escrow;
    
    console.log(`   Payment Status: ${finalPayment.status}`);
    console.log(`   Escrow Status: ${finalEscrow.status}`);
    
    if (finalEscrow.status === 'released') {
      console.log(`\n🎉 SUCCESS: Payment 88 escrow has been released!`);
    } else if (finalEscrow.status === 'funded') {
      console.log(`\n❌ STILL NEEDS FIX: Escrow status is still 'funded'`);
      console.log(`   MANUAL ACTION REQUIRED:`);
      console.log(`   1. Connect to database and run: UPDATE escrows SET status='active' WHERE id=${finalEscrow.id}`);
      console.log(`   2. Then wait for automation service to process it automatically`);
    } else {
      console.log(`\n⏳ Escrow status: ${finalEscrow.status}`);
      console.log(`   The automation service should process this automatically if status='active' and expired`);
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.response?.data || error.message);
  }
}

// Run the script
fixPayment88Escrow().catch(console.error);
