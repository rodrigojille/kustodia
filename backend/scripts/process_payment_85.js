const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const ormconfig = require('../src/ormconfig').default;
const { Payment } = require('../src/entity/Payment');
const { Escrow } = require('../src/entity/Escrow');
const { PaymentEvent } = require('../src/entity/PaymentEvent');

// Juno API configuration
const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY : process.env.JUNO_API_KEY;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET : process.env.JUNO_API_SECRET;
const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
const DESTINATION_ADDRESS = process.env.ESCROW_BRIDGE_WALLET;

console.log('🔧 Configuration:');
console.log('- JUNO_ENV:', JUNO_ENV);
console.log('- JUNO_API_KEY:', JUNO_API_KEY ? JUNO_API_KEY.slice(0, 8) + '...' : 'NOT SET');
console.log('- JUNO_API_SECRET:', JUNO_API_SECRET ? 'SET' : 'NOT SET');
console.log('- BASE_URL:', BASE_URL);
console.log('- DESTINATION_ADDRESS:', DESTINATION_ADDRESS);

async function withdrawFromJunoToBridge(amount) {
  console.log(`💰 Starting Juno withdrawal for amount: ${amount}`);
  
  const endpoint = '/mint_platform/v1/crypto_withdrawals';
  const url = `${BASE_URL}${endpoint}`;

  const bodyObj = {
    amount: amount.toString(),
    asset: 'mxnbj',
    destination_address: DESTINATION_ADDRESS,
    blockchain_network: 'arbitrum'
  };

  const body = JSON.stringify(bodyObj);
  const nonce = Date.now().toString();
  const method = 'POST';
  const requestPath = endpoint;
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  };

  console.log('📡 Making Juno API call:');
  console.log('- URL:', url);
  console.log('- Method:', method);
  console.log('- Headers:', { ...headers, 'Authorization': 'Bitso [REDACTED]' });
  console.log('- Body:', bodyObj);

  try {
    const response = await axios.post(url, bodyObj, { headers });
    console.log('✅ Juno withdrawal successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Juno withdrawal failed:');
    console.error('- Status:', error.response?.status);
    console.error('- Status Text:', error.response?.statusText);
    console.error('- Response:', error.response?.data);
    console.error('- Request Config:', {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data
    });
    throw error;
  }
}

async function logPaymentEvent(paymentId, eventType, description) {
  try {
    const paymentEventRepo = ormconfig.getRepository(PaymentEvent);
    const paymentEvent = paymentEventRepo.create({
      paymentId: paymentId,
      type: eventType,
      description: description,
      timestamp: new Date()
    });
    await paymentEventRepo.save(paymentEvent);
    console.log(`📝 Event logged: ${eventType} - ${description}`);
  } catch (error) {
    console.error('❌ Error logging payment event:', error);
  }
}

async function processPayment85() {
  let dataSource = null;
  
  try {
    console.log('🚀 Processing Payment 85 specifically...');
    
    // Initialize database
    dataSource = await ormconfig.initialize();
    console.log('✅ Database connected');
    
    // Get repositories
    const paymentRepo = ormconfig.getRepository(Payment);
    const escrowRepo = ormconfig.getRepository(Escrow);
    
    // Find payment 85
    const payment = await paymentRepo.findOne({
      where: { id: 85 },
      relations: ['escrow']
    });
    
    if (!payment) {
      console.log('❌ Payment 85 not found');
      return;
    }
    
    console.log('📊 Payment 85 details:');
    console.log('- ID:', payment.id);
    console.log('- Status:', payment.status);
    console.log('- Amount:', payment.amount);
    console.log('- Escrow exists:', !!payment.escrow);
    
    if (!payment.escrow) {
      console.log('❌ No escrow found for payment 85');
      return;
    }
    
    console.log('- Escrow ID:', payment.escrow.id);
    console.log('- Escrow Status:', payment.escrow.status);
    
    // Check if escrow needs funding
    if (payment.escrow.status !== 'pending') {
      console.log(`❌ Escrow status is '${payment.escrow.status}', expected 'pending'`);
      return;
    }
    
    // Perform Juno withdrawal
    console.log('💰 Performing Juno withdrawal...');
    const withdrawalResult = await withdrawFromJunoToBridge(payment.amount);
    
    // Update payment status
    payment.status = 'withdrawn';
    await paymentRepo.save(payment);
    console.log('✅ Payment status updated to withdrawn');
    
    // Log the event
    await logPaymentEvent(
      payment.id,
      'juno_withdrawal',
      `MXNB withdrawn from Juno to bridge wallet: ${payment.amount}. Response: ${JSON.stringify(withdrawalResult)}`
    );
    
    console.log('🎉 Payment 85 processed successfully!');
    
  } catch (error) {
    console.error('❌ Error processing payment 85:', error);
    
    // Try to log the error event
    try {
      await logPaymentEvent(
        85,
        'juno_withdrawal_error',
        `Error in Juno withdrawal: ${error.message}`
      );
    } catch (logError) {
      console.error('❌ Error logging failure event:', logError);
    }
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

processPayment85();
