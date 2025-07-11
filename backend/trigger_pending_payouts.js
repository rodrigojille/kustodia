const { PaymentAutomationService } = require('./dist/services/PaymentAutomationService.js');
const AppDataSource = require('./dist/ormconfig.js').default;

async function triggerPendingPayouts() {
  console.log('🚀 MANUAL TRIGGER: processPendingPayouts()');
  console.log('This will complete Payments 85, 87 with actual MXNB redemption and SPEI transfer');
  console.log('');

  // Initialize database connection
  if (!AppDataSource.isInitialized) {
    console.log('🔌 Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');
  }

  const automationService = new PaymentAutomationService();
  
  try {
    await automationService.processPendingPayouts();
    console.log('✅ Manual trigger completed successfully');
  } catch (error) {
    console.error('❌ Error during manual trigger:', error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

triggerPendingPayouts();
