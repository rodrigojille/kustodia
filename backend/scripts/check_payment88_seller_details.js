require('dotenv').config();
const axios = require('axios');

const PAYMENT_API_BASE_URL = process.env.PAYMENT_API_BASE_URL || 'http://localhost:4000';

async function getPayment88SellerDetails() {
  console.log('🔍 CHECKING PAYMENT 88 SELLER DETAILS\n');
  
  try {
    const response = await axios.get(`${PAYMENT_API_BASE_URL}/api/payments/88`);
    const payment = response.data.payment;
    
    console.log('💰 PAYMENT 88 FLOW:');
    console.log(`   Buyer (User): ${payment.user?.email || 'NOT FOUND'}`);
    console.log(`   Seller Email: ${payment.recipient_email || 'NOT SET'}`);
    console.log(`   Amount: ${payment.amount} MXN`);
    console.log('');
    
    console.log('🏦 PAYOUT DETAILS (TO SELLER):');
    console.log(`   Payout CLABE: ${payment.payout_clabe || 'NOT SET'}`);
    console.log(`   Payout Juno UUID: ${payment.payout_juno_bank_account_id || 'NOT SET'}`);
    console.log('');
    
    console.log('📋 SELLER IDENTIFICATION:');
    if (payment.recipient_email) {
      console.log(`   ✅ Seller Email: ${payment.recipient_email}`);
      
      if (payment.payout_clabe) {
        console.log(`   ✅ Seller CLABE: ${payment.payout_clabe}`);
        
        if (payment.payout_juno_bank_account_id) {
          console.log(`   ✅ Seller Juno UUID: ${payment.payout_juno_bank_account_id}`);
          console.log('   🎉 SELLER READY FOR PAYOUT');
        } else {
          console.log(`   ❌ Missing Seller Juno UUID`);
          console.log('   🔧 FIX NEEDED: Register seller CLABE with Juno');
        }
      } else {
        console.log(`   ❌ Missing Seller CLABE`);
        console.log('   🔧 FIX NEEDED: Seller needs to configure bank account');
      }
    } else {
      console.log(`   ❌ Missing Seller Email`);
      console.log('   🔧 FIX NEEDED: Payment missing recipient information');
    }
    
    console.log('\n🎯 ANALYSIS:');
    const readyForPayout = payment.payout_clabe && payment.payout_juno_bank_account_id;
    
    if (readyForPayout) {
      console.log('✅ SELLER READY: All payout details configured');
      console.log('   Issue must be Juno service outage');
    } else {
      console.log('❌ SELLER NOT READY: Missing payout configuration');
      if (!payment.payout_clabe) {
        console.log('   → Seller needs to set up bank account');
      }
      if (!payment.payout_juno_bank_account_id) {
        console.log('   → CLABE needs registration with Juno');
      }
    }
    
    return {
      sellerEmail: payment.recipient_email,
      sellerClabe: payment.payout_clabe,
      sellerJunoUuid: payment.payout_juno_bank_account_id,
      readyForPayout: readyForPayout
    };
    
  } catch (error) {
    console.error('❌ Error getting payment details:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('🎯 PAYMENT 88 SELLER PAYOUT VERIFICATION\n');
  console.log(`Current Time: ${new Date().toISOString()}`);
  
  const sellerDetails = await getPayment88SellerDetails();
  
  if (!sellerDetails) {
    console.log('\n❌ Cannot proceed - Payment details unavailable');
    return;
  }
  
  console.log('\n📋 NEXT STEPS:');
  
  if (sellerDetails.readyForPayout) {
    console.log('✅ Seller configuration is complete');
    console.log('✅ Issue confirmed as Juno service outage');
    console.log('⏳ Wait for Juno service recovery');
    console.log('🔄 Automation will auto-retry when service returns');
  } else {
    console.log('⚠️  Seller configuration incomplete:');
    
    if (!sellerDetails.sellerClabe) {
      console.log('   1. Seller must configure bank account (CLABE)');
    }
    
    if (!sellerDetails.sellerJunoUuid) {
      console.log('   2. Admin must register seller CLABE with Juno');
      console.log(`      CLABE to register: ${sellerDetails.sellerClabe}`);
    }
  }
}

main().catch(console.error);
