const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kustodia',
  password: '140290',
  port: 5432,
});

async function checkDatabaseSchema() {
  const client = await pool.connect();
  
  try {
    console.log('=== DATABASE SCHEMA CHECK ===');
    
    // List all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('📋 Available tables:');
    tablesResult.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    console.log('');
    
    const tablesToInspect = ['payment', 'escrow', 'user', 'payment_event'];

    for (const tableName of tablesToInspect) {
      console.log('');
      console.log(`📊 Structure of ${tableName}:`);
      
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position;
      `;
      
      const columnsResult = await client.query(columnsQuery);

      if (columnsResult.rows.length > 0) {
        columnsResult.rows.forEach(row => {
          console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
      } else {
        console.log('  - Table not found or has no columns.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

checkDatabaseSchema();
