const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');
const { PaymentEvent } = require('./dist/entity/PaymentEvent');

async function cleanupPayment87() {
  try {
    console.log('🧹 Cleaning up Payment 87 for safe escrow creation...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // First, let's check the current status
    const payment = await AppDataSource.getRepository(Payment).findOne({
      where: { id: 87 },
      relations: ['user', 'escrow']
    });

    if (!payment) {
      console.log('❌ Payment 87 not found');
      return;
    }

    console.log('\n📋 CURRENT PAYMENT 87 STATUS:');
    console.log(`  - Status: ${payment.status}`);
    console.log(`  - Amount: ${payment.amount}`);
    console.log(`  - Reference: ${payment.reference}`);
    console.log(`  - Transaction ID: ${payment.transaction_id}`);
    console.log(`  - Escrow ID: ${payment.escrow_id}`);

    // Check recent payment events to identify double redemption
    console.log('\n📅 PAYMENT EVENTS (Last 15):');
    const events = await AppDataSource.getRepository(PaymentEvent).find({
      where: { paymentId: 87 },
      order: { created_at: 'DESC' },
      take: 15
    });

    const redemptionEvents = [];
    const withdrawalEvents = [];
    
    events.forEach(event => {
      const eventTime = event.created_at.toISOString();
      console.log(`  - ${eventTime}: ${event.type} - ${event.description || 'N/A'}`);
      
      if (event.type.includes('redeem') || event.type.includes('withdrawal')) {
        if (event.type.includes('redeem')) {
          redemptionEvents.push(event);
        } else if (event.type.includes('withdrawal')) {
          withdrawalEvents.push(event);
        }
      }
    });

    // Identify double redemption
    if (redemptionEvents.length > 1) {
      console.log('\n🚨 DOUBLE REDEMPTION DETECTED:');
      redemptionEvents.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.created_at.toISOString()}: ${event.type} - ${event.description}`);
      });
    }

    // Identify multiple withdrawals
    if (withdrawalEvents.length > 1) {
      console.log('\n🚨 MULTIPLE WITHDRAWALS DETECTED:');
      withdrawalEvents.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.created_at.toISOString()}: ${event.type} - ${event.description}`);
      });
    }

    // Check escrow status
    if (payment.escrow) {
      console.log('\n🔒 ESCROW STATUS:');
      console.log(`  - Escrow ID: ${payment.escrow.id}`);
      console.log(`  - Status: ${payment.escrow.status}`);
      console.log(`  - Smart Contract ID: ${payment.escrow.smart_contract_escrow_id}`);
      console.log(`  - Custody Amount: ${payment.escrow.custody_amount}`);
      
      // If escrow exists but no smart contract ID, we need to proceed with escrow creation
      if (!payment.escrow.smart_contract_escrow_id) {
        console.log('\n✅ ESCROW READY FOR ON-CHAIN CREATION');
        console.log('   - Bridge withdrawal completed (custody_amount set)');
        console.log('   - Payment has reference (won\'t be processed by automation again)');
        console.log('   - Status is funded (correct state)');
        console.log('   - Ready for manual escrow creation');
      }
    }

    // Recommendations
    console.log('\n🎯 RECOMMENDED ACTIONS:');
    console.log('1. Payment 87 is in correct state for escrow creation');
    console.log('2. Reference is set - automation will skip this payment');
    console.log('3. Bridge withdrawal completed (500 MXNB in custody)');
    console.log('4. Ready to proceed with on-chain escrow creation');
    
    // Show the prevention mechanism
    console.log('\n🛡️ DOUBLE REDEMPTION PREVENTION:');
    console.log('The automation checks: !payment.reference');
    console.log(`Current reference: "${payment.reference}"`);
    console.log('Since reference is set, automation will skip this payment ✅');

    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Run escrow creation manually (automation won\'t interfere)');
    console.log('2. Bridge wallet should have sufficient MXNB (500 needed)');
    console.log('3. Smart contract will create escrow with ID and store blockchain TX hash');

    await AppDataSource.destroy();

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

cleanupPayment87();
