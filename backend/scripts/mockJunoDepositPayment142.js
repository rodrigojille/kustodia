/**
 * Mock SPEI Deposit Script for Payment 142
 * 
 * This script creates a real mock deposit via Juno's test API for Payment 142
 * Uses Juno's /spei/test/deposits endpoint to simulate a SPEI deposit
 * 
 * Payment Details:
 * - ID: 142
 * - Amount: $10,000.00 MXN
 * - Recipient: rodrigo@kustodia.mx
 * - Custody: 100% (Full amount goes to escrow)
 * - CLABE: 710969000000419158
 */

require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

// Mock deposit configuration for Payment 142
const PAYMENT_ID = 142;
const DEPOSIT_CLABE = '710969000000419158'; // CLABE from payment 142
const AMOUNT = 10000; // 10,000 MXN

async function mockJunoDepositForPayment142() {
  try {
    console.log('--- PAYMENT 142 MOCK DEPOSIT ---');
    console.log(`Payment ID: ${PAYMENT_ID}`);
    console.log(`CLABE: ${DEPOSIT_CLABE}`);
    console.log(`Amount: ${AMOUNT} MXN`);
    console.log('Custody: 100% (Full amount to escrow)');
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
    console.log('📝 Expected automation flow for Payment 142:');
    console.log('   1. Deposit detection → Payment status: pending → funded');
    console.log('   2. ⏳ Wait 1 minute for Juno MXNB minting');
    console.log('   3. ⏩ Skip seller payout (0% immediate payout)');
    console.log('   4. 🏦 Bridge withdrawal: $10,000 MXNB → Bridge wallet');
    console.log('   5. 🔒 Escrow creation: Full $10,000 MXNB in smart contract');
    console.log('   6. 📊 Payment status: funded → escrowed');
    console.log('   7. ⏰ Wait 1 day for custody release (1/8/2025, 7:56:44 p.m.)');
    console.log('   8. 💸 Automatic seller payout after custody ends');
    
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
  mockJunoDepositForPayment142()
    .then(() => {
      console.log('\n✅ Payment 142 mock deposit completed!');
      console.log('🔄 Automation service should detect this deposit shortly');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error.message);
      process.exit(1);
    });
}
