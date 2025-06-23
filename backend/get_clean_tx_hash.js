require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function getCleanTxHash() {
  await client.connect();
  
  const result = await client.query(`
    SELECT 
      id,
      payment_id,
      blockchain_tx_hash,
      smart_contract_escrow_id,
      LENGTH(blockchain_tx_hash) as hash_length
    FROM escrow 
    WHERE payment_id = 81
  `);
  
  if (result.rows.length > 0) {
    const row = result.rows[0];
    console.log('Raw data:');
    console.log('ID:', row.id);
    console.log('Payment ID:', row.payment_id);
    console.log('Hash length:', row.hash_length);
    console.log('Smart Contract Escrow ID:', row.smart_contract_escrow_id);
    console.log('Raw hash:', JSON.stringify(row.blockchain_tx_hash));
    
    // Try to extract clean hash
    const hash = row.blockchain_tx_hash;
    if (hash && hash.includes('0x')) {
      const cleanHash = hash.match(/0x[a-fA-F0-9]{64}/);
      if (cleanHash) {
        console.log('✅ Clean hash found:', cleanHash[0]);
        return cleanHash[0];
      }
    }
  }
  
  await client.end();
}

getCleanTxHash();
