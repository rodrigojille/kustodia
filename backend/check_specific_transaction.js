require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function checkSpecificTransaction() {
  await client.connect();

  // Check for the specific ISSUANCE transaction ID we saw in Juno dashboard
  console.log('=== Looking for transaction af9ae01-c904-4fb7-a39cc-7a2b4542a796 ===');
  const specific = await client.query('SELECT * FROM juno_transaction WHERE reference = $1', ['af9ae01-c904-4fb7-a39cc-7a2b4542a796']); 
  
  if (specific.rows.length > 0) {
    console.log('✅ FOUND our ISSUANCE transaction!');
    console.log(JSON.stringify(specific.rows[0], null, 2));        
  } else {
    console.log('❌ Our ISSUANCE transaction af9ae01-c904-4fb7-a39cc-7a2b4542a796 NOT found in database');
    
    // Let's check for any deposit transactions with amount 1000
    console.log('\n=== Looking for deposit transactions with amount 1000 ===');
    const deposits = await client.query('SELECT * FROM juno_transaction WHERE type = $1 AND amount = $2 ORDER BY created_at DESC LIMIT 10', ['deposit', 1000]);
    
    if (deposits.rows.length > 0) {
      console.log(`Found ${deposits.rows.length} deposit transactions with amount 1000:`);
      deposits.rows.forEach((tx, index) => {
        console.log(`\n--- Deposit ${index + 1} ---`);
        console.log('ID:', tx.id);
        console.log('Reference:', tx.reference);
        console.log('Amount:', tx.amount);
        console.log('Status:', tx.status);
        console.log('Created:', tx.created_at);
      });
    } else {
      console.log('No deposit transactions found with amount 1000');
    }
  }

  await client.end();
}

checkSpecificTransaction().catch(console.error);
