require('dotenv').config();
const AppDataSource = require('../dist/ormconfig').default;
const { Payment } = require('../dist/entity/Payment');
const crypto = require('crypto');
const axios = require('axios');

/**
 * Universal Mock Deposit Script
 * Usage: node scripts/universal_mock_deposit.js [PAYMENT_ID]
 * Example: node scripts/universal_mock_deposit.js 115
 */

async function createMockDepositForPayment(paymentId) {
  console.log(`🏦 Creating mock SPEI deposit for Payment ${paymentId} via Juno API...`);
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Database connected');

    // Get Payment details
    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = await paymentRepo.findOne({
      where: { id: parseInt(paymentId) },
      relations: ['escrow']
    });

    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    console.log(`📊 Payment ${paymentId} details:`);
    console.log(`- Amount: ${payment.amount} MXN`);
    console.log(`- CLABE: ${payment.deposit_clabe}`);
    console.log(`- Status: ${payment.status}`);
    console.log(`- Type: ${payment.payment_type || 'standard'}`);
    console.log(`- Escrow ID: ${payment.escrow_id}`);

    // Validate payment can receive deposits
    if (!payment.deposit_clabe) {
      throw new Error(`Payment ${paymentId} has no deposit CLABE assigned`);
    }

    if (payment.status === 'paid' || payment.status === 'completed') {
      console.log(`⚠️  Warning: Payment ${paymentId} is already ${payment.status}`);
    }

    // Check Juno API credentials
    const JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
    const JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;

    if (!JUNO_API_KEY || !JUNO_API_SECRET) {
      throw new Error('Missing Juno API credentials in environment variables');
    }

    // Prepare mock deposit payload
    const mockDepositPayload = {
      amount: parseFloat(payment.amount),
      receiver_clabe: payment.deposit_clabe,
      receiver_name: 'Kustodia',
      sender_clabe: '032180000118359719', // Test sender CLABE
      sender_name: `Test Payer Payment ${paymentId}`,
      reference: `Mock deposit for Payment ${paymentId} - ${payment.payment_type || 'standard'} - ${Date.now()}`
    };

    console.log('\n--- MOCK DEPOSIT PAYLOAD ---');
    console.log(mockDepositPayload);

    // Build Juno API authentication
    const nonce = Date.now().toString();
    const method = 'POST';
    const requestPath = '/spei/test/deposits';
    const bodyString = JSON.stringify(mockDepositPayload);
    const stringToSign = nonce + method + requestPath + bodyString;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(stringToSign).digest('hex');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
    };

    console.log('\n--- JUNO API DEBUG ---');
    console.log('String to sign:', stringToSign);
    console.log('Signature:', signature);

    // Send mock deposit to Juno
    console.log('\n🚀 Sending mock deposit to Juno...');
    const response = await axios.post(
      'https://stage.buildwithjuno.com/spei/test/deposits',
      mockDepositPayload,
      { headers }
    );

    console.log('\n✅ Mock deposit created successfully!');
    console.log('Response:', response.data);

    console.log('\n📋 Next Steps:');
    console.log('1. Wait 1-2 minutes for Juno webhook to process');
    console.log('2. Check payment status in database');
    console.log('3. Verify automation processed the deposit');
    console.log(`4. Payment ${paymentId} should move to 'escrowed' status`);

  } catch (error) {
    console.error('\n❌ Error creating mock deposit:', error.message);
    
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      console.error('Status:', error.response.status);
    }
    
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Get payment ID from command line arguments
const paymentId = process.argv[2];

if (!paymentId) {
  console.error('❌ Usage: node scripts/universal_mock_deposit.js [PAYMENT_ID]');
  console.error('Example: node scripts/universal_mock_deposit.js 115');
  process.exit(1);
}

if (isNaN(paymentId)) {
  console.error('❌ Payment ID must be a number');
  process.exit(1);
}

console.log('🚀 Starting universal mock deposit script...');
console.log(`Target Payment ID: ${paymentId}`);

createMockDepositForPayment(paymentId)
  .then(() => {
    console.log('\n🎉 Mock deposit script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Mock deposit script failed:', error.message);
    process.exit(1);
  });
