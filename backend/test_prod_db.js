const { DataSource } = require('typeorm');
const dotenv = require('dotenv');

dotenv.config();

// Production database configuration
const prodDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL_PRODUCTION,
  ssl: {
    rejectUnauthorized: false // For cloud databases
  },
  synchronize: false,
  logging: true,
});

async function testProductionDB() {
  console.log('🔍 TESTING PRODUCTION DATABASE CONNECTION\n');
  
  try {
    console.log('Connecting to production database...');
    await prodDataSource.initialize();
    console.log('✅ Successfully connected to production database!');
    
    // Test query
    const result = await prodDataSource.query('SELECT version();');
    console.log('📊 Database version:', result[0].version);
    
    // Check if users table exists
    const tables = await prodDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Available tables:');
    tables.forEach(table => console.log(`  - ${table.table_name}`));
    
    // Check user count
    const userCount = await prodDataSource.query('SELECT COUNT(*) as count FROM users;');
    console.log(`\n👥 Total users: ${userCount[0].count}`);
    
    await prodDataSource.destroy();
    console.log('\n✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testProductionDB();
