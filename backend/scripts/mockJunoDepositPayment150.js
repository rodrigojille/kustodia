/**
 * Mock SPEI Deposit Script for Payment 150 - FINAL TEST #3 (COBRO INTELIGENTE)
 * 
 * This script creates a real mock deposit via Juno's test API for Payment 150
 * Uses Juno's /spei/test/deposits endpoint to simulate a SPEI deposit
 * 
 * Payment Details:
 * - ID: 150
 * - Amount: $5,000.00 MXN (100% custody)
 * - Payer: rodrigojille6@gmail.com
 * - Seller: test-seller@kustodia.mx
 * - Description: Enganche casa test
 * - Type: Standard payment (under $500 threshold - no multi-sig)
 */

require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

// Mock deposit configuration for Payment 150
const PAYMENT_ID = 150;
const DEPOSIT_CLABE = '710969000000420312'; // CLABE from payment 150
const AMOUNT = 5000; // 5,000 MXN
const CUSTODY_PERCENTAGE = 100; // 100% custody
const CUSTODY_AMOUNT = AMOUNT * (CUSTODY_PERCENTAGE / 100); // $5,000
const IMMEDIATE_PAYOUT = AMOUNT - CUSTODY_AMOUNT; // $0

async function mockJunoDepositForPayment150() {
  try {
    console.log('🧪 === FINAL TEST #3: PAYMENT 150 MOCK DEPOSIT (COBRO INTELIGENTE) ===');
    console.log(`Payment ID: ${PAYMENT_ID}`);
    console.log(`CLABE: ${DEPOSIT_CLABE}`);
    console.log(`Total Amount: $${AMOUNT.toLocaleString()} MXN`);
    console.log(`Custody: ${CUSTODY_PERCENTAGE}% ($${CUSTODY_AMOUNT.toLocaleString()} MXN)`);
    console.log(`Immediate Payout: $${IMMEDIATE_PAYOUT.toLocaleString()} MXN`);
    console.log('Payer: rodrigojille6@gmail.com');
    console.log('Recipient: test-seller@kustodia.mx');
    console.log('Type: Standard payment (under $500 threshold - no multi-sig)');
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
      sender_clabe: '032180000118359719', // Mock sender CLABE
      sender_name: 'Rodrigo Jille Final Test Sender',
      reference: `Payment ${PAYMENT_ID} - Final Test #3 - Cobro Inteligente - 100% Custody`
    };
    
    console.log('📤 Creating mock SPEI deposit...');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // Build Juno API request with proper authentication (matching Payment 149)
    const nonce = Date.now().toString();
    const method = 'POST';
    const endpoint = '/spei/test/deposits';
    const body = JSON.stringify(payload);
    const dataToSign = nonce + method + endpoint + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
    };
    
    console.log('📡 Sending mock deposit request to Juno API...');
    console.log(`Endpoint: POST ${endpoint}`);
    console.log(`Payload:`, JSON.stringify(payload, null, 2));
    console.log('Headers:', headers);
    console.log('');
    
    const response = await axios.post(
      'https://stage.buildwithjuno.com/spei/test/deposits',
      payload,
      { headers }
    );
    
    console.log('✅ SUCCESS: Mock deposit created successfully!');
    console.log('Response:', response.data);
    console.log('');
    console.log('🔄 Expected Cobro Inteligente Automation Flow:');
    console.log('1. ✅ Juno webhook → Backend payment automation');
    console.log('2. 🔍 processNewDeposits() detects $5,000 deposit');
    console.log('3. 💰 Payment status: pending → funded');
    console.log('4. 🚫 No multi-sig required: $5,000 < $500 threshold');
    console.log('5. 🔒 Automatic smart contract escrow creation');
    console.log('6. 📧 Cobro inteligente notifications sent with proper names');
    console.log('7. 📊 Payment status: funded → escrowed');
    console.log('8. ⏰ After 1 day: Automatic release');
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('- Monitor backend logs for automation flow');
    console.log('- Check email notifications for cobro inteligente alerts');
    console.log('- Verify buyer name personalization (should show "Hola Rodrigo" not "Hola (buyer)")');
    console.log('- Verify escrow creation and release timing');
    console.log('- Test complete end-to-end flow');
    
  } catch (error) {
    console.error('❌ Error creating mock deposit:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

// Execute the mock deposit for Payment 150
mockJunoDepositForPayment150();
