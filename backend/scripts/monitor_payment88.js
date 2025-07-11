require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.PAYMENT_API_BASE_URL || 'http://localhost:4000';

async function monitorPayment88() {
  console.log('🔍 MONITORING PAYMENT 88 AUTOMATION PROGRESS\n');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/payments/88`);
    const payment = response.data.payment;
    const escrow = payment.escrow;
    
    console.log('📊 CURRENT STATUS:');
    console.log(`   Payment ID: ${payment.id}`);
    console.log(`   Payment Status: ${payment.status}`);
    console.log(`   Amount: ${payment.amount} MXN`);
    console.log(`   Escrow ID: ${escrow.id}`);
    console.log(`   Escrow Status: ${escrow.status}`);
    console.log(`   Custody End: ${escrow.custody_end}`);
    console.log(`   Smart Contract ID: ${escrow.smart_contract_escrow_id || 'NOT SET'}`);
    
    const custodyEnd = new Date(escrow.custody_end);
    const now = new Date();
    const isExpired = now > custodyEnd;
    const daysPast = Math.floor((now - custodyEnd) / (1000 * 60 * 60 * 24));
    
    console.log(`\n⏰ TIMING ANALYSIS:`);
    console.log(`   Current Time: ${now.toISOString()}`);
    console.log(`   Custody End: ${custodyEnd.toISOString()}`);
    console.log(`   Is Expired: ${isExpired}`);
    console.log(`   Days Past Expiry: ${daysPast}`);
    
    console.log(`\n🤖 AUTOMATION STATUS:`);
    
    if (escrow.status === 'active' && isExpired) {
      console.log('   ✅ READY FOR AUTOMATION');
      console.log('   📋 PaymentAutomationService.releaseExpiredCustodies() will process this escrow');
      console.log('   ⏱️  Automation runs every 10 minutes');
      console.log('   🎯 Expected: Escrow status will change to "released"');
    } else if (escrow.status === 'released') {
      console.log('   🎉 ESCROW RELEASED - Moving to payout phase');
      console.log('   📋 Next: MXNB redemption and SPEI payout');
    } else if (escrow.status === 'funded') {
      console.log('   ❌ BLOCKED - Status should be "active" not "funded"');
      console.log('   🔧 Fix needed: UPDATE escrow SET status=\'active\' WHERE id=76');
    } else {
      console.log(`   🤔 Status: ${escrow.status} - Monitor for changes`);
    }
    
    if (payment.status === 'completed') {
      console.log('   🏆 PAYMENT COMPLETED - Full automation flow successful!');
    }
    
    console.log(`\n💡 To monitor continuously, run this script every few minutes`);
    
  } catch (error) {
    console.error('❌ Error checking payment status:', error.response?.data || error.message);
  }
}

monitorPayment88().catch(console.error);
