import "reflect-metadata";
import AppDataSource from "../src/ormconfig";

async function setupProductionDatabase() {
  try {
    console.log("🚀 Starting production database setup...");
    
    // Initialize the data source
    await AppDataSource.initialize();
    console.log("✅ Database connection established");

    // Run synchronization to create all tables (but don't drop existing data)
    console.log("📊 Creating/updating database schema...");
    // Use synchronize: false in production, rely on migrations instead
    // await AppDataSource.synchronize();
    console.log("✅ Using migrations instead of synchronize for production safety");

    // Run pending migrations
    console.log("🔄 Running pending migrations...");
    const migrations = await AppDataSource.runMigrations();
    
    if (migrations.length > 0) {
      console.log(`✅ Applied ${migrations.length} migrations:`);
      migrations.forEach(migration => {
        console.log(`  - ${migration.name}`);
      });
    } else {
      console.log("✅ No pending migrations");
    }

    // Verify all entities are properly created
    console.log("🔍 Verifying database tables...");
    const queryRunner = AppDataSource.createQueryRunner();
    
    const tables = await queryRunner.getTables();
    const expectedTables = [
      'user',
      'payment', 
      'payment_event',
      'escrow',
      'dispute',
      'dispute_message',
      'notification',
      'early_access_counter',
      'juno_transaction',
      'lead',
      'ticket',
      'ticket_reply',
      'token',
      'wallet_transaction'
    ];

    console.log("📋 Found tables:");
    tables.forEach(table => {
      console.log(`  ✅ ${table.name}`);
    });

    const missingTables = expectedTables.filter(
      expectedTable => !tables.some(table => table.name === expectedTable)
    );

    if (missingTables.length > 0) {
      console.log("❌ Missing tables:");
      missingTables.forEach(table => {
        console.log(`  - ${table}`);
      });
    } else {
      console.log("✅ All expected tables are present");
    }

    await queryRunner.release();
    await AppDataSource.destroy();
    
    console.log("🎉 Production database setup completed successfully!");
    
  } catch (error) {
    console.error("❌ Error setting up production database:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupProductionDatabase();
}

export default setupProductionDatabase;
