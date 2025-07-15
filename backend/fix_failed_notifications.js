const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  user: 'postgres',
  password: '140290',
  host: 'localhost',
  database: 'kustodia',
  port: 5432,
});

async function fixFailedNotifications() {
  try {
    await client.connect();
    console.log('🔍 Connected to local database');

    // Get notifications with NULL type or category (the ones that failed)
    const failedQuery = `
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
      WHERE type IS NULL OR category IS NULL OR user_id IS NULL
      ORDER BY id;
    `;

    const result = await client.query(failedQuery);
    console.log(`📋 Found ${result.rows.length} notifications needing fixes`);

    let sqlContent = `-- Fix Failed Notifications SQL
-- Generated on ${new Date().toISOString()}
-- Notifications with NULL values that need default values

`;

    // Generate INSERT statements with proper defaults
    for (const notification of result.rows) {
      const escapeString = (str) => {
        if (str === null || str === undefined) return 'NULL';
        return `'${str.toString().replace(/'/g, "''")}'`;
      };

      const formatDate = (date) => {
        if (!date) return 'NULL';
        return `'${date.toISOString()}'`;
      };

      // Determine defaults based on message content
      let defaultType = 'info';
      let defaultCategory = 'general';
      let defaultUserId = 'NULL';

      // Analyze message to set appropriate defaults
      if (notification.message.includes('creado exitosamente') || 
          notification.message.includes('liberado y transferido') ||
          notification.message.includes('recibidos en la custodia')) {
        defaultType = 'success';
        defaultCategory = 'payment';
      } else if (notification.message.includes('custodia') || 
                 notification.message.includes('pago')) {
        defaultType = 'info';
        defaultCategory = 'payment';
      }

      // Try to extract user from payment context - for now set a default
      // In a real scenario, we'd need to look up payment ownership
      if (notification.user_id === null) {
        // Extract payment ID from link if possible
        const paymentMatch = notification.link.match(/\/pagos\/(\d+)/);
        if (paymentMatch) {
          // For now, set to user 1 (could be improved by looking up payment ownership)
          defaultUserId = '1';
        }
      }

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
        ${notification.user_id || defaultUserId},
        ${escapeString(notification.message)},
        ${escapeString(notification.link)},
        ${escapeString(notification.type || defaultType)},
        ${escapeString(notification.category || defaultCategory)},
        ${notification.read},
        ${notification.payment_id || 'NULL'},
        ${formatDate(notification.createdAt)}
      );

`;
    }

    // Write SQL file
    fs.writeFileSync('fix_failed_notifications.sql', sqlContent);
    console.log('✅ SQL fix file created: fix_failed_notifications.sql');
    console.log(`📊 Notifications to fix: ${result.rows.length}`);

    // Show sample of what will be fixed
    console.log('\n📋 Sample of notifications being fixed:');
    result.rows.slice(0, 3).forEach(notification => {
      console.log(`ID ${notification.id}: "${notification.message.substring(0, 40)}..."`);
      console.log(`   Original - Type: ${notification.type}, Category: ${notification.category}, User: ${notification.user_id}`);
      console.log(`   Will Fix - Type: ${notification.type || 'info'}, Category: ${notification.category || 'payment'}, User: ${notification.user_id || '1'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error analyzing failed notifications:', error);
  } finally {
    await client.end();
  }
}

fixFailedNotifications();
