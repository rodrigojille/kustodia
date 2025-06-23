require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function findTransaction() {
  await client.connect();

  console.log('=== Searching for our transaction in all possible ways ===');
  
  // 1. Look for the exact reference
  console.log('\n1. Looking for exact reference af9ae01-c904-4fb7-a39cc-7a2b4542a796...');
  const exact = await client.query('SELECT * FROM juno_transaction WHERE reference = $1', ['af9ae01-c904-4fb7-a39cc-7a2b4542a796']);
  console.log(`Found ${exact.rows.length} rows with exact reference`);
  
  // 2. Look for partial matches
  console.log('\n2. Looking for partial reference matches...');
  const partial = await client.query("SELECT * FROM juno_transaction WHERE reference LIKE '%af9ae01%' OR reference LIKE '%a39cc%'");
  console.log(`Found ${partial.rows.length} rows with partial reference match`);
  
  // 3. Look for amount 1000 with deposit type
  console.log('\n3. Looking for deposit type with amount 1000...');
  const deposits = await client.query('SELECT * FROM juno_transaction WHERE type = $1 AND amount = $2', ['deposit', 1000]);
  console.log(`Found ${deposits.rows.length} deposit rows with amount 1000`);
  
  // 4. Look for issuance type (in case it was stored differently)
  console.log('\n4. Looking for issuance type...');
  const issuances = await client.query("SELECT * FROM juno_transaction WHERE type ILIKE '%issuance%'");
  console.log(`Found ${issuances.rows.length} rows with issuance type`);
  
  // 5. Show recent transactions to see what's actually being stored
  console.log('\n5. Recent transactions in database:');
  const recent = await client.query('SELECT id, type, reference, amount, status, created_at FROM juno_transaction ORDER BY created_at DESC LIMIT 5');
  recent.rows.forEach((row, index) => {
    console.log(`${index + 1}. ID: ${row.id}, Type: ${row.type}, Ref: ${row.reference}, Amount: ${row.amount}, Status: ${row.status}`);
  });
  
  // 6. Check if Payment 83 has been updated
  console.log('\n6. Checking Payment ID 83 status:');
  const payment83 = await client.query('SELECT id, amount, deposit_clabe, reference, transaction_id, status FROM payment WHERE id = 83');
  if (payment83.rows.length > 0) {
    const p = payment83.rows[0];
    console.log(`Payment 83: amount=${p.amount}, deposit_clabe=${p.deposit_clabe}, reference=${p.reference}, transaction_id=${p.transaction_id}, status=${p.status}`);
  } else {
    console.log('Payment 83 not found');
  }

  await client.end();
}

findTransaction().catch(console.error);
