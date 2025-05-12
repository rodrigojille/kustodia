import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4000';

async function runPayoutMonitorE2E() {
  // 1. Initiate Payment with short custody period
  console.log('--- Initiating Payment (short custody) ---');
  const paymentBody = {
    user_id: 3, // test buyer user_id
    recipient_email: 'rodrigojille6@gmail.com', // test seller email
    amount: 1000,
    currency: 'mxn',
    description: 'E2E Monitor Payout Test',
    custody_percent: 50,
    custody_period: 10, // 10 seconds
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
    console.error('Error initiating payment:', err.response?.data || err.message || err);
    return;
  }

  // 2. Simulate Deposit Webhook
  console.log('--- Simulating Juno Deposit Webhook ---');
  try {
    const webhookBody = {
      transaction_id: 'test-tx-monitor-1234',
      amount: payment.amount,
      clabe: payment.deposit_clabe,
      status: 'completed',
      referencia: payment.reference
    };
    const webhookRes = await axios.post(`${BASE_URL}/api/payments/webhook/juno`, webhookBody);
    console.log('Webhook response:', webhookRes.data);
  } catch (err: any) {
    console.error('Error sending webhook:', err.response?.data || err.message || err);
    return;
  }

  // 3. Wait for custody period to expire
  console.log('--- Waiting for custody period to expire (15s) ---');
  await new Promise(res => setTimeout(res, 15000));

  // 4. Run custody monitor script
  console.log('--- Running custody monitor script ---');
  try {
    const output = execSync('npx ts-node src/scripts/custodyMonitor.ts', { cwd: path.resolve(__dirname, '..') });
    console.log('Custody monitor output:', output.toString());
  } catch (err: any) {
    console.error('Error running custody monitor:', err.message || err);
    return;
  }

  // 5. Fetch and assert final payment and escrow status
  try {
    const statusRes = await axios.get(`${BASE_URL}/api/payments/${payment.id}`);
    console.log('Final status:', statusRes.data);
    if (
      statusRes.data.payment.status === 'paid' &&
      statusRes.data.payment.escrow &&
      statusRes.data.payment.escrow.status === 'released'
    ) {
      console.log('✅ E2E Monitor Payout Workflow Test PASSED');
    } else {
      console.error('❌ E2E Monitor Payout Workflow Test FAILED: Unexpected final status');
    }
  } catch (err: any) {
    console.error('Error fetching final status:', err.response?.data || err.message || err);
  }
}

runPayoutMonitorE2E();
