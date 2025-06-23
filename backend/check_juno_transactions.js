require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function checkForOurTransaction() {
  await client.connect();

  console.log('=== Looking for transactions with amount 1000 ===');
  const amount1000 = await client.query('SELECT * FROM juno_transaction WHERE amount = 1000 ORDER BY created_at DESC');
  console.log('Found', amount1000.rows.length, 'transactions with amount 1000');

  if (amount1000.rows.length > 0) {
    amount1000.rows.forEach((tx, index) => {
      console.log(`--- Transaction ${index + 1} ---`);
      console.log('ID:', tx.id);
      console.log('Type:', tx.type);
      console.log('Reference:', tx.reference);
      console.log('Amount:', tx.amount);
      console.log('Status:', tx.status);
      console.log('Created:', tx.created_at);
      console.log('');
    });
  }

  console.log('=== Looking for recent transactions (last 5) ===');
  const recent = await client.query('SELECT * FROM juno_transaction ORDER BY created_at DESC LIMIT 5');
  recent.rows.forEach((tx, index) => {
    console.log(`--- Recent ${index + 1} ---`);
    console.log('ID:', tx.id);
    console.log('Type:', tx.type);
    console.log('Reference:', tx.reference);
    console.log('Amount:', tx.amount);
    console.log('Status:', tx.status);
    console.log('Created:', tx.created_at);
    console.log('');
  });

  // Check for the specific ISSUANCE transaction ID we saw in Juno dashboard
  console.log('=== Looking for af9ae01-c904-4fb7-a39cc-7a2b4542a796 ===');
  const specific = await client.query('SELECT * FROM juno_transaction WHERE reference = $1', ['af9ae01-c904-4fb7-a39cc-7a2b4542a796']); 
  if (specific.rows.length > 0) {
    console.log('FOUND our ISSUANCE transaction!');
    console.log(JSON.stringify(specific.rows[0], null, 2));        
  } else {
    console.log('Our ISSUANCE transaction af9ae01-c904-4fb7-a39cc-7a2b4542a796 NOT found in database');
  }

  await client.end();
}

checkForOurTransaction().catch(console.error);
