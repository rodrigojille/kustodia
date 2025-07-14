require('dotenv').config();
const AppDataSource = require('./dist/ormconfig.js').default;
const { PaymentAutomationService } = require('./dist/services/PaymentAutomationService.js');
const { Payment } = require('./dist/entity/Payment.js');

async function triggerEscrowCreation112() {
  try {
    console.log('🏦 Triggering escrow creation for Payment 112...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    // Get payment details
    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = await paymentRepo.findOne({ 
      where: { id: 112 }, 
      relations: ['escrow', 'user', 'seller'] 
    });
    
    if (!payment) {
      throw new Error('Payment 112 not found');
    }
    
    console.log('📊 Payment 112 Status:');
    console.log(`   Payment Status: ${payment.status}`);
    console.log(`   Escrow Status: ${payment.escrow?.status}`);
    console.log(`   Smart Contract ID: ${payment.escrow?.smart_contract_escrow_id || 'None'}`);
    
    // Create automation service instance
    const automationService = new PaymentAutomationService();
    
    // Since the withdrawal was successful, we can proceed directly to escrow creation
    console.log('🔧 Creating escrow contract...');
    
    // Calculate custody amount (100% for Payment 112)
    const totalAmount = Number(payment.amount);
    const custodyPercent = Number(payment.escrow?.custody_percent || 100);
    const custodyAmount = Math.round(totalAmount * (custodyPercent / 100));
    
    console.log(`💰 Custody Amount: ${custodyAmount} MXNB (${custodyPercent}% of ${totalAmount})`);
    
    // Call the escrow creation method directly
    await automationService.processEscrowCreationAndFunding(payment, custodyAmount);
    
    console.log('✅ Escrow creation completed successfully!');
    
  } catch (error) {
    console.error('❌ Escrow creation failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

triggerEscrowCreation112();
