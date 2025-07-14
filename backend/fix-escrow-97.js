const { DataSource } = require('typeorm');

async function fixEscrow97() {
  // Database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '140290',
    database: 'kustodia',
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Check current values for Payment 110 and Escrow 97
    const paymentQuery = `
      SELECT p.id, p.status, p.created_at, e.id as escrow_id, e.custody_percent, 
             e.custody_end, e.created_at as escrow_created_at, e.status as escrow_status
      FROM payment p 
      LEFT JOIN escrow e ON p.escrow_id = e.id 
      WHERE p.id = 110;
    `;
    
    const currentData = await dataSource.query(paymentQuery);
    console.log('\n📊 Current Payment 110 & Escrow 97 data:');
    console.log(currentData[0]);

    if (currentData.length === 0) {
      console.log('❌ Payment 110 not found');
      return;
    }

    const payment = currentData[0];
    
    // Calculate what the custody_end should be for 1 day (86400 seconds)
    const escrowCreatedAt = new Date(payment.escrow_created_at);
    const custodyPeriodSeconds = 86400; // 1 day in seconds
    const correctCustodyEnd = new Date(escrowCreatedAt.getTime() + custodyPeriodSeconds * 1000);
    
    console.log('\n🔧 Calculation details:');
    console.log('Escrow created_at:', escrowCreatedAt.toISOString());
    console.log('Custody period (seconds):', custodyPeriodSeconds);
    console.log('Correct custody_end should be:', correctCustodyEnd.toISOString());
    console.log('Current custody_end:', payment.custody_end);

    // Update the escrow with correct custody_end
    const updateQuery = `
      UPDATE escrow 
      SET custody_end = $1, updated_at = NOW()
      WHERE id = 97;
    `;
    
    await dataSource.query(updateQuery, [correctCustodyEnd]);
    console.log('\n✅ Updated Escrow 97 custody_end to:', correctCustodyEnd.toISOString());

    // Verify the update
    const verifyQuery = `
      SELECT id, custody_end, created_at, 
             EXTRACT(EPOCH FROM (custody_end - created_at)) as custody_seconds,
             ROUND(EXTRACT(EPOCH FROM (custody_end - created_at)) / 86400) as custody_days
      FROM escrow 
      WHERE id = 97;
    `;
    
    const verifyData = await dataSource.query(verifyQuery);
    console.log('\n✅ Verification - Updated Escrow 97:');
    console.log(verifyData[0]);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

fixEscrow97();
