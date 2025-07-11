require('dotenv').config();
const { DataSource } = require('typeorm');

// Use the same DataSource pattern as PaymentAutomationService
const Payment = require('../dist/entity/Payment').Payment;
const Escrow = require('../dist/entity/Escrow').Escrow;
const PaymentEvent = require('../dist/entity/PaymentEvent').PaymentEvent;

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [Payment, Escrow, PaymentEvent],
  synchronize: false,
  logging: false,
});

async function fixEscrow76Status() {
  try {
    console.log('=== FIXING ESCROW 76 STATUS ===\n');
    
    // Initialize database connection like PaymentAutomationService
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }
    
    const escrowRepo = AppDataSource.getRepository(Escrow);
    const paymentEventRepo = AppDataSource.getRepository(PaymentEvent);
    
    // Find escrow 76
    const escrow = await escrowRepo.findOne({
      where: { id: 76 },
      relations: ['payment']
    });
    
    if (!escrow) {
      console.log('❌ Escrow 76 not found');
      return;
    }
    
    console.log(`Current escrow status: ${escrow.status}`);
    console.log(`Custody end: ${escrow.custody_end}`);
    console.log(`Is expired: ${new Date() > new Date(escrow.custody_end)}`);
    
    if (escrow.status === 'funded') {
      console.log('\n🔧 Updating escrow status from "funded" to "active"...');
      
      // Update status to 'active' so automation can process it
      escrow.status = 'active';
      await escrowRepo.save(escrow);
      
      console.log('✅ Escrow 76 status updated to "active"');
      
      // Log the fix as payment event
      const paymentEvent = new PaymentEvent();
      paymentEvent.payment_id = escrow.payment.id;
      paymentEvent.event_type = 'escrow_status_fixed';
      paymentEvent.description = 'Escrow status corrected from "funded" to "active" to enable automation processing';
      paymentEvent.success = true;
      paymentEvent.created_at = new Date();
      
      await paymentEventRepo.save(paymentEvent);
      console.log('✅ Payment event logged');
      
      console.log('\n🎯 NEXT STEPS:');
      console.log('   The PaymentAutomationService should now pick up this escrow automatically');
      console.log('   It runs every few minutes and will:');
      console.log('   1. Find escrows with status="active" and expired custody_end');
      console.log('   2. Release the escrow on-chain');
      console.log('   3. Update status to "released"');
      console.log('   4. Trigger MXNB redemption and payout');
      
    } else if (escrow.status === 'active') {
      console.log('\n✅ Escrow status is already "active" - automation should process it');
    } else if (escrow.status === 'released') {
      console.log('\n🎉 Escrow is already released');
    } else {
      console.log(`\n🤔 Unexpected escrow status: ${escrow.status}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n🔚 Database connection closed');
    }
  }
}

// Run the fix
fixEscrow76Status().catch(console.error);
