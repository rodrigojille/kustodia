const { AppDataSource } = require('./dist/data-source');

async function checkEscrow() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    // Check payment 107
    const paymentRepo = AppDataSource.getRepository('Payment');
    const payment = await paymentRepo.findOne({
      where: { id: 107 },
      relations: ['escrow']
    });
    
    console.log('Payment 107:', payment);

    // Check escrow table directly
    const escrowRepo = AppDataSource.getRepository('Escrow');
    const escrows = await escrowRepo.find({
      where: { payment: { id: 107 } },
      relations: ['payment']
    });
    
    console.log('Escrows for payment 107:', escrows);

    // Check all escrows
    const allEscrows = await escrowRepo.find({
      relations: ['payment'],
      order: { id: 'DESC' },
      take: 5
    });
    
    console.log('Latest 5 escrows:', allEscrows.map(e => ({
      id: e.id,
      payment_id: e.payment?.id,
      status: e.status,
      custody_amount: e.custody_amount,
      custody_percent: e.custody_percent
    })));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEscrow();
