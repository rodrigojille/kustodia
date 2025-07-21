// Payment 113 Monitor using API calls
const http = require('http');

async function monitorPayment113() {
  console.log('🔍 MONITORING PAYMENT 113 via API - Real-time Status');
  console.log('=' .repeat(80));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log('=' .repeat(80));

  let previousData = null;

  const makeRequest = (path) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 4000,
        path: path,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  };

  const checkStatus = async () => {
    try {
      // Get payment details
      const payment = await makeRequest('/api/payments/113');
      
      // Get payment events
      let events = [];
      try {
        events = await makeRequest('/api/payments/113/events');
      } catch (error) {
        console.log('⚠️  Could not fetch events:', error.message);
      }

      return { payment, events };
    } catch (error) {
      console.error('❌ API Error:', error.message);
      return null;
    }
  };

  const displayStatus = (data) => {
    if (!data || !data.payment) {
      console.log('❌ Could not fetch Payment 113 data!');
      return;
    }

    const { payment, events } = data;
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    
    // Check for changes
    const currentData = JSON.stringify(payment);
    if (currentData === previousData) {
      return; // No changes
    }

    console.log(`\n[${timestamp}] 📊 PAYMENT 113 STATUS UPDATE`);
    console.log(`💰 Amount: $${payment.amount} ${payment.currency || 'MXN'}`);
    console.log(`📋 Payment Status: ${payment.status}`);
    console.log(`🔒 Escrow Status: ${payment.escrow?.status || 'No escrow'}`);
    console.log(`✅ Payer Approval: ${payment.payer_approval ? '✅ YES' : '❌ NO'} ${payment.payer_approval_timestamp ? `(${new Date(payment.payer_approval_timestamp).toLocaleString()})` : ''}`);
    console.log(`✅ Payee Approval: ${payment.payee_approval ? '✅ YES' : '❌ NO'} ${payment.payee_approval_timestamp ? `(${new Date(payment.payee_approval_timestamp).toLocaleString()})` : ''}`);
    
    if (payment.escrow) {
      console.log(`🏦 Escrow ID: ${payment.escrow.id || 'N/A'}`);
      console.log(`💎 Custody Amount: $${payment.escrow.custody_amount || 'N/A'}`);
      console.log(`⏰ Custody End: ${payment.escrow.custody_end ? new Date(payment.escrow.custody_end).toLocaleString() : 'N/A'}`);
      console.log(`🔗 Smart Contract ID: ${payment.escrow.smart_contract_escrow_id || 'Not created'}`);
      console.log(`🔓 Release TX: ${payment.escrow.release_tx_hash || 'Not released'}`);
    }

    // Check automation conditions
    const bothApproved = payment.payer_approval && payment.payee_approval;
    const canAutoRelease = bothApproved && payment.payment_type === 'nuevo_flujo';
    
    console.log(`\n🤖 AUTOMATION STATUS:`);
    console.log(`   Both Approved: ${bothApproved ? '✅ YES' : '❌ NO'}`);
    console.log(`   Payment Type: ${payment.payment_type || 'N/A'}`);
    console.log(`   Auto-Release Ready: ${canAutoRelease ? '✅ YES - Will trigger on next automation cycle' : '❌ NO'}`);

    if (payment.escrow?.release_tx_hash) {
      console.log(`\n🎉 PAYMENT RELEASED! TX: ${payment.escrow.release_tx_hash}`);
    }

    // Show recent events if available
    if (events && events.length > 0) {
      console.log(`\n📋 Recent Events (${events.length}):`);
      events.slice(0, 3).forEach(event => {
        console.log(`   ${new Date(event.created_at).toLocaleString()} - ${event.type}: ${event.description || 'N/A'}`);
      });
    }

    console.log('-'.repeat(80));
    previousData = currentData;
  };

  // Initial check
  console.log('🔄 Fetching initial status...');
  const initialData = await checkStatus();
  displayStatus(initialData);

  // Monitor every 5 seconds
  const interval = setInterval(async () => {
    const data = await checkStatus();
    displayStatus(data);
  }, 5000);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Monitoring stopped by user');
    clearInterval(interval);
    process.exit(0);
  });

  console.log('\n⏱️  Monitoring every 5 seconds... Press Ctrl+C to stop');
  console.log('💡 Now go to the frontend and approve Payment 113!\n');
}

// Start monitoring
monitorPayment113().catch(console.error);
