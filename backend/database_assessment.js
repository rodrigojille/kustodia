const { DataSource } = require('typeorm');
const dotenv = require('dotenv');

dotenv.config();

// Local database configuration (synchronize: true)
const localDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false, // Don't auto-sync during assessment
  logging: false,
});

// Production database configuration 
const prodDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function assessDatabaseSchemas() {
  console.log('🔍 KUSTODIA DATABASE SCHEMA ASSESSMENT\n');
  
  try {
    // Connect to local database
    console.log('📊 Connecting to LOCAL database...');
    await localDataSource.initialize();
    
    // Get Payment table structure from local
    console.log('\n🏠 LOCAL DATABASE - Payment Table Structure:');
    const localPaymentColumns = await localDataSource.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'payment' 
      ORDER BY ordinal_position;
    `);
    
    console.table(localPaymentColumns);
    
    // Check for foreign key constraints
    console.log('\n🔗 LOCAL DATABASE - Payment Table Foreign Keys:');
    const localForeignKeys = await localDataSource.query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'payment';
    `);
    
    console.table(localForeignKeys);
    
    await localDataSource.destroy();
    
  } catch (localError) {
    console.error('❌ Error connecting to local database:', localError.message);
  }
  
  try {
    // Connect to production database
    console.log('\n📊 Connecting to PRODUCTION database...');
    await prodDataSource.initialize();
    
    // Get Payment table structure from production
    console.log('\n☁️ PRODUCTION DATABASE - Payment Table Structure:');
    const prodPaymentColumns = await prodDataSource.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'payment' 
      ORDER BY ordinal_position;
    `);
    
    console.table(prodPaymentColumns);
    
    // Check for foreign key constraints
    console.log('\n🔗 PRODUCTION DATABASE - Payment Table Foreign Keys:');
    const prodForeignKeys = await prodDataSource.query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'payment';
    `);
    
    console.table(prodForeignKeys);
    
    // Check migration history
    console.log('\n📋 PRODUCTION DATABASE - Migration History:');
    try {
      const migrations = await prodDataSource.query(`
        SELECT * FROM migrations ORDER BY timestamp DESC;
      `);
      console.table(migrations);
    } catch (migrationError) {
      console.log('⚠️ No migrations table found or accessible');
    }
    
    await prodDataSource.destroy();
    
  } catch (prodError) {
    console.error('❌ Error connecting to production database:', prodError.message);
  }
  
  // Check existing migrations in codebase
  console.log('\n📁 CODEBASE MIGRATIONS ANALYSIS:');
  const fs = require('fs');
  const path = require('path');
  
  const migrationDir = path.join(__dirname, 'src', 'migration');
  
  if (fs.existsSync(migrationDir)) {
    const migrationFiles = fs.readdirSync(migrationDir);
    console.log('Available migration files:');
    migrationFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
  } else {
    console.log('⚠️ Migration directory not found');
  }
  
  console.log('\n🎯 ASSESSMENT COMPLETE');
  console.log('\nRECOMMENDATIONS:');
  console.log('1. Compare column differences between local and production');
  console.log('2. Create missing migrations for any schema differences');
  console.log('3. Consider standardizing both environments to use migrations');
  console.log('4. Ensure all entity relations have corresponding database constraints');
}

assessDatabaseSchemas().catch(console.error);
