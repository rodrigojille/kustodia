const { Client } = require('pg');
const fs = require('fs');

// Local PostgreSQL connection
const localConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'kustodia',
  password: '140290',
  port: 5432,
};

async function exportPaymentEscrowUpdates() {
  const client = new Client(localConfig);
  
  try {
    await client.connect();
    console.log('Connected to local PostgreSQL database');

    // Get payments that have escrow_id (non-null)
    const result = await client.query(`
      SELECT p.id as payment_id, p.escrow_id, e.id as actual_escrow_id
      FROM payment p
      LEFT JOIN escrow e ON e.payment_id = p.id
      WHERE p.escrow_id IS NOT NULL
      ORDER BY p.id
    `);

    console.log(`Found ${result.rows.length} payments with escrow references to update`);
    
    if (result.rows.length === 0) {
      console.log('No payment-escrow updates needed');
      return;
    }

    let sql = `-- Phase 3: Update payments with correct escrow_id references\n`;
    sql += `-- Generated on ${new Date().toISOString()}\n\n`;

    result.rows.forEach((row) => {
      console.log(`Payment ID: ${row.payment_id}, Current escrow_id: ${row.escrow_id}, Actual escrow_id: ${row.actual_escrow_id}`);
      
      sql += `-- Update payment ${row.payment_id} with escrow_id ${row.actual_escrow_id}\n`;
      sql += `UPDATE payment SET escrow_id = ${row.actual_escrow_id} WHERE id = ${row.payment_id};\n`;
    });

    // Add verification query
    sql += `\n-- Verification: Check updated payment-escrow relationships\n`;
    sql += `SELECT p.id as payment_id, p.escrow_id, e.id as escrow_id_check, e.payment_id as escrow_payment_id\n`;
    sql += `FROM payment p\n`;
    sql += `LEFT JOIN escrow e ON p.escrow_id = e.id\n`;
    sql += `WHERE p.escrow_id IS NOT NULL\n`;
    sql += `ORDER BY p.id\n`;
    sql += `LIMIT 10;\n`;

    // Write to file
    fs.writeFileSync('migrate_payments_phase3.sql', sql);
    console.log('✅ Phase 3 SQL migration file created: migrate_payments_phase3.sql');

  } catch (err) {
    console.error('❌ Error exporting payment-escrow updates:', err);
  } finally {
    await client.end();
  }
}

exportPaymentEscrowUpdates();
