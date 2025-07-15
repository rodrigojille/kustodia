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

async function generateEscrowColumnFixes() {
  const client = new Client(localConfig);
  
  try {
    await client.connect();
    console.log('Connected to local PostgreSQL database');

    // Get all escrows with all columns
    const result = await client.query(`
      SELECT 
        id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_end, dispute_reason, dispute_details, dispute_evidence, dispute_history
      FROM escrow 
      ORDER BY id
    `);

    console.log(`Found ${result.rows.length} escrows to update missing columns`);
    
    let sql = `-- Fix Missing Escrow Columns\n`;
    sql += `-- Generated on ${new Date().toISOString()}\n\n`;

    result.rows.forEach((escrow) => {
      console.log(`Processing escrow ID: ${escrow.id}`);
      
      sql += `-- Update escrow ${escrow.id} with missing columns\n`;
      sql += `UPDATE escrow SET\n`;
      
      const updates = [];
      
      // Add all potentially missing columns
      if (escrow.smart_contract_escrow_id) updates.push(`  smart_contract_escrow_id = '${escrow.smart_contract_escrow_id}'`);
      if (escrow.blockchain_tx_hash) updates.push(`  blockchain_tx_hash = '${escrow.blockchain_tx_hash}'`);
      if (escrow.release_tx_hash) updates.push(`  release_tx_hash = '${escrow.release_tx_hash}'`);
      if (escrow.custody_end) updates.push(`  custody_end = '${escrow.custody_end.toISOString()}'`);
      if (escrow.dispute_reason) updates.push(`  dispute_reason = '${escrow.dispute_reason.replace(/'/g, "''")}'`);
      if (escrow.dispute_details) updates.push(`  dispute_details = '${escrow.dispute_details.replace(/'/g, "''")}'`);
      if (escrow.dispute_evidence) updates.push(`  dispute_evidence = '${escrow.dispute_evidence.replace(/'/g, "''")}'`);
      if (escrow.dispute_history) updates.push(`  dispute_history = '${JSON.stringify(escrow.dispute_history).replace(/'/g, "''")}'::jsonb`);
      
      if (updates.length > 0) {
        sql += updates.join(',\n') + '\n';
        sql += `WHERE id = ${escrow.id};\n\n`;
      } else {
        sql += `-- No updates needed for escrow ${escrow.id}\n\n`;
      }
    });

    // Add verification query
    sql += `-- Verification: Check updated columns\n`;
    sql += `SELECT id, smart_contract_escrow_id, custody_end, dispute_status, payment_id\n`;
    sql += `FROM escrow WHERE id <= 10 ORDER BY id;\n`;

    // Write to file
    fs.writeFileSync('fix_escrow_missing_columns.sql', sql);
    console.log('✅ Escrow column fix SQL file created: fix_escrow_missing_columns.sql');

  } catch (err) {
    console.error('❌ Error generating escrow column fixes:', err);
  } finally {
    await client.end();
  }
}

generateEscrowColumnFixes();
