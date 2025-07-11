require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

// Set these as needed
const PAYMENT_ID = 88; // The payment you want to check
const BASE_URL = process.env.PAYMENT_API_BASE_URL || 'http://localhost:4000'; // Updated to backend port 4000

async function checkPaymentStatus() {
  try {
    const url = `${BASE_URL}/api/payments/${PAYMENT_ID}`;
    console.log(`Checking payment status at: ${url}`);
    const res = await axios.get(url);
    if (res.data && res.data.payment) {
      const payment = res.data.payment;
      console.log('--- Payment Status ---');
      console.log(`ID: ${payment.id}`);
      console.log(`Recipient: ${payment.recipient_email}`);
      console.log(`Amount: ${payment.amount}`);
      console.log(`Status: ${payment.status}`);
      console.log(`Transaction ID: ${payment.transaction_id}`);
      if (payment.status === 'funded') {
        console.log('✅ Payment is funded!');
      } else {
        console.log('⏳ Payment is not yet funded.');
      }
    } else {
      console.log('No payment data found in response:', res.data);
    }
  } catch (err) {
    if (err.response) {
      console.error('Error response:', err.response.data);
    } else {
      console.error('Request failed:', err.message);
    }
  }
}

checkPaymentStatus();
