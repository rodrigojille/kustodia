const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  user: 'postgres',
  password: '140290',
  host: 'localhost',
  database: 'kustodia',
  port: 5432,
});

async function exportDisputes() {
  try {
    await client.connect();
    console.log('Connected to local database');

    // Get all disputes
    const disputeQuery = `
      SELECT 
        id,
        escrow_id,
        raised_by,
        reason,
        details,
        evidence_url,
        status,
        admin_notes,
        contract_dispute_raised_tx,
        contract_dispute_resolved_tx,
        created_at,
        updated_at
      FROM dispute 
      ORDER BY id;
    `;

    const result = await client.query(disputeQuery);
    console.log(`Found ${result.rows.length} disputes to export`);

    let sqlContent = `-- Dispute Migration SQL
-- Generated on ${new Date().toISOString()}
-- Total disputes: ${result.rows.length}

`;

    // Generate INSERT statements
    for (const dispute of result.rows) {
      const escapeString = (str) => {
        if (str === null || str === undefined) return 'NULL';
        return `'${str.toString().replace(/'/g, "''")}'`;
      };

      const formatDate = (date) => {
        if (!date) return 'NULL';
        return `'${date.toISOString()}'`;
      };

      sqlContent += `INSERT INTO dispute (
        id, 
        escrow_id, 
        raised_by, 
        reason, 
        details, 
        evidence_url, 
        status, 
        admin_notes, 
        contract_dispute_raised_tx, 
        contract_dispute_resolved_tx, 
        created_at, 
        updated_at
      ) VALUES (
        ${dispute.id},
        ${dispute.escrow_id},
        ${dispute.raised_by},
        ${escapeString(dispute.reason)},
        ${escapeString(dispute.details)},
        ${dispute.evidence_url ? escapeString(dispute.evidence_url) : 'NULL'},
        ${escapeString(dispute.status)},
        ${dispute.admin_notes ? escapeString(dispute.admin_notes) : 'NULL'},
        ${dispute.contract_dispute_raised_tx ? escapeString(dispute.contract_dispute_raised_tx) : 'NULL'},
        ${dispute.contract_dispute_resolved_tx ? escapeString(dispute.contract_dispute_resolved_tx) : 'NULL'},
        ${formatDate(dispute.created_at)},
        ${formatDate(dispute.updated_at)}
      );

`;
    }

    // Update sequence
    const maxId = Math.max(...result.rows.map(d => d.id), 0);
    sqlContent += `
-- Update sequence
SELECT setval('dispute_id_seq', ${maxId + 1}, false);

-- Verification query
SELECT 
  COUNT(*) as total_disputes,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_disputes,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_disputes
FROM dispute;

-- Show sample data
SELECT id, escrow_id, raised_by, reason, status, created_at 
FROM dispute 
ORDER BY id 
LIMIT 10;
`;

    // Write SQL file
    fs.writeFileSync('migrate_disputes.sql', sqlContent);
    console.log('✅ SQL migration file created: migrate_disputes.sql');
    console.log(`📊 Total disputes to migrate: ${result.rows.length}`);

    // Show sample data
    console.log('\n📋 Sample dispute data:');
    result.rows.forEach(dispute => {
      console.log(`ID ${dispute.id}: Escrow ${dispute.escrow_id}, User ${dispute.raised_by}, Status: ${dispute.status}`);
    });

  } catch (error) {
    console.error('❌ Error exporting disputes:', error);
  } finally {
    await client.end();
  }
}

exportDisputes();
