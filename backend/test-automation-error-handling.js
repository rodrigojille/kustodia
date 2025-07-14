/**
 * Test automation with improved Juno error handling for Payment 112
 */

require('dotenv').config();
const AppDataSource = require('./src/ormconfig').default;
const { Payment } = require('./src/entity/Payment');
const { PaymentAutomationService } = require('./src/services/PaymentAutomationService');
const { initializeJunoService } = require('./src/services/junoService');

async function testAutomationErrorHandling() {
  try {
    console.log('🚀 Testing automation with improved error handling...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    // Initialize Juno service
    initializeJunoService();
    console.log('✅ Juno service initialized');
    
    // Get Payment 112
    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = await paymentRepo.findOne({ 
      where: { id: 112 }, 
      relations: ['escrow'] 
    });
    
    if (!payment) {
      console.log('❌ Payment 112 not found');
      return;
    }
    
    console.log(`📋 Found Payment 112:`);
    console.log(`- Status: ${payment.status}`);
    console.log(`- Amount: ${payment.amount_mxn} MXN`);
    console.log(`- Escrow Status: ${payment.escrow?.status || 'No escrow'}`);
    
    // Create automation service instance
    const automationService = new PaymentAutomationService();
    
    // Test the bridge withdrawal process specifically
    console.log('\n💰 Testing bridge withdrawal with improved error handling...');
    
    if (payment.status === 'funded' && (!payment.escrow || payment.escrow.status === 'pending')) {
      console.log('🔄 Payment is in correct state for bridge withdrawal test');
      
      try {
        // This should use the improved error handling
        await automationService.processPayment(payment.id);
        console.log('✅ Automation completed successfully');
        
        // Check final payment status
        const updatedPayment = await paymentRepo.findOne({ 
          where: { id: 112 }, 
          relations: ['escrow'] 
        });
        
        console.log(`📊 Final Payment Status:`);
        console.log(`- Payment Status: ${updatedPayment.status}`);
        console.log(`- Escrow Status: ${updatedPayment.escrow?.status || 'No escrow'}`);
        
      } catch (error) {
        console.log('⚠️ Automation encountered an error:');
        console.log('Error:', error.message);
        
        // Check if payment status was updated despite the error
        const updatedPayment = await paymentRepo.findOne({ 
          where: { id: 112 }, 
          relations: ['escrow'] 
        });
        
        console.log(`📊 Payment Status After Error:`);
        console.log(`- Payment Status: ${updatedPayment.status}`);
        console.log(`- Escrow Status: ${updatedPayment.escrow?.status || 'No escrow'}`);
        
        if (updatedPayment.status === 'escrowed' || updatedPayment.escrow?.status === 'funded') {
          console.log('✅ Despite the error, automation appears to have succeeded');
        } else {
          console.log('❌ Automation failed and payment status was not updated');
        }
      }
      
    } else {
      console.log('ℹ️ Payment 112 is not in the correct state for automation testing');
      console.log('Current state:', {
        status: payment.status,
        escrowStatus: payment.escrow?.status
      });
      
      if (payment.status === 'escrowed') {
        console.log('✅ Payment is already escrowed - automation was successful');
      }
    }
    
    console.log('\n🎉 Automation error handling test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  }
}

// Run the test
testAutomationErrorHandling().catch(console.error);
