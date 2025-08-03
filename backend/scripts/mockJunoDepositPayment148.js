/**
 * Mock SPEI Deposit Script for Payment 148 - FINAL TEST #1
 * 
 * This script creates a real mock deposit via Juno's test API for Payment 148
 * Uses Juno's /spei/test/deposits endpoint to simulate a SPEI deposit
 * 
 * Payment Details:
 * - ID: 148
 * - Amount: $5,000.00 MXN
 * - Payer: rodrigojille6@gmail.com
 * - Recipient: test-seller@kustodia.mx
 * - CLABE: 710969000000420299
 * - Custody: 50% ($2,500.00) for 1 day
 * - Immediate Payout: $2,500.00
 * - Description: Test final
 * - Type: Standard payment (below $500 USD multi-sig threshold)
 */

require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

// Mock deposit configuration for Payment 148
const PAYMENT_ID = 148;
const DEPOSIT_CLABE = '710969000000420299'; // CLABE from payment 148
const AMOUNT = 5000; // 5,000 MXN
const CUSTODY_PERCENTAGE = 50; // 50% custody
const CUSTODY_AMOUNT = AMOUNT * (CUSTODY_PERCENTAGE / 100); // $2,500
const IMMEDIATE_PAYOUT = AMOUNT - CUSTODY_AMOUNT; // $2,500

async function mockJunoDepositForPayment148() {
  try {
    console.log('🧪 === FINAL TEST #1: PAYMENT 148 MOCK DEPOSIT ===');
    console.log(`Payment ID: ${PAYMENT_ID}`);
    console.log(`CLABE: ${DEPOSIT_CLABE}`);
    console.log(`Total Amount: $${AMOUNT.toLocaleString()} MXN`);
    console.log(`Custody: ${CUSTODY_PERCENTAGE}% ($${CUSTODY_AMOUNT.toLocaleString()} MXN)`);
    console.log(`Immediate Payout: $${IMMEDIATE_PAYOUT.toLocaleString()} MXN`);
    console.log('Payer: rodrigojille6@gmail.com');
    console.log('Recipient: test-seller@kustodia.mx');
    console.log('Type: Standard payment (no multi-sig required)');
    console.log('Expected Flow: Deposit → Immediate payout → Escrow hold → Release after 1 day');
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
      reference: `Payment ${PAYMENT_ID} - Final Test #1 - 50% Custody`
    };
    
    // Build Juno API request with proper authentication (matching Payment 144)
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
    console.log('🔄 Expected Automation Flow:');
    console.log('1. ✅ Juno webhook → Backend payment automation');
    console.log('2. ⏳ Immediate payout: $2,500 to test-seller@kustodia.mx');
    console.log('3. ⏳ Escrow hold: $2,500 for 1 day');
    console.log('4. ⏳ Notifications sent to both parties');
    console.log('5. ⏳ Database updated with transaction records');
    console.log('6. ⏳ After 1 day: Automatic escrow release');
    console.log('');
    console.log('🎯 MONITORING POINTS:');
    console.log('- Check payment status updates in dashboard');
    console.log('- Verify email notifications delivered');
    console.log('- Monitor backend logs for automation triggers');
    console.log('- Confirm database consistency');
    console.log('- Validate no multi-sig transactions created (standard payment)');
    
  } catch (error) {
    console.error('❌ ERROR: Failed to create mock deposit');
    console.error('Error details:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.error('🔐 Authentication failed - check API credentials');
    } else if (error.response?.status === 400) {
      console.error('📝 Bad request - check payload format');
    }
    
    process.exit(1);
  }
}

// Run the script
console.log('🚀 Starting Final Test #1 - Payment 148 Mock Deposit');
console.log('Time:', new Date().toISOString());
console.log('');

mockJunoDepositForPayment148();
