/**
 * Mock SPEI Deposit Script for Payment 120 - TEST DEPOSIT
 * 
 * This script creates a real mock deposit via Juno's test API for Payment 120
 * Uses Juno's /spei/test/deposits endpoint to simulate a SPEI deposit
 * 
 * Payment Details:
 * - ID: 120
 * - Amount: $2,500.00 MXN (100% custody)
 * - Payer: rodrigo@kustodia.mx
 * - Seller: carlosaguerof@gmail.com
 * - Description: Pago servicios
 * - CLABE: 710969000000420927
 * - Type: Standard payment
 */

require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

// Mock deposit configuration for Payment 120
const PAYMENT_ID = 120;
const DEPOSIT_CLABE = '710969000000420927'; // CLABE from payment 120
const AMOUNT = 2500; // 2,500 MXN
const CUSTODY_PERCENTAGE = 100; // 100% custody
const CUSTODY_AMOUNT = AMOUNT * (CUSTODY_PERCENTAGE / 100); // $2,500
const IMMEDIATE_PAYOUT = AMOUNT - CUSTODY_AMOUNT; // $0

async function mockJunoDepositForPayment120() {
  try {
    console.log('🧪 === MOCK DEPOSIT TEST: PAYMENT 120 ===');
    console.log(`Payment ID: ${PAYMENT_ID}`);
    console.log(`CLABE: ${DEPOSIT_CLABE}`);
    console.log(`Total Amount: $${AMOUNT.toLocaleString()} MXN`);
    console.log(`Custody: ${CUSTODY_PERCENTAGE}% ($${CUSTODY_AMOUNT.toLocaleString()} MXN)`);
    console.log(`Immediate Payout: $${IMMEDIATE_PAYOUT.toLocaleString()} MXN`);
    console.log('Payer: rodrigo@kustodia.mx');
    console.log('Recipient: carlosaguerof@gmail.com');
    console.log('Description: Pago servicios');
    console.log('Type: Standard payment');
    console.log('Expected Flow: Deposit → Automatic escrow creation → Release after 1 day');
    console.log('');
    
    const JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
    const JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;
    
    if (!JUNO_API_KEY || !JUNO_API_SECRET) {
      throw new Error('Missing Juno API credentials in environment variables');
    }
    
    const payload = {
      amount: AMOUNT,
      receiver_clabe: DEPOSIT_CLABE,
      receiver_name: 'Kustodia',
      sender_clabe: '032180000118359719', // Test sender CLABE
      sender_name: 'Test Payer Payment 120',
      reference: `Mock deposit for Payment ${PAYMENT_ID} - Pago servicios - ${Date.now()}`
    };
    
    console.log('📤 Payload to send:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('');
    
    // Build authentication signature
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
    
    console.log('✅ SUCCESS! Mock deposit created');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Wait 1-2 minutes for Juno webhook to process the deposit');
    console.log('2. Check payment status in the Kustodia dashboard');
    console.log('3. Verify that payment 120 moves to "escrowed" status');
    console.log('4. Confirm automation processes the deposit correctly');
    console.log('');
    console.log('🎯 Expected Result:');
    console.log(`- Payment ${PAYMENT_ID} should change from "pending" to "escrowed"`);
    console.log(`- Escrow should be created with $${CUSTODY_AMOUNT.toLocaleString()} MXN`);
    console.log('- Timeline should show deposit received event');
    
  } catch (error) {
    console.error('❌ ERROR creating mock deposit:', error.message);
    
    if (error.response) {
      console.error('API Response:', JSON.stringify(error.response.data, null, 2));
      console.error('Status Code:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
    
    if (error.request) {
      console.error('Request failed:', error.request);
    }
    
    throw error;
  }
}

// Execute the mock deposit for Payment 120
mockJunoDepositForPayment120();
