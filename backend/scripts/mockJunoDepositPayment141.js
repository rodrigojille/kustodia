/**
 * Mock SPEI Deposit Script for Payment 141
 * 
 * This script simulates a SPEI deposit from Juno API for testing payment automation
 * Uses the same approach as mock_nuevo_flujo_deposit.js but targets Payment 141
 * 
 * Payment Details:
 * - ID: 141
 * - Amount: $30,000.00 MXN
 * - Recipient: rodrigo@kustodia.mx
 * - Custody: 50% (15,000 MXN immediate payout + 15,000 MXN in escrow)
 * - CLABE: 710969000000419129
 */

require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

// Mock deposit configuration for Payment 141
const PAYMENT_ID = 141;
const DEPOSIT_CLABE = '710969000000419129'; // CLABE from payment 141
const AMOUNT = 30000; // 30,000 MXN

async function mockJunoDepositForPayment141() {
  try {
    console.log('--- PAYMENT 141 MOCK DEPOSIT ---');
    console.log(`Payment ID: ${PAYMENT_ID}`);
    console.log(`CLABE: ${DEPOSIT_CLABE}`);
    console.log(`Amount: ${AMOUNT} MXN`);
    
    const JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
    const JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;
    
    if (!JUNO_API_KEY || !JUNO_API_SECRET) {
      throw new Error('Missing Juno API credentials in environment variables');
    }
    
    const payload = {
      amount: AMOUNT,
      receiver_clabe: DEPOSIT_CLABE,
      receiver_name: 'Kustodia',
      sender_clabe: '032180000118359719', // Mock sender CLABE
      sender_name: 'Rodrigo Jille Mock Sender',
      reference: `Payment ${PAYMENT_ID} - Mock Deposit Test with Personalized Emails`
    };
    
    console.log('--- MOCK DEPOSIT PAYLOAD ---');
    console.log(payload);
    
    // Build Juno API request
    const nonce = Date.now().toString();
    const method = 'POST';
    const endpoint = '/spei/test/deposits';
    const body = JSON.stringify(payload);
    const dataToSign = nonce + method + endpoint + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    
    console.log('--- JUNO MOCK DEPOSIT DEBUG ---');
    console.log('String to sign:', dataToSign);
    console.log('Signature:', signature);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
    };
    
    console.log('Headers:', headers);
    console.log('Request payload:', payload);
    console.log('Body for signature:', body);
    
    // Make the request
    const response = await axios.post(
      'https://stage.buildwithjuno.com/spei/test/deposits',
      payload,
      { headers }
    );
    
    console.log('Mock deposit response:', response.data);
    
    console.log('\n🎉 Mock deposit successful!');
    console.log('⏳ Automation should detect this deposit and trigger payment flow');
    console.log('📝 Expected automation flow for Payment 141:');
    console.log('   1. Deposit detection → Payment status: pending → funded');
    console.log('   2. 📧 "funds_received" notification → "Hola Rodrigo" (personalized!)');
    console.log('   3. 💸 Immediate payout: $15,000 MXN to rodrigo@kustodia.mx');
    console.log('   4. 🔒 Escrow creation: $15,000 MXN (50% custody)');
    console.log('   5. 📧 "escrow_created" notification');
    console.log('   6. ⏰ Wait 1 day for custody release');
    console.log('   7. 📧 "payout_completed" notification when released');
    
  } catch (error) {
    console.error('❌ Mock deposit failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the script
if (require.main === module) {
  mockJunoDepositForPayment141()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { mockJunoDepositForPayment141 };
