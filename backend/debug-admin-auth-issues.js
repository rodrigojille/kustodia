require('dotenv').config();
const AppDataSource = require('./dist/ormconfig').default;
const { User } = require('./dist/entity/User');
const { Payment } = require('./dist/entity/Payment');

async function debugAdminAuthIssues() {
  console.log('🔍 Debugging admin authentication and data fetch issues...');
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Database connected');

    // Check admin user data
    const userRepo = AppDataSource.getRepository(User);
    const adminUser = await userRepo.findOne({
      where: { email: 'rodrigojille6@gmail.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('📊 Admin user data:');
    console.log(`- ID: ${adminUser.id}`);
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Role: ${adminUser.role}`);
    console.log(`- Wallet: ${adminUser.wallet_address}`);
    console.log(`- MXNB Balance: ${adminUser.mxnb_balance || 0}`);
    console.log(`- Deposit CLABE: ${adminUser.deposit_clabe}`);
    console.log(`- Payout CLABE: ${adminUser.payout_clabe}`);
    console.log(`- Juno UUID: ${adminUser.juno_bank_account_id}`);
    console.log(`- KYC Status: ${adminUser.kyc_status}`);

    // Check payment data structure
    const paymentRepo = AppDataSource.getRepository(Payment);
    const recentPayments = await paymentRepo.find({
      take: 5,
      order: { created_at: 'DESC' },
      relations: ['user', 'escrow']
    });

    console.log('\n📊 Recent payments structure:');
    recentPayments.forEach(payment => {
      console.log(`Payment ${payment.id}:`);
      console.log(`  - Amount: ${payment.amount}`);
      console.log(`  - Status: ${payment.status}`);
      console.log(`  - Type: ${payment.payment_type}`);
      console.log(`  - User ID: ${payment.user_id}`);
      console.log(`  - Escrow ID: ${payment.escrow_id}`);
      console.log(`  - Created: ${payment.created_at}`);
    });

    // Test admin payments endpoint data structure
    const allPayments = await paymentRepo.find({
      relations: ['user', 'escrow'],
      order: { created_at: 'DESC' },
      take: 10
    });

    console.log('\n📊 Admin payments endpoint test:');
    console.log(`- Total payments found: ${allPayments.length}`);
    console.log(`- Is array: ${Array.isArray(allPayments)}`);
    console.log(`- First payment structure:`, {
      id: allPayments[0]?.id,
      amount: allPayments[0]?.amount,
      status: allPayments[0]?.status,
      hasUser: !!allPayments[0]?.user,
      hasEscrow: !!allPayments[0]?.escrow
    });

    // Check if reduce would work
    try {
      const statusGroups = allPayments.reduce((acc, payment) => {
        const status = payment.status;
        if (!acc[status]) {
          acc[status] = { count: 0, amount: 0 };
        }
        acc[status].count += 1;
        acc[status].amount += Number(payment.amount || 0);
        return acc;
      }, {});
      
      console.log('\n✅ Reduce operation successful:');
      console.log('Status groups:', statusGroups);
    } catch (reduceError) {
      console.log('\n❌ Reduce operation failed:', reduceError.message);
    }

  } catch (error) {
    console.error('❌ Error debugging admin auth issues:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  }
}

// Run the script
debugAdminAuthIssues();
