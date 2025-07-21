import AppDataSource from '../ormconfig';
import { Payment } from '../entity/Payment';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkPayment113Status() {
  try {
    await AppDataSource.initialize();
    
    const paymentRepo = AppDataSource.getRepository(Payment);
    
    const payment = await paymentRepo.findOne({
      where: { id: 113 },
      relations: ['escrow', 'seller', 'user']
    });
    
    if (!payment) {
      console.log('Payment 113 not found');
      return;
    }
    
    console.log('Payment 113 Status:');
    console.log('  Payment Status:', payment.status);
    console.log('  Payment Type:', payment.payment_type);
    console.log('  Amount:', payment.amount);
    console.log('  Payer:', payment.payer_email);
    console.log('  Payee:', payment.recipient_email);
    console.log('  Payer Approval:', payment.payer_approval);
    console.log('  Payee Approval:', payment.payee_approval);
    
    if (payment.escrow) {
      console.log('\nEscrow Details:');
      console.log('  Escrow ID:', payment.escrow.id);
      console.log('  Smart Contract ID:', payment.escrow.smart_contract_escrow_id);
      console.log('  Escrow Status:', payment.escrow.status);
      console.log('  Custody End:', payment.escrow.custody_end);
      console.log('  Release Amount:', payment.escrow.release_amount);
      console.log('  Release TX Hash:', payment.escrow.release_tx_hash);
      console.log('  Blockchain TX Hash:', payment.escrow.blockchain_tx_hash);
    } else {
      console.log('\nNo escrow associated with this payment');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

checkPayment113Status();
