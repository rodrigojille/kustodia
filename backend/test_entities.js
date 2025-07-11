require('dotenv').config();
const { AppDataSource } = require('./src/ormconfig');

async function testEntities() {
  try {
    console.log('🔄 Initializing DataSource...');
    await AppDataSource.initialize();
    console.log('✅ DataSource initialized successfully');
    
    console.log('🔍 Checking entity metadata...');
    const entities = AppDataSource.entityMetadatas;
    
    console.log(`Found ${entities.length} entities:`);
    entities.forEach(entity => {
      console.log(`  - ${entity.name} (${entity.tableName})`);
    });
    
    console.log('✅ All entities loaded successfully');
    
    // Test specific entities that were failing
    const paymentRepo = AppDataSource.getRepository('Payment');
    const notificationRepo = AppDataSource.getRepository('Notification');
    const escrowRepo = AppDataSource.getRepository('Escrow');
    
    console.log('✅ All repositories created successfully');
    
    await AppDataSource.destroy();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testEntities();
