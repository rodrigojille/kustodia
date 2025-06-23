require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function checkPayment83() {
  await client.connect();
  
  // Check Payment ID 83 status
  const payment = await client.query('SELECT id, amount, deposit_clabe, reference, transaction_id, status, created_at FROM payment WHERE id = 83');
  console.log('=== Payment ID 83 Status ===');
  if (payment.rows.length > 0) {
    const p = payment.rows[0];
    console.log('ID:', p.id);
    console.log('Amount:', p.amount);
    console.log('CLABE:', p.deposit_clabe);
    console.log('Reference:', p.reference || 'null');
    console.log('Transaction ID:', p.transaction_id || 'null');
    console.log('Status:', p.status);
    console.log('Created:', p.created_at);
  } else {
    console.log('Payment ID 83 not found');
  }
  
  // Check for Juno transactions with the new ISSUANCE ID
  const issuanceId = 'af9ae01-c904-4fb7-a39cc-7a2b4542a796';
  const junoTx = await client.query('SELECT * FROM juno_transaction WHERE juno_id = $1 OR reference = $1', [issuanceId]);
  console.log('\n=== Juno Transaction af9ae01-c904-4fb7-a39cc-7a2b4542a796 ===');
  if (junoTx.rows.length > 0) {
    junoTx.rows.forEach(tx => {
      console.log('ID:', tx.id);
      console.log('Juno ID:', tx.juno_id);
      console.log('Amount:', tx.amount);
      console.log('Type:', tx.transaction_type);
      console.log('CLABE:', tx.clabe || 'null');
      console.log('Status:', tx.status);
      console.log('Reference:', tx.reference || 'null');
      console.log('Created:', tx.created_at);
    });
  } else {
    console.log('No Juno transaction found with ID', issuanceId);
  }
  
  // Check for any ISSUANCE transactions with amount 1000
  const issuanceTransactions = await client.query("SELECT * FROM juno_transaction WHERE transaction_type = 'ISSUANCE' AND amount = 1000 ORDER BY created_at DESC");
  console.log('\n=== ISSUANCE transactions with amount 1000 ===');  
  if (issuanceTransactions.rows.length > 0) {
    issuanceTransactions.rows.forEach(tx => {
      console.log('ID:', tx.id);
      console.log('Juno ID:', tx.juno_id);
      console.log('Amount:', tx.amount);
      console.log('CLABE:', tx.clabe || 'null');
      console.log('Status:', tx.status);
      console.log('Reference:', tx.reference || 'null');
      console.log('Created:', tx.created_at);
      console.log('---');
    });
  } else {
    console.log('No ISSUANCE transactions found with amount 1000');
  }
  
  await client.end();
}

checkPayment83().catch(console.error);
