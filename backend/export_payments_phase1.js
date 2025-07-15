const { Pool } = require('pg');
const fs = require('fs');

// Database configuration
const localConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'kustodia',
  password: '140290',
  port: 5432,
};

async function exportPayments() {
  const client = new Pool(localConfig);
  
  try {
    await client.connect();
    console.log('Connected to local database');

    // Get all payments
    const result = await client.query(`
      SELECT id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at 
      FROM payment 
      ORDER BY id
    `);

    const payments = result.rows;
    console.log(`Found ${payments.length} payments to migrate`);

    // Generate SQL file - PHASE 1: Insert without escrow_id
    let sqlContent = `-- Phase 1: Insert payments without escrow_id references
TRUNCATE TABLE payment RESTART IDENTITY CASCADE;

`;

    payments.forEach((payment, index) => {
      console.log(`\nPayment ID: ${payment.id}`);
      console.log(`User ID: ${payment.user_id}`);
      console.log(`Seller ID: ${payment.seller_id}`);
      console.log(`Juno Transaction ID: ${payment.juno_transaction_id}`);
      console.log(`Original Escrow ID: ${payment.escrow_id} (will be set to NULL for now)`);
      console.log(`Amount: ${payment.amount}`);
      console.log(`Status: ${payment.status}`);

      const userIdValue = payment.user_id ? payment.user_id : 'NULL';
      const sellerIdValue = payment.seller_id ? payment.seller_id : 'NULL';
      const junoTransactionIdValue = payment.juno_transaction_id ? payment.juno_transaction_id : 'NULL';
      // SET ESCROW_ID TO NULL FOR PHASE 1
      const escrowIdValue = 'NULL';
      const recipientEmail = payment.recipient_email ? `'${payment.recipient_email.replace(/'/g, "''")}'` : 'NULL';
      const amountValue = payment.amount ? payment.amount : 'NULL';
      const currencyValue = payment.currency ? `'${payment.currency}'` : 'NULL';
      const statusValue = payment.status ? `'${payment.status}'` : 'NULL';
      const paymentTypeValue = payment.payment_type ? `'${payment.payment_type}'` : 'NULL';
      const travelRuleDataValue = payment.travel_rule_data ? `'${JSON.stringify(payment.travel_rule_data)}'::jsonb` : 'NULL';
      const createdAtValue = payment.created_at ? `'${payment.created_at.toISOString()}'` : 'NULL';
      const updatedAtValue = payment.updated_at ? `'${payment.updated_at.toISOString()}'` : 'NULL';

      sqlContent += `INSERT INTO payment (id, user_id, seller_id, juno_transaction_id, escrow_id, recipient_email, amount, currency, status, payment_type, travel_rule_data, created_at, updated_at) 
VALUES (${payment.id}, ${userIdValue}, ${sellerIdValue}, ${junoTransactionIdValue}, ${escrowIdValue}, ${recipientEmail}, ${amountValue}, ${currencyValue}, ${statusValue}, ${paymentTypeValue}, ${travelRuleDataValue}, ${createdAtValue}, ${updatedAtValue});
`;
    });

    // Reset sequence
    sqlContent += `\n-- Reset payment sequence
SELECT setval('payment_id_seq', (SELECT MAX(id) FROM payment));

-- Verify migration
SELECT id, user_id, seller_id, recipient_email, amount, currency, status, payment_type FROM payment ORDER BY id LIMIT 20;
`;

    // Write to file
    fs.writeFileSync('migrate_payments_phase1.sql', sqlContent);
    console.log('\n✅ Phase 1 SQL migration file created: migrate_payments_phase1.sql');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

exportPayments();
