import "reflect-metadata";
import AppDataSource from "../src/ormconfig";

async function fixProductionDatabase() {
  try {
    console.log("🔧 Fixing production database issues...");
    
    // Initialize the data source
    await AppDataSource.initialize();
    console.log("✅ Database connection established");

    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      // Check if seller_id column exists in payment table
      console.log("🔍 Checking payment table structure...");
      
      const paymentTable = await queryRunner.getTable("payment");
      if (!paymentTable) {
        console.log("❌ Payment table not found! Creating tables...");
        await AppDataSource.synchronize();
        console.log("✅ Tables created");
      } else {
        const sellerIdColumn = paymentTable.findColumnByName("seller_id");
        
        if (!sellerIdColumn) {
          console.log("🔧 Adding missing seller_id column...");
          
          await queryRunner.query(`
            ALTER TABLE payment 
            ADD COLUMN seller_id INTEGER;
          `);
          
          await queryRunner.query(`
            ALTER TABLE payment 
            ADD CONSTRAINT FK_payment_seller_id 
            FOREIGN KEY (seller_id) REFERENCES "user"(id) 
            ON DELETE SET NULL;
          `);
          
          console.log("✅ seller_id column added successfully");
        } else {
          console.log("✅ seller_id column already exists");
        }
      }
      
      // Run any pending migrations
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
      
      // Verify table structure
      console.log("🔍 Verifying table structure...");
      const tables = await queryRunner.getTables();
      console.log(`✅ Found ${tables.length} tables in database`);
      
      // Check payment table columns
      const finalPaymentTable = await queryRunner.getTable("payment");
      if (finalPaymentTable) {
        const columnNames = finalPaymentTable.columns.map(col => col.name);
        console.log("📋 Payment table columns:", columnNames);
        
        const hasSellerIdColumn = columnNames.includes("seller_id");
        console.log(`${hasSellerIdColumn ? '✅' : '❌'} seller_id column: ${hasSellerIdColumn ? 'EXISTS' : 'MISSING'}`);
      }
      
    } finally {
      await queryRunner.release();
    }
    
    await AppDataSource.destroy();
    console.log("🎉 Database fix completed successfully!");
    
  } catch (error) {
    console.error("❌ Error fixing production database:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fixProductionDatabase();
}

export default fixProductionDatabase;
