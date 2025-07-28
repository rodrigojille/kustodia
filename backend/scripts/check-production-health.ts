import "reflect-metadata";
import AppDataSource from "../src/ormconfig";

async function checkProductionHealth() {
  try {
    console.log("🔍 Checking production database health...");
    
    // Initialize the data source
    await AppDataSource.initialize();
    console.log("✅ Database connection successful");

    // Check all tables exist
    const queryRunner = AppDataSource.createQueryRunner();
    const tables = await queryRunner.getTables();
    
    const expectedTables = [
      'user', 'payment', 'payment_event', 'escrow', 'dispute', 
      'dispute_message', 'notification', 'early_access_counter',
      'juno_transaction', 'lead', 'tickets', 'ticket_replies', 
      'token', 'wallet_transaction'
    ];

    console.log("\n📊 Database Tables Status:");
    expectedTables.forEach(expectedTable => {
      const exists = tables.some(table => table.name === expectedTable);
      console.log(`${exists ? '✅' : '❌'} ${expectedTable}`);
    });

    // Check sample data
    const userRepository = AppDataSource.getRepository("User");
    const paymentRepository = AppDataSource.getRepository("Payment");
    
    const userCount = await userRepository.count();
    const paymentCount = await paymentRepository.count();
    
    console.log("\n📈 Data Summary:");
    console.log(`👥 Users: ${userCount}`);
    console.log(`💳 Payments: ${paymentCount}`);

    // Check environment variables
    console.log("\n🔧 Environment Variables:");
    const requiredEnvVars = [
      'DATABASE_URL', 'JWT_SECRET', 'JUNO_API_KEY', 
      'NEBIUS_API_KEY', 'FRONTEND_URL'
    ];
    
    requiredEnvVars.forEach(envVar => {
      const exists = !!process.env[envVar];
      console.log(`${exists ? '✅' : '❌'} ${envVar}`);
    });

    await queryRunner.release();
    await AppDataSource.destroy();
    
    console.log("\n🎉 Health check completed!");
    
  } catch (error) {
    console.error("❌ Health check failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  checkProductionHealth();
}

export default checkProductionHealth;
