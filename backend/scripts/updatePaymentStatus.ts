import { DataSource } from 'typeorm';
import { Payment } from '../src/entity/Payment';
import ormconfig from '../src/ormconfig';

const updatePaymentStatus = async (paymentId: number, newStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'dispute') => {
  let dataSource: DataSource | null = null;
  try {
    console.log('🔌 Connecting to the database...');
    dataSource = await ormconfig.initialize();
    console.log('✅ Database connected.');

    const paymentRepo = dataSource.getRepository(Payment);

    console.log(`🔍 Finding payment with ID: ${paymentId}`);
    const payment = await paymentRepo.findOne({ where: { id: paymentId } });

    if (!payment) {
      console.error(`❌ Payment with ID ${paymentId} not found.`);
      return;
    }

    console.log(`Status of payment ${paymentId} is currently: '${payment.status}'`);
    console.log(`Updating status to: '${newStatus}'...`);

    payment.status = newStatus;
    await paymentRepo.save(payment);

    console.log(`✅ Payment ${paymentId} status successfully updated to '${newStatus}'.`);

  } catch (error) {
    console.error('❌ Error updating payment status:', error);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed.');
    }
  }
};

const paymentIdArg = process.argv[2];
const newStatusArg = process.argv[3];

if (!paymentIdArg || !newStatusArg) {
  console.error('Usage: ts-node backend/scripts/updatePaymentStatus.ts <paymentId> <newStatus>');
  console.error("Example: ts-node backend/scripts/updatePaymentStatus.ts 84 completed");
  process.exit(1);
}

const validStatuses = ['pending', 'processing', 'completed', 'failed', 'dispute'];
if (!validStatuses.includes(newStatusArg)) {
    console.error(`Invalid status '${newStatusArg}'. Must be one of: ${validStatuses.join(', ')}`);
    process.exit(1);
}

updatePaymentStatus(parseInt(paymentIdArg, 10), newStatusArg as any);
