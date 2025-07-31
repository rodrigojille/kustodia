require('dotenv').config();
const { MultiSigApprovalService } = require('../dist/services/MultiSigApprovalService');

async function debugMultiSig() {
  console.log('🔍 Debugging Multi-Sig Service...');
  
  try {
    const multiSigService = new MultiSigApprovalService();
    
    console.log('✅ MultiSigApprovalService instantiated');
    
    // Test the getUpcomingMultiSigPayments method
    console.log('📋 Calling getUpcomingMultiSigPayments...');
    const upcomingPayments = await multiSigService.getUpcomingMultiSigPayments();
    
    console.log('📊 Results:');
    console.log(`Found ${upcomingPayments.length} upcoming payments`);
    
    if (upcomingPayments.length > 0) {
      console.log('\n🔍 Payment details:');
      upcomingPayments.forEach((payment, index) => {
        console.log(`\n${index + 1}. Payment ID: ${payment.paymentId}`);
        console.log(`   Amount: ${payment.amount} ${payment.currency}`);
        console.log(`   Amount USD: $${payment.amountUsd}`);
        console.log(`   Payer: ${payment.payerEmail}`);
        console.log(`   Payee: ${payment.payeeEmail}`);
        console.log(`   Escrow End: ${payment.escrowEndTime}`);
        console.log(`   Hours Until Release: ${payment.hoursUntilRelease}`);
        console.log(`   Wallet Type: ${payment.walletType}`);
        console.log(`   Requires Multi-Sig: ${payment.requiresMultiSig}`);
      });
    } else {
      console.log('❌ No upcoming payments found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugMultiSig().catch(console.error);
