const { AppDataSource } = require('./src/data-source');

async function monitorPayment113() {
  // Initialize TypeORM connection
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('✅ Database connection initialized');
  }

  console.log('🔍 MONITORING PAYMENT 113 - Real-time Status');
  console.log('=' .repeat(80));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log('=' .repeat(80));

  let previousStatus = null;
  let previousEscrowStatus = null;
  let previousApprovals = { payer: null, payee: null };

  const checkStatus = async () => {
    try {
      // Get payment and escrow details using TypeORM
      const payments = await AppDataSource.query(`
        SELECT p.id, p.amount, p.status, p.payer_approval, p.payee_approval, 
               p.payer_approval_timestamp, p.payee_approval_timestamp,
               p.deposit_clabe, p.reference, p.payment_type, p.created_at,
               e.id as escrow_id, e.status as escrow_status, e.release_tx_hash,
               e.custody_end, e.custody_amount, e.smart_contract_escrow_id,
               e.blockchain_tx_hash
        FROM payment p 
        LEFT JOIN escrow e ON p.escrow_id = e.id 
        WHERE p.id = 113
      `);

      if (payments.length === 0) {
        console.log('❌ Payment 113 not found!');
        return;
      }

      const payment = payments[0];
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];

      // Check for changes
      let hasChanges = false;
      let changes = [];

      if (payment.status !== previousStatus) {
        changes.push(`Status: ${previousStatus} → ${payment.status}`);
        hasChanges = true;
      }

      if (payment.escrow_status !== previousEscrowStatus) {
        changes.push(`Escrow: ${previousEscrowStatus} → ${payment.escrow_status}`);
        hasChanges = true;
      }

      if (payment.payer_approval !== previousApprovals.payer) {
        changes.push(`Payer Approval: ${previousApprovals.payer} → ${payment.payer_approval}`);
        hasChanges = true;
      }

      if (payment.payee_approval !== previousApprovals.payee) {
        changes.push(`Payee Approval: ${previousApprovals.payee} → ${payment.payee_approval}`);
        hasChanges = true;
      }

      // Display current status
      if (hasChanges || previousStatus === null) {
        console.log(`\n[${timestamp}] 📊 PAYMENT 113 STATUS UPDATE`);
        
        if (changes.length > 0) {
          console.log('🔄 CHANGES:', changes.join(' | '));
        }

        console.log(`💰 Amount: $${payment.amount} MXN`);
        console.log(`📋 Payment Status: ${payment.status}`);
        console.log(`🔒 Escrow Status: ${payment.escrow_status || 'No escrow'}`);
        console.log(`✅ Payer Approval: ${payment.payer_approval ? '✅ YES' : '❌ NO'} ${payment.payer_approval_timestamp ? `(${new Date(payment.payer_approval_timestamp).toLocaleString()})` : ''}`);
        console.log(`✅ Payee Approval: ${payment.payee_approval ? '✅ YES' : '❌ NO'} ${payment.payee_approval_timestamp ? `(${new Date(payment.payee_approval_timestamp).toLocaleString()})` : ''}`);
        
        if (payment.escrow_id) {
          console.log(`🏦 Escrow ID: ${payment.escrow_id}`);
          console.log(`💎 Custody Amount: $${payment.custody_amount || 'N/A'}`);
          console.log(`⏰ Custody End: ${payment.custody_end ? new Date(payment.custody_end).toLocaleString() : 'N/A'}`);
          console.log(`🔗 Smart Contract ID: ${payment.smart_contract_escrow_id || 'Not created'}`);
          console.log(`📝 Blockchain TX: ${payment.blockchain_tx_hash || 'None'}`);
          console.log(`🔓 Release TX: ${payment.release_tx_hash || 'Not released'}`);
        }

        // Check automation conditions
        const bothApproved = payment.payer_approval && payment.payee_approval;
        const canAutoRelease = bothApproved && payment.payment_type === 'nuevo_flujo';
        
        console.log(`\n🤖 AUTOMATION STATUS:`);
        console.log(`   Both Approved: ${bothApproved ? '✅ YES' : '❌ NO'}`);
        console.log(`   Payment Type: ${payment.payment_type}`);
        console.log(`   Auto-Release Ready: ${canAutoRelease ? '✅ YES - Will trigger on next automation cycle' : '❌ NO'}`);

        if (payment.release_tx_hash) {
          console.log(`\n🎉 PAYMENT RELEASED! TX: ${payment.release_tx_hash}`);
        }

        console.log('-'.repeat(80));
      }

      // Update previous values
      previousStatus = payment.status;
      previousEscrowStatus = payment.escrow_status;
      previousApprovals = { 
        payer: payment.payer_approval, 
        payee: payment.payee_approval 
      };

      // Get recent events
      const events = await AppDataSource.query(`
        SELECT type, description, created_at 
        FROM payment_event 
        WHERE payment_id = 113 
        ORDER BY created_at DESC 
        LIMIT 5
      `);

      if (events.length > 0 && hasChanges) {
        console.log(`📋 Recent Events:`);
        events.forEach(event => {
          console.log(`   ${new Date(event.created_at).toLocaleString()} - ${event.type}: ${event.description || 'N/A'}`);
        });
      }

    } catch (error) {
      console.error(`❌ Error checking status:`, error.message);
    }
  };

  // Initial check
  await checkStatus();

  // Monitor every 5 seconds
  const interval = setInterval(checkStatus, 5000);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Monitoring stopped by user');
    clearInterval(interval);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  });

  console.log('\n⏱️  Monitoring every 5 seconds... Press Ctrl+C to stop\n');
}

// Start monitoring
monitorPayment113().catch(console.error);
