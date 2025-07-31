const axios = require('axios');

// Test Multi-Sig Payment Creation
async function createTestMultiSigPayment() {
  const baseURL = 'http://localhost:3001/api';
  
  // Test payment data - over $1000 to trigger multi-sig
  const testPayment = {
    amount: '1500.00', // $1,500 USD - should trigger multi-sig
    recipient: '0x742d35Cc6634C0532925a3b8D4C2C1c1e8D4A2B3', // Test recipient address
    concept: 'Test Multi-Sig Payment - High Value Transfer',
    currency: 'USD',
    paymentMethod: 'crypto',
    network: 'arbitrum-sepolia'
  };

  console.log('🧪 Creating test multi-sig payment...');
  console.log('Payment details:', testPayment);
  
  try {
    // Create the payment (this should trigger the TransactionRouterService)
    const response = await axios.post(`${baseURL}/payments`, testPayment, {
      headers: {
        'Content-Type': 'application/json',
        // Add any required auth headers here if needed
      }
    });

    console.log('✅ Payment created successfully!');
    console.log('Response:', response.data);
    
    // Check if it was routed to multi-sig
    if (response.data.requiresMultiSig || response.data.status === 'pending_multisig') {
      console.log('🔐 Payment routed to multi-sig approval queue');
      console.log('💡 Check the Multi-Sig tab in admin dashboard to see the pending transaction');
    } else {
      console.log('⚠️  Payment may have been processed as single-sig');
    }

    return response.data;

  } catch (error) {
    console.error('❌ Error creating test payment:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 You may need to add authentication headers or use the frontend to create the payment');
    }
  }
}

// Test fetching multi-sig data
async function testMultiSigEndpoints() {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('\n🔍 Testing Multi-Sig API endpoints...');
  
  const endpoints = [
    '/multisig/pending',
    '/multisig/wallet-config', 
    '/multisig/statistics'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint}...`);
      const response = await axios.get(`${baseURL}${endpoint}`, {
        headers: {
          // Add auth headers if needed
        }
      });
      
      console.log('✅ Success:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.error(`❌ Error on ${endpoint}:`, error.response?.data || error.message);
    }
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting Multi-Sig Integration Tests\n');
  
  // Test 1: Create high-value payment
  await createTestMultiSigPayment();
  
  // Wait a moment for processing
  console.log('\n⏳ Waiting 2 seconds for processing...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Check multi-sig endpoints
  await testMultiSigEndpoints();
  
  console.log('\n✨ Tests completed! Check the Multi-Sig tab in your admin dashboard.');
}

runTests().catch(console.error);
