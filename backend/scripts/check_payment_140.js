require('dotenv').config();
const { TransactionRouterService } = require('../dist/services/TransactionRouterService');
const AppDataSource = require('../dist/ormconfig').default;
const { Payment } = require('../dist/entity/Payment');

async function checkPayment140() {
  console.log('🔍 Checking Payment 140 Multi-Sig Requirements...');
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }
    
    const transactionRouter = new TransactionRouterService();
    const paymentRepo = AppDataSource.getRepository(Payment);
    
    // Query payment 140 from database
    console.log('📋 Querying Payment 140 from database...');
    const payment140 = await paymentRepo.findOne({
      where: { id: 140 },
      relations: ['escrow', 'user']
    });
    
    if (!payment140) {
      console.log('❌ Payment 140 not found in database');
      return;
    }
    
    console.log('📋 Payment Details:');
    console.log(`  ID: ${payment140.id}`);
    console.log(`  Amount: $${Number(payment140.amount).toLocaleString()} ${payment140.currency || 'MXN'}`);
    console.log(`  Status: ${payment140.status}`);
    console.log(`  Description: ${payment140.description}`);
    console.log(`  Payer: ${payment140.payer_email}`);
    console.log(`  Recipient: ${payment140.recipient_email}`);
    
    if (payment140.escrow) {
      console.log(`  Escrow ID: ${payment140.escrow.id}`);
      console.log(`  Escrow End: ${new Date(payment140.escrow.end_time).toLocaleString()}`);
    } else {
      console.log('  ❌ No escrow found!');
      return;
    }
    
    // Test the routing decision
    console.log('\n🔄 Testing Transaction Routing...');
    const routingDecision = await transactionRouter.routeTransaction({
      amount: Number(payment140.amount),
      type: 'escrow_release',
      paymentId: payment140.id,
      description: `Release escrow for payment ${payment140.id}`
    });
    
    console.log('📊 Routing Decision:');
    console.log(`  Requires Approval: ${routingDecision.requiresApproval}`);
    console.log(`  Type: ${routingDecision.type}`);
    console.log(`  Wallet: ${routingDecision.wallet}`);
    console.log(`  Reason: ${routingDecision.reason}`);
    
    // Check if it qualifies as upcoming multi-sig
    const qualifiesForMultiSig = routingDecision.requiresApproval && routingDecision.type === 'multi_sig';
    console.log(`\n✅ Qualifies for Multi-Sig: ${qualifiesForMultiSig}`);
    
    if (qualifiesForMultiSig) {
      // Calculate time until release
      const now = new Date();
      const escrowEndTime = new Date(payment140.escrow.end_time);
      const hoursUntilRelease = Math.max(0, Math.floor((escrowEndTime.getTime() - now.getTime()) / (1000 * 60 * 60)));
      const daysUntilRelease = Math.floor(hoursUntilRelease / 24);
      
      console.log(`⏰ Time until release: ${daysUntilRelease} days, ${hoursUntilRelease % 24} hours`);
      
      const upcomingPayment = {
        paymentId: payment140.id,
        amount: Number(payment140.amount),
        amountUsd: Number(payment140.amount) / 20, // Rough MXN to USD conversion
        currency: payment140.currency || 'MXN',
        description: payment140.description,
        payerEmail: payment140.payer_email,
        payeeEmail: payment140.recipient_email,
        escrowId: payment140.escrow.id,
        escrowEndTime: escrowEndTime,
        hoursUntilRelease,
        status: 'upcoming',
        requiresMultiSig: true,
        walletType: routingDecision.type,
        targetWallet: routingDecision.wallet,
        createdAt: payment140.created_at
      };
      
      console.log('\n🎯 Would be included as upcoming payment:');
      console.log(JSON.stringify(upcomingPayment, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkPayment140().catch(console.error);
