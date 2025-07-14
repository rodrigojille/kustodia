/**
 * Debug script to check dashboard issues for user rodrigojille6@gmail.com
 */

require('dotenv').config();

// Import compiled JavaScript files
const AppDataSource = require('./dist/ormconfig').default;
const { User } = require('./dist/entity/User');
const { Payment } = require('./dist/entity/Payment');
const { PaymentEvent } = require('./dist/entity/PaymentEvent');
const { createJunoClabe, initializeJunoService } = require('./dist/services/junoService');

async function debugDashboardIssues() {
  try {
    console.log('🔍 Debugging dashboard issues...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    const userEmail = 'rodrigojille6@gmail.com';
    
    // Get user data
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email: userEmail } });
    
    if (!user) {
      console.log(`❌ User ${userEmail} not found`);
      return;
    }
    
    console.log('\n📊 User Data:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Full Name: ${user.full_name || 'Not set'}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- Email Verified: ${user.email_verified}`);
    console.log(`- KYC Status: ${user.kyc_status}`);
    console.log(`- Wallet Address: ${user.wallet_address || 'Not set'}`);
    console.log(`- Deposit CLABE: ${user.deposit_clabe || 'NOT SET - THIS IS THE ISSUE!'}`);
    console.log(`- Payout CLABE: ${user.payout_clabe || 'Not set'}`);
    console.log(`- MXNB Balance: ${user.mxnb_balance || 0}`);
    console.log(`- Juno Bank Account ID: ${user.juno_bank_account_id || 'Not set'}`);
    console.log(`- Truora Process ID: ${user.truora_process_id || 'Not set'}`);
    
    // Check if deposit CLABE is missing and try to create it
    if (!user.deposit_clabe) {
      console.log('\n🔧 Fixing missing deposit CLABE...');
      try {
        initializeJunoService();
        
        const depositClabe = await createJunoClabe();
        user.deposit_clabe = depositClabe;
        await userRepo.save(user);
        console.log(`✅ Created and saved deposit CLABE: ${depositClabe}`);
      } catch (clabeError) {
        console.error('❌ Failed to create deposit CLABE:', clabeError.message);
      }
    }
    
    // Get user's payments
    const paymentRepo = AppDataSource.getRepository(Payment);
    const payments = await paymentRepo.find({
      where: [
        { user_id: user.id },
        { recipient_email: user.email },
        { payer_email: user.email }
      ],
      relations: ['escrow'],
      order: { created_at: 'DESC' },
      take: 5 // Get last 5 payments
    });
    
    console.log(`\n💳 User's Recent Payments (${payments.length}):`);
    payments.forEach((payment, index) => {
      console.log(`${index + 1}. Payment ${payment.id}:`);
      console.log(`   - Status: ${payment.status}`);
      console.log(`   - Amount: ${payment.amount_mxn} MXN`);
      console.log(`   - Type: ${payment.payment_type || 'standard'}`);
      console.log(`   - Escrow: ${payment.escrow?.status || 'No escrow'}`);
      console.log(`   - Created: ${payment.created_at}`);
    });
    
    // Check payment events for a recent payment
    if (payments.length > 0) {
      const recentPayment = payments[0];
      console.log(`\n📅 Events for Payment ${recentPayment.id}:`);
      
      const eventRepo = AppDataSource.getRepository(PaymentEvent);
      const events = await eventRepo.find({
        where: { paymentId: recentPayment.id },
        order: { created_at: 'ASC' }
      });
      
      if (events.length === 0) {
        console.log('   ❌ No events found - this could be why timeline is empty!');
      } else {
        events.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.type}: ${event.description || 'No description'}`);
          console.log(`      - Time: ${event.created_at}`);
          console.log(`      - Auto: ${event.is_automatic}`);
        });
      }
    }
    
    console.log('\n🎯 Dashboard Issues Summary:');
    console.log('1. Deposit CLABE:', user.deposit_clabe ? '✅ Present' : '❌ Missing');
    console.log('2. MXNB Balance:', typeof user.mxnb_balance === 'number' ? '✅ Available' : '❌ Missing');
    console.log('3. KYC Status:', user.kyc_status ? `✅ ${user.kyc_status}` : '❌ Missing');
    console.log('4. Payment Events:', payments.length > 0 ? '✅ Has payments' : '❌ No payments');
    
    console.log('\n🔧 Recommended Fixes:');
    if (!user.deposit_clabe) {
      console.log('- Fix deposit CLABE creation in getMe endpoint');
    }
    if (typeof user.mxnb_balance !== 'number') {
      console.log('- Ensure mxnb_balance is included in getMe response');
    }
    if (user.kyc_status === 'pending') {
      console.log('- User needs to complete KYC verification');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error(error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  }
}

// Run the debug
debugDashboardIssues().catch(console.error);
