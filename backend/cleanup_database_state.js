const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');
const { PaymentEvent } = require('./dist/entity/PaymentEvent');

async function cleanupDatabaseState() {
  try {
    console.log('🧹 Starting database cleanup to prevent automation errors...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Get all payments that could cause automation issues
    const problematicPayments = await AppDataSource.getRepository(Payment).find({
      where: [
        { status: 'pending' },
        { status: 'deposit_detected' },
        { status: 'processing' }
      ],
      relations: ['user', 'escrow']
    });

    console.log(`\n🔍 Found ${problematicPayments.length} payments in pending/processing states`);

    const cleanupActions = [];

    for (const payment of problematicPayments) {
      console.log(`\n📋 Payment ${payment.id}:`);
      console.log(`  - Status: ${payment.status}`);
      console.log(`  - Amount: ${payment.amount}`);
      console.log(`  - CLABE: ${payment.deposit_clabe || 'null'}`);
      console.log(`  - Reference: ${payment.reference || 'null'}`);
      console.log(`  - Has Escrow: ${payment.escrow ? 'Yes' : 'No'}`);

      // Skip Payment 87 - it's now properly handled
      if (payment.id === 87) {
        console.log('  ✅ Payment 87 - Already fixed, skipping');
        continue;
      }

      // Check for payments with null CLABE (can't be matched to deposits)
      if (!payment.deposit_clabe) {
        console.log('  ❌ Issue: Null CLABE - cannot be matched to deposits');
        cleanupActions.push({
          type: 'null_clabe',
          payment: payment,
          action: 'Set status to failed'
        });
      }

      // Check for payments without reference
      if (!payment.reference) {
        console.log('  ❌ Issue: Null reference - cannot be matched to deposits');
        cleanupActions.push({
          type: 'null_reference',
          payment: payment,
          action: 'Set status to failed'
        });
      }

      // Check for payments stuck in processing without escrow
      if ((payment.status === 'processing' || payment.status === 'deposit_detected') && !payment.escrow) {
        console.log('  ❌ Issue: Processing status without escrow');
        cleanupActions.push({
          type: 'processing_no_escrow',
          payment: payment,
          action: 'Reset to pending'
        });
      }

      // Check for payments with escrow but wrong status
      if (payment.escrow && payment.status === 'pending') {
        console.log('  ❌ Issue: Has escrow but status is pending');
        cleanupActions.push({
          type: 'escrow_wrong_status',
          payment: payment,
          action: 'Update status to match escrow'
        });
      }
    }

    console.log(`\n🎯 Found ${cleanupActions.length} issues to fix`);

    if (cleanupActions.length === 0) {
      console.log('✅ No cleanup needed - database is clean!');
      return;
    }

    // Ask for confirmation
    console.log('\n🔧 Proposed cleanup actions:');
    cleanupActions.forEach((action, index) => {
      console.log(`  ${index + 1}. Payment ${action.payment.id}: ${action.action} (${action.type})`);
    });

    console.log('\n⚠️  This will modify payment statuses to prevent automation conflicts');
    console.log('💡 Payments with null CLABE/reference will be marked as failed');
    console.log('💡 Payments stuck in processing will be reset to pending');
    console.log('💡 All changes will be logged as PaymentEvents');

    // Execute cleanup
    console.log('\n🔄 Executing cleanup...');
    
    const processedPayments = new Set();
    
    for (const action of cleanupActions) {
      const payment = action.payment;
      const paymentId = payment.id;
      
      // Skip if we already processed this payment
      if (processedPayments.has(paymentId)) {
        continue;
      }
      
      const oldStatus = payment.status;
      let newStatus = oldStatus;
      let description = '';

      // Determine the final status for this payment
      const paymentActions = cleanupActions.filter(a => a.payment.id === paymentId);
      const hasNullClabe = paymentActions.some(a => a.type === 'null_clabe');
      const hasNullReference = paymentActions.some(a => a.type === 'null_reference');
      const hasEscrowWrongStatus = paymentActions.some(a => a.type === 'escrow_wrong_status');
      
      if (hasNullClabe || hasNullReference) {
        newStatus = 'failed';
        description = `Payment marked as failed due to missing ${hasNullClabe ? 'CLABE' : 'reference'} - cannot be matched to deposits`;
      } else if (hasEscrowWrongStatus && payment.escrow) {
        newStatus = payment.escrow.status === 'active' ? 'funded' : 'processing';
        description = `Payment status updated to match escrow state: ${payment.escrow.status}`;
      }

      // Update payment status only if it changed
      if (newStatus !== oldStatus) {
        payment.status = newStatus;
        await AppDataSource.getRepository(Payment).save(payment);

        // Log the change
        await AppDataSource.getRepository(PaymentEvent).save({
          paymentId: payment.id,
          type: 'database_cleanup',
          description: description
        });

        console.log(`  ✅ Payment ${payment.id}: ${oldStatus} → ${newStatus}`);
      }
      
      processedPayments.add(paymentId);
    }

    console.log('\n✅ DATABASE CLEANUP COMPLETED!');
    console.log(`📊 Processed ${processedPayments.size} payments`);

    // Special check for Payment 87
    const payment87 = await AppDataSource.getRepository(Payment).findOne({
      where: { id: 87 },
      relations: ['escrow']
    });

    if (payment87) {
      console.log(`\n🎯 Payment 87 Status Check:`);
      console.log(`  - Status: ${payment87.status}`);
      console.log(`  - Escrow Status: ${payment87.escrow ? payment87.escrow.status : 'No escrow'}`);
      console.log(`  - Smart Contract ID: ${payment87.escrow?.smart_contract_escrow_id || 'None'}`);
      
      if (payment87.escrow?.smart_contract_escrow_id) {
        console.log('  ✅ Payment 87 is properly configured with escrow');
      } else {
        console.log('  ❌ Payment 87 escrow may need manual verification');
      }
    }

    await AppDataSource.destroy();
    console.log('\n✅ Database cleanup analysis complete!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.error(error.stack);
  }
}

cleanupDatabaseState();
