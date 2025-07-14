/**
 * Fix Payment 113 custody end date - should be 1 day, not 2 seconds
 */

require('dotenv').config();
const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');

async function fixPayment113Custody() {
  try {
    console.log('🔧 Fixing Payment 113 custody end date...');
    
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    const paymentRepo = AppDataSource.getRepository(Payment);
    const escrowRepo = AppDataSource.getRepository(Escrow);
    
    const payment = await paymentRepo.findOne({ 
      where: { id: 113 }, 
      relations: ['escrow'] 
    });
    
    if (!payment) {
      console.log('❌ Payment 113 not found');
      return;
    }
    
    if (!payment.escrow) {
      console.log('❌ Payment 113 has no escrow');
      return;
    }
    
    console.log('📊 Current Payment 113 data:');
    console.log('- Payment created:', payment.created_at);
    console.log('- Escrow created:', payment.escrow.created_at);
    console.log('- Current custody end:', payment.escrow.custody_end);
    
    const currentPeriodMs = payment.escrow.custody_end.getTime() - payment.escrow.created_at.getTime();
    const currentPeriodDays = currentPeriodMs / (1000 * 60 * 60 * 24);
    console.log('- Current custody period:', currentPeriodDays, 'days');
    
    // Fix: Set custody_end to 1 day (86400 seconds) after escrow creation
    const correctCustodyEnd = new Date(payment.escrow.created_at.getTime() + (24 * 60 * 60 * 1000));
    
    console.log('🔄 Updating custody end date...');
    console.log('- New custody end:', correctCustodyEnd);
    
    payment.escrow.custody_end = correctCustodyEnd;
    await escrowRepo.save(payment.escrow);
    
    console.log('✅ Payment 113 custody end fixed!');
    
    // Verify the fix
    const updatedPayment = await paymentRepo.findOne({ 
      where: { id: 113 }, 
      relations: ['escrow'] 
    });
    
    const newPeriodMs = updatedPayment.escrow.custody_end.getTime() - updatedPayment.escrow.created_at.getTime();
    const newPeriodDays = newPeriodMs / (1000 * 60 * 60 * 24);
    
    console.log('📊 Updated Payment 113 data:');
    console.log('- Custody end:', updatedPayment.escrow.custody_end);
    console.log('- Custody period:', newPeriodDays, 'days');
    
  } catch (error) {
    console.error('❌ Error fixing Payment 113:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  }
}

fixPayment113Custody().catch(console.error);
