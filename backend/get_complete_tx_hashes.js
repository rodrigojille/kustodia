// Get Complete Transaction Hashes for Payments 112 & 113
const { Client } = require('pg');
require('dotenv').config();

async function getCompleteTxHashes() {
  console.log('🔍 GETTING COMPLETE TRANSACTION HASHES');
  console.log('=' .repeat(50));
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    await client.connect();
    console.log('✅ Local database connected');

    const query = `
      SELECT 
        p.id,
        p.status,
        p.payer_approval,
        p.payee_approval,
        e.status as escrow_status,
        e.release_tx_hash,
        e.smart_contract_escrow_id
      FROM payment p
      LEFT JOIN escrow e ON p.id = e.payment_id
      WHERE p.id IN (112, 113)
      ORDER BY p.id;
    `;
    
    const result = await client.query(query);
    
    console.log('\n📋 COMPLETE LOCAL DATA:');
    
    result.rows.forEach(payment => {
      console.log(`\nPayment ${payment.id}:`);
      console.log(`  status: '${payment.status}',`);
      console.log(`  payer_approval: ${payment.payer_approval},`);
      console.log(`  payee_approval: ${payment.payee_approval},`);
      console.log(`  escrow_status: '${payment.escrow_status}',`);
      console.log(`  release_tx_hash: '${payment.release_tx_hash}',`);
      console.log(`  smart_contract_escrow_id: '${payment.smart_contract_escrow_id}'`);
    });

    // Generate the migration script data
    console.log('\n📝 COPY THIS DATA TO MIGRATION SCRIPT:');
    console.log('const PAYMENT_DATA = {');
    
    result.rows.forEach((payment, index) => {
      console.log(`  ${payment.id}: {`);
      console.log(`    status: '${payment.status}',`);
      console.log(`    payer_approval: ${payment.payer_approval},`);
      console.log(`    payee_approval: ${payment.payee_approval},`);
      console.log(`    escrow_status: '${payment.escrow_status}',`);
      console.log(`    release_tx_hash: '${payment.release_tx_hash}',`);
      console.log(`    smart_contract_escrow_id: '${payment.smart_contract_escrow_id}'`);
      console.log(`  }${index < result.rows.length - 1 ? ',' : ''}`);
    });
    
    console.log('};');

  } catch (error) {
    console.error('❌ Failed:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

getCompleteTxHashes().catch(console.error);
