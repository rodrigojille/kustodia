require('dotenv').config();
const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');
const crypto = require('crypto');
const axios = require('axios');

async function createMockDepositForPayment132() {
  console.log('🏦 Creating mock SPEI deposit for Payment 132 via Juno API...');
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Database connected');

    // Get Payment 132 details
    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = await paymentRepo.findOne({
      where: { id: 132 },
      relations: ['escrow']
    });

    if (!payment) {
      throw new Error('Payment 132 not found');
    }

    console.log('📊 Payment 132 details:');
    console.log(`- Amount: ${payment.amount} MXN`);
    console.log(`- CLABE: ${payment.deposit_clabe}`);
    console.log(`- Status: ${payment.status}`);
    console.log(`- Escrow ID: ${payment.escrow_id}`);

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
      sender_name: 'Test Payer Payment 132',
      reference: `Mock deposit for Payment 132 - ${Date.now()}`
    };

    console.log('📤 Creating mock deposit via Juno API...');
    console.log('Payload:', mockDepositPayload);

    // Create HMAC signature for Juno API
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

    // Make API call to create mock deposit
    const response = await axios.post(
      'https://stage.buildwithjuno.com/spei/test/deposits',
      mockDepositPayload,
      { headers }
    );

    console.log('✅ Mock deposit created successfully via Juno API!');
    console.log('Response:', response.data);

    console.log('\n🤖 Next steps:');
    console.log('1. The automation should detect this deposit within 1 minute');
    console.log('2. Payment 132 status should change from "pending" to "funded"');
    console.log('3. The nuevo_flujo automation should process the payment');
    console.log('4. Check the payment status and events after a few minutes');

    // Check updated payment status
    const updatedPayment = await paymentRepo.findOne({
      where: { id: 132 },
      relations: ['escrow']
    });

    console.log('📈 Updated Payment 132 status:');
    console.log(`- Status: ${updatedPayment.status}`);
    console.log(`- Escrow ID: ${updatedPayment.escrow_id}`);
    console.log(`- Updated at: ${updatedPayment.updated_at}`);

    if (updatedPayment.escrow) {
      console.log('🔒 Escrow details:');
      console.log(`- Escrow Address: ${updatedPayment.escrow.escrow_address}`);
      console.log(`- Status: ${updatedPayment.escrow.status}`);
      console.log(`- Amount: ${updatedPayment.escrow.amount}`);
    }

  } catch (error) {
    console.error('❌ Error creating mock deposit:', error);
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      console.error('Status:', error.response.status);
    }
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  }
}

// Run the script
createMockDepositForPayment132();
