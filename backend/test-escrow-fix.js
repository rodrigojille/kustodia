const axios = require('axios');

async function testEscrowLinkageFix() {
  console.log('🧪 Testing Payment-Escrow Linkage Fix...\n');
  
  const baseURL = 'http://localhost:4000/api';
  
  try {
    // 1. Login to get JWT token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'rodrigojille6@gmail.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // 2. Create a new payment
    console.log('2. Creating new payment...');
    const paymentData = {
      recipient_email: 'test-seller@kustodia.mx',
      amount: 1500,
      currency: 'mxn',
      description: 'Test payment for escrow linkage fix',
      custody_percent: 100,
      custody_period: 432000 // 5 days
    };
    
    const paymentResponse = await axios.post(`${baseURL}/payments/initiate`, paymentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Payment created successfully');
    console.log('Payment ID:', paymentResponse.data.payment.id);
    console.log('Payment escrow_id:', paymentResponse.data.payment.escrow_id);
    console.log('Escrow ID:', paymentResponse.data.escrow.id);
    console.log('Escrow payment_id:', paymentResponse.data.escrow.payment_id);
    
    // 3. Verify the linkage
    if (paymentResponse.data.payment.escrow_id === paymentResponse.data.escrow.id &&
        paymentResponse.data.escrow.payment_id === paymentResponse.data.payment.id) {
      console.log('\n🎉 SUCCESS: Payment-Escrow linkage is working correctly!');
      console.log('✅ Payment.escrow_id matches Escrow.id');
      console.log('✅ Escrow.payment_id matches Payment.id');
    } else {
      console.log('\n❌ FAILED: Payment-Escrow linkage is not working correctly');
      console.log('Payment escrow_id:', paymentResponse.data.payment.escrow_id);
      console.log('Escrow id:', paymentResponse.data.escrow.id);
      console.log('Escrow payment_id:', paymentResponse.data.escrow.payment_id);
      console.log('Payment id:', paymentResponse.data.payment.id);
    }
    
    // 4. Display custody details
    console.log('\n📊 Custody Details:');
    console.log('Amount:', paymentResponse.data.payment.amount);
    console.log('Custody Percent:', paymentResponse.data.escrow.custody_percent + '%');
    console.log('Custody Amount:', paymentResponse.data.escrow.custody_amount);
    console.log('Release Amount:', paymentResponse.data.escrow.release_amount);
    console.log('Custody End:', paymentResponse.data.escrow.custody_end);
    console.log('Status:', paymentResponse.data.escrow.status);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testEscrowLinkageFix();
