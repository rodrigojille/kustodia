require('dotenv').config();
const { MultiSigApprovalService } = require('../dist/services/MultiSigApprovalService');

async function testMultiSigAPI() {
  console.log('🔍 Testing Multi-Sig API Service...');
  
  try {
    const multiSigService = new MultiSigApprovalService();
    
    console.log('\n📡 Testing getUpcomingMultiSigPayments method...');
    
    // This is the method called by the API endpoint
    const upcomingPayments = await multiSigService.getUpcomingMultiSigPayments();
    
    console.log(`\n📊 Results:`);
    console.log(`  Found ${upcomingPayments.length} upcoming multi-sig payments`);
    
    if (upcomingPayments.length === 0) {
      console.log('\n❌ No upcoming payments found!');
      console.log('🔍 This explains why Payment 140 is not showing in the dashboard.');
      console.log('\n🛠️ Debugging the getUpcomingMultiSigPayments method...');
      
      // Let's debug step by step
      console.log('\n1️⃣ Checking for escrowed payments in database...');
      
      // We'll need to manually check the database and routing
      const { DataSource } = require('typeorm');
      const testDataSource = new DataSource({
        type: "postgres",
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT) || 5432,
        username: process.env.POSTGRES_USER || 'postgres',
        password: String(process.env.POSTGRES_PASSWORD || '140290'),
        database: process.env.POSTGRES_DB || 'kustodia',
        synchronize: false,
        logging: false,
        entities: []
      });
      
      await testDataSource.initialize();
      
      // Check escrowed payments
      const escrowedPayments = await testDataSource.query(`
        SELECT p.id, p.amount, p.status, p.description, p.payer_email, p.recipient_email, p.created_at,
               e.id as escrow_id, e.custody_end as escrow_end_time
        FROM payment p
        LEFT JOIN escrow e ON p.id = e.payment_id
        WHERE p.status = 'escrowed'
        ORDER BY p.id
      `);
      
      console.log(`   Found ${escrowedPayments.length} escrowed payments:`);
      escrowedPayments.forEach(payment => {
        console.log(`   - Payment ${payment.id}: $${Number(payment.amount).toLocaleString()} MXN, Escrow: ${payment.escrow_id || 'NONE'}`);
      });
      
      // Check specifically for payment 140
      const payment140 = escrowedPayments.find(p => p.id === 140);
      if (payment140) {
        console.log(`\n2️⃣ Payment 140 found in escrowed payments:`);
        console.log(`   - Has escrow: ${payment140.escrow_id ? 'YES' : 'NO'}`);
        if (payment140.escrow_id) {
          console.log(`   - Escrow ID: ${payment140.escrow_id}`);
          console.log(`   - Escrow end time: ${new Date(payment140.escrow_end_time).toLocaleString()}`);
          
          // Test routing for this payment
          console.log(`\n3️⃣ Testing routing for Payment 140...`);
          const { TransactionRouterService } = require('../dist/services/TransactionRouterService');
          const router = new TransactionRouterService();
          
          const routingDecision = await router.routeTransaction({
            amount: Number(payment140.amount),
            type: 'escrow_release',
            paymentId: payment140.id,
            description: `Release escrow for payment ${payment140.id}`
          });
          
          console.log(`   - Requires approval: ${routingDecision.requiresApproval}`);
          console.log(`   - Type: ${routingDecision.type}`);
          console.log(`   - Qualifies for multi-sig: ${routingDecision.requiresApproval && routingDecision.type === 'multi_sig'}`);
          
          if (routingDecision.requiresApproval && routingDecision.type === 'multi_sig') {
            console.log(`\n✅ Payment 140 should qualify! There might be an issue in the getUpcomingMultiSigPayments method.`);
          } else {
            console.log(`\n❌ Payment 140 doesn't qualify for multi-sig according to routing.`);
          }
        } else {
          console.log(`\n❌ Payment 140 has no escrow record - this is the problem!`);
        }
      } else {
        console.log(`\n❌ Payment 140 not found in escrowed payments!`);
      }
      
      await testDataSource.destroy();
      
    } else {
      console.log('\n✅ Found upcoming payments:');
      upcomingPayments.forEach((payment, index) => {
        console.log(`\n${index + 1}. Payment ${payment.paymentId}:`);
        console.log(`   Amount: $${payment.amount.toLocaleString()} ${payment.currency} ($${payment.amountUsd.toLocaleString()} USD)`);
        console.log(`   Description: ${payment.description}`);
        console.log(`   Payer: ${payment.payerEmail}`);
        console.log(`   Payee: ${payment.payeeEmail}`);
        console.log(`   Escrow End: ${new Date(payment.escrowEndTime).toLocaleString()}`);
        console.log(`   Hours until release: ${payment.hoursUntilRelease}`);
        console.log(`   Target wallet: ${payment.targetWallet}`);
      });
      
      // Check if payment 140 is in the list
      const payment140 = upcomingPayments.find(p => p.paymentId === 140);
      if (payment140) {
        console.log(`\n🎯 Payment 140 IS in the upcoming payments list!`);
      } else {
        console.log(`\n❌ Payment 140 is NOT in the upcoming payments list.`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testMultiSigAPI().catch(console.error);
