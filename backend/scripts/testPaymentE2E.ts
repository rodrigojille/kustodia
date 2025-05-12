import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4000';

async function runE2EPaymentTest() {
  // 1. Initiate Payment
  console.log('--- Initiating Payment ---');
  const paymentBody = {
    user_id: 3, // Valid test buyer user_id
    recipient_email: 'rodrigojille6@gmail.com', // Valid test seller email (user_id 2)
    amount: 1000,
    currency: 'mxn',
    description: 'E2E Test Payment',
    custody_percent: 50,
    custody_period: 60, // seconds
    travel_rule_data: { sender: 'Test Buyer', receiver: 'Test Seller' }
  };
  let payment, escrow;
  try {
    const res = await axios.post(`${BASE_URL}/api/payments/initiate`, paymentBody);
    payment = res.data.payment;
    escrow = res.data.escrow;
    console.log('Payment initiated:', payment);
    console.log('Escrow created:', escrow);
  } catch (err) {
    const e = err as any;
    console.error('Error initiating payment:', e.response?.data || e.message || e);
    return;
  }

  // 2. Simulate Deposit Webhook
  console.log('--- Simulating Juno Deposit Webhook ---');
  try {
    const webhookBody = {
      transaction_id: 'test-tx-1234',
      amount: payment.amount,
      clabe: payment.deposit_clabe, // Use the correct deposit_clabe as 'clabe'
      status: 'completed',
      referencia: payment.reference // Use 'referencia' as expected by backend
    };
    const webhookRes = await axios.post(`${BASE_URL}/api/payments/webhook/juno`, webhookBody);
    console.log('Webhook response:', webhookRes.data);
  } catch (err) {
    const e = err as any;
    console.error('Error sending webhook:', e.response?.data || e.message || e);
    return;
  }

  // 3. Wait for backend to process redemption and payout
  console.log('--- Waiting for payout processing (10s) ---');
  await new Promise(res => setTimeout(res, 10000));

  // 4. Fetch and assert final payment and escrow status
  try {
    const statusRes = await axios.get(`${BASE_URL}/api/payments/${payment.id}`);
    console.log('Final status:', statusRes.data);
    if (
      statusRes.data.payment.status === 'funded' &&
      statusRes.data.payment.escrow &&
      statusRes.data.payment.escrow.status === 'active'
    ) {
      console.log('✅ E2E Payment Workflow Test PASSED');
    } else {
      console.error('❌ E2E Payment Workflow Test FAILED: Unexpected final status');
    }
  } catch (err) {
    const e = err as any;
    console.error('Error fetching final status:', e.response?.data || e.message || e);
  }
}

runE2EPaymentTest();
