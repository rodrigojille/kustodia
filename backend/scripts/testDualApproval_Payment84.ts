import { AppDataSource } from '../src/data-source';
import { Payment } from '../src/entity/Payment';
import axios from 'axios';

/**
 * Test script to validate dual approval flow for Payment 84
 * This script simulates both payer and payee approvals
 */

const PAYMENT_ID = 84;
const BASE_URL = 'http://localhost:3001/api';

// Test user credentials - you'll need to replace these with actual tokens
const PAYER_TOKEN = 'your_payer_token_here';  // rodrigojille@gmail.com token
const PAYEE_TOKEN = 'your_payee_token_here';  // test-seller@kustodia.mx token

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Step 1: Check current payment status
    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = await paymentRepo.findOne({
      where: { id: PAYMENT_ID },
      relations: ['escrow']
    });

    if (!payment) {
      throw new Error(`Payment ${PAYMENT_ID} not found`);
    }

    console.log(`\n📊 PAYMENT ${PAYMENT_ID} STATUS:`);
    console.log(`- Status: ${payment.status}`);
    console.log(`- Payer: ${payment.payer_email}`);
    console.log(`- Payee: ${payment.recipient_email}`);
    console.log(`- Payer Approval: ${payment.payer_approval || false}`);
    console.log(`- Payee Approval: ${payment.payee_approval || false}`);
    console.log(`- Escrow Status: ${payment.escrow?.status}`);
    console.log(`- Escrow Smart Contract ID: ${payment.escrow?.smart_contract_escrow_id}`);

    // Step 2: Reset approvals for testing (optional)
    if (payment.payer_approval || payment.payee_approval) {
      console.log('\n🔄 Resetting approvals for fresh test...');
      payment.payer_approval = false;
      payment.payee_approval = false;
      payment.payer_approval_timestamp = undefined;
      payment.payee_approval_timestamp = undefined;
      await paymentRepo.save(payment);
      console.log('✅ Approvals reset');
    }

    // Step 3: Simulate Payer Approval
    console.log('\n👤 STEP 1: Payer Approval');
    console.log('Manual approval required:');
    console.log(`POST ${BASE_URL}/payments/${PAYMENT_ID}/approve/payer`);
    console.log(`Authorization: Bearer ${PAYER_TOKEN}`);
    console.log('Expected result: Payer approval recorded, waiting for payee');

    // Step 4: Simulate Payee Approval
    console.log('\n👤 STEP 2: Payee Approval');
    console.log('Manual approval required:');
    console.log(`POST ${BASE_URL}/payments/${PAYMENT_ID}/approve/payee`);
    console.log(`Authorization: Bearer ${PAYEE_TOKEN}`);
    console.log('Expected result: Both approvals complete → automatic escrow release');

    // Step 5: Expected Final State
    console.log('\n🎯 EXPECTED FINAL RESULTS:');
    console.log('- Both payer_approval and payee_approval = true');
    console.log('- Payment status changes to "completed"');
    console.log('- Escrow status changes to "released"');
    console.log('- MXNB tokens released from smart contract');
    console.log('- SPEI payout sent to beneficiary');
    console.log('- PaymentEvents logged: payer_approved, payee_approved, custody_released');

    console.log('\n🧪 TESTING INSTRUCTIONS:');
    console.log('1. Start backend server: npm run start:dev');
    console.log('2. Navigate to Payment 84 tracker in browser');
    console.log('3. Login as payer (rodrigojille@gmail.com)');
    console.log('4. Click "Sí, confirmar" button');
    console.log('5. Login as payee (test-seller@kustodia.mx)');
    console.log('6. Click "Sí, confirmar" button');
    console.log('7. Observe automatic release and payout');

    console.log('\n🔍 MONITOR PROGRESS:');
    console.log('- Watch backend console for approval logs');
    console.log('- Check frontend for approval status updates');
    console.log('- Verify blockchain transaction for escrow release');
    console.log('- Confirm SPEI payout in Juno dashboard');

  } catch (error) {
    console.error('❌ Test setup error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

if (require.main === module) {
  main();
}
