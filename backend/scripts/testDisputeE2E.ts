import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4000';

async function runDisputeE2ETest() {
  // 1. Initiate Payment
  console.log('--- Initiating Payment ---');
  const paymentBody = {
    user_id: 3, // Valid test buyer user_id
    recipient_email: 'rodrigojille6@gmail.com', // Valid test seller email (user_id 2)
    amount: 1000,
    currency: 'mxn',
    description: 'E2E Dispute Test Payment',
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
  } catch (err: any) {
    const e = err as any;
    console.error('Error initiating payment:', e.response?.data || e.message || e);
    return;
  }

  // 2. Simulate Deposit Webhook
  console.log('--- Simulating Juno Deposit Webhook ---');
  try {
    const webhookBody = {
      transaction_id: 'test-tx-5678',
      amount: payment.amount,
      clabe: payment.deposit_clabe,
      status: 'completed',
      referencia: payment.reference
    };
    const webhookRes = await axios.post(`${BASE_URL}/api/payments/webhook/juno`, webhookBody);
    console.log('Webhook response:', webhookRes.data);
  } catch (err: any) {
    const e = err as any;
    console.error('Error sending webhook:', e.response?.data || e.message || e);
    return;
  }

  // 3. Wait for backend to process redemption and payout
  console.log('--- Waiting for payout processing (10s) ---');
  await new Promise(res => setTimeout(res, 10000));

  // 4. Log in as buyer to get JWT
  console.log('--- Logging in as Buyer ---');
  let userToken = '';
  try {
    const loginRes = await axios.post(`${BASE_URL}/api/users/login`, {
      email: 'test-seller@kustodia.mx', // Use the seller email from your DB (or buyer if that's the dispute user)
      password: 'test1234' // Updated password as provided by user
    });
    userToken = loginRes.data.token;
    console.log('Buyer login successful, token obtained.');
  } catch (err: any) {
    const e = err as any;
    console.error('Error logging in as buyer:', e.response?.data || e.message || e);
    return;
  }

  // 5. Raise a dispute (with JWT)
  console.log('--- Raising Dispute ---');
  try {
    const disputeBody = {
      reason: 'Item not delivered',
      details: 'The item was not delivered as promised.',
      evidence: null
    };
    const disputeRes = await axios.post(
      `${BASE_URL}/api/escrow/${escrow.id}/raise`,
      disputeBody,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    console.log('Dispute raised:', disputeRes.data);
  } catch (err: any) {
    const e = err as any;
    console.error('Error raising dispute:', e.response?.data || e.message || e);
    return;
  }

  // 5. Admin resolves dispute
  console.log('--- Resolving Dispute as Admin ---');
  try {
    const resolveBody = {
      resolution: 'dismissed', // or 'approved' for refund
      adminNotes: 'Test admin resolution.'
    };
    const resolveRes = await axios.post(`${BASE_URL}/api/escrow/${escrow.id}/admin-resolve`, resolveBody);
    console.log('Dispute resolved:', resolveRes.data);
  } catch (err: any) {
    const e = err as any;
    console.error('Error resolving dispute:', e.response?.data || e.message || e);
    return;
  }

  // 6. Simulate custody monitor job (trigger payout if needed)
  console.log('--- Simulating Custody Monitor Job ---');
  try {
    // This script is usually run by cron, but we can invoke it directly for E2E
    // You may need to adjust this path if your script is elsewhere
    const { execSync } = require('child_process');
    const output = execSync('npx ts-node scripts/custodyMonitor.ts', { cwd: path.resolve(__dirname, '..') });
    console.log('Custody monitor output:', output.toString());
  } catch (err: any) {
    console.error('Error running custody monitor:', err.message || err);
  }

  // 7. Fetch and assert final payment and escrow status
  try {
    const statusRes = await axios.get(`${BASE_URL}/api/payments/${payment.id}`);
    console.log('Final status:', statusRes.data);
    if (
      statusRes.data.payment.status === 'paid' &&
      statusRes.data.payment.escrow &&
      statusRes.data.payment.escrow.status === 'released'
    ) {
      console.log('✅ E2E Dispute Workflow Test PASSED');
    } else {
      console.error('❌ E2E Dispute Workflow Test FAILED: Unexpected final status');
    }
  } catch (err: any) {
    const e = err as any;
    console.error('Error fetching final status:', e.response?.data || e.message || e);
  }
}

runDisputeE2ETest();
