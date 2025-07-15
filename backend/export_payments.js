const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '140290',
  database: 'kustodia'
});

async function exportPayments() {
  try {
    await client.connect();
    console.log('Connected to local database');

    const result = await client.query('SELECT * FROM payment ORDER BY id');
    const payments = result.rows;

    console.log(`Found ${payments.length} payments to migrate`);

    if (payments.length === 0) {
      console.log('No payments to migrate');
      return;
    }

    // Generate SQL for truncating and inserting
    let sql = '-- Payments Migration\n';
    sql += 'TRUNCATE TABLE payment RESTART IDENTITY CASCADE;\n\n';

    payments.forEach(payment => {
      console.log(`\nPayment ID: ${payment.id}`);
      console.log(`User ID: ${payment.user_id}`);
      console.log(`Seller ID: ${payment.seller_id}`);
      console.log(`Amount: ${payment.amount} ${payment.currency}`);
      console.log(`Status: ${payment.status}`);
      console.log(`Payment Type: ${payment.payment_type}`);
      console.log(`Recipient Email: ${payment.recipient_email}`);

      // Handle nullable fields with proper escaping
      const escapeString = (str) => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';
      const escapeNumber = (num) => num !== null && num !== undefined ? num : 'NULL';
      const escapeBoolean = (bool) => bool !== null && bool !== undefined ? bool : 'NULL';
      const escapeTimestamp = (date) => date ? `'${date.toISOString()}'` : 'NULL';

      sql += `INSERT INTO payment (
        id, user_id, seller_id, recipient_email, payer_email, amount, currency, 
        description, reference, transaction_id, juno_transaction_id, blockchain_tx_hash, 
        bitso_tracking_number, travel_rule_data, deposit_clabe, payout_clabe, 
        payout_juno_bank_account_id, juno_payment_id, commission_percent, commission_amount,
        platform_commission_percent, platform_commission_amount, platform_commission_beneficiary_email,
        commission_beneficiary_name, commission_beneficiary_email, commission_beneficiary_clabe,
        commission_beneficiary_juno_bank_account_id, payer_clabe, status, payment_type,
        payer_approval, payee_approval, payer_approval_timestamp, payee_approval_timestamp,
        release_conditions, vertical_type, escrow_id, created_at, updated_at
      ) VALUES (
        ${payment.id},
        ${escapeNumber(payment.user_id)},
        ${escapeNumber(payment.seller_id)},
        ${escapeString(payment.recipient_email)},
        ${escapeString(payment.payer_email)},
        ${payment.amount},
        ${escapeString(payment.currency || 'MXN')},
        ${escapeString(payment.description)},
        ${escapeString(payment.reference)},
        ${escapeString(payment.transaction_id)},
        ${escapeNumber(payment.juno_transaction_id)},
        ${escapeString(payment.blockchain_tx_hash)},
        ${escapeString(payment.bitso_tracking_number)},
        ${payment.travel_rule_data ? `'${JSON.stringify(payment.travel_rule_data).replace(/'/g, "''")}'::jsonb` : 'NULL'},
        ${escapeString(payment.deposit_clabe)},
        ${escapeString(payment.payout_clabe)},
        ${escapeString(payment.payout_juno_bank_account_id)},
        ${escapeString(payment.juno_payment_id)},
        ${escapeNumber(payment.commission_percent)},
        ${escapeNumber(payment.commission_amount)},
        ${escapeNumber(payment.platform_commission_percent)},
        ${escapeNumber(payment.platform_commission_amount)},
        ${escapeString(payment.platform_commission_beneficiary_email)},
        ${escapeString(payment.commission_beneficiary_name)},
        ${escapeString(payment.commission_beneficiary_email)},
        ${escapeString(payment.commission_beneficiary_clabe)},
        ${escapeString(payment.commission_beneficiary_juno_bank_account_id)},
        ${escapeString(payment.payer_clabe)},
        ${escapeString(payment.status || 'pending')},
        ${escapeString(payment.payment_type || 'traditional')},
        ${escapeBoolean(payment.payer_approval)},
        ${escapeBoolean(payment.payee_approval)},
        ${escapeTimestamp(payment.payer_approval_timestamp)},
        ${escapeTimestamp(payment.payee_approval_timestamp)},
        ${escapeString(payment.release_conditions)},
        ${escapeString(payment.vertical_type)},
        ${escapeNumber(payment.escrow_id)},
        ${escapeTimestamp(payment.created_at) || 'NOW()'},
        ${escapeTimestamp(payment.updated_at) || 'NOW()'}
      );\n`;
    });

    sql += '\n-- Reset sequence\n';
    sql += `SELECT setval('payment_id_seq', (SELECT MAX(id) FROM payment));\n\n`;
    sql += '-- Verification\n';
    sql += 'SELECT id, user_id, seller_id, recipient_email, amount, currency, status, payment_type FROM payment ORDER BY id;\n';

    // Write to file
    require('fs').writeFileSync('migrate_payments.sql', sql);
    console.log('\n✅ SQL migration file created: migrate_payments.sql');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

exportPayments();
