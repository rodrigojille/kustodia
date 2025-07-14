const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');

async function checkNuevoFlujoStatus() {
  try {
    console.log('🔍 Checking Flow 2 (nuevo_flujo) health status...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }
    
    const paymentRepo = AppDataSource.getRepository(Payment);
    
    // Check for nuevo_flujo payments
    const nuevoFlujoPayments = await paymentRepo.find({
      where: { payment_type: 'nuevo_flujo' },
      relations: ['escrow', 'user', 'seller'],
      order: { id: 'DESC' },
      take: 10
    });
    
    console.log(`📊 Found ${nuevoFlujoPayments.length} nuevo_flujo payments`);
    
    if (nuevoFlujoPayments.length === 0) {
      console.log('⚠️  No nuevo_flujo payments found in database');
      console.log('💡 Need to create test payments for Flow 2 validation');
    } else {
      console.log('\n📋 Nuevo Flujo Payments Status:');
      nuevoFlujoPayments.forEach(payment => {
        console.log(`\n   Payment ${payment.id}:`);
        console.log(`     - Status: ${payment.status}`);
        console.log(`     - Amount: ${payment.amount} MXN`);
        console.log(`     - Vertical: ${payment.vertical_type || 'Not set'}`);
        console.log(`     - Payer Approval: ${payment.payer_approval ? '✅' : '❌'}`);
        console.log(`     - Payee Approval: ${payment.payee_approval ? '✅' : '❌'}`);
        console.log(`     - Release Conditions: ${payment.release_conditions || 'Not set'}`);
        
        if (payment.escrow) {
          console.log(`     - Escrow Status: ${payment.escrow.status}`);
          console.log(`     - Smart Contract ID: ${payment.escrow.smart_contract_escrow_id || 'Not created'}`);
        }
      });
    }
    
    // Check vertical types in use
    const verticalTypes = await paymentRepo
      .createQueryBuilder('payment')
      .select('payment.vertical_type', 'vertical')
      .addSelect('COUNT(*)', 'count')
      .where('payment.vertical_type IS NOT NULL')
      .groupBy('payment.vertical_type')
      .getRawMany();
    
    console.log('\n📈 Vertical Types in Database:');
    if (verticalTypes.length === 0) {
      console.log('   - No vertical types found');
    } else {
      verticalTypes.forEach(v => {
        console.log(`   - ${v.vertical}: ${v.count} payments`);
      });
    }
    
    // Check payment types distribution
    const paymentTypes = await paymentRepo
      .createQueryBuilder('payment')
      .select('payment.payment_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('payment.payment_type')
      .getRawMany();
    
    console.log('\n🔄 Payment Types Distribution:');
    paymentTypes.forEach(t => {
      console.log(`   - ${t.type}: ${t.count} payments`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n🔌 Database connection closed');
    }
  }
}

checkNuevoFlujoStatus();
