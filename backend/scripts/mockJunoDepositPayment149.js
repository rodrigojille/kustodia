/**
 * Mock SPEI Deposit Script for Payment 149 - FINAL TEST #2 (MULTI-SIG)
 * 
 * This script creates a real mock deposit via Juno's test API for Payment 149
 * Uses Juno's /spei/test/deposits endpoint to simulate a SPEI deposit
 * 
 * Payment Details:
 * - ID: 149
 * - Amount: $30,000.00 MXN (100% custody)
 * - Payer: rodrigojille6@gmail.com
 * - Seller: test-seller@kustodia.mx
 * - Description: Enganche Cupra Ateca 2022
 * - Type: Multi-sig required (above $500 threshold)
 */

require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

// Mock deposit configuration for Payment 149
const PAYMENT_ID = 149;
const DEPOSIT_CLABE = '710969000000420309'; // CLABE from payment 149
const AMOUNT = 30000; // 30,000 MXN
const CUSTODY_PERCENTAGE = 100; // 100% custody
const CUSTODY_AMOUNT = AMOUNT * (CUSTODY_PERCENTAGE / 100); // $30,000
const IMMEDIATE_PAYOUT = AMOUNT - CUSTODY_AMOUNT; // $0

async function mockJunoDepositForPayment149() {
  try {
    console.log('🧪 === FINAL TEST #2: PAYMENT 149 MOCK DEPOSIT (MULTI-SIG) ===');
    console.log(`Payment ID: ${PAYMENT_ID}`);
    console.log(`CLABE: ${DEPOSIT_CLABE}`);
    console.log(`Total Amount: $${AMOUNT.toLocaleString()} MXN`);
    console.log(`Custody: ${CUSTODY_PERCENTAGE}% ($${CUSTODY_AMOUNT.toLocaleString()} MXN)`);
    console.log(`Immediate Payout: $${IMMEDIATE_PAYOUT.toLocaleString()} MXN`);
    console.log('Payer: rodrigojille6@gmail.com');
    console.log('Recipient: test-seller@kustodia.mx');
    console.log('Type: Multi-sig required (above $500 threshold)');
    console.log('Expected Flow: Deposit → Multi-sig approval → Escrow creation → Release after 1 day');
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
      reference: `Payment ${PAYMENT_ID} - Final Test #2 - Multi-sig Test - 100% Custody`
    };
    
    // Build Juno API request with proper authentication (matching Payment 148)
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
    console.log('🔄 Expected Multi-Sig Automation Flow:');
    console.log('1. ✅ Juno webhook → Backend payment automation');
    console.log('2. 🔍 processNewDeposits() detects $30,000 deposit');
    console.log('3. 💰 Payment status: pending → funded');
    console.log('4. 🔐 Multi-sig detection: $30,000 > $500 threshold');
    console.log('5. 📋 Pre-approval transaction created for admin approval');
    console.log('6. 👨‍💼 Admin approval required in operations dashboard');
    console.log('7. ✅ After approval: Smart contract escrow creation');
    console.log('8. 📧 Multi-sig approval notifications sent');
    console.log('9. 📊 Payment status: funded → escrowed');
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('- Monitor operations control room for approval requests');
    console.log('- Check email notifications for multi-sig alerts');
    console.log('- Verify escrow creation after admin approval');
    console.log('- Validate database consistency throughout process');
    
  } catch (error) {
    console.error('❌ ERROR: Mock deposit failed!');
    console.error('Status:', error.response?.status || 'Unknown');
    console.error('Error:', error.response?.data || error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('- Check Juno API credentials in .env file');
    console.error('- Verify staging environment is accessible');
    console.error('- Confirm CLABE format is correct');
    console.error('- Review payload structure matches API expectations');
  }
}

// Execute the mock deposit for Payment 149
mockJunoDepositForPayment149();
