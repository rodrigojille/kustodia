const { PaymentAutomationService } = require('../src/services/PaymentAutomationService');
const ormconfig = require('../src/ormconfig').default;

async function testWithdrawal() {
  try {
    console.log('🔧 Testing withdrawal process...');
    
    // Initialize database
    await ormconfig.initialize();
    
    // Create automation service
    const automationService = new PaymentAutomationService();
    
    // Run withdrawal process
    await automationService.processJunoWithdrawals();
    
    console.log('✅ Withdrawal process completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (ormconfig.isInitialized) {
      await ormconfig.destroy();
    }
  }
}

testWithdrawal();
