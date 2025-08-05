/**
 * Mock SPEI Deposit Script for Payment 119 - TEST DEPOSIT
 * 
 * This script creates a real mock deposit via Juno's test API for Payment 119
 * Uses Juno's /spei/test/deposits endpoint to simulate a SPEI deposit
 * 
 * Payment Details:
 * - ID: 119
 * - Amount: $1,000.00 MXN (100% custody)
 * - Payer: rodrigo@kustodia.mx
 * - Seller: test-seller@kustodia.mx
 * - Description: test
 * - CLABE: 710969000000420914
 * - Type: Standard payment
 * - Custody Days: 1
 * - Custody End: 6/8/2025, 10:36:09 a.m.
 */

require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

// Mock deposit configuration for Payment 119
const PAYMENT_ID = 119;
const DEPOSIT_CLABE = '710969000000420914'; // CLABE from payment 119
const AMOUNT = 1000; // 1,000 MXN
const CUSTODY_PERCENTAGE = 100; // 100% custody
const CUSTODY_AMOUNT = AMOUNT * (CUSTODY_PERCENTAGE / 100); // $1,000
const IMMEDIATE_PAYOUT = AMOUNT - CUSTODY_AMOUNT; // $0

async function mockJunoDepositForPayment119() {
  try {
    console.log('🧪 === MOCK DEPOSIT TEST: PAYMENT 119 ===');
    console.log(`Payment ID: ${PAYMENT_ID}`);
    console.log(`CLABE: ${DEPOSIT_CLABE}`);
    console.log(`Total Amount: $${AMOUNT.toLocaleString()} MXN`);
    console.log(`Custody: ${CUSTODY_PERCENTAGE}% ($${CUSTODY_AMOUNT.toLocaleString()} MXN)`);
    console.log(`Immediate Payout: $${IMMEDIATE_PAYOUT.toLocaleString()} MXN`);
    console.log('Payer: rodrigo@kustodia.mx');
    console.log('Recipient: test-seller@kustodia.mx');
    console.log('Description: test');
    console.log('Type: Standard payment');
    console.log('Custody Days: 1');
    console.log('Custody End: 6/8/2025, 10:36:09 a.m.');
    console.log('Expected Flow: Deposit → Automatic escrow creation → Release after 1 day');
    console.log('');
    
    const JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
    const JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;
    
    if (!JUNO_API_KEY || !JUNO_API_SECRET) {
      throw new Error('Missing Juno API credentials in environment variables');
    }
    
    // Generate unique transaction ID
    const transactionId = `MOCK_SPEI_119_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the mock deposit payload (matching payment 120 format)
    const payload = {
      amount: AMOUNT,
      receiver_clabe: DEPOSIT_CLABE,
      receiver_name: 'Kustodia',
      sender_clabe: '032180000118359719', // Test sender CLABE
      sender_name: 'Test Payer Payment 119',
      reference: `Mock deposit for Payment ${PAYMENT_ID} - test - ${Date.now()}`
    };
    
    console.log('📤 Payload to send:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('');
    
    // Build authentication signature (matching payment 120 format)
    const nonce = Date.now().toString();
    const method = 'POST';
    const requestPath = '/spei/test/deposits';
    const bodyString = JSON.stringify(payload);
    const stringToSign = nonce + method + requestPath + bodyString;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(stringToSign).digest('hex');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
    };
    
    console.log('🔐 Authentication:');
    console.log(`API Key: ${JUNO_API_KEY.substring(0, 4)}...`);
    console.log(`Nonce: ${nonce}`);
    console.log(`String to sign: ${stringToSign}`);
    console.log(`Signature: ${signature}`);
    console.log('');
    
    // Send the mock deposit request
    console.log('🚀 Sending mock deposit to Juno staging API...');
    const response = await axios.post(
      'https://stage.buildwithjuno.com/spei/test/deposits',
      payload,
      { headers }
    );
    
    console.log('✅ Mock deposit created successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('');
    console.log('🔄 Expected next steps:');
    console.log('1. Juno webhook will notify our backend');
    console.log('2. Backend will process the deposit');
    console.log('3. Payment 119 status will update to "funds_received"');
    console.log('4. Email notification will be sent to both parties');
    console.log('5. Escrow will be created automatically');
    console.log('6. Funds will be held for 1 day until 6/8/2025, 10:36:09 a.m.');
    console.log('');
    console.log('📧 Test the new email UX:');
    console.log('- Check email for payment notification');
    console.log('- Click "Ver Detalles Completos" button');
    console.log('- Should redirect to: https://kustodia.mx/pagos/119');
    console.log('- Test authentication flow if not logged in');
    
  } catch (error) {
    console.error('❌ Error creating mock deposit:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Execute the mock deposit for Payment 119
mockJunoDepositForPayment119();
