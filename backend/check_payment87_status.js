const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');
const { PaymentEvent } = require('./dist/entity/PaymentEvent');

async function checkPayment87Status() {
  try {
    console.log('🔍 Checking Payment 87 current status...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Get payment with all relations
    const payment = await AppDataSource.getRepository(Payment).findOne({
      where: { id: 87 },
      relations: ['user', 'escrow']
    });

    if (!payment) {
      console.log('❌ Payment 87 not found');
      return;
    }

    console.log('\n📋 PAYMENT 87 STATUS:');
    console.log(`  - Status: ${payment.status}`);
    console.log(`  - Amount: ${payment.amount}`);
    console.log(`  - Reference: ${payment.reference}`);
    console.log(`  - Transaction ID: ${payment.transaction_id}`);
    console.log(`  - Deposit CLABE: ${payment.deposit_clabe}`);
    console.log(`  - Payout CLABE: ${payment.payout_clabe}`);
    console.log(`  - User wallet: ${payment.user?.wallet_address}`);

    // Check escrow status
    if (payment.escrow) {
      console.log('\n🔒 ESCROW STATUS:');
      console.log(`  - Escrow ID: ${payment.escrow.id}`);
      console.log(`  - Status: ${payment.escrow.status}`);
      console.log(`  - Smart Contract ID: ${payment.escrow.smart_contract_escrow_id}`);
      console.log(`  - Blockchain TX: ${payment.escrow.blockchain_tx_hash}`);
      console.log(`  - Release TX: ${payment.escrow.release_tx_hash}`);
      console.log(`  - Custody Amount: ${payment.escrow.custody_amount}`);
    } else {
      console.log('\n❌ No escrow found for Payment 87');
    }

    // Check recent payment events
    console.log('\n📅 RECENT PAYMENT EVENTS:');
    const events = await AppDataSource.getRepository(PaymentEvent).find({
      where: { paymentId: 87 },
      order: { created_at: 'DESC' },
      take: 10
    });

    events.forEach(event => {
      console.log(`  - ${event.created_at.toISOString()}: ${event.type || 'Unknown'} - ${event.description || 'No description'}`);
    });

    // Check for double redemption evidence
    const redemptionEvents = events.filter(e => 
      e.type && (e.type.includes('redeem') || e.type.includes('withdrawal'))
    );

    if (redemptionEvents.length > 1) {
      console.log('\n🚨 DOUBLE REDEMPTION DETECTED:');
      redemptionEvents.forEach(event => {
        console.log(`  - ${event.created_at.toISOString()}: ${event.type} - ${event.description}`);
      });
    }

    await AppDataSource.destroy();

  } catch (error) {
    console.error('❌ Error checking payment status:', error.message);
    process.exit(1);
  }
}

checkPayment87Status();
