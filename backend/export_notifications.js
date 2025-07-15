const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  user: 'postgres',
  password: '140290',
  host: 'localhost',
  database: 'kustodia',
  port: 5432,
});

async function exportNotifications() {
  try {
    await client.connect();
    console.log('🔍 Connected to local database');

    // Get all notifications
    const notificationQuery = `
      SELECT 
        id,
        user_id,
        message,
        link,
        type,
        category,
        read,
        payment_id,
        "createdAt"
      FROM notification 
      ORDER BY id;
    `;

    const result = await client.query(notificationQuery);
    console.log(`📋 Found ${result.rows.length} notifications to export`);

    // Show sample data
    console.log('\n📊 Sample notification data:');
    result.rows.slice(0, 5).forEach(notification => {
      console.log(`ID ${notification.id}: User ${notification.user_id}, Type: ${notification.type}, Category: ${notification.category}`);
      console.log(`   Message: ${notification.message.substring(0, 50)}...`);
      console.log(`   Link: ${notification.link}`);
      console.log(`   Read: ${notification.read}, Payment ID: ${notification.payment_id}`);
      console.log('');
    });

    let sqlContent = `-- Notification Migration SQL
-- Generated on ${new Date().toISOString()}
-- Total notifications: ${result.rows.length}

`;

    // Generate INSERT statements
    for (const notification of result.rows) {
      const escapeString = (str) => {
        if (str === null || str === undefined) return 'NULL';
        return `'${str.toString().replace(/'/g, "''")}'`;
      };

      const formatDate = (date) => {
        if (!date) return 'NULL';
        return `'${date.toISOString()}'`;
      };

      sqlContent += `INSERT INTO notification (
        id, 
        user_id, 
        message, 
        link, 
        type, 
        category, 
        read, 
        payment_id, 
        "createdAt"
      ) VALUES (
        ${notification.id},
        ${notification.user_id},
        ${escapeString(notification.message)},
        ${escapeString(notification.link)},
        ${escapeString(notification.type)},
        ${escapeString(notification.category)},
        ${notification.read},
        ${notification.payment_id || 'NULL'},
        ${formatDate(notification.createdAt)}
      );

`;
    }

    // Update sequence
    const maxId = Math.max(...result.rows.map(n => n.id), 0);
    sqlContent += `
-- Update sequence
SELECT setval('notification_id_seq', ${maxId + 1}, false);

-- Verification query
SELECT 
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN read = true THEN 1 END) as read_notifications,
  COUNT(CASE WHEN read = false THEN 1 END) as unread_notifications,
  COUNT(CASE WHEN payment_id IS NOT NULL THEN 1 END) as payment_related_notifications
FROM notification;

-- Show sample data
SELECT id, user_id, message, type, category, read, payment_id, "createdAt" 
FROM notification 
ORDER BY "createdAt" DESC 
LIMIT 10;
`;

    // Write SQL file
    fs.writeFileSync('migrate_notifications.sql', sqlContent);
    console.log('✅ SQL migration file created: migrate_notifications.sql');
    console.log(`📊 Total notifications to migrate: ${result.rows.length}`);

    // Analyze notification categories
    const categoryCount = {};
    const typeCount = {};
    result.rows.forEach(n => {
      categoryCount[n.category] = (categoryCount[n.category] || 0) + 1;
      typeCount[n.type] = (typeCount[n.type] || 0) + 1;
    });

    console.log('\n📈 Notification Analysis:');
    console.log('Categories:', categoryCount);
    console.log('Types:', typeCount);
    console.log(`Payment-related: ${result.rows.filter(n => n.payment_id).length}`);
    console.log(`Unread: ${result.rows.filter(n => !n.read).length}`);

  } catch (error) {
    console.error('❌ Error exporting notifications:', error);
  } finally {
    await client.end();
  }
}

exportNotifications();
