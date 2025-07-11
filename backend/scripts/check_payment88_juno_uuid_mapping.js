require('dotenv').config();
const axios = require('axios');

const PAYMENT_API_BASE_URL = process.env.PAYMENT_API_BASE_URL || 'http://localhost:4000';

async function checkPayment88JunoUuidMapping() {
  console.log('🔍 CHECKING PAYMENT 88 JUNO UUID MAPPING\n');
  
  try {
    const response = await axios.get(`${PAYMENT_API_BASE_URL}/api/payments/88`);
    const payment = response.data.payment;
    
    console.log('💰 PAYMENT 88 RECORD:');
    console.log(`   Payment ID: ${payment.id}`);
    console.log(`   Recipient Email: ${payment.recipient_email}`);
    console.log(`   Payout CLABE: ${payment.payout_clabe || 'NOT SET'}`);
    console.log(`   Payout Juno UUID: ${payment.payout_juno_bank_account_id || 'NOT SET'}`);
    console.log('');
    
    console.log('👤 SELLER (from users table):');
    console.log(`   Email: test-seller@kustodia.mx`);
    console.log(`   User ID: 3`);
    console.log(`   Juno Bank Account ID: f14bdec6-45ba-4e55-8c42-599df650c8cf`);
    console.log('');
    
    console.log('🔍 FIELD MAPPING ANALYSIS:');
    
    if (payment.payout_juno_bank_account_id) {
      console.log('✅ Payment HAS payout_juno_bank_account_id');
      console.log(`   Value: ${payment.payout_juno_bank_account_id}`);
      
      if (payment.payout_juno_bank_account_id === 'f14bdec6-45ba-4e55-8c42-599df650c8cf') {
        console.log('✅ UUID MATCHES seller juno_bank_account_id');
        console.log('   Issue must be Juno service outage only');
      } else {
        console.log('❌ UUID MISMATCH');
        console.log('   Payment UUID:', payment.payout_juno_bank_account_id);
        console.log('   Seller UUID: f14bdec6-45ba-4e55-8c42-599df650c8cf');
      }
    } else {
      console.log('❌ Payment MISSING payout_juno_bank_account_id');
      console.log('   Need to copy from seller: f14bdec6-45ba-4e55-8c42-599df650c8cf');
    }
    
    console.log('\n🔧 DIAGNOSIS:');
    
    if (!payment.payout_juno_bank_account_id) {
      console.log('🚨 FIELD MAPPING BUG CONFIRMED:');
      console.log('   - Seller has juno_bank_account_id in users table ✅');
      console.log('   - Payment missing payout_juno_bank_account_id ❌');
      console.log('   - Need to copy seller UUID to payment record');
      console.log('');
      console.log('💡 SQL FIX REQUIRED:');
      console.log(`
      -- Copy seller's Juno UUID to payment record
      UPDATE payments 
      SET payout_juno_bank_account_id = 'f14bdec6-45ba-4e55-8c42-599df650c8cf' 
      WHERE id = 88;
      
      -- Reset payment for retry
      UPDATE payments SET status = 'escrowed' WHERE id = 88;
      UPDATE escrows SET status = 'released' WHERE id = 76;
      `);
    } else {
      console.log('✅ Field mapping is correct');
      console.log('   Issue is only Juno service outage');
    }
    
  } catch (error) {
    console.error('❌ Error checking payment details:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🎯 PAYMENT 88 JUNO UUID FIELD MAPPING CHECK\n');
  console.log(`Current Time: ${new Date().toISOString()}`);
  
  await checkPayment88JunoUuidMapping();
}

main().catch(console.error);
