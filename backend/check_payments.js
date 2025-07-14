const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkData() {
  try {
    console.log('🔍 CHECKING PAYMENT DATA IN LOCAL DATABASE:');
    
    // Check payments table
    const paymentsResult = await pool.query('SELECT COUNT(*) as count, status FROM payment GROUP BY status');
    console.log('\n📊 PAYMENTS BY STATUS:');
    console.table(paymentsResult.rows);
    
    // Check total volume
    const volumeResult = await pool.query('SELECT SUM(amount) as total_volume FROM payment WHERE status = \'completed\'');
    console.log('\n💰 TOTAL VOLUME:', volumeResult.rows[0]?.total_volume || 0);
    
    // Check recent payments
    const recentResult = await pool.query('SELECT id, amount, status, created_at FROM payment ORDER BY created_at DESC LIMIT 5');
    console.log('\n📅 RECENT PAYMENTS:');
    console.table(recentResult.rows);
    
    // Check this month's payments
    const thisMonthResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM payment 
      WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) 
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);
    console.log('\n📅 PAYMENTS THIS MONTH:', thisMonthResult.rows[0]?.count || 0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkData();
