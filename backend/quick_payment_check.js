// Quick Payment Status Check
// Simple script to check current status of specific payments

const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');

async function checkPaymentStatus() {
  console.log('🔍 QUICK PAYMENT STATUS CHECK');
  console.log('=' .repeat(50));

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    const paymentRepo = AppDataSource.getRepository(Payment);
    
    // Check specific payments
    const paymentIds = [112, 113, 114, 115]; // Add more as needed
    
    for (const id of paymentIds) {
      const payment = await paymentRepo.findOne({
        where: { id },
        relations: ['escrow']
      });
      
      if (payment) {
        console.log(`💰 Payment ${id}:`);
        console.log(`   Status: ${payment.status}`);
        console.log(`   Amount: $${payment.amount}`);
        console.log(`   Type: ${payment.payment_type || 'traditional'}`);
        console.log(`   Payer Approval: ${payment.payer_approval ? '✅' : '❌'}`);
        console.log(`   Payee Approval: ${payment.payee_approval ? '✅' : '❌'}`);
        
        if (payment.escrow) {
          console.log(`   Escrow Status: ${payment.escrow.status}`);
          console.log(`   Release TX: ${payment.escrow.release_tx_hash ? '✅ ' + payment.escrow.release_tx_hash.substring(0, 10) + '...' : '❌ None'}`);
          console.log(`   Smart Contract: ${payment.escrow.smart_contract_escrow_id || 'None'}`);
        } else {
          console.log(`   Escrow: ❌ None`);
        }
        
        // Check if migration needed
        const needsMigration = payment.escrow?.release_tx_hash && payment.status !== 'completed';
        console.log(`   Migration Needed: ${needsMigration ? '⚠️  YES' : '✅ NO'}`);
        console.log('');
      } else {
        console.log(`💰 Payment ${id}: ❌ Not found\n`);
      }
    }
    
    // Quick stats
    console.log('📊 QUICK STATS:');
    
    const totalPayments = await paymentRepo.count();
    console.log(`   Total Payments: ${totalPayments}`);
    
    const completedPayments = await paymentRepo.count({ where: { status: 'completed' } });
    console.log(`   Completed: ${completedPayments}`);
    
    const processingPayments = await paymentRepo.count({ where: { status: 'processing' } });
    console.log(`   Processing: ${processingPayments}`);
    
    const escrowedPayments = await paymentRepo.count({ where: { status: 'escrowed' } });
    console.log(`   Escrowed: ${escrowedPayments}`);
    
    console.log('\n✅ Check complete');

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

checkPaymentStatus().catch(console.error);
