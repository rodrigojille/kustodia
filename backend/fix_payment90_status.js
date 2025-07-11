const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');

async function fixPayment90Status() {
  try {
    console.log('🔧 Fixing Payment 90 status...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const paymentRepo = AppDataSource.getRepository(Payment);

    // Find Payment 90
    const payment = await paymentRepo.findOne({
      where: { id: 90 }
    });

    if (!payment) {
      console.error('❌ Payment 90 not found');
      return;
    }

    console.log(`📋 Current payment status: ${payment.status}`);

    // Reset status to 'funded' so automation can retry payout
    if (payment.status === 'processing') {
      payment.status = 'funded';
      await paymentRepo.save(payment);
      console.log('✅ Payment status reset to "funded" for retry');
    } else {
      console.log('ℹ️ Payment status is already correct');
    }

    console.log('🎉 Payment 90 status fix completed!');

  } catch (error) {
    console.error('❌ Error fixing Payment 90 status:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

fixPayment90Status();
