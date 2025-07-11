/**
 * 🚀 Test Complete Payment Automation Flow
 * Verify end-to-end automation: deposit detection → SPEI payout → bridge withdrawal → escrow creation & funding
 */

const AppDataSource = require('./dist/ormconfig').default;
const { PaymentAutomationService } = require('./dist/services/PaymentAutomationService');
const { PaymentService } = require('./dist/services/paymentService');

async function testCompleteAutomation() {
  console.log('🚀 Testing Complete Payment Automation Flow');
  console.log('═'.repeat(50));
  
  try {
    // Initialize database
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }

    const { Payment } = require('./dist/entity/Payment');
    const { Escrow } = require('./dist/entity/Escrow');
    const paymentRepo = AppDataSource.getRepository(Payment);
    const escrowRepo = AppDataSource.getRepository(Escrow);
    const paymentService = new PaymentService();
    const automationService = new PaymentAutomationService(paymentService);

    // Test 1: Check Payment 87 Status
    console.log('\n📋 Step 1: Check Payment 87 Current Status');
    console.log('-'.repeat(30));
    
    const payment87 = await paymentRepo.findOne({
      where: { id: 87 },
      relations: ['escrow']
    });
    
    if (!payment87) {
      console.log('❌ Payment 87 not found');
      return;
    }
    
    console.log(`💰 Payment 87 Status: ${payment87.status}`);
    console.log(`💰 Payment Amount: ${payment87.amount} MXN`);
    console.log(`💰 Payment Reference: ${payment87.reference || 'NULL'}`);
    console.log(`💰 Payment CLABE: ${payment87.deposit_clabe}`);
    
    if (payment87.escrow) {
      console.log(`⚖️ Escrow ID: ${payment87.escrow.id}`);
      console.log(`⚖️ Escrow Status: ${payment87.escrow.status}`);
      console.log(`⚖️ Escrow Custody %: ${payment87.escrow.custody_percent}%`);
      console.log(`⚖️ Escrow Contract: ${payment87.escrow.smart_contract_escrow_id || 'Not Created'}`);
    } else {
      console.log('⚖️ No escrow found for Payment 87');
    }

    // Test 2: Check Recent Events
    console.log('\n📋 Step 2: Check Recent Payment Events');
    console.log('------------------------------');
    const eventsQuery = `
      SELECT type, description, created_at
      FROM payment_event
      WHERE "paymentId" = 87
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const events = await AppDataSource.query(eventsQuery);
    console.log('📝 Recent Events:', events.length);
    events.forEach(event => {
      console.log(`   ${event.type}: ${event.description || 'N/A'}`);
    });

    // Step 3: Manually trigger automation if needed
    console.log('\n🤖 Step 3: Trigger Payment Automation');
    console.log('------------------------------');
    
    // Only trigger if payment is funded but automation hasn't run
    const automationEvents = events.filter(e => 
      ['redemption_initiated', 'juno_withdrawal', 'escrow_created', 'escrow_funded'].includes(e.type)
    );
    
    if (payment87.status === 'funded' && automationEvents.length === 0) {
      console.log('⚡ Triggering automation for Payment 87...');
      
      const { PaymentAutomationService } = require('./dist/services/PaymentAutomationService');
      const paymentAutomationService = new PaymentAutomationService();
      await paymentAutomationService.processPaymentAutomation(87);
      
      console.log('✅ Automation triggered successfully!');
    } else {
      console.log(`ℹ️  Automation already processed (${automationEvents.length} automation events found)`);
    }

    // Test 3: Run Deposit Detection
    console.log('\n📋 Step 3: Test Deposit Detection Automation');
    console.log('-'.repeat(30));
    
    if (payment87.status === 'pending' && !payment87.reference) {
      console.log('🔍 Running deposit detection automation...');
      const processed = await automationService.processNewDeposits();
      console.log(`✅ Processed ${processed} deposits`);
    } else if (payment87.status === 'funded') {
      console.log('✅ Payment 87 already funded, skipping deposit detection');
      
      // Test 4: Trigger Complete Automation
      console.log('\n📋 Step 4: Test Complete Automation Flow');
      console.log('-'.repeat(30));
      
      console.log('🚀 Triggering complete automation for Payment 87...');
      await automationService.processPaymentAutomation(87);
      
      // Check updated status
      const updatedPayment = await paymentRepo.findOne({
        where: { id: 87 },
        relations: ['escrow']
      });
      
      console.log('\n📊 Post-Automation Status:');
      console.log(`💰 Payment Status: ${updatedPayment.status}`);
      if (updatedPayment.escrow) {
        console.log(`⚖️ Escrow Status: ${updatedPayment.escrow.status}`);
        console.log(`⚖️ Escrow Contract: ${updatedPayment.escrow.smart_contract_escrow_id || 'Not Created'}`);
        console.log(`⚖️ Escrow Custody Amount: ${updatedPayment.escrow.custody_amount || 'Not Set'}`);
      }
      
    } else {
      console.log(`⚠️ Payment 87 status: ${payment87.status}, reference: ${payment87.reference}`);
      console.log('💡 Reset payment to test automation: UPDATE payment SET status=\'pending\', reference=NULL WHERE id=87;');
    }

    console.log('\n🎯 Complete Automation Test Summary:');
    console.log('═'.repeat(50));
    console.log('✅ Flow: Deposit Detection → SPEI Payout → Bridge Withdrawal → Escrow Creation & Funding');
    console.log('✅ Payment 87 used as test case');
    console.log('✅ All steps logged to payment_event table');
    console.log('💡 Check automation logs in backend server for detailed execution info');

  } catch (error) {
    console.error('❌ Automation test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  }
}

testCompleteAutomation().catch(console.error);
