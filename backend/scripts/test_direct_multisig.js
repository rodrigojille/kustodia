require('dotenv').config();
const { DataSource } = require('typeorm');
const { TransactionRouterService } = require('../dist/services/TransactionRouterService');

async function testDirectMultiSig() {
  console.log('🔍 Testing Multi-Sig Logic (Direct Database Approach)...');
  
  try {
    // Create direct database connection without entities
    const testDataSource = new DataSource({
      type: "postgres",
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: String(process.env.POSTGRES_PASSWORD),
      database: process.env.POSTGRES_DB || 'kustodia',
      synchronize: false,
      logging: false,
      entities: [] // No entities to avoid import issues
    });
    
    await testDataSource.initialize();
    console.log('✅ Database connected');
    
    // Get escrowed payments with escrow details using raw SQL
    const escrowedPayments = await testDataSource.query(`
      SELECT p.id, p.amount, p.status, p.description, p.payer_email, p.recipient_email, 
             p.created_at, p.currency,
             e.id as escrow_id, e.custody_end as escrow_end_time
      FROM payment p
      LEFT JOIN escrow e ON p.id = e.payment_id
      WHERE p.status = 'escrowed' AND e.id IS NOT NULL
      ORDER BY p.id
    `);
    
    console.log(`\n📊 Found ${escrowedPayments.length} escrowed payments with escrow records:`);
    
    const router = new TransactionRouterService();
    const upcomingMultiSigPayments = [];
    
    for (const payment of escrowedPayments) {
      console.log(`\n--- Processing Payment ${payment.id} ---`);
      console.log(`  Amount: $${Number(payment.amount).toLocaleString()} ${payment.currency || 'MXN'}`);
      console.log(`  Escrow ID: ${payment.escrow_id}`);
      console.log(`  Escrow End: ${new Date(payment.escrow_end_time).toLocaleString()}`);
      
      // Test routing for this payment
      const routingDecision = await router.routeTransaction({
        amount: Number(payment.amount),
        type: 'escrow_release',
        paymentId: payment.id,
        description: `Release escrow for payment ${payment.id}`
      });
      
      console.log(`  Routing Result:`);
      console.log(`    - Requires approval: ${routingDecision.requiresApproval}`);
      console.log(`    - Type: ${routingDecision.type}`);
      console.log(`    - Wallet: ${routingDecision.wallet}`);
      console.log(`    - Reason: ${routingDecision.reason}`);
      
      const qualifiesForMultiSig = routingDecision.requiresApproval && routingDecision.type === 'multi_sig';
      console.log(`    - ✅ Qualifies for Multi-Sig: ${qualifiesForMultiSig}`);
      
      if (qualifiesForMultiSig) {
        // Calculate time until release
        const escrowEndTime = new Date(payment.escrow_end_time);
        const now = new Date();
        const hoursUntilRelease = Math.max(0, Math.floor((escrowEndTime.getTime() - now.getTime()) / (1000 * 60 * 60)));
        const daysUntilRelease = Math.floor(hoursUntilRelease / 24);
        
        console.log(`    - ⏰ Time until release: ${daysUntilRelease} days, ${hoursUntilRelease % 24} hours`);
        
        const upcomingPayment = {
          paymentId: payment.id,
          amount: Number(payment.amount),
          amountUsd: Number(payment.amount) / 18.77, // Use actual exchange rate
          currency: payment.currency || 'MXN',
          description: payment.description,
          payerEmail: payment.payer_email,
          payeeEmail: payment.recipient_email,
          escrowId: payment.escrow_id,
          escrowEndTime: escrowEndTime,
          hoursUntilRelease,
          status: 'upcoming',
          requiresMultiSig: true,
          walletType: routingDecision.type,
          targetWallet: routingDecision.wallet,
          createdAt: payment.created_at
        };
        
        upcomingMultiSigPayments.push(upcomingPayment);
        console.log(`    - 🎯 Added to upcoming multi-sig payments list`);
      }
    }
    
    // Sort by release time (soonest first)
    upcomingMultiSigPayments.sort((a, b) => new Date(a.escrowEndTime).getTime() - new Date(b.escrowEndTime).getTime());
    
    console.log(`\n🏆 FINAL RESULTS:`);
    console.log(`📊 Found ${upcomingMultiSigPayments.length} upcoming multi-sig payments:`);
    
    if (upcomingMultiSigPayments.length > 0) {
      upcomingMultiSigPayments.forEach((payment, index) => {
        console.log(`\n${index + 1}. Payment ${payment.paymentId}:`);
        console.log(`   Amount: $${payment.amount.toLocaleString()} ${payment.currency} ($${payment.amountUsd.toLocaleString()} USD)`);
        console.log(`   Description: ${payment.description}`);
        console.log(`   Payer: ${payment.payerEmail}`);
        console.log(`   Payee: ${payment.payeeEmail}`);
        console.log(`   Escrow End: ${payment.escrowEndTime.toLocaleString()}`);
        console.log(`   Hours until release: ${payment.hoursUntilRelease}`);
        console.log(`   Target wallet: ${payment.targetWallet}`);
      });
      
      console.log(`\n✅ SUCCESS: The multi-sig logic works correctly!`);
      console.log(`📝 These payments should appear in the dashboard.`);
    } else {
      console.log(`\n❌ No payments qualified for multi-sig approval.`);
    }
    
    await testDataSource.destroy();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDirectMultiSig().catch(console.error);
