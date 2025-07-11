const AppDataSource = require('./dist/ormconfig').default;
const { Escrow } = require('./dist/entity/Escrow');
const { Payment } = require('./dist/entity/Payment');
const { PaymentEvent } = require('./dist/entity/PaymentEvent');

async function fixPayment90Sync() {
  try {
    console.log('🔧 Fixing Payment 90 database sync...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const escrowRepo = AppDataSource.getRepository(Escrow);
    const paymentRepo = AppDataSource.getRepository(Payment);
    const eventRepo = AppDataSource.getRepository(PaymentEvent);

    // Find Payment 90's escrow
    const payment = await paymentRepo.findOne({
      where: { id: 90 },
      relations: ['escrow']
    });

    if (!payment) {
      console.error('❌ Payment 90 not found');
      return;
    }

    if (!payment.escrow) {
      console.error('❌ Payment 90 has no escrow');
      return;
    }

    console.log(`📋 Current escrow status: ${payment.escrow.status}`);
    console.log(`📋 Current payment status: ${payment.status}`);

    // Update escrow status to 'released' (blockchain shows it was released)
    if (payment.escrow.status !== 'released') {
      payment.escrow.status = 'released';
      payment.escrow.release_tx_hash = '0x636d426615560139516d8a6909792204134053af4829797956e4d797e2c2510';
      await escrowRepo.save(payment.escrow);
      console.log('✅ Escrow status updated to "released"');

      // Add missing escrow_released event
      const releaseEvent = new PaymentEvent();
      releaseEvent.paymentId = payment.id;
      releaseEvent.type = 'escrow_released';
      releaseEvent.description = 'Escrow released manually via blockchain transaction';
      releaseEvent.is_automatic = false;
      releaseEvent.created_at = new Date('2025-07-11T00:07:29.000Z'); // Match blockchain timestamp
      await eventRepo.save(releaseEvent);
      console.log('✅ Added missing escrow_released event');
    }

    // Update payment status to 'processing' (ready for payout)
    if (payment.status !== 'processing') {
      payment.status = 'processing';
      await paymentRepo.save(payment);
      console.log('✅ Payment status updated to "processing"');
    }

    console.log('🎉 Payment 90 database sync completed!');
    console.log('💸 Payout automation should now detect and process this payment');

  } catch (error) {
    console.error('❌ Error fixing Payment 90 sync:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

fixPayment90Sync();
