require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

// Mock deposit configuration - UPDATED FOR MULTI-SIG TEST
const PAYMENT_ID = 140; // Payment ID for $30,000
const DEPOSIT_CLABE = '710969000000418418'; // CLABE from payment 140
const AMOUNT = 30000; // 30,000 MXN

async function mockNuevoFlujoDeposit() {
  try {
    console.log('--- NUEVO FLUJO MOCK DEPOSIT ---');
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
      sender_name: 'Kustodia',
      reference: `Nuevo Flujo Payment ${PAYMENT_ID} - Mock Deposit Test`
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
    console.log('⏳ Automation should detect this deposit and fund the escrow');
    console.log('📝 Next steps for nuevo_flujo testing:');
    console.log('   1. Wait for automation to detect deposit and create escrow');
    console.log('   2. Test payer approval via API or frontend');
    console.log('   3. Test payee approval via API or frontend');
    console.log('   4. Verify dual approval triggers automatic release');
    
  } catch (error) {
    console.error('❌ Mock deposit failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

console.log('🚀 Starting nuevo_flujo mock deposit...');
console.log('⚠️  IMPORTANT: Update PAYMENT_ID, DEPOSIT_CLABE, and AMOUNT variables after creating payment from frontend');
mockNuevoFlujoDeposit();
