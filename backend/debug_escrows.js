const { Pool } = require('pg');
require('dotenv').config();

async function checkEscrowsAndPayments() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:140290@localhost:5432/kustodia'
  });

  try {
    console.log('🔍 Checking active escrows and their payment statuses...\n');
    
    // Check active escrows with their payment details
    const activeEscrowsQuery = `
      SELECT 
        e.id as escrow_id,
        e.status as escrow_status,
        e.custody_amount,
        p.id as payment_id,
        p.status as payment_status,
        p.amount,
        p.recipient_email,
        p.created_at
      FROM escrow e 
      LEFT JOIN payment p ON e.payment_id = p.id 
      WHERE e.status IN ('active', 'funded')
      ORDER BY e.id DESC 
      LIMIT 10;
    `;
    
    const result = await pool.query(activeEscrowsQuery);
    
    console.log('📊 Active Escrows Found:', result.rows.length);
    console.log('==================================');
    
    result.rows.forEach(row => {
      console.log(`Escrow ID: ${row.escrow_id}`);
      console.log(`Escrow Status: ${row.escrow_status}`);
      console.log(`Payment ID: ${row.payment_id}`);
      console.log(`Payment Status: ${row.payment_status}`);
      console.log(`Amount: ${row.amount}`);
      console.log(`Recipient: ${row.recipient_email}`);
      console.log('---');
    });
    
    console.log('\n🎯 Current Backend Query Logic:');
    console.log('Requires: escrow.status IN (\'active\', \'funded\') AND payment.status = \'escrowed\'');
    
    // Check what payment statuses actually exist for active escrows
    const statusQuery = `
      SELECT DISTINCT p.status, COUNT(*) as count
      FROM escrow e 
      LEFT JOIN payment p ON e.payment_id = p.id 
      WHERE e.status IN ('active', 'funded')
      GROUP BY p.status;
    `;
    
    const statusResult = await pool.query(statusQuery);
    console.log('\n📈 Payment Statuses for Active Escrows:');
    statusResult.rows.forEach(row => {
      console.log(`Status: ${row.status} - Count: ${row.count}`);
    });
    
  } catch (error) {
    console.error('❌ Database query failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkEscrowsAndPayments();
