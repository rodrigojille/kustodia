const { Pool } = require('pg');

async function fixPayment112CustodyEnd() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'kustodia',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '140290',
  });

  try {
    console.log('🔧 Fixing Payment 112 custody_end date...');
    
    // Calculate a proper future date (24 hours from now)
    const futureDate = new Date(Date.now() + (24 * 60 * 60 * 1000));
    
    console.log('📅 Setting new custody end date:');
    console.log(`   Current time: ${new Date().toISOString()}`);
    console.log(`   New custody end: ${futureDate.toISOString()}`);
    
    // Update the custody_end in the escrow table
    const result = await pool.query(`
      UPDATE escrow 
      SET custody_end = $1
      WHERE payment_id = 112
      RETURNING id, custody_end
    `, [futureDate]);
    
    if (result.rows.length > 0) {
      const escrow = result.rows[0];
      console.log('✅ Custody end updated successfully:');
      console.log(`   Escrow ID: ${escrow.id}`);
      console.log(`   New custody end: ${escrow.custody_end}`);
      
      // Verify the timestamp calculation
      const timestamp = Math.floor(new Date(escrow.custody_end).getTime() / 1000);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      console.log('');
      console.log('🕐 Timestamp verification:');
      console.log(`   New timestamp: ${timestamp}`);
      console.log(`   Current timestamp: ${currentTimestamp}`);
      console.log(`   Is future: ${timestamp > currentTimestamp ? '✅ YES' : '❌ NO'}`);
      console.log(`   Hours ahead: ${((timestamp - currentTimestamp) / 3600).toFixed(1)}`);
      
    } else {
      console.log('❌ No escrow found for Payment 112');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

fixPayment112CustodyEnd();
