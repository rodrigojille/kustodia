require('dotenv').config();
const { AppDataSource } = require('./src/data-source');

async function checkClabeOrigin() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const paymentRepo = AppDataSource.getRepository('Payment');
    const payment = await paymentRepo.findOne({ where: { id: 110 } });
    
    if (!payment) {
      console.log('❌ Payment 110 not found');
      return;
    }

    console.log('\n📊 Payment 110 CLABE Analysis:');
    console.log('CLABE:', payment.deposit_clabe);
    console.log('Created at:', payment.created_at);
    console.log('Length:', payment.deposit_clabe.length);
    
    // Check CLABE prefix
    if (payment.deposit_clabe.startsWith('710969')) {
      console.log('✅ CLABE belongs to our Juno account (710969)');
      console.log('✅ Can be used for mock deposits');
    } else if (payment.deposit_clabe.startsWith('646459')) {
      console.log('❌ CLABE starts with 646459 (different bank)');
      console.log('❌ Cannot be used for mock deposits to our account');
      console.log('💡 This CLABE was likely created with /spei/v1/clabes (old method)');
    } else {
      console.log('❓ Unknown CLABE prefix:', payment.deposit_clabe.substring(0, 6));
    }

    // Check recent payments to see current CLABE creation pattern
    console.log('\n📋 Recent payments CLABE patterns:');
    const recentPayments = await paymentRepo.find({
      order: { id: 'DESC' },
      take: 5
    });

    recentPayments.forEach(p => {
      const prefix = p.deposit_clabe ? p.deposit_clabe.substring(0, 6) : 'NULL';
      console.log(`Payment ${p.id}: ${prefix}... (${p.deposit_clabe ? p.deposit_clabe.length : 0} digits)`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('\n🔌 Database connection closed');
  }
}

checkClabeOrigin();
