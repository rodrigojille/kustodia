const { DataSource } = require('typeorm');

async function resetPayment110() {
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

    // Reset Payment 110 to allow re-processing
    const resetQuery = `
      UPDATE payment 
      SET reference = NULL, transaction_id = NULL, status = 'pending'
      WHERE id = 110;
    `;
    
    await dataSource.query(resetQuery);
    console.log('✅ Payment 110 reset - cleared reference, transaction_id, and set status to pending');

    // Verify the reset
    const verifyQuery = `
      SELECT id, amount, status, deposit_clabe, reference, transaction_id
      FROM payment 
      WHERE id = 110;
    `;
    
    const result = await dataSource.query(verifyQuery);
    console.log('\n📊 Payment 110 after reset:');
    console.log(result[0]);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

resetPayment110();
