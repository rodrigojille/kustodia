require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function insertIssuanceTransaction() {
  await client.connect();
  
  console.log('=== Inserting ISSUANCE transaction manually ===');
  
  // The ISSUANCE transaction details from Juno dashboard
  const issuanceData = {
    type: 'issuance',
    reference: 'af9ae01-c904-4fb7-a39cc-7a2b4542a796',
    amount: 1000.00,
    status: 'complete',
    tx_hash: '0x0c36c9f6debea8b822d1b38dbf88b9ecc82a417be7c25f59580e22c94980911e'
  };
  
  try {
    // Check if it already exists
    const existing = await client.query('SELECT * FROM juno_transaction WHERE reference = $1', [issuanceData.reference]);
    
    if (existing.rows.length > 0) {
      console.log('✅ ISSUANCE transaction already exists with ID:', existing.rows[0].id);
      console.log('Current tx_hash:', existing.rows[0].tx_hash);
      
      if (!existing.rows[0].tx_hash || existing.rows[0].tx_hash === 'MOCK-TX-HASH') {
        console.log('🔄 Updating tx_hash...');
        await client.query('UPDATE juno_transaction SET tx_hash = $1 WHERE reference = $2', 
          [issuanceData.tx_hash, issuanceData.reference]);
        console.log('✅ tx_hash updated successfully');
      }
    } else {
      console.log('➕ Creating new ISSUANCE transaction...');
      const result = await client.query(`
        INSERT INTO juno_transaction (type, reference, amount, status, tx_hash, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `, [issuanceData.type, issuanceData.reference, issuanceData.amount, issuanceData.status, issuanceData.tx_hash]);
      
      console.log('✅ ISSUANCE transaction created with ID:', result.rows[0].id);
    }
    
    // Verify the tx_hash is now in the database
    console.log('\n=== Verification ===');
    const verification = await client.query('SELECT * FROM juno_transaction WHERE tx_hash = $1', [issuanceData.tx_hash]);
    
    if (verification.rows.length > 0) {
      console.log('✅ SUCCESS! Blockchain tx hash is now in database:');
      const tx = verification.rows[0];
      console.log(`ID: ${tx.id}, Type: ${tx.type}, Reference: ${tx.reference}, Amount: ${tx.amount}, TxHash: ${tx.tx_hash}`);
    } else {
      console.log('❌ ERROR: tx_hash still not found in database');
    }
    
  } catch (error) {
    console.error('❌ Error inserting ISSUANCE transaction:', error.message);
  }
  
  await client.end();
}

insertIssuanceTransaction().catch(console.error);
