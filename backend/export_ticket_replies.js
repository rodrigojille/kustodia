const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  user: 'postgres',
  password: '140290',
  host: 'localhost',
  database: 'kustodia',
  port: 5432,
});

async function exportTicketReplies() {
  try {
    await client.connect();
    console.log('🔍 Connected to local database');

    // Get all ticket replies
    const replyQuery = `
      SELECT 
        id,
        message,
        "createdAt",
        "ticketId",
        "userId"
      FROM ticket_replies 
      ORDER BY "createdAt";
    `;

    const result = await client.query(replyQuery);
    console.log(`📋 Found ${result.rows.length} ticket replies to export`);

    // Show sample data
    console.log('\n📊 Ticket reply data:');
    result.rows.forEach(reply => {
      console.log(`ID ${reply.id}: User ${reply.userId}, Ticket ${reply.ticketId}`);
      console.log(`   Message: ${reply.message.substring(0, 80)}...`);
      console.log(`   Created: ${reply.createdAt}`);
      console.log('');
    });

    let sqlContent = `-- Ticket Replies Migration SQL
-- Generated on ${new Date().toISOString()}
-- Total ticket replies: ${result.rows.length}

`;

    // Generate INSERT statements
    for (const reply of result.rows) {
      const escapeString = (str) => {
        if (str === null || str === undefined) return 'NULL';
        return `'${str.toString().replace(/'/g, "''")}'`;
      };

      const formatDate = (date) => {
        if (!date) return 'NULL';
        return `'${date.toISOString()}'`;
      };

      sqlContent += `INSERT INTO ticket_replies (
        id, 
        message, 
        "createdAt", 
        "ticketId", 
        "userId"
      ) VALUES (
        ${escapeString(reply.id)},
        ${escapeString(reply.message)},
        ${formatDate(reply.createdAt)},
        ${escapeString(reply.ticketId)},
        ${reply.userId}
      );

`;
    }

    // Add verification queries
    sqlContent += `
-- Verification queries
SELECT 
  COUNT(*) as total_replies,
  COUNT(DISTINCT "ticketId") as tickets_with_replies,
  COUNT(DISTINCT "userId") as users_with_replies
FROM ticket_replies;

-- Show all replies with ticket and user info
SELECT 
  tr.id, 
  tr.message, 
  tr."createdAt", 
  tr."ticketId", 
  tr."userId"
FROM ticket_replies tr
ORDER BY tr."createdAt" DESC;

-- Check foreign key relationships exist
SELECT 
  tr.id as reply_id,
  t.id as ticket_exists,
  u.id as user_exists
FROM ticket_replies tr
LEFT JOIN tickets t ON t.id = tr."ticketId"
LEFT JOIN "user" u ON u.id = tr."userId"
ORDER BY tr."createdAt";
`;

    // Write SQL file
    fs.writeFileSync('migrate_ticket_replies.sql', sqlContent);
    console.log('✅ SQL migration file created: migrate_ticket_replies.sql');
    console.log(`📊 Total ticket replies to migrate: ${result.rows.length}`);

    // Analyze the data
    console.log('\n📈 Ticket Reply Analysis:');
    const ticketIds = [...new Set(result.rows.map(r => r.ticketId))];
    const userIds = [...new Set(result.rows.map(r => r.userId))];
    console.log(`Tickets with replies: ${ticketIds.length}`);
    console.log(`Users who replied: ${userIds.length}`);
    console.log(`Ticket IDs: ${ticketIds.join(', ')}`);
    console.log(`User IDs: ${userIds.join(', ')}`);

  } catch (error) {
    console.error('❌ Error exporting ticket replies:', error);
  } finally {
    await client.end();
  }
}

exportTicketReplies();
