require('dotenv').config();
const AppDataSource = require('./dist/ormconfig.js').default;
const { PaymentAutomationService } = require('./dist/services/PaymentAutomationService.js');

async function triggerPayment112Automation() {
  try {
    console.log('🚀 Triggering automation for Payment 112...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    // Create automation service instance
    const automationService = new PaymentAutomationService();
    
    // Trigger automation for Payment 112
    console.log('🔧 Starting automation for Payment 112...');
    await automationService.processPaymentAutomation(112);
    
    console.log('✅ Automation completed successfully!');
    
  } catch (error) {
    console.error('❌ Automation failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

triggerPayment112Automation();
