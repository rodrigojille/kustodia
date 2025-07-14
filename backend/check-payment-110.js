const { DataSource } = require('typeorm');

async function checkPayment110() {
  // Database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '140290',
    database: 'kustodia',
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Check Payment 110 details for deposit simulation
    const paymentQuery = `
      SELECT p.id, p.amount, p.status, p.deposit_clabe, p.reference, p.transaction_id,
             p.payer_email, p.recipient_email, p.description,
             e.id as escrow_id, e.custody_percent, e.custody_end, e.status as escrow_status
      FROM payment p 
      LEFT JOIN escrow e ON p.escrow_id = e.id 
      WHERE p.id = 110;
    `;
    
    const paymentData = await dataSource.query(paymentQuery);
    console.log('\n📊 Payment 110 Details for Deposit Simulation:');
    console.log(paymentData[0]);

    if (paymentData.length === 0) {
      console.log('❌ Payment 110 not found');
      return;
    }

    const payment = paymentData[0];
    
    console.log('\n🎯 Deposit Matching Criteria:');
    console.log('- Amount to match:', payment.amount);
    console.log('- CLABE to match:', payment.deposit_clabe);
    console.log('- Status should be: complete');
    console.log('- Current payment status:', payment.status);
    console.log('- Current reference:', payment.reference || 'NULL (good for new deposit)');
    
    console.log('\n📋 To simulate deposit, create a Juno transaction with:');
    console.log('- amount:', payment.amount);
    console.log('- receiver_clabe:', payment.deposit_clabe);
    console.log('- status: "complete"');
    console.log('- fid: "TEST_FID_110"');
    console.log('- deposit_id: "TEST_DEPOSIT_110"');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

checkPayment110();
