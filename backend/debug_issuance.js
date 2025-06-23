require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function debugIssuance() {
  await client.connect();
  
  console.log('=== Payment ID 83 Details ===');
  const payment = await client.query('SELECT * FROM payment WHERE id = 83');
  if (payment.rows.length > 0) {
    const p = payment.rows[0];
    console.log('Payment amount:', p.amount, typeof p.amount);
    console.log('Payment deposit_clabe:', p.deposit_clabe);
    console.log('Payment reference:', p.reference);
    console.log('Payment transaction_id:', p.transaction_id);
  }
  
  console.log('\n=== All ISSUANCE Transactions ===');
  const issuances = await client.query("SELECT * FROM juno_transaction WHERE transaction_type = 'ISSUANCE' ORDER BY created_at DESC LIMIT 5");
  issuances.rows.forEach((tx, index) => {
    console.log(`--- ISSUANCE ${index + 1} ---`);
    console.log('juno_id:', tx.juno_id);
    console.log('amount:', tx.amount, typeof tx.amount);
    console.log('clabe:', tx.clabe || 'NULL');
    console.log('beneficiary_clabe:', tx.beneficiary_clabe || 'NULL');
    console.log('status:', tx.status);
    console.log('reference:', tx.reference || 'NULL');
    console.log('Raw transaction data:', JSON.stringify(tx, null, 2));
    console.log('');
  });
  
  console.log('\n=== Testing Match Logic ===');
  // Test the exact matching logic from sync script
  const testAmount = 1000;
  const testClabe = '710969000000396022';
  
  console.log(`Looking for payment with amount=${testAmount} and deposit_clabe='${testClabe}'`);
  const matchTest = await client.query('SELECT * FROM payment WHERE amount = $1 AND deposit_clabe = $2', [testAmount, testClabe]);
  console.log('Match found?', matchTest.rows.length > 0);
  if (matchTest.rows.length > 0) {
    console.log('Matched payment ID:', matchTest.rows[0].id);
  }
  
  console.log(`\nLooking for ISSUANCE with amount=${testAmount} and clabe='${testClabe}'`);
  const issuanceTest = await client.query("SELECT * FROM juno_transaction WHERE transaction_type = 'ISSUANCE' AND amount = $1 AND clabe = $2", [testAmount, testClabe]);
  console.log('ISSUANCE match found?', issuanceTest.rows.length > 0);
  
  console.log(`\nLooking for ISSUANCE with amount=${testAmount} (any clabe)`);
  const issuanceAny = await client.query("SELECT * FROM juno_transaction WHERE transaction_type = 'ISSUANCE' AND amount = $1", [testAmount]);
  console.log('ISSUANCE found with amount 1000:', issuanceAny.rows.length);
  if (issuanceAny.rows.length > 0) {
    issuanceAny.rows.forEach(tx => {
      console.log('  - juno_id:', tx.juno_id);
      console.log('  - clabe:', tx.clabe || 'NULL');
      console.log('  - amount:', tx.amount);
    });
  }
  
  await client.end();
}

debugIssuance().catch(console.error);
