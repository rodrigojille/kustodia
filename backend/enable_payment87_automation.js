const { AppDataSource } = require('./src/ormconfig');
const { Payment } = require('./dist/entity/Payment');

async function enablePayment87Automation() {
  try {
    await AppDataSource.initialize();
    console.log('🔧 Enabling automation for Payment 87...\n');
    
    const paymentRepo = AppDataSource.getRepository(Payment);
    
    // Get current state
    const payment = await paymentRepo.findOne({
      where: { id: 87 },
      relations: ['escrow']
    });
    
    if (!payment) {
      console.log('❌ Payment 87 not found');
      return;
    }
    
    console.log('=== CURRENT STATE ===');
    console.log('Payment Status:', payment.status);
    console.log('Reference Field:', payment.reference);
    console.log('Escrow Status:', payment.escrow?.status);
    console.log('Smart Contract ID:', payment.escrow?.smart_contract_escrow_id);
    
    // Clear the reference field to allow automation
    if (payment.reference) {
      console.log('\n🔄 Clearing reference field to enable automation...');
      payment.reference = null;
      await paymentRepo.save(payment);
      console.log('✅ Reference field cleared');
    } else {
      console.log('\n✅ Reference field already clear');
    }
    
    console.log('\n=== POST-CHANGE STATE ===');
    const updatedPayment = await paymentRepo.findOne({
      where: { id: 87 },
      relations: ['escrow']
    });
    
    console.log('Payment Status:', updatedPayment.status);
    console.log('Reference Field:', updatedPayment.reference);
    console.log('Escrow Status:', updatedPayment.escrow?.status);
    
    console.log('\n🚀 Payment 87 is now ready for automation!');
    console.log('💡 The automation service will now:');
    console.log('   1. Skip SPEI redemption (idempotency check will prevent double processing)');
    console.log('   2. Skip bridge withdrawal (idempotency check will prevent double processing)');  
    console.log('   3. Proceed with escrow creation (this is what we want)');
    console.log('\n⚠️  Remember: The new idempotency checks will prevent double redemption/withdrawal');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

enablePayment87Automation();
