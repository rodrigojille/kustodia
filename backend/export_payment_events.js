const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '140290',
  database: 'kustodia'
});

async function exportPaymentEvents() {
  try {
    await client.connect();
    console.log('Connected to local database');

    const result = await client.query('SELECT * FROM payment_event ORDER BY id');
    const events = result.rows;

    console.log(`Found ${events.length} payment events to migrate`);

    if (events.length === 0) {
      console.log('No payment events to migrate');
      return;
    }

    // Generate SQL for truncating and inserting
    let sql = '-- Payment Events Migration\n';
    sql += 'TRUNCATE TABLE payment_event RESTART IDENTITY CASCADE;\n\n';

    events.forEach(event => {
      console.log(`\nPayment Event ID: ${event.id}`);
      console.log(`Payment ID: ${event.paymentId || event.payment_id}`);
      console.log(`Type: ${event.type}`);
      console.log(`Description: ${event.description}`);
      console.log(`Is Automatic: ${event.is_automatic}`);
      console.log(`Created: ${event.created_at}`);

      // Handle different column naming conventions
      const paymentId = event.paymentId || event.payment_id;
      const escapeString = (str) => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';
      const escapeTimestamp = (date) => date ? `'${date.toISOString()}'` : 'NOW()';

      sql += `INSERT INTO payment_event (
        id, type, description, is_automatic, created_at, "paymentId"
      ) VALUES (
        ${event.id},
        ${escapeString(event.type)},
        ${escapeString(event.description)},
        ${event.is_automatic || false},
        ${escapeTimestamp(event.created_at)},
        ${paymentId}
      );\n`;
    });

    sql += '\n-- Reset sequence\n';
    sql += `SELECT setval('payment_event_id_seq', (SELECT MAX(id) FROM payment_event));\n\n`;
    sql += '-- Verification\n';
    sql += 'SELECT id, type, description, is_automatic, "paymentId", created_at FROM payment_event ORDER BY id;\n';

    // Write to file
    require('fs').writeFileSync('migrate_payment_events.sql', sql);
    console.log('\n✅ SQL migration file created: migrate_payment_events.sql');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

exportPaymentEvents();
