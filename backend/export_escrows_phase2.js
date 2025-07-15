const { Client } = require('pg');
const fs = require('fs');

const localConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'kustodia',
  password: '140290',
  port: 5432,
};

const client = new Client(localConfig);

async function exportEscrows() {
  try {
    await client.connect();
    console.log('Connected to local database');

    const result = await client.query('SELECT * FROM escrow ORDER BY id');
    const escrows = result.rows;

    console.log(`Found ${escrows.length} escrows to migrate`);

    let sql = `-- Phase 2: Escrow Migration (Non-destructive)\n`;
    sql += `-- Do NOT truncate - just insert escrows that reference existing payments\n\n`;

    // Insert statements
    escrows.forEach((escrow, index) => {
      console.log(`\nEscrow ID: ${escrow.id}`);
      console.log(`Payment ID: ${escrow.payment_id}`);
      console.log(`Smart Contract Escrow ID: ${escrow.smart_contract_escrow_id}`);
      console.log(`Custody Amount: ${escrow.custody_amount}`);
      console.log(`Release Amount: ${escrow.release_amount}`);
      console.log(`Status: ${escrow.status}`);
      console.log(`Dispute Status: ${escrow.dispute_status}`);

      sql += `INSERT INTO escrow (
        id, 
        payment_id, 
        smart_contract_escrow_id, 
        custody_percent,
        custody_amount, 
        release_amount, 
        status, 
        dispute_status, 
        dispute_history, 
        created_at, 
        updated_at
      ) VALUES (
        ${escrow.id},
        ${escrow.payment_id || 'NULL'},
        ${escrow.smart_contract_escrow_id !== null ? `'${escrow.smart_contract_escrow_id.replace(/'/g, "''")}'` : 'NULL'},
        ${escrow.custody_percent !== null ? escrow.custody_percent : '0.00'},
        ${escrow.custody_amount || 0},
        ${escrow.release_amount || 0},
        '${escrow.status}',
        '${escrow.dispute_status}',
        ${escrow.dispute_history ? `'${JSON.stringify(escrow.dispute_history).replace(/'/g, "''")}'::jsonb` : 'NULL'},
        '${escrow.created_at.toISOString()}',
        '${escrow.updated_at.toISOString()}'
      );\n`;
    });

    // Reset sequence
    sql += `\n-- Reset sequence\n`;
    sql += `SELECT setval('escrow_id_seq', (SELECT MAX(id) FROM escrow));\n`;

    // Verification query
    sql += `\n-- Verify migration\n`;
    sql += `SELECT 
      id, 
      payment_id, 
      smart_contract_escrow_id, 
      custody_amount, 
      release_amount, 
      status, 
      dispute_status 
    FROM escrow 
    ORDER BY id 
    LIMIT 5;\n`;

    // Write to file
    fs.writeFileSync('migrate_escrows_phase2.sql', sql);
    console.log('\n✅ Phase 2 SQL migration file created: migrate_escrows_phase2.sql');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

exportEscrows();
