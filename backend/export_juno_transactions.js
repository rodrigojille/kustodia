const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '140290',
  database: 'kustodia'
});

async function exportJunoTransactions() {
  try {
    await client.connect();
    console.log('Connected to local database');

    const result = await client.query('SELECT * FROM juno_transaction ORDER BY id');
    const transactions = result.rows;

    console.log(`Found ${transactions.length} Juno transactions to migrate`);

    if (transactions.length === 0) {
      console.log('No Juno transactions to migrate');
      return;
    }

    // Generate SQL for truncating and inserting
    let sql = '-- Juno Transactions Migration\n';
    sql += 'TRUNCATE TABLE juno_transaction RESTART IDENTITY CASCADE;\n\n';

    transactions.forEach(transaction => {
      console.log(`\nJuno Transaction ID: ${transaction.id}`);
      console.log(`Type: ${transaction.type}`);
      console.log(`Reference: ${transaction.reference}`);
      console.log(`Amount: ${transaction.amount}`);
      console.log(`Status: ${transaction.status}`);
      console.log(`TX Hash: ${transaction.tx_hash}`);
      console.log(`Created: ${transaction.created_at}`);
      console.log(`Updated: ${transaction.updated_at}`);

      const reference = transaction.reference ? `'${transaction.reference.replace(/'/g, "''")}'` : 'NULL';
      const txHash = transaction.tx_hash ? `'${transaction.tx_hash.replace(/'/g, "''")}'` : 'NULL';
      const createdAt = transaction.created_at ? `'${transaction.created_at.toISOString()}'` : 'NOW()';
      const updatedAt = transaction.updated_at ? `'${transaction.updated_at.toISOString()}'` : 'NOW()';

      sql += `INSERT INTO juno_transaction (id, type, reference, amount, status, tx_hash, created_at, updated_at) VALUES (${transaction.id}, '${transaction.type}', ${reference}, ${transaction.amount}, '${transaction.status}', ${txHash}, ${createdAt}, ${updatedAt});\n`;
    });

    sql += '\n-- Reset sequence\n';
    sql += `SELECT setval('juno_transaction_id_seq', (SELECT MAX(id) FROM juno_transaction));\n\n`;
    sql += '-- Verification\n';
    sql += 'SELECT id, type, reference, amount, status FROM juno_transaction ORDER BY id;\n';

    // Write to file
    require('fs').writeFileSync('migrate_juno_transactions.sql', sql);
    console.log('\n✅ SQL migration file created: migrate_juno_transactions.sql');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

exportJunoTransactions();
