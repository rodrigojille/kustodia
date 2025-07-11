console.log('--- Payment 85 Withdrawal Script Started ---');
import dotenv from 'dotenv';
import path from 'path';
import { withdrawCryptoToBridgeWallet } from '../src/services/junoService';
import ormconfig from '../src/ormconfig';
import { Payment } from '../src/entity/Payment';
import { PaymentEvent } from '../src/entity/PaymentEvent';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function logPaymentEvent(paymentId: number, eventType: string, description: string) {
  try {
    const paymentEventRepo = ormconfig.getRepository(PaymentEvent);
    const paymentEvent = paymentEventRepo.create({
      payment: { id: paymentId },
      type: eventType,
      description: description
    });
    await paymentEventRepo.save(paymentEvent);
    console.log(`📝 Event logged: ${eventType} - ${description}`);
  } catch (error) {
    console.error('❌ Error logging payment event:', error);
  }
}

async function main() {
  console.log('🚀 Processing Payment 85 withdrawal...');
  
  // Initialize database
  await ormconfig.initialize();
  console.log('✅ Database connected');
  
  // Get payment details
  const paymentRepo = ormconfig.getRepository(Payment);
  const payment = await paymentRepo.findOne({
    where: { id: 85 },
    relations: ['escrow']
  });
  
  if (!payment) {
    throw new Error('Payment 85 not found');
  }
  
  console.log('📊 Payment 85 details:');
  console.log('- ID:', payment.id);
  console.log('- Status:', payment.status);
  console.log('- Amount:', payment.amount);
  console.log('- Escrow exists:', !!payment.escrow);
  
  if (!payment.escrow) {
    throw new Error('No escrow found for payment 85');
  }
  
  console.log('- Escrow ID:', payment.escrow.id);
  console.log('- Escrow Status:', payment.escrow.status);
  
  if (payment.escrow.status !== 'pending') {
    throw new Error(`Escrow status is '${payment.escrow.status}', expected 'pending'`);
  }
  
  // Use the correct bridge wallet address
  const destinationAddress = '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b';
  console.log('✅ Using bridge wallet address:', destinationAddress);
  
  console.log('💰 Withdrawal details:');
  console.log('- Amount:', payment.amount);
  console.log('- Destination:', destinationAddress);
  
  // Perform withdrawal
  console.log('🔄 Initiating Juno withdrawal...');
  await withdrawCryptoToBridgeWallet(payment.amount, destinationAddress);
  
  // Update payment status
  payment.status = 'withdrawn';
  await paymentRepo.save(payment);
  console.log('✅ Payment status updated to withdrawn');
  
  // Log the event
  await logPaymentEvent(
    payment.id,
    'juno_withdrawal',
    `MXNB withdrawn from Juno to bridge wallet: ${payment.amount} to ${destinationAddress}`
  );
  
  console.log('🎉 Payment 85 withdrawal completed successfully!');
}

(async () => {
  try {
    await main();
    console.log('\n✅ Script finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ SCRIPT FAILED');
    console.error('An error was caught by the execution wrapper:', error);
    process.exit(1);
  } finally {
    if (ormconfig.isInitialized) {
      await ormconfig.destroy();
      console.log('🔌 Database connection closed');
    }
  }
})();
