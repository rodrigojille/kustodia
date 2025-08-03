const { AppDataSource } = require('../src/data-source');
const { Payment } = require('../src/entity/Payment');
const { Escrow } = require('../src/entity/Escrow');

async function fixPayment146EscrowLink() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const paymentRepo = AppDataSource.getRepository(Payment);
    const escrowRepo = AppDataSource.getRepository(Escrow);

    // Find payment 146
    const payment = await paymentRepo.findOne({
      where: { id: 146 },
      relations: ['escrow']
    });

    if (!payment) {
      console.log('Payment 146 not found');
      return;
    }

    console.log(`Payment 146 found - escrow_id: ${payment.escrow?.id || 'null'}`);

    // Check if there's an escrow for this payment that's not linked
    const unlinkedEscrow = await escrowRepo.findOne({
      where: { payment: { id: 146 } }
    });

    if (unlinkedEscrow) {
      console.log(`Found unlinked escrow ${unlinkedEscrow.id} for payment 146`);
      
      // Link the escrow to the payment
      payment.escrow = unlinkedEscrow;
      await paymentRepo.save(payment);
      
      console.log(`✅ Successfully linked escrow ${unlinkedEscrow.id} to payment 146`);
    } else {
      console.log('No unlinked escrow found for payment 146');
      
      // Create escrow based on payment data if custody info exists
      // For payment 146, we know it should have 100% custody for 1 day
      const custodyPercent = 100;
      const custodyPeriod = 1;
      const custodyAmount = payment.amount * (custodyPercent / 100);
      const releaseAmount = payment.amount - custodyAmount;
      const custodyEnd = new Date();
      custodyEnd.setDate(custodyEnd.getDate() + custodyPeriod);

      const newEscrow = escrowRepo.create({
        payment: payment,
        custody_percent: custodyPercent,
        custody_amount: custodyAmount,
        release_amount: releaseAmount,
        custody_end: custodyEnd,
        status: 'pending'
      });

      const savedEscrow = await escrowRepo.save(newEscrow);
      console.log(`✅ Created new escrow ${savedEscrow.id} for payment 146`);
      
      // Link the escrow to the payment
      payment.escrow = savedEscrow;
      await paymentRepo.save(payment);
      console.log(`✅ Successfully linked new escrow ${savedEscrow.id} to payment 146`);
    }

    // Verify the fix
    const updatedPayment = await paymentRepo.findOne({
      where: { id: 146 },
      relations: ['escrow']
    });

    console.log(`Final verification - Payment 146 escrow_id: ${updatedPayment.escrow?.id || 'null'}`);
    
  } catch (error) {
    console.error('Error fixing payment 146:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

fixPayment146EscrowLink();
