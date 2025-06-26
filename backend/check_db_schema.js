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
    
    // Find payment-related tables
    const paymentTablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%payment%' OR table_name LIKE '%escrow%')
      ORDER BY table_name;
    `;
    
    const paymentTablesResult = await client.query(paymentTablesQuery);
    console.log('💳 Payment-related tables:');
    paymentTablesResult.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    // If we find a payment table, check its structure
    if (paymentTablesResult.rows.length > 0) {
      const tableName = paymentTablesResult.rows[0].table_name;
      console.log('');
      console.log(`📊 Structure of ${tableName}:`);
      
      const columnsQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position;
      `;
      
      const columnsResult = await client.query(columnsQuery);
      columnsResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

checkDatabaseSchema();
