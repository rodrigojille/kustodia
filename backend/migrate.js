// Simple migration script for Heroku
const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to production database');

    // Check current status
    console.log('\n📋 Current status:');
    const current = await client.query(`
      SELECT p.id, p.status, p.payer_approval, p.payee_approval, 
             e.status as escrow_status, e.release_tx_hash 
      FROM payment p LEFT JOIN escrow e ON p.id = e.payment_id 
      WHERE p.id IN (112, 113)
    `);
    console.table(current.rows);

    // Migrate Payment 112
    console.log('\n🚀 Migrating Payment 112...');
    await client.query('BEGIN');
    await client.query(`UPDATE payment SET status = 'completed', payer_approval = true, payee_approval = true, updated_at = NOW() WHERE id = 112`);
    await client.query(`UPDATE escrow SET status = 'completed', release_tx_hash = '0x1917e76262e46cd27aa80cf702e1ae204f0c37936ce9c45e115298ac4e1cd35d', smart_contract_escrow_id = '9', updated_at = NOW() WHERE payment_id = 112`);
    await client.query(`INSERT INTO payment_event (payment_id, type, description, is_automatic, created_at) VALUES (112, 'production_migration', 'Estado migrado desde desarrollo', true, NOW())`);
    await client.query('COMMIT');
    console.log('✅ Payment 112 migrated');

    // Migrate Payment 113
    console.log('\n🚀 Migrating Payment 113...');
    await client.query('BEGIN');
    await client.query(`UPDATE payment SET status = 'completed', payer_approval = true, payee_approval = true, updated_at = NOW() WHERE id = 113`);
    await client.query(`UPDATE escrow SET status = 'completed', release_tx_hash = '0x41da5b7d6b5f08596c04c798409723e20361acd25430b0f058b7e6970fa38531', smart_contract_escrow_id = '10', updated_at = NOW() WHERE payment_id = 113`);
    await client.query(`INSERT INTO payment_event (payment_id, type, description, is_automatic, created_at) VALUES (113, 'production_migration', 'Estado migrado desde desarrollo', true, NOW())`);
    await client.query('COMMIT');
    console.log('✅ Payment 113 migrated');

    // Verify
    console.log('\n✅ Final status:');
    const final = await client.query(`
      SELECT p.id, p.status, p.payer_approval, p.payee_approval, 
             e.status as escrow_status, e.release_tx_hash 
      FROM payment p LEFT JOIN escrow e ON p.id = e.payment_id 
      WHERE p.id IN (112, 113)
    `);
    console.table(final.rows);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    await client.query('ROLLBACK');
  } finally {
    await client.end();
  }
}

migrate();
