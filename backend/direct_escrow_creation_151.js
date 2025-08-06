/**
 * Direct escrow creation for Payment 151
 * Bypasses API authentication and calls services directly
 */

require('dotenv').config();
const { createConnection } = require('typeorm');

async function directEscrowCreation() {
    console.log('🔧 DIRECT ESCROW CREATION FOR PAYMENT 151');
    console.log('==========================================');
    console.log('Time:', new Date().toISOString());
    console.log('');
    
    let connection;
    
    try {
        // Initialize database connection
        console.log('📡 Connecting to database...');
        
        // Import the TypeScript modules using require
        const AppDataSource = require('./src/ormconfig').default;
        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('✅ Database connected');
        }
        
        // Import services
        const { PaymentAutomationService } = require('./src/services/PaymentAutomationService');
        const { Payment } = require('./src/entity/Payment');
        
        // Get payment 151
        console.log('🔍 Fetching Payment 151...');
        const paymentRepo = AppDataSource.getRepository(Payment);
        const payment = await paymentRepo.findOne({
            where: { id: 151 },
            relations: ['escrow']
        });
        
        if (!payment) {
            throw new Error('Payment 151 not found');
        }
        
        console.log('✅ Payment 151 found:');
        console.log('   Status:', payment.status);
        console.log('   Escrow ID:', payment.escrow?.id);
        console.log('   Smart Contract ID:', payment.escrow?.smart_contract_escrow_id);
        console.log('   Custody Amount:', payment.escrow?.custody_amount);
        console.log('');
        
        // Check if escrow already exists
        if (payment.escrow?.smart_contract_escrow_id) {
            console.log('⚠️  Escrow already exists with ID:', payment.escrow.smart_contract_escrow_id);
            console.log('   This payment may already be processed');
            return;
        }
        
        // Create automation service instance
        console.log('🚀 Creating PaymentAutomationService instance...');
        const automationService = new PaymentAutomationService();
        
        // Calculate custody amount
        const custodyAmount = Number(payment.escrow?.custody_amount || 0);
        console.log('💰 Custody amount:', custodyAmount, 'MXNB');
        
        if (custodyAmount <= 0) {
            throw new Error('Invalid custody amount');
        }
        
        // Call the escrow creation method directly
        console.log('⚡ Calling processEscrowCreationAndFunding directly...');
        await automationService.processEscrowCreationAndFunding(payment, custodyAmount);
        
        console.log('✅ ESCROW CREATION COMPLETED!');
        console.log('🎯 Check Payment 151 status in database');
        
    } catch (error) {
        console.error('❌ Direct escrow creation failed:');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        
        // Try to get more details about the payment
        try {
            if (AppDataSource?.isInitialized) {
                const { Payment } = require('./src/entity/Payment');
                const paymentRepo = AppDataSource.getRepository(Payment);
                const payment = await paymentRepo.findOne({
                    where: { id: 151 },
                    relations: ['escrow']
                });
                
                console.log('');
                console.log('📊 Payment 151 current state:');
                console.log('   Status:', payment?.status);
                console.log('   Escrow Status:', payment?.escrow?.status);
                console.log('   Smart Contract ID:', payment?.escrow?.smart_contract_escrow_id);
            }
        } catch (debugError) {
            console.error('Could not fetch payment details:', debugError.message);
        }
    } finally {
        if (AppDataSource?.isInitialized) {
            await AppDataSource.destroy();
            console.log('📡 Database connection closed');
        }
    }
}

directEscrowCreation().catch(console.error);
