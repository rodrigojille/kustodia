const { PaymentAutomationService } = require('../dist/services/PaymentAutomationService');
const AppDataSource = require('../dist/ormconfig').default;

async function processPayment141() {
  try {
    console.log('🚀 Starting manual processing of Payment 141...');
    
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }
    
    // Create automation service instance
    const automationService = new PaymentAutomationService();
    
    // Process Payment 141 automation
    const paymentId = 141;
    console.log(`🔄 Processing automation for Payment ${paymentId}...`);
    
    await automationService.processPaymentAutomation(paymentId);
    
    console.log('✅ Payment 141 automation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error processing Payment 141:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

// Run the script
processPayment141();
