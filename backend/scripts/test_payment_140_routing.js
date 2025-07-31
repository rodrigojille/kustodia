require('dotenv').config();
const { TransactionRouterService } = require('../dist/services/TransactionRouterService');

async function testPayment140Routing() {
  console.log('🔍 Testing Payment 140 Multi-Sig Routing...');
  
  try {
    const transactionRouter = new TransactionRouterService();
    
    // Payment 140 details (confirmed from database)
    const payment140 = {
      id: 140,
      amount: 30000, // $30,000 MXN
      currency: 'MXN',
      status: 'escrowed',
      description: 'Servicios de consultoria',
      payer_email: 'rodrigojille6@gmail.com',
      recipient_email: 'test-seller@kustodia.mx'
    };
    
    console.log('📋 Payment 140 Details:');
    console.log(`  ID: ${payment140.id}`);
    console.log(`  Amount: $${payment140.amount.toLocaleString()} ${payment140.currency}`);
    console.log(`  Status: ${payment140.status}`);
    console.log(`  Description: ${payment140.description}`);
    
    // Convert MXN to USD for threshold comparison
    const MXN_TO_USD_RATE = 20; // As used in the system
    const amountUSD = payment140.amount / MXN_TO_USD_RATE;
    console.log(`  Amount in USD: $${amountUSD.toLocaleString()} USD (using rate: 1 USD = ${MXN_TO_USD_RATE} MXN)`);
    
    // Test different transaction types to see routing behavior
    const transactionTypes = [
      'escrow_release',
      'withdrawal', 
      'transfer',
      'payment'
    ];
    
    console.log('\n🔄 Testing Transaction Routing for different types:');
    
    for (const txType of transactionTypes) {
      console.log(`\n--- Testing type: ${txType} ---`);
      
      const routingDecision = await transactionRouter.routeTransaction({
        amount: payment140.amount, // Amount in MXN
        type: txType,
        paymentId: payment140.id,
        description: `${txType} for payment ${payment140.id}`
      });
      
      console.log(`  Requires Approval: ${routingDecision.requiresApproval}`);
      console.log(`  Type: ${routingDecision.type}`);
      console.log(`  Wallet: ${routingDecision.wallet}`);
      console.log(`  Reason: ${routingDecision.reason}`);
      
      // Check if it qualifies as multi-sig
      const qualifiesForMultiSig = routingDecision.requiresApproval && routingDecision.type === 'multi_sig';
      console.log(`  ✅ Qualifies for Multi-Sig: ${qualifiesForMultiSig}`);
      
      if (qualifiesForMultiSig) {
        console.log(`  🎯 This transaction would require multi-sig approval!`);
      }
    }
    
    // Test with the exact escrow_release scenario
    console.log('\n🎯 Final Test - Escrow Release Scenario:');
    const escrowReleaseDecision = await transactionRouter.routeTransaction({
      amount: payment140.amount,
      type: 'escrow_release',
      paymentId: payment140.id,
      description: `Release escrow for payment ${payment140.id}`
    });
    
    console.log('\n📊 Final Routing Decision for Escrow Release:');
    console.log(`  Requires Approval: ${escrowReleaseDecision.requiresApproval}`);
    console.log(`  Type: ${escrowReleaseDecision.type}`);
    console.log(`  Wallet: ${escrowReleaseDecision.wallet}`);
    console.log(`  Reason: ${escrowReleaseDecision.reason}`);
    
    const finalQualifies = escrowReleaseDecision.requiresApproval && escrowReleaseDecision.type === 'multi_sig';
    console.log(`\n🏆 FINAL RESULT: Payment 140 ${finalQualifies ? 'QUALIFIES' : 'DOES NOT QUALIFY'} for Multi-Sig`);
    
    if (finalQualifies) {
      console.log('\n✅ Payment 140 should appear in upcoming multi-sig payments!');
      console.log('📝 Summary:');
      console.log(`   - Amount: $${payment140.amount.toLocaleString()} MXN ($${amountUSD.toLocaleString()} USD)`);
      console.log(`   - Above threshold: ${amountUSD > 1000 ? 'YES' : 'NO'} (threshold: $1,000 USD)`);
      console.log(`   - Transaction type: escrow_release`);
      console.log(`   - Target wallet: ${escrowReleaseDecision.wallet}`);
      console.log(`   - Requires multi-sig: ${finalQualifies}`);
    } else {
      console.log('\n❌ Payment 140 will NOT appear in upcoming multi-sig payments');
      console.log('🔍 Possible reasons:');
      console.log(`   - Amount too low: ${amountUSD <= 1000 ? 'YES' : 'NO'} (${amountUSD} USD vs 1000 USD threshold)`);
      console.log(`   - Wrong transaction type: ${escrowReleaseDecision.type !== 'multi_sig' ? 'YES' : 'NO'}`);
      console.log(`   - No approval required: ${!escrowReleaseDecision.requiresApproval ? 'YES' : 'NO'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPayment140Routing().catch(console.error);
