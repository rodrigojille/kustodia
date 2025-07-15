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

async function exportPaymentEvents() {
  const client = new Client(localConfig);
  
  try {
    await client.connect();
    console.log('Connected to local PostgreSQL database');

    // Get all payment events
    const result = await client.query(`
      SELECT 
        id, type, description, is_automatic, created_at, "paymentId"
      FROM payment_event 
      ORDER BY id
    `);

    console.log(`Found ${result.rows.length} payment events to export`);
    
    let sqlContent = `-- Payment Events Migration\n`;
    sqlContent += `-- Generated on ${new Date().toISOString()}\n`;
    sqlContent += `-- Total records: ${result.rows.length}\n\n`;

    result.rows.forEach((event) => {
      console.log(`Processing payment event ID: ${event.id}, Type: ${event.type}, Payment ID: ${event.paymentId}`);
      
      const typeValue = event.type ? `'${event.type.replace(/'/g, "''")}'` : 'NULL';
      const descriptionValue = event.description ? `'${event.description.replace(/'/g, "''")}'` : 'NULL';
      const isAutomaticValue = event.is_automatic ? 'true' : 'false';
      const createdAtValue = event.created_at ? `'${event.created_at.toISOString()}'` : 'NULL';
      const paymentIdValue = event.paymentId ? event.paymentId : 'NULL';

      sqlContent += `INSERT INTO payment_event (id, type, description, is_automatic, created_at, "paymentId") 
VALUES (${event.id}, ${typeValue}, ${descriptionValue}, ${isAutomaticValue}, ${createdAtValue}, ${paymentIdValue});
`;
    });

    // Reset sequence
    sqlContent += `\n-- Reset payment_event sequence\n`;
    sqlContent += `SELECT setval('payment_event_id_seq', (SELECT MAX(id) FROM payment_event));\n\n`;

    // Verification query
    sqlContent += `-- Verification: Check migrated payment events\n`;
    sqlContent += `SELECT id, type, description, is_automatic, "paymentId" FROM payment_event ORDER BY id LIMIT 20;\n\n`;
    
    sqlContent += `-- Count verification\n`;
    sqlContent += `SELECT COUNT(*) as total_payment_events FROM payment_event;\n`;

    // Write to file
    fs.writeFileSync('migrate_payment_events.sql', sqlContent);
    console.log('✅ Payment events migration SQL file created: migrate_payment_events.sql');

  } catch (err) {
    console.error('❌ Error exporting payment events:', err);
  } finally {
    await client.end();
  }
}

exportPaymentEvents();
