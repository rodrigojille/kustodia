const { Client } = require('pg');
require('dotenv').config();

async function debugAnalyticsQueries() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('🔍 Debugging Analytics Queries...\n');

    const userId = 2;
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
    const currentYear = now.getFullYear();
    
    console.log(`📅 Current Date: ${now}`);
    console.log(`📅 Current Month: ${currentMonth}`);
    console.log(`📅 Current Year: ${currentYear}\n`);

    // Test the payments this month query
    const paymentsThisMonthQuery = `
      SELECT COUNT(*) as count FROM payment 
      WHERE user_id = $1 
      AND EXTRACT(MONTH FROM created_at) = $2 
      AND EXTRACT(YEAR FROM created_at) = $3
    `;
    
    console.log('🔍 Testing Payments This Month Query:');
    console.log(`Query: ${paymentsThisMonthQuery}`);
    console.log(`Parameters: userId=${userId}, month=${currentMonth}, year=${currentYear}`);
    
    const paymentsResult = await client.query(paymentsThisMonthQuery, [userId, currentMonth, currentYear]);
    console.log(`Result: ${paymentsResult.rows[0]?.count || 0} payments\n`);

    // Test without date filter
    const allPaymentsQuery = `SELECT COUNT(*) as count FROM payment WHERE user_id = $1`;
    const allPaymentsResult = await client.query(allPaymentsQuery, [userId]);
    console.log(`🔍 Total Payments for User ${userId}: ${allPaymentsResult.rows[0]?.count || 0}\n`);

    // Test July 2025 specifically
    const julyPaymentsQuery = `
      SELECT COUNT(*) as count FROM payment 
      WHERE user_id = $1 
      AND EXTRACT(MONTH FROM created_at) = 7 
      AND EXTRACT(YEAR FROM created_at) = 2025
    `;
    const julyResult = await client.query(julyPaymentsQuery, [userId]);
    console.log(`🔍 July 2025 Payments: ${julyResult.rows[0]?.count || 0}\n`);

    // Check recent payments with their extracted month/year
    const recentWithDatesQuery = `
      SELECT id, amount, status, created_at,
             EXTRACT(MONTH FROM created_at) as month,
             EXTRACT(YEAR FROM created_at) as year
      FROM payment 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    const recentResult = await client.query(recentWithDatesQuery, [userId]);
    console.log('🔍 Recent Payments with Date Parts:');
    recentResult.rows.forEach(payment => {
      console.log(`  Payment ${payment.id}: ${payment.created_at} → Month: ${payment.month}, Year: ${payment.year}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

debugAnalyticsQueries();
