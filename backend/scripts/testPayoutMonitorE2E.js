"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
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
        const res = await axios_1.default.post(`${BASE_URL}/api/payments/initiate`, paymentBody);
        payment = res.data.payment;
        escrow = res.data.escrow;
        console.log('Payment initiated:', payment);
        console.log('Escrow created:', escrow);
    }
    catch (err) {
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
        const webhookRes = await axios_1.default.post(`${BASE_URL}/api/payments/webhook/juno`, webhookBody);
        console.log('Webhook response:', webhookRes.data);
    }
    catch (err) {
        console.error('Error sending webhook:', err.response?.data || err.message || err);
        return;
    }
    // 3. Wait for custody period to expire
    console.log('--- Waiting for custody period to expire (15s) ---');
    await new Promise(res => setTimeout(res, 15000));
    // 4. Run custody monitor script
    console.log('--- Running custody monitor script ---');
    try {
        const output = (0, child_process_1.execSync)('npx ts-node src/scripts/custodyMonitor.ts', { cwd: path_1.default.resolve(__dirname, '..') });
        console.log('Custody monitor output:', output.toString());
    }
    catch (err) {
        console.error('Error running custody monitor:', err.message || err);
        return;
    }
    // 5. Fetch and assert final payment and escrow status
    try {
        const statusRes = await axios_1.default.get(`${BASE_URL}/api/payments/${payment.id}`);
        console.log('Final status:', statusRes.data);
        if (statusRes.data.payment.status === 'paid' &&
            statusRes.data.payment.escrow &&
            statusRes.data.payment.escrow.status === 'released') {
            console.log('✅ E2E Monitor Payout Workflow Test PASSED');
        }
        else {
            console.error('❌ E2E Monitor Payout Workflow Test FAILED: Unexpected final status');
        }
    }
    catch (err) {
        console.error('Error fetching final status:', err.response?.data || err.message || err);
    }
}
runPayoutMonitorE2E();
