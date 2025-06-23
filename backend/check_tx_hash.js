require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function checkTxHash() {
  await client.connect();
  
  console.log('=== Searching for blockchain tx hash ===');
  const txHash = '0x0c36c9f6debea8b822d1b38dbf88b9ecc82a417be7c25f59580e22c94980911e';
  
  const result = await client.query('SELECT * FROM juno_transaction WHERE tx_hash = $1', [txHash]);
  console.log('Found', result.rows.length, 'transactions with this tx_hash');
  
  if (result.rows.length === 0) {
    console.log('❌ Blockchain transaction hash NOT found in juno_transaction table');
    console.log('');
    console.log('=== All transactions with tx_hash populated ===');
    const withTxHash = await client.query('SELECT id, type, reference, amount, tx_hash FROM juno_transaction WHERE tx_hash IS NOT NULL');
    console.log('Found', withTxHash.rows.length, 'transactions with tx_hash');
    
    if (withTxHash.rows.length > 0) {
      withTxHash.rows.forEach(row => {
        console.log(`ID: ${row.id}, Type: ${row.type}, TxHash: ${row.tx_hash}`);
      });
    } else {
      console.log('No transactions found with tx_hash populated');
    }
  } else {
    console.log('✅ Found the transaction!');
    console.log(result.rows[0]);
  }
  
  await client.end();
}

checkTxHash().catch(console.error);
