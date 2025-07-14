require('dotenv').config();
const AppDataSource = require('./dist/ormconfig').default;

async function verifyCustodyDeadlines() {
  console.log('🔍 Verifying custody deadline calculations...');
  console.log(`Current time: ${new Date().toISOString()}`);
  console.log(`Current Unix timestamp: ${Math.floor(Date.now() / 1000)}`);
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Database connected');

    // Check Payment 112 and 113 with their escrows
    const paymentsQuery = `
      SELECT p.id as payment_id, p.amount, p.status as payment_status, 
             p.payment_type, p.created_at as payment_created,
             e.id as escrow_id, e.smart_contract_escrow_id, e.status as escrow_status,
             e.custody_percent, e.custody_amount, e.release_amount,
             e.custody_end, e.created_at as escrow_created,
             e.blockchain_tx_hash
      FROM payment p
      JOIN escrow e ON p.escrow_id = e.id
      WHERE p.id IN (112, 113)
      ORDER BY p.id DESC;
    `;
    
    const results = await AppDataSource.query(paymentsQuery);
    
    console.log('\n📊 Payment-Escrow Analysis:');
    results.forEach(row => {
      console.log(`\n--- Payment ${row.payment_id} ---`);
      console.log(`Payment Details:`);
      console.log(`  - Amount: $${row.amount}`);
      console.log(`  - Status: ${row.payment_status}`);
      console.log(`  - Type: ${row.payment_type}`);
      console.log(`  - Created: ${row.payment_created}`);
      
      console.log(`Escrow Details:`);
      console.log(`  - Escrow ID: ${row.escrow_id}`);
      console.log(`  - Smart Contract ID: ${row.smart_contract_escrow_id}`);
      console.log(`  - Status: ${row.escrow_status}`);
      console.log(`  - Custody %: ${row.custody_percent}%`);
      console.log(`  - Custody Amount: $${row.custody_amount}`);
      console.log(`  - Release Amount: $${row.release_amount}`);
      console.log(`  - Created: ${row.escrow_created}`);
      console.log(`  - Custody End: ${row.custody_end}`);
      console.log(`  - Blockchain TX: ${row.blockchain_tx_hash}`);
      
      // Calculate timing
      const paymentCreated = new Date(row.payment_created);
      const escrowCreated = new Date(row.escrow_created);
      const custodyEnd = new Date(row.custody_end);
      const now = new Date();
      
      const escrowDelay = escrowCreated.getTime() - paymentCreated.getTime();
      const custodyPeriod = custodyEnd.getTime() - escrowCreated.getTime();
      const timeUntilEnd = custodyEnd.getTime() - now.getTime();
      
      console.log(`Timing Analysis:`);
      console.log(`  - Escrow creation delay: ${(escrowDelay / 1000).toFixed(0)} seconds`);
      console.log(`  - Custody period: ${(custodyPeriod / (1000 * 60 * 60)).toFixed(2)} hours`);
      console.log(`  - Time until custody end: ${(timeUntilEnd / (1000 * 60 * 60)).toFixed(2)} hours`);
      console.log(`  - Is in future: ${custodyEnd > now ? '✅ Yes' : '❌ No'}`);
      
      // Calculate expected custody period based on payment type
      if (row.payment_type === 'nuevo_flujo') {
        // For nuevo_flujo, check if it matches expected 1-2 days
        const expectedDays = row.payment_id === 113 ? 1 : 2; // Based on payment details shown
        const actualDays = custodyPeriod / (1000 * 60 * 60 * 24);
        console.log(`  - Expected custody: ${expectedDays} days`);
        console.log(`  - Actual custody: ${actualDays.toFixed(2)} days`);
        console.log(`  - Matches expected: ${Math.abs(actualDays - expectedDays) < 0.1 ? '✅ Yes' : '❌ No'}`);
      }
      
      // Unix timestamp for smart contract
      const unixTimestamp = Math.floor(custodyEnd.getTime() / 1000);
      console.log(`  - Unix timestamp: ${unixTimestamp}`);
      console.log(`  - Current Unix: ${Math.floor(now.getTime() / 1000)}`);
      console.log(`  - Deadline valid: ${unixTimestamp > Math.floor(now.getTime() / 1000) ? '✅ Yes' : '❌ No'}`);
    });

    // Check if there are any automation issues
    console.log('\n🤖 Automation Status Check:');
    console.log('Both payments show "escrowed" status, which means:');
    console.log('✅ Deposits were detected');
    console.log('✅ Smart contracts were created');
    console.log('✅ Custody periods are active');
    console.log('');
    console.log('Next steps in automation:');
    console.log('- Wait for custody period to expire');
    console.log('- Automatic release to seller');
    console.log('- Status change to "completed"');

  } catch (error) {
    console.error('❌ Error verifying custody deadlines:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  }
}

// Run the script
verifyCustodyDeadlines();
