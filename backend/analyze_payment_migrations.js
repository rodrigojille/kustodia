// Payment Migration Analysis Script
// Analyzes current payment statuses and identifies migration needs

const { AppDataSource } = require('./dist/ormconfig');
const { Payment } = require('./dist/entities/Payment');
const { Escrow } = require('./dist/entities/Escrow');
const { PaymentEvent } = require('./dist/entities/PaymentEvent');

async function analyzePaymentMigrations() {
  console.log('🔍 PAYMENT MIGRATION ANALYSIS');
  console.log('=' .repeat(80));

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const paymentRepo = AppDataSource.getRepository(Payment);
    const escrowRepo = AppDataSource.getRepository(Escrow);
    const eventRepo = AppDataSource.getRepository(PaymentEvent);

    // 1. Analyze Payment 112
    console.log('\n📋 PAYMENT 112 ANALYSIS:');
    const payment112 = await paymentRepo.findOne({
      where: { id: 112 },
      relations: ['escrow']
    });

    if (payment112) {
      console.log(`   Status: ${payment112.status}`);
      console.log(`   Amount: $${payment112.amount}`);
      console.log(`   Type: ${payment112.payment_type || 'traditional'}`);
      console.log(`   Payer Approval: ${payment112.payer_approval ? 'YES' : 'NO'}`);
      console.log(`   Payee Approval: ${payment112.payee_approval ? 'YES' : 'NO'}`);
      
      if (payment112.escrow) {
        console.log(`   Escrow Status: ${payment112.escrow.status}`);
        console.log(`   Release TX: ${payment112.escrow.release_tx_hash || 'None'}`);
        console.log(`   Smart Contract ID: ${payment112.escrow.smart_contract_escrow_id || 'None'}`);
      }

      // Get recent events
      const events112 = await eventRepo.find({
        where: { paymentId: 112 },
        order: { created_at: 'DESC' },
        take: 5
      });
      console.log(`   Recent Events (${events112.length}):`);
      events112.forEach(event => {
        console.log(`     ${event.created_at.toISOString().split('T')[0]} - ${event.type}: ${event.description}`);
      });
    } else {
      console.log('   ❌ Payment 112 not found');
    }

    // 2. Analyze Payment 113
    console.log('\n📋 PAYMENT 113 ANALYSIS:');
    const payment113 = await paymentRepo.findOne({
      where: { id: 113 },
      relations: ['escrow']
    });

    if (payment113) {
      console.log(`   Status: ${payment113.status}`);
      console.log(`   Amount: $${payment113.amount}`);
      console.log(`   Type: ${payment113.payment_type || 'traditional'}`);
      console.log(`   Payer Approval: ${payment113.payer_approval ? 'YES' : 'NO'}`);
      console.log(`   Payee Approval: ${payment113.payee_approval ? 'YES' : 'NO'}`);
      
      if (payment113.escrow) {
        console.log(`   Escrow Status: ${payment113.escrow.status}`);
        console.log(`   Release TX: ${payment113.escrow.release_tx_hash || 'None'}`);
        console.log(`   Smart Contract ID: ${payment113.escrow.smart_contract_escrow_id || 'None'}`);
      }

      // Get recent events
      const events113 = await eventRepo.find({
        where: { paymentId: 113 },
        order: { created_at: 'DESC' },
        take: 5
      });
      console.log(`   Recent Events (${events113.length}):`);
      events113.forEach(event => {
        console.log(`     ${event.created_at.toISOString().split('T')[0]} - ${event.type}: ${event.description}`);
      });
    } else {
      console.log('   ❌ Payment 113 not found');
    }

    // 3. Find other problematic payments
    console.log('\n🔍 SCANNING FOR OTHER PROBLEMATIC PAYMENTS:');
    
    // Find payments with released escrows but not completed status
    const releasedButNotCompleted = await paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.escrow', 'escrow')
      .where('escrow.release_tx_hash IS NOT NULL')
      .andWhere('payment.status != :status', { status: 'completed' })
      .getMany();

    console.log(`   Found ${releasedButNotCompleted.length} payments with released escrows but not completed status:`);
    releasedButNotCompleted.forEach(payment => {
      console.log(`     Payment ${payment.id}: Status '${payment.status}', Escrow released: ${payment.escrow?.release_tx_hash ? 'YES' : 'NO'}`);
    });

    // Find payments in 'processing' status for too long
    const stuckProcessing = await paymentRepo
      .createQueryBuilder('payment')
      .where('payment.status = :status', { status: 'processing' })
      .andWhere('payment.updated_at < :cutoff', { 
        cutoff: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      })
      .getMany();

    console.log(`   Found ${stuckProcessing.length} payments stuck in 'processing' for >24h:`);
    stuckProcessing.forEach(payment => {
      console.log(`     Payment ${payment.id}: Status '${payment.status}', Last updated: ${payment.updated_at}`);
    });

    // Find payments with both approvals but not released
    const approvedButNotReleased = await paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.escrow', 'escrow')
      .where('payment.payer_approval = true')
      .andWhere('payment.payee_approval = true')
      .andWhere('payment.payment_type = :type', { type: 'nuevo_flujo' })
      .andWhere('escrow.release_tx_hash IS NULL')
      .getMany();

    console.log(`   Found ${approvedButNotReleased.length} nuevo_flujo payments with both approvals but not released:`);
    approvedButNotReleased.forEach(payment => {
      console.log(`     Payment ${payment.id}: Both approved, but no release TX`);
    });

    // 4. Generate migration recommendations
    console.log('\n📝 MIGRATION RECOMMENDATIONS:');
    
    const migrations = [];

    // Payment 112 migration
    if (payment112) {
      if (payment112.status === 'processing' && payment112.escrow?.release_tx_hash) {
        migrations.push({
          paymentId: 112,
          currentStatus: payment112.status,
          recommendedStatus: 'completed',
          reason: 'Escrow released but payment still processing',
          action: 'Update status to completed'
        });
      }
    }

    // Payment 113 migration
    if (payment113) {
      if (payment113.status === 'processing' && payment113.escrow?.release_tx_hash) {
        migrations.push({
          paymentId: 113,
          currentStatus: payment113.status,
          recommendedStatus: 'completed',
          reason: 'Escrow released but payment still processing',
          action: 'Update status to completed'
        });
      }
    }

    // Other payments
    releasedButNotCompleted.forEach(payment => {
      if (payment.id !== 112 && payment.id !== 113) {
        migrations.push({
          paymentId: payment.id,
          currentStatus: payment.status,
          recommendedStatus: 'completed',
          reason: 'Escrow released but payment not completed',
          action: 'Update status to completed'
        });
      }
    });

    stuckProcessing.forEach(payment => {
      migrations.push({
        paymentId: payment.id,
        currentStatus: payment.status,
        recommendedStatus: 'failed',
        reason: 'Stuck in processing for >24h',
        action: 'Investigate and update status'
      });
    });

    console.log(`\n   Total migrations needed: ${migrations.length}`);
    migrations.forEach((migration, index) => {
      console.log(`   ${index + 1}. Payment ${migration.paymentId}:`);
      console.log(`      Current: ${migration.currentStatus} → Recommended: ${migration.recommendedStatus}`);
      console.log(`      Reason: ${migration.reason}`);
      console.log(`      Action: ${migration.action}`);
    });

    console.log('\n✅ Analysis complete');
    return migrations;

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run analysis
analyzePaymentMigrations().catch(console.error);
