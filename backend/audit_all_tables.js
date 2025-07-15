const { Client } = require('pg');

const localClient = new Client({
  user: 'postgres',
  password: '140290',
  host: 'localhost',
  database: 'kustodia',
  port: 5432,
});

async function auditAllTables() {
  try {
    await localClient.connect();
    console.log('🔍 Connected to local database');

    // Get all table counts from local database
    const localCountsQuery = `
      SELECT 
        'dispute' as table_name, COUNT(*) as count FROM dispute UNION ALL
        SELECT 'dispute_message', COUNT(*) FROM dispute_message UNION ALL
        SELECT 'dispute_messages', COUNT(*) FROM dispute_messages UNION ALL
        SELECT 'early_access_counter', COUNT(*) FROM early_access_counter UNION ALL
        SELECT 'escrow', COUNT(*) FROM escrow UNION ALL
        SELECT 'etherfuse_customers', COUNT(*) FROM etherfuse_customers UNION ALL
        SELECT 'juno_transaction', COUNT(*) FROM juno_transaction UNION ALL
        SELECT 'lead', COUNT(*) FROM lead UNION ALL
        SELECT 'notification', COUNT(*) FROM notification UNION ALL
        SELECT 'payment', COUNT(*) FROM payment UNION ALL
        SELECT 'payment_event', COUNT(*) FROM payment_event UNION ALL
        SELECT 'ticket_replies', COUNT(*) FROM ticket_replies UNION ALL
        SELECT 'tickets', COUNT(*) FROM tickets UNION ALL
        SELECT 'token', COUNT(*) FROM token UNION ALL
        SELECT 'user', COUNT(*) FROM "user" UNION ALL
        SELECT 'wallet_transaction', COUNT(*) FROM wallet_transaction UNION ALL
        SELECT 'yield_activations', COUNT(*) FROM yield_activations UNION ALL
        SELECT 'yield_earnings', COUNT(*) FROM yield_earnings UNION ALL
        SELECT 'yield_payouts', COUNT(*) FROM yield_payouts
      ORDER BY table_name;
    `;

    const localResult = await localClient.query(localCountsQuery);
    
    console.log('\n📊 LOCAL DATABASE TABLE COUNTS:');
    console.log('=====================================');
    let totalLocalRecords = 0;
    const localCounts = {};
    
    localResult.rows.forEach(row => {
      console.log(`${row.table_name.padEnd(20)} : ${row.count}`);
      localCounts[row.table_name] = parseInt(row.count);
      totalLocalRecords += parseInt(row.count);
    });
    
    console.log('=====================================');
    console.log(`TOTAL LOCAL RECORDS: ${totalLocalRecords}`);

    // Now let's identify tables with data
    console.log('\n🔥 TABLES WITH DATA IN LOCAL:');
    console.log('=====================================');
    const tablesWithData = localResult.rows.filter(row => parseInt(row.count) > 0);
    tablesWithData.forEach(row => {
      console.log(`✅ ${row.table_name}: ${row.count} records`);
    });

    // Tables that exist only in local (missing from production)
    const localTables = localResult.rows.map(r => r.table_name);
    const productionTables = [
      'dispute', 'dispute_messages', 'early_access_counter', 'escrow', 
      'juno_transaction', 'lead', 'migrations', 'notification', 'payment', 
      'payment_event', 'ticket_replies', 'tickets', 'token', 'user', 'wallet_transaction'
    ];

    const missingFromProduction = localTables.filter(table => !productionTables.includes(table));
    
    console.log('\n⚠️  TABLES MISSING FROM PRODUCTION:');
    console.log('=====================================');
    missingFromProduction.forEach(table => {
      const count = localCounts[table];
      if (count > 0) {
        console.log(`❌ ${table}: ${count} records need migration`);
      } else {
        console.log(`⭕ ${table}: 0 records (no migration needed)`);
      }
    });

    console.log('\n🎯 MIGRATION PRIORITY ANALYSIS:');
    console.log('=====================================');
    console.log('✅ COMPLETED: payment, escrow, payment_event, dispute');
    
    const needMigration = tablesWithData.filter(row => 
      !['payment', 'escrow', 'payment_event', 'dispute'].includes(row.table_name) &&
      parseInt(row.count) > 0
    );

    if (needMigration.length > 0) {
      console.log('\n🚨 TABLES STILL NEEDING MIGRATION:');
      needMigration.forEach(row => {
        console.log(`📋 ${row.table_name}: ${row.count} records`);
      });
    } else {
      console.log('\n🎉 ALL TABLES WITH DATA HAVE BEEN MIGRATED!');
    }

  } catch (error) {
    console.error('❌ Error during audit:', error);
  } finally {
    await localClient.end();
  }
}

auditAllTables();
