const { Pool } = require('pg');

async function debugPayment112Deadline() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'kustodia',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '140290',
  });

  try {
    console.log('🔍 Debugging Payment 112 deadline calculation...');
    
    // Get the exact custody_end value from database
    const result = await pool.query(`
      SELECT 
        p.id, 
        p.status, 
        p.payment_type,
        e.custody_end,
        e.created_at as escrow_created_at,
        EXTRACT(EPOCH FROM e.custody_end) as custody_end_timestamp,
        EXTRACT(EPOCH FROM NOW()) as current_timestamp
      FROM payment p 
      LEFT JOIN escrow e ON p.escrow_id = e.id 
      WHERE p.id = 112
    `);
    
    if (result.rows.length > 0) {
      const payment = result.rows[0];
      
      console.log('📊 Database Values:');
      console.log(`   Escrow Created At: ${payment.escrow_created_at}`);
      console.log(`   Custody End: ${payment.custody_end}`);
      console.log(`   Custody End Timestamp: ${payment.custody_end_timestamp}`);
      console.log(`   Current Timestamp: ${payment.current_timestamp}`);
      console.log('');
      
      console.log('🧮 JavaScript Calculations:');
      const custodyEndDate = new Date(payment.custody_end);
      const jsTimestamp = Math.floor(custodyEndDate.getTime() / 1000);
      const currentTime = Math.floor(Date.now() / 1000);
      
      console.log(`   JS Custody End Date: ${custodyEndDate.toISOString()}`);
      console.log(`   JS Timestamp: ${jsTimestamp}`);
      console.log(`   Current JS Timestamp: ${currentTime}`);
      console.log(`   Difference (seconds): ${jsTimestamp - currentTime}`);
      console.log(`   Is Future: ${jsTimestamp > currentTime ? '✅ YES' : '❌ NO'}`);
      console.log('');
      
      console.log('🔍 Comparison:');
      console.log(`   DB Timestamp: ${payment.custody_end_timestamp}`);
      console.log(`   JS Timestamp: ${jsTimestamp}`);
      console.log(`   Match: ${Math.abs(payment.custody_end_timestamp - jsTimestamp) < 1 ? '✅ YES' : '❌ NO'}`);
      
      // The timestamp that was failing in the logs
      const failedTimestamp = 1752363100;
      console.log('');
      console.log('❌ Failed Timestamp Analysis:');
      console.log(`   Failed Timestamp: ${failedTimestamp}`);
      console.log(`   Failed Date: ${new Date(failedTimestamp * 1000).toISOString()}`);
      console.log(`   Current Timestamp: ${currentTime}`);
      console.log(`   Was Past: ${failedTimestamp < currentTime ? '❌ YES' : '✅ NO'}`);
      
    } else {
      console.log('❌ Payment 112 not found');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

debugPayment112Deadline();
