const { Client } = require('pg');

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

    if (escrows.length === 0) {
      console.log('No escrows to migrate');
      return;
    }

    // Generate SQL for truncating and inserting
    let sql = '-- Escrows Migration\n';
    sql += 'TRUNCATE TABLE escrow RESTART IDENTITY CASCADE;\n\n';

    escrows.forEach(escrow => {
      console.log(`\nEscrow ID: ${escrow.id}`);
      console.log(`Payment ID: ${escrow.payment_id}`);
      console.log(`Smart Contract ID: ${escrow.smart_contract_escrow_id}`);
      console.log(`Custody Amount: ${escrow.custody_amount}`);
      console.log(`Release Amount: ${escrow.release_amount}`);
      console.log(`Status: ${escrow.status}`);
      console.log(`Dispute Status: ${escrow.dispute_status}`);

      // Handle nullable fields with proper escaping
      const escapeString = (str) => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';
      const escapeNumber = (num) => num !== null && num !== undefined ? num : 'NULL';
      const escapeTimestamp = (date) => date ? `'${date.toISOString()}'` : 'NULL';
      const escapeJsonb = (obj) => obj ? `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb` : 'NULL';

      sql += `INSERT INTO escrow (
        id, payment_id, smart_contract_escrow_id, blockchain_tx_hash, release_tx_hash,
        custody_percent, custody_amount, release_amount, status, dispute_status,
        dispute_reason, dispute_details, dispute_evidence, dispute_history,
        custody_end, created_at, updated_at
      ) VALUES (
        ${escrow.id},
        ${escrow.payment_id},
        ${escapeString(escrow.smart_contract_escrow_id)},
        ${escapeString(escrow.blockchain_tx_hash)},
        ${escapeString(escrow.release_tx_hash)},
        ${escapeNumber(escrow.custody_percent)},
        ${escapeNumber(escrow.custody_amount)},
        ${escapeNumber(escrow.release_amount)},
        ${escapeString(escrow.status || 'active')},
        ${escapeString(escrow.dispute_status || 'none')},
        ${escapeString(escrow.dispute_reason)},
        ${escapeString(escrow.dispute_details)},
        ${escapeString(escrow.dispute_evidence)},
        ${escapeJsonb(escrow.dispute_history)},
        ${escapeTimestamp(escrow.custody_end)},
        ${escapeTimestamp(escrow.created_at) || 'NOW()'},
        ${escapeTimestamp(escrow.updated_at) || 'NOW()'}
      );\n`;
    });

    sql += '\n-- Reset sequence\n';
    sql += `SELECT setval('escrow_id_seq', (SELECT MAX(id) FROM escrow));\n\n`;
    sql += '-- Verification\n';
    sql += 'SELECT id, payment_id, smart_contract_escrow_id, custody_amount, release_amount, status, dispute_status FROM escrow ORDER BY id;\n';

    // Write to file
    require('fs').writeFileSync('migrate_escrows.sql', sql);
    console.log('\n✅ SQL migration file created: migrate_escrows.sql');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

exportEscrows();
