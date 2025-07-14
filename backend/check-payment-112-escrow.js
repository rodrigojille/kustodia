const { AppDataSource } = require('./dist/ormconfig.js');
const { Payment } = require('./dist/entity/Payment.js');

async function checkPayment112() {
  try {
    await AppDataSource.initialize();
    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = await paymentRepo.findOne({ 
      where: { id: 112 }, 
      relations: ['escrow'] 
    });
    
    if (payment && payment.escrow) {
      console.log('📊 Payment 112 escrow details:');
      console.log('Created at:', payment.escrow.created_at);
      console.log('Custody end:', payment.escrow.custody_end);
      console.log('Current time:', new Date());
      console.log('');
      console.log('🕐 Timestamp comparison:');
      console.log('Deadline timestamp:', Math.floor(payment.escrow.custody_end.getTime() / 1000));
      console.log('Current timestamp:', Math.floor(Date.now() / 1000));
      console.log('');
      console.log('⏰ Is deadline in future?', payment.escrow.custody_end > new Date());
      
      if (payment.escrow.custody_end <= new Date()) {
        console.log('❌ PROBLEM: Deadline is in the past!');
        console.log('💡 Solution: Update custody_end to future date');
      } else {
        console.log('✅ Deadline is valid (in future)');
      }
    } else {
      console.log('❌ Payment 112 or escrow not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPayment112();
