const axios = require('axios');

/**
 * Mock Deposit Script for Payment 84
 * Simulates a SPEI deposit to test the complete automated payment flow
 */

const PAYMENT_ID = 84;
const AMOUNT = 5000;
const CLABE = '710969000000396640';
const API_BASE = 'http://localhost:4000';

// Mock transaction data that matches Payment 84
const mockTransaction = {
  id: `mock_tx_${Date.now()}`,
  transaction_type: 'ISSUANCE',
  status: 'SUCCEEDED',
  amount: AMOUNT.toString(),
  clabe: CLABE,
  currency: 'MXN',
  description: `Mock deposit for Payment ${PAYMENT_ID}`,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  reference: `MOCK${PAYMENT_ID}${Date.now()}`
};

async function mockDeposit() {
  console.log('🚀 Starting mock deposit for Payment 84...\n');
  
  try {
    // 1. Check current payment status
    console.log('📋 Checking Payment 84 status...');
    const paymentResponse = await axios.get(`${API_BASE}/api/payments/${PAYMENT_ID}`);
    const payment = paymentResponse.data.payment;
    
    console.log(`   Status: ${payment.status}`);
    console.log(`   Amount: $${payment.amount}`);
    console.log(`   CLABE: ${payment.deposit_clabe}`);
    console.log(`   Description: ${payment.description}\n`);
    
    if (payment.status !== 'pending') {
      console.log('⚠️  Payment is not in pending status. Current status:', payment.status);
      console.log('   This script only works for pending payments.\n');
      return;
    }
    
    // 2. Show automation status
    console.log('🤖 Checking automation system status...');
    try {
      const autoStatus = await axios.get(`${API_BASE}/api/automation/status`);
      console.log('   Automation Status:', autoStatus.data.status);
      console.log('   Next deposit check:', autoStatus.data.nextRun?.deposits || 'Unknown');
    } catch (error) {
      console.log('   ⚠️ Could not fetch automation status (may not be running)');
    }
    console.log();
    
    // 3. Simulate the deposit by triggering deposit processing
    console.log('💳 Simulating SPEI deposit...');
    console.log(`   Mock transaction details:`);
    console.log(`   - ID: ${mockTransaction.id}`);
    console.log(`   - Type: ${mockTransaction.transaction_type}`);
    console.log(`   - Amount: $${mockTransaction.amount}`);
    console.log(`   - CLABE: ${mockTransaction.clabe}`);
    console.log();
    
    // 4. Trigger deposit automation manually
    console.log('🔄 Triggering deposit automation...');
    try {
      const triggerResponse = await axios.post(`${API_BASE}/api/automation/trigger`, {
        process: 'deposits'
      });
      console.log('   ✅ Deposit automation triggered successfully');
      console.log('   Response:', triggerResponse.data.message);
    } catch (error) {
      console.log('   ❌ Failed to trigger automation:', error.response?.data?.error || error.message);
      console.log('\n📝 Manual Steps:');
      console.log('   1. Ensure backend is running: cd backend && npm start');
      console.log('   2. Wait for automatic deposit detection (every 5 minutes)');
      console.log('   3. Or manually trigger: POST /api/automation/trigger {"process": "deposits"}');
      return;
    }
    console.log();
    
    // 5. Wait and check status
    console.log('⏳ Waiting 3 seconds for processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📊 Checking updated payment status...');
    const updatedResponse = await axios.get(`${API_BASE}/api/payments/${PAYMENT_ID}`);
    const updatedPayment = updatedResponse.data.payment;
    
    console.log(`   New Status: ${updatedPayment.status}`);
    console.log(`   Transaction ID: ${updatedPayment.transaction_id || 'Not set'}`);
    console.log();
    
    // 6. Show next steps
    console.log('🎯 Next Steps in Automation Flow:');
    console.log('   1. ✅ Deposit Detection - Should be processed now');
    
    if (updatedPayment.status === 'funded') {
      console.log('   2. ⏳ Custody Release - Will trigger in 10 minutes (or after custody period)');
      console.log('   3. ⏳ MXNB Redemption - Will trigger 15 minutes after release');
      console.log('   4. ⏳ SPEI Payout - Will complete payment automatically');
    } else {
      console.log('   2. ⚠️  Payment not yet funded - check automation logs');
    }
    
    console.log('\n🔍 Monitor Progress:');
    console.log(`   - Payment Tracker: http://localhost:3000/dashboard/pagos/${PAYMENT_ID}/tracker`);
    console.log(`   - Automation Status: GET ${API_BASE}/api/automation/status`);
    console.log(`   - Backend Logs: Check console for automation messages`);
    
    console.log('\n✨ Mock deposit simulation complete!');
    
  } catch (error) {
    console.error('❌ Error during mock deposit:', error.response?.data || error.message);
    console.log('\n🛠️  Troubleshooting:');
    console.log('   - Ensure backend is running on port 4000');
    console.log('   - Check if automation service is enabled');
    console.log('   - Verify Payment 84 exists and is in pending status');
  }
}

// Additional utility functions
async function checkAutomationStatus() {
  try {
    const response = await axios.get(`${API_BASE}/api/automation/status`);
    console.log('🤖 Automation Status:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Could not fetch automation status:', error.message);
  }
}

async function triggerAllAutomation() {
  console.log('🚀 Triggering all automation processes...');
  const processes = ['deposits', 'custodies', 'payouts', 'sync'];
  
  for (const process of processes) {
    try {
      const response = await axios.post(`${API_BASE}/api/automation/trigger`, { process });
      console.log(`✅ ${process}: ${response.data.message}`);
    } catch (error) {
      console.log(`❌ ${process}: ${error.response?.data?.error || error.message}`);
    }
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'status':
    checkAutomationStatus();
    break;
  case 'trigger-all':
    triggerAllAutomation();
    break;
  case 'help':
    console.log(`
🎯 Payment 84 Mock Deposit Script

Usage:
  node mock_deposit_payment84.js          - Run mock deposit simulation
  node mock_deposit_payment84.js status   - Check automation status
  node mock_deposit_payment84.js trigger-all - Trigger all automation processes
  node mock_deposit_payment84.js help     - Show this help

Description:
  This script simulates a SPEI deposit for Payment 84 to test the complete
  automated payment flow. It triggers the deposit automation and monitors
  the payment status changes.

Requirements:
  - Backend running on localhost:4000
  - Payment 84 must exist and be in 'pending' status
  - Automation system should be enabled
    `);
    break;
  default:
    mockDeposit();
    break;
}
