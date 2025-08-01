const { AppDataSource } = require('../src/ormconfig.ts');
const { PaymentAutomationService } = require('../src/services/PaymentAutomationService.ts');

async function testEscrowRetry() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    
    const automationService = new PaymentAutomationService();
    
    console.log('🔄 Testing escrow retry mechanism for Payment 141...');
    console.log('⏰ Current time:', new Date().toLocaleString('es-MX'));
    
    // Run the retry method
    await automationService.retryFailedEscrowCreations();
    
    console.log('✅ Escrow retry test completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

testEscrowRetry();
