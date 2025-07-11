require('dotenv').config();
const axios = require('axios');

const PAYMENT_API_BASE_URL = process.env.PAYMENT_API_BASE_URL || 'http://localhost:4000';

async function validateSellerUuidMappings() {
  console.log('🔍 VALIDATING SELLER UUID MAPPINGS IN ALL PAYMENTS\n');
  
  try {
    // Get all payments
    const response = await axios.get(`${PAYMENT_API_BASE_URL}/api/payments`);
    const payments = response.data.payments || response.data;
    
    if (!Array.isArray(payments)) {
      console.log('❌ Unable to fetch payments list');
      return;
    }
    
    console.log(`📊 Total payments found: ${payments.length}\n`);
    
    const issues = [];
    const fixed = [];
    const noSellerNeeded = [];
    
    for (const payment of payments) {
      const paymentId = payment.id;
      const recipientEmail = payment.recipient_email;
      const payoutJunoUuid = payment.payout_juno_bank_account_id;
      const status = payment.status;
      
      // Skip payments that don't need seller UUIDs
      if (!recipientEmail || status === 'cancelled' || status === 'rejected' || status === 'refunded') {
        noSellerNeeded.push({
          id: paymentId,
          status: status,
          reason: 'Payment type does not require seller UUID'
        });
        continue;
      }
      
      if (!payoutJunoUuid) {
        // This payment is missing seller UUID - need to check if seller has one
        console.log(`⚠️  Payment ${paymentId}:`);
        console.log(`   Recipient: ${recipientEmail}`);
        console.log(`   Status: ${status}`);
        console.log(`   Missing: payout_juno_bank_account_id`);
        
        issues.push({
          id: paymentId,
          recipient_email: recipientEmail,
          status: status,
          issue: 'Missing payout_juno_bank_account_id'
        });
      } else {
        fixed.push({
          id: paymentId,
          recipient_email: recipientEmail,
          status: status,
          juno_uuid: payoutJunoUuid
        });
      }
    }
    
    console.log('\n📋 VALIDATION SUMMARY:\n');
    
    console.log(`✅ Payments with seller UUID: ${fixed.length}`);
    if (fixed.length > 0) {
      console.log('   Sample UUIDs:');
      fixed.slice(0, 3).forEach(p => {
        console.log(`   - Payment ${p.id}: ${p.juno_uuid.substring(0, 8)}...`);
      });
    }
    
    console.log(`⚠️  Payments missing seller UUID: ${issues.length}`);
    if (issues.length > 0) {
      console.log('   Affected payments:');
      issues.forEach(p => {
        console.log(`   - Payment ${p.id} (${p.status}): ${p.recipient_email}`);
      });
      
      console.log('\n💡 SQL TO CHECK SELLER UUIDs:');
      console.log(`
SELECT p.id, p.recipient_email, p.status, p.payout_juno_bank_account_id, u.juno_bank_account_id as seller_uuid
FROM payments p
LEFT JOIN users u ON u.email = p.recipient_email
WHERE p.id IN (${issues.map(p => p.id).join(', ')})
  AND p.recipient_email IS NOT NULL;
      `);
      
      console.log('\n🔧 BULK FIX TEMPLATE:');
      console.log('-- Run this after checking which sellers actually have UUIDs');
      issues.forEach(p => {
        console.log(`-- UPDATE payments SET payout_juno_bank_account_id = (SELECT juno_bank_account_id FROM users WHERE email = '${p.recipient_email}') WHERE id = ${p.id} AND (SELECT juno_bank_account_id FROM users WHERE email = '${p.recipient_email}') IS NOT NULL;`);
      });
    }
    
    console.log(`ℹ️  Payments not requiring seller UUID: ${noSellerNeeded.length}`);
    
    console.log('\n🎯 RECOMMENDATION:');
    if (issues.length === 0) {
      console.log('✅ All active payments have proper seller UUID mapping');
      console.log('✅ Backend fix is working correctly for new payments');
    } else {
      console.log('⚠️  Some payments are missing seller UUIDs');
      console.log('   1. Check if affected sellers have juno_bank_account_id in users table');
      console.log('   2. Use bulk fix SQL to update payments where sellers have UUIDs');
      console.log('   3. For sellers without UUIDs, register their CLABEs with Juno first');
    }
    
  } catch (error) {
    console.error('❌ Error validating seller UUID mappings:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🎯 SELLER UUID MAPPING VALIDATION\n');
  console.log(`Current Time: ${new Date().toISOString()}`);
  
  await validateSellerUuidMappings();
}

main().catch(console.error);
