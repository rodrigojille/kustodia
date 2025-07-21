import AppDataSource from '../ormconfig';
import { Payment } from '../entity/Payment';
import { Escrow } from '../entity/Escrow';

async function main() {
  await AppDataSource.initialize();
  
  try {
    const paymentRepo = AppDataSource.getRepository(Payment);
    const escrowRepo = AppDataSource.getRepository(Escrow);
    
    const payment = await paymentRepo.findOne({
      where: { id: 112 },
      relations: ['escrow']
    });
    
    if (!payment) {
      console.log('Payment 112 not found');
      return;
    }
    
    console.log('Payment 112 Status:');
    console.log(`  Payment Status: ${payment.status}`);
    console.log(`  Escrow ID: ${payment.escrow?.id}`);
    console.log(`  Escrow Status: ${payment.escrow?.status}`);
    console.log(`  Release Amount: ${payment.escrow?.release_amount}`);
    console.log(`  Release TX Hash: ${payment.escrow?.release_tx_hash}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

main();
