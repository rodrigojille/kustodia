const { PaymentAutomationService } = require('./dist/services/PaymentAutomationService.js');

async function triggerPendingPayouts() {
  console.log('🚀 MANUAL TRIGGER: processPendingPayouts()');
  console.log('This will complete Payment 83 with actual MXNB redemption and SPEI transfer');
  console.log('');

  const automationService = new PaymentAutomationService();
  
  try {
    await automationService.processPendingPayouts();
    console.log('✅ Manual trigger completed successfully');
  } catch (error) {
    console.error('❌ Error during manual trigger:', error);
  }
}

triggerPendingPayouts();
