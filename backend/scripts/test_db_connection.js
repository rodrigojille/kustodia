require('dotenv').config();
const { DataSource } = require('typeorm');

async function testConnection() {
  console.log('🔍 Testing Database Connection...');
  
  // Log environment variables (without showing password)
  console.log('Environment variables:');
  console.log(`  POSTGRES_HOST: ${process.env.POSTGRES_HOST}`);
  console.log(`  POSTGRES_PORT: ${process.env.POSTGRES_PORT}`);
  console.log(`  POSTGRES_USER: ${process.env.POSTGRES_USER}`);
  console.log(`  POSTGRES_PASSWORD: ${process.env.POSTGRES_PASSWORD ? '[SET]' : '[NOT SET]'}`);
  console.log(`  POSTGRES_DB: ${process.env.POSTGRES_DB}`);
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '[SET]' : '[NOT SET]'}`);
  
  try {
    // Test with explicit connection parameters
    const testDataSource = new DataSource({
      type: "postgres",
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: String(process.env.POSTGRES_PASSWORD || '140290'), // Ensure it's a string
      database: process.env.POSTGRES_DB || 'kustodia',
      synchronize: false,
      logging: false,
      entities: []
    });
    
    console.log('🔄 Attempting to connect...');
    await testDataSource.initialize();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await testDataSource.query('SELECT COUNT(*) as payment_count FROM payment WHERE status = $1', ['escrowed']);
    console.log(`📊 Found ${result[0].payment_count} escrowed payments`);
    
    // Specifically check for payment 140
    const payment140 = await testDataSource.query('SELECT id, amount, status, description FROM payment WHERE id = $1', [140]);
    if (payment140.length > 0) {
      console.log('🎯 Payment 140 found:');
      console.log(`  ID: ${payment140[0].id}`);
      console.log(`  Amount: ${payment140[0].amount}`);
      console.log(`  Status: ${payment140[0].status}`);
      console.log(`  Description: ${payment140[0].description}`);
    } else {
      console.log('❌ Payment 140 not found');
    }
    
    await testDataSource.destroy();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testConnection().catch(console.error);
