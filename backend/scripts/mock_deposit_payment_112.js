const crypto = require('crypto');
const axios = require('axios');

/**
 * Mock SPEI deposit for Payment 112 (Nuevo Flujo - Inmobiliarias)
 * This simulates a deposit to trigger automation for dual approval testing
 */

async function mockDepositPayment112() {
  console.log('🏦 Creating mock SPEI deposit for Payment 112 (Nuevo Flujo)...');
  
  // Mock deposit data for Payment 112
  const depositData = {
    amount: 10000.00, // $10,000 MXN
    receiver_clabe: '710969000000410995', // Payment 112 CLABE
    receiver_name: 'Kustodia', // Business name registered in Juno
    sender_clabe: '002668900881819471', // Rodrigo's CLABE
    sender_name: 'Rodrigo_Jimenez', // Sender name
    reference: 'Apartado depa sonora 398 - Payment 112 Nuevo Flujo'
  };

  console.log('📋 Deposit Details:');
  console.log(`   - Amount: $${depositData.amount} MXN`);
  console.log(`   - CLABE: ${depositData.receiver_clabe}`);
  console.log(`   - Sender: ${depositData.sender_name}`);
  console.log(`   - Reference: ${depositData.reference}`);

  // Juno API authentication
  const JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
  const JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;

  if (!JUNO_API_KEY || !JUNO_API_SECRET) {
    console.error('❌ Missing Juno API credentials!');
    console.error('JUNO_STAGE_API_KEY:', JUNO_API_KEY ? 'Set' : 'Missing');
    console.error('JUNO_STAGE_API_SECRET:', JUNO_API_SECRET ? 'Set' : 'Missing');
    return;
  }

  // Create Juno API signature
  const nonce = Date.now().toString();
  const method = 'POST';
  const requestPath = '/spei/test/deposits';
  const bodyString = JSON.stringify(depositData);
  const stringToSign = nonce + method + requestPath + bodyString;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(stringToSign).digest('hex');
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
  };

  try {
    console.log('🔐 Authenticating with Juno API...');
    
    // Create mock deposit via Juno API
    const response = await axios.post('https://stage.buildwithjuno.com/spei/test/deposits', depositData, { headers });

    console.log('✅ Mock deposit created successfully!');
    console.log('📋 Response:', response.data);
    
    console.log('\n🔄 Next Steps:');
    console.log('1. Wait for automation to detect the deposit (1-2 minutes)');
    console.log('2. Payment status should change to "funded"');
    console.log('3. Since this is nuevo_flujo, escrow will be created but NOT released');
    console.log('4. Both payer and payee must approve before release');
    console.log('\n📋 Approval Endpoints:');
    console.log('   Payer: POST /api/payments/112/approve/payer');
    console.log('   Payee: POST /api/payments/112/approve/payee');
      
  } catch (error) {
    console.error('❌ Error creating mock deposit:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

// Load environment variables
require('dotenv').config();

// Validate required environment variables
if (!process.env.JUNO_STAGE_API_KEY) {
  console.error('❌ JUNO_STAGE_API_KEY environment variable is required');
  process.exit(1);
}

// Run the mock deposit
mockDepositPayment112()
  .then(() => {
    console.log('\n✅ Mock deposit script completed');
    console.log('💡 Monitor the backend logs to see automation processing');
    console.log('🎯 Payment 112 should transition: pending → funded → escrowed');
    console.log('⏳ Escrow will wait for dual approval before release');
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
