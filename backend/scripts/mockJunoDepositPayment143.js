/**
 * Mock SPEI Deposit Script for Payment 143
 * 
 * This script creates a real mock deposit via Juno's test API for Payment 143
 * Uses Juno's /spei/test/deposits endpoint to simulate a SPEI deposit
 * 
 * Payment Details:
 * - ID: 143
 * - Amount: $5,000.00 MXN
 * - Payer: rodrigojille6@gmail.com
 * - Recipient: test-seller@kustodia.mx
 * - CLABE: 710969000000419527
 * - Custody: 100% for 1 day
 * - Description: Test
 */

require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

// Mock deposit configuration for Payment 143
const PAYMENT_ID = 143;
const DEPOSIT_CLABE = '710969000000419527'; // CLABE from payment 143
const AMOUNT = 5000; // 5,000 MXN

async function mockJunoDepositForPayment143() {
  try {
    console.log('--- PAYMENT 143 MOCK DEPOSIT ---');
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
    
    // Generate HMAC signature for Juno API (matching other scripts)
    const nonce = Date.now();
    const method = 'POST';
    const endpoint = '/spei/test/deposits';
    const body = JSON.stringify(payload);
    
    const dataToSign = nonce + method + endpoint + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    
    console.log('--- JUNO API REQUEST ---');
    console.log('String to sign:', dataToSign);
    console.log('Signature:', signature);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
    };
    
    console.log('Headers:', headers);
    console.log('Request payload:', payload);
    
    // Make the request to Juno's test API (using correct endpoint)
    const response = await axios.post(
      'https://stage.buildwithjuno.com/spei/test/deposits',
      payload,
      { headers }
    );
    
    console.log('--- JUNO API RESPONSE ---');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
    console.log('\n🎉 Mock deposit successful!');
    console.log('⏳ Automation will detect this deposit automatically (every 1 minute)');
    console.log('📝 Expected automation flow for Payment 143:');
    
    console.log('\n--- EXPECTED AUTOMATION FLOW ---');
    console.log('📊 Watch backend logs for:');
    console.log('   1. Payment 143 status: pending → funded');
    console.log('   2. Wait 1 minute for MXNB minting');
    console.log('   3. Escrow creation (100% custody = $5,000.00)');
    console.log('   4. Payment status: funded → escrowed');
    console.log('   5. No immediate payout (0% payout amount)');
    
  } catch (error) {
    console.error('❌ Error creating mock deposit:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the script
if (require.main === module) {
  mockJunoDepositForPayment143()
    .then(() => {
      console.log('\n✅ Mock deposit script completed');
      console.log('🔍 Check backend logs to see automation progress');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error.message);
      process.exit(1);
    });
}
