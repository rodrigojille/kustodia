/**
 * Mock SPEI Deposit Script for Payment 144
 * 
 * This script creates a real mock deposit via Juno's test API for Payment 144
 * Uses Juno's /spei/test/deposits endpoint to simulate a SPEI deposit
 * 
 * Payment Details:
 * - ID: 144
 * - Amount: $15,000.00 MXN
 * - Payer: rodrigojille6@gmail.com
 * - Recipient: test-seller@kustodia.mx
 * - CLABE: 710969000000419530
 * - Custody: 100% for 1 day
 * - Description: Enganche depa
 */

require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

// Mock deposit configuration for Payment 144
const PAYMENT_ID = 144;
const DEPOSIT_CLABE = '710969000000419530'; // CLABE from payment 144
const AMOUNT = 15000; // 15,000 MXN

async function mockJunoDepositForPayment144() {
  try {
    console.log('--- PAYMENT 144 MOCK DEPOSIT ---');
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
    
    // Build Juno API request with proper authentication
    const nonce = Date.now().toString();
    const method = 'POST';
    const endpoint = '/spei/test/deposits';
    const body = JSON.stringify(payload);
    const dataToSign = nonce + method + endpoint + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    
    console.log('\n--- CREATING MOCK DEPOSIT VIA JUNO TEST API ---');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('String to sign:', dataToSign);
    console.log('Signature:', signature);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
    };
    
    console.log('Headers:', headers);
    
    const response = await axios.post(
      'https://stage.buildwithjuno.com/spei/test/deposits',
      payload,
      { headers }
    );
    
    console.log('\n--- MOCK DEPOSIT CREATED SUCCESSFULLY ---');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    console.log('\n--- NEXT STEPS ---');
    console.log('1. The PaymentAutomationService will detect this deposit within 1 minute');
    console.log('2. Payment 144 status will change from "pending" to "funded"');
    console.log('3. Escrow will be created and funded automatically');
    console.log('4. Check the payment timeline for updates');
    console.log('\n✅ Mock deposit script completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error creating mock deposit:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the script
mockJunoDepositForPayment144();
