require('dotenv').config();
import { PaymentAutomationService } from './src/services/PaymentAutomationService';
import AppDataSource from './src/ormconfig';

async function retryPayment90Automation() {
  try {
    console.log('🚀 Manually triggering automation for Payment 90...');
    
    // Verify environment variable is loaded
    console.log('ESCROW_BRIDGE_WALLET:', process.env.ESCROW_BRIDGE_WALLET ? 'SET ✅' : 'NOT SET ❌');
    
    // Initialize database connection
    console.log('📊 Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database initialized successfully');
    
    const automationService = new PaymentAutomationService();
    
    // Manually trigger the complete automation flow for Payment 90
    await automationService.processPaymentAutomation(90);
    
    console.log('✅ Payment 90 automation triggered successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error triggering automation:', error.message);
    process.exit(1);
  }
}

retryPayment90Automation();
