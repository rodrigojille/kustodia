require('dotenv').config();
const { DataSource } = require('typeorm');

async function fixPayment110Clabe() {
  // Database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '140290',
    database: 'kustodia',
    entities: ['dist/entity/*.js'],
    synchronize: false,
    logging: false
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const paymentRepo = dataSource.getRepository('Payment');
    
    // Get Payment 110
    const payment = await paymentRepo.findOne({ where: { id: 110 } });
    if (!payment) {
      console.log('❌ Payment 110 not found');
      return;
    }

    console.log('\n📊 Payment 110 Current State:');
    console.log('Current CLABE:', payment.deposit_clabe);
    console.log('Status:', payment.status);
    console.log('Reference:', payment.reference);

    // Use one of our valid CLABEs from the list we saw earlier
    const validClabe = '710969000000401454'; // Most recent CLABE from our account
    
    console.log('\n🔧 Updating Payment 110:');
    console.log('New CLABE:', validClabe);
    
    // Update the payment
    payment.deposit_clabe = validClabe;
    payment.status = 'pending'; // Reset to pending so automation can process it
    payment.reference = null; // Clear reference so automation can set it
    payment.transaction_id = null; // Clear transaction ID
    
    await paymentRepo.save(payment);
    
    console.log('✅ Payment 110 updated successfully');
    console.log('\n📋 Updated Payment 110:');
    console.log('CLABE:', payment.deposit_clabe);
    console.log('Status:', payment.status);
    console.log('Reference:', payment.reference);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Run mock deposit with CLABE:', validClabe);
    console.log('2. Amount should be: 1000.00');
    console.log('3. Automation should detect and process the deposit');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n🔌 Database connection closed');
    }
  }
}

fixPayment110Clabe();
