/**
 * Mock SPEI Deposit Script for Payment 117
 * 
 * This script creates a real mock deposit via Juno's test API for Payment 117
 * Uses Juno's /spei/test/deposits endpoint to simulate a SPEI deposit
 * 
 * Payment Details:
 * - ID: 117
 * - Amount: $1,000.00 MXN
 * - Payer: rodrigojille6@gmail.com
 * - Recipient: test-seller@kustodia.mx
 * - Custody: 100% (Full amount goes to escrow for 1 day)
 * - CLABE: [Will be fetched from payment record]
 */

require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

// Mock deposit configuration for Payment 117
const PAYMENT_ID = 117;
const DEPOSIT_CLABE = '710969000000419491'; // Correct CLABE for payment 117
const AMOUNT = 1000; // 1,000 MXN

async function mockJunoDepositForPayment117() {
  try {
    console.log('--- PAYMENT 117 MOCK DEPOSIT ---');
    console.log(`Payment ID: ${PAYMENT_ID}`);
    console.log(`CLABE: ${DEPOSIT_CLABE}`);
    console.log(`Amount: ${AMOUNT} MXN`);
    console.log('Payer: rodrigojille6@gmail.com');
    console.log('Recipient: test-seller@kustodia.mx');
    console.log('Custody: 100% (Full amount to escrow for 1 day)');
    console.log('Immediate Payout: $0');
    
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
      reference: `Payment ${PAYMENT_ID} - 100% Custody Test Deposit`
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
    
    // Make the request to Juno's test API
    const response = await axios.post(
      'https://stage.buildwithjuno.com/spei/test/deposits',
      payload,
      { headers }
    );
    
    console.log('Mock deposit response:', response.data);
    
    console.log('\n🎉 Mock deposit successful!');
    console.log('⏳ Automation should detect this deposit and trigger payment flow');
    console.log('📝 Expected automation flow for Payment 117:');
    console.log('   1. Deposit detection → Payment status: pending → funded');
    console.log('   2. ⏳ Wait 1 minute for Juno MXNB minting');
    console.log('   3. ⏩ Skip seller payout (0% immediate payout)');
    console.log('   4. 🏦 Bridge withdrawal: $1,000 MXNB → Bridge wallet');
    console.log('   5. 🔒 Escrow creation: Full $1,000 MXNB in smart contract');
    console.log('   6. 📊 Payment status: funded → escrowed');
    console.log('   7. ⏰ Wait 1 day for custody release');
    console.log('   8. 💸 Automatic seller payout to test-seller@kustodia.mx after custody ends');
    
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
  mockJunoDepositForPayment117()
    .then(() => {
      console.log('\n✅ Payment 117 mock deposit completed!');
      console.log('🔄 Automation service should detect this deposit shortly');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { mockJunoDepositForPayment117 };
