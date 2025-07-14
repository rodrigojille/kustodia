const { DataSource } = require('typeorm');

// Import the existing ormconfig but enable synchronization
const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true, // Enable synchronization to create missing tables
  logging: true,
  entities: [
    "dist/entity/**/*.js"
  ],
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function syncTables() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    
    console.log('✅ Database synchronized! All missing tables should now be created.');
    console.log('🏁 Sync complete. Exiting...');
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during synchronization:', error);
    process.exit(1);
  }
}

syncTables();
