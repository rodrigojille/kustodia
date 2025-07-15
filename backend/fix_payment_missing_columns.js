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

async function generatePaymentColumnFixes() {
  const client = new Client(localConfig);
  
  try {
    await client.connect();
    console.log('Connected to local PostgreSQL database');

    // Get all payments with all columns
    const result = await client.query(`
      SELECT 
        id, description, reference, transaction_id, 
        blockchain_tx_hash, bitso_tracking_number, travel_rule_data,
        deposit_clabe, payout_clabe, payout_juno_bank_account_id, juno_payment_id, 
        commission_percent, commission_amount, platform_commission_percent, platform_commission_amount,
        platform_commission_beneficiary_email, commission_beneficiary_name, commission_beneficiary_email,
        commission_beneficiary_clabe, commission_beneficiary_juno_bank_account_id, payer_clabe,
        payer_email, payer_approval, payee_approval, payer_approval_timestamp, payee_approval_timestamp,
        release_conditions, vertical_type
      FROM payment 
      ORDER BY id
    `);

    console.log(`Found ${result.rows.length} payments to update missing columns`);
    
    let sql = `-- Fix Missing Payment Columns\n`;
    sql += `-- Generated on ${new Date().toISOString()}\n\n`;

    result.rows.forEach((payment) => {
      console.log(`Processing payment ID: ${payment.id}`);
      
      sql += `-- Update payment ${payment.id} with missing columns\n`;
      sql += `UPDATE payment SET\n`;
      
      const updates = [];
      
      // Add all potentially missing columns
      if (payment.description) updates.push(`  description = '${payment.description.replace(/'/g, "''")}'`);
      if (payment.reference) updates.push(`  reference = '${payment.reference.replace(/'/g, "''")}'`);
      if (payment.transaction_id) updates.push(`  transaction_id = '${payment.transaction_id}'`);
      if (payment.blockchain_tx_hash) updates.push(`  blockchain_tx_hash = '${payment.blockchain_tx_hash}'`);
      if (payment.bitso_tracking_number) updates.push(`  bitso_tracking_number = '${payment.bitso_tracking_number}'`);
      if (payment.travel_rule_data) updates.push(`  travel_rule_data = '${JSON.stringify(payment.travel_rule_data).replace(/'/g, "''")}'::jsonb`);
      if (payment.deposit_clabe) updates.push(`  deposit_clabe = '${payment.deposit_clabe}'`);
      if (payment.payout_clabe) updates.push(`  payout_clabe = '${payment.payout_clabe}'`);
      if (payment.payout_juno_bank_account_id) updates.push(`  payout_juno_bank_account_id = '${payment.payout_juno_bank_account_id}'`);
      if (payment.juno_payment_id) updates.push(`  juno_payment_id = '${payment.juno_payment_id}'`);
      if (payment.commission_percent !== null) updates.push(`  commission_percent = ${payment.commission_percent}`);
      if (payment.commission_amount !== null) updates.push(`  commission_amount = ${payment.commission_amount}`);
      if (payment.platform_commission_percent !== null) updates.push(`  platform_commission_percent = ${payment.platform_commission_percent}`);
      if (payment.platform_commission_amount !== null) updates.push(`  platform_commission_amount = ${payment.platform_commission_amount}`);
      if (payment.platform_commission_beneficiary_email) updates.push(`  platform_commission_beneficiary_email = '${payment.platform_commission_beneficiary_email}'`);
      if (payment.commission_beneficiary_name) updates.push(`  commission_beneficiary_name = '${payment.commission_beneficiary_name.replace(/'/g, "''")}'`);
      if (payment.commission_beneficiary_email) updates.push(`  commission_beneficiary_email = '${payment.commission_beneficiary_email}'`);
      if (payment.commission_beneficiary_clabe) updates.push(`  commission_beneficiary_clabe = '${payment.commission_beneficiary_clabe}'`);
      if (payment.commission_beneficiary_juno_bank_account_id) updates.push(`  commission_beneficiary_juno_bank_account_id = '${payment.commission_beneficiary_juno_bank_account_id}'`);
      if (payment.payer_clabe) updates.push(`  payer_clabe = '${payment.payer_clabe}'`);
      if (payment.payer_email) updates.push(`  payer_email = '${payment.payer_email}'`);
      if (payment.payer_approval !== null) updates.push(`  payer_approval = ${payment.payer_approval}`);
      if (payment.payee_approval !== null) updates.push(`  payee_approval = ${payment.payee_approval}`);
      if (payment.payer_approval_timestamp) updates.push(`  payer_approval_timestamp = '${payment.payer_approval_timestamp.toISOString()}'`);
      if (payment.payee_approval_timestamp) updates.push(`  payee_approval_timestamp = '${payment.payee_approval_timestamp.toISOString()}'`);
      if (payment.release_conditions) updates.push(`  release_conditions = '${payment.release_conditions.replace(/'/g, "''")}'`);
      if (payment.vertical_type) updates.push(`  vertical_type = '${payment.vertical_type}'`);
      
      if (updates.length > 0) {
        sql += updates.join(',\n') + '\n';
        sql += `WHERE id = ${payment.id};\n\n`;
      } else {
        sql += `-- No updates needed for payment ${payment.id}\n\n`;
      }
    });

    // Add verification query
    sql += `-- Verification: Check updated columns\n`;
    sql += `SELECT id, description, reference, transaction_id, commission_percent, commission_amount, payer_email, vertical_type\n`;
    sql += `FROM payment WHERE id <= 10 ORDER BY id;\n`;

    // Write to file
    fs.writeFileSync('fix_payment_missing_columns.sql', sql);
    console.log('✅ Payment column fix SQL file created: fix_payment_missing_columns.sql');

  } catch (err) {
    console.error('❌ Error generating payment column fixes:', err);
  } finally {
    await client.end();
  }
}

generatePaymentColumnFixes();
