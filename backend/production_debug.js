const { DataSource } = require('typeorm');
const dotenv = require('dotenv');

dotenv.config();

// Use the same configuration as production
const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true, // Enable logging to see actual queries
  entities: [
    "dist/entity/**/*.js" // Use compiled JS files like production
  ],
  migrations: ["dist/migration/**/*.js"],
  subscribers: ["dist/subscriber/**/*.js"],
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function debugProductionIssue() {
  console.log('🔍 PRODUCTION ISSUE DEBUG\n');
  
  try {
    console.log('📊 Connecting to database with production config...');
    await AppDataSource.initialize();
    
    console.log('✅ Database connection successful');
    
    // Check if Payment entity is loaded
    console.log('\n📋 Checking loaded entities...');
    const entityMetadatas = AppDataSource.entityMetadatas;
    const paymentEntity = entityMetadatas.find(meta => meta.name === 'Payment');
    
    if (paymentEntity) {
      console.log('✅ Payment entity loaded successfully');
      console.log('📊 Payment entity relations:');
      paymentEntity.relations.forEach(relation => {
        console.log(`  - ${relation.propertyName} (${relation.type}) -> ${relation.inverseEntityMetadata?.name || 'Unknown'}`);
      });
      
      console.log('\n📊 Payment entity columns:');
      paymentEntity.columns.forEach(column => {
        console.log(`  - ${column.propertyName} (${column.databaseName}) - Type: ${column.type}`);
      });
    } else {
      console.log('❌ Payment entity NOT FOUND in loaded entities');
      console.log('Available entities:');
      entityMetadatas.forEach(meta => {
        console.log(`  - ${meta.name}`);
      });
    }
    
    // Try the exact query that's failing
    console.log('\n🧪 Testing the problematic query...');
    try {
      const paymentRepository = AppDataSource.getRepository('Payment');
      
      // Test basic query without relations first
      console.log('Testing basic query...');
      const basicPayments = await paymentRepository.find({
        take: 1
      });
      console.log(`✅ Basic query successful - Found ${basicPayments.length} payments`);
      
      // Test query with user relation (this works)
      console.log('Testing query with user relation...');
      const userPayments = await paymentRepository.find({
        relations: ['user'],
        take: 1
      });
      console.log(`✅ User relation query successful - Found ${userPayments.length} payments`);
      
      // Test query with seller relation (this might fail)
      console.log('Testing query with seller relation...');
      const sellerPayments = await paymentRepository.find({
        relations: ['seller'],
        take: 1
      });
      console.log(`✅ Seller relation query successful - Found ${sellerPayments.length} payments`);
      
    } catch (queryError) {
      console.error('❌ Query failed:', queryError.message);
      console.error('Full error:', queryError);
    }
    
    await AppDataSource.destroy();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  }
}

debugProductionIssue().catch(console.error);
