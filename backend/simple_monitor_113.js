// Simple Payment 113 Monitor - No dependencies needed
const { spawn } = require('child_process');

async function monitorPayment113() {
  console.log('🔍 MONITORING PAYMENT 113 - Real-time Status');
  console.log('=' .repeat(80));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log('=' .repeat(80));

  let previousData = null;

  const checkStatus = async () => {
    return new Promise((resolve) => {
      const query = `
        SELECT p.id, p.amount, p.status, p.payer_approval, p.payee_approval, 
               p.payer_approval_timestamp, p.payee_approval_timestamp,
               p.payment_type, p.created_at,
               e.id as escrow_id, e.status as escrow_status, e.release_tx_hash,
               e.custody_end, e.custody_amount, e.smart_contract_escrow_id
        FROM payment p 
        LEFT JOIN escrow e ON p.escrow_id = e.id 
        WHERE p.id = 113;
      `;

      // Use mysql command line to query
      const mysql = spawn('mysql', [
        '-h', 'localhost',
        '-u', 'root',
        '-p140290',
        'kustodia_db',
        '-e', query,
        '--batch',
        '--raw'
      ]);

      let output = '';
      let error = '';

      mysql.stdout.on('data', (data) => {
        output += data.toString();
      });

      mysql.stderr.on('data', (data) => {
        error += data.toString();
      });

      mysql.on('close', (code) => {
        if (code === 0 && output) {
          const lines = output.trim().split('\n');
          if (lines.length > 1) {
            const headers = lines[0].split('\t');
            const values = lines[1].split('\t');
            
            const payment = {};
            headers.forEach((header, index) => {
              payment[header] = values[index] === 'NULL' ? null : values[index];
            });

            resolve(payment);
          } else {
            resolve(null);
          }
        } else {
          console.error('❌ MySQL Error:', error);
          resolve(null);
        }
      });
    });
  };

  const displayStatus = (payment) => {
    if (!payment) {
      console.log('❌ Payment 113 not found!');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    
    // Check for changes
    const currentData = JSON.stringify(payment);
    if (currentData === previousData) {
      return; // No changes
    }

    console.log(`\n[${timestamp}] 📊 PAYMENT 113 STATUS UPDATE`);
    console.log(`💰 Amount: $${payment.amount} MXN`);
    console.log(`📋 Payment Status: ${payment.status}`);
    console.log(`🔒 Escrow Status: ${payment.escrow_status || 'No escrow'}`);
    console.log(`✅ Payer Approval: ${payment.payer_approval === '1' ? '✅ YES' : '❌ NO'} ${payment.payer_approval_timestamp ? `(${new Date(payment.payer_approval_timestamp).toLocaleString()})` : ''}`);
    console.log(`✅ Payee Approval: ${payment.payee_approval === '1' ? '✅ YES' : '❌ NO'} ${payment.payee_approval_timestamp ? `(${new Date(payment.payee_approval_timestamp).toLocaleString()})` : ''}`);
    
    if (payment.escrow_id) {
      console.log(`🏦 Escrow ID: ${payment.escrow_id}`);
      console.log(`💎 Custody Amount: $${payment.custody_amount || 'N/A'}`);
      console.log(`⏰ Custody End: ${payment.custody_end ? new Date(payment.custody_end).toLocaleString() : 'N/A'}`);
      console.log(`🔗 Smart Contract ID: ${payment.smart_contract_escrow_id || 'Not created'}`);
      console.log(`🔓 Release TX: ${payment.release_tx_hash || 'Not released'}`);
    }

    // Check automation conditions
    const bothApproved = payment.payer_approval === '1' && payment.payee_approval === '1';
    const canAutoRelease = bothApproved && payment.payment_type === 'nuevo_flujo';
    
    console.log(`\n🤖 AUTOMATION STATUS:`);
    console.log(`   Both Approved: ${bothApproved ? '✅ YES' : '❌ NO'}`);
    console.log(`   Payment Type: ${payment.payment_type}`);
    console.log(`   Auto-Release Ready: ${canAutoRelease ? '✅ YES - Will trigger on next automation cycle' : '❌ NO'}`);

    if (payment.release_tx_hash && payment.release_tx_hash !== 'NULL') {
      console.log(`\n🎉 PAYMENT RELEASED! TX: ${payment.release_tx_hash}`);
    }

    console.log('-'.repeat(80));
    previousData = currentData;
  };

  // Initial check
  const initialPayment = await checkStatus();
  displayStatus(initialPayment);

  // Monitor every 5 seconds
  const interval = setInterval(async () => {
    const payment = await checkStatus();
    displayStatus(payment);
  }, 5000);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Monitoring stopped by user');
    clearInterval(interval);
    process.exit(0);
  });

  console.log('\n⏱️  Monitoring every 5 seconds... Press Ctrl+C to stop\n');
}

// Start monitoring
monitorPayment113().catch(console.error);
