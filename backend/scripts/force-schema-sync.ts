import "reflect-metadata";
import AppDataSource from "../src/ormconfig";

/**
 * EMERGENCY: Force schema synchronization for production
 * This will update the database schema to match current entities
 * WITHOUT dropping existing data
 */
async function forceSchemaSync() {
  try {
    console.log("🚨 EMERGENCY: Force schema synchronization starting...");
    console.log("⚠️  This will update schema but preserve existing data");
    
    // Initialize the data source with synchronization enabled
    console.log("🔗 Connecting to database...");
    await AppDataSource.initialize();
    console.log("✅ Database connection established");

    // Force synchronization (add missing tables/columns, but don't drop existing data)
    console.log("🔄 Synchronizing database schema...");
    console.log("   - Adding missing tables");
    console.log("   - Adding missing columns");
    console.log("   - Preserving existing data");
    
    await AppDataSource.synchronize();
    console.log("✅ Schema synchronization completed");

    // Verify all entities are properly created
    console.log("🔍 Verifying database tables...");
    const queryRunner = AppDataSource.createQueryRunner();
    
    const tables = await queryRunner.getTables();
    // Verify key tables exist (using correct entity table names)
    const expectedTables = [
      'user', 'payment', 'paymentevent', 'escrow', 'dispute', 'dispute_messages',
      'notification', 'earlyaccesscounter', 'junotransaction', 'lead', 
      'tickets', 'ticket_replies', 'token', 'wallet_transaction'
    ];
    
    console.log("📋 Current database tables:");
    const foundTables = tables.map(table => table.name).sort();
    foundTables.forEach(table => {
      const isExpected = expectedTables.includes(table);
      console.log(`  ${isExpected ? '✅' : '🔹'} ${table}`);
    });

    const missingTables = expectedTables.filter(
      expectedTable => !tables.some(table => table.name === expectedTable)
    );

    if (missingTables.length > 0) {
      console.log("❌ Still missing tables:");
      missingTables.forEach(table => {
        console.log(`  - ${table}`);
      });
      throw new Error("Schema sync failed - missing tables remain");
    } else {
      console.log("✅ All expected tables are present");
    }

    // Check for key columns in User table
    console.log("🔍 Verifying User table columns...");
    const userTable = tables.find(t => t.name === 'user');
    if (userTable) {
      const requiredColumns = ['id', 'email', 'googleId', 'googleAccessToken', 'googleRefreshToken', 'mxnb_balance'];
      const existingColumns = userTable.columns.map(col => col.name);
      
      console.log("📋 User table columns:");
      existingColumns.sort().forEach(col => {
        const isRequired = requiredColumns.includes(col);
        console.log(`  ${isRequired ? '✅' : '🔹'} ${col}`);
      });

      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      if (missingColumns.length > 0) {
        console.log("❌ Missing User columns:");
        missingColumns.forEach(col => console.log(`  - ${col}`));
      }
    }

    // Check for key columns in Payment table
    console.log("🔍 Verifying Payment table columns...");
    const paymentTable = tables.find(t => t.name === 'payment');
    if (paymentTable) {
      const requiredColumns = ['id', 'recipient_email', 'payer_email', 'payout_juno_bank_account_id', 'seller_id'];
      const existingColumns = paymentTable.columns.map(col => col.name);
      
      console.log("📋 Payment table columns:");
      existingColumns.sort().forEach(col => {
        const isRequired = requiredColumns.includes(col);
        console.log(`  ${isRequired ? '✅' : '🔹'} ${col}`);
      });

      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      if (missingColumns.length > 0) {
        console.log("❌ Missing Payment columns:");
        missingColumns.forEach(col => console.log(`  - ${col}`));
      }
    }

    await queryRunner.release();
    await AppDataSource.destroy();
    
    console.log("🎉 Emergency schema sync completed successfully!");
    console.log("✅ Production database should now match entity definitions");
    
  } catch (error) {
    console.error("❌ Error during force schema sync:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  forceSchemaSync();
}

export default forceSchemaSync;
