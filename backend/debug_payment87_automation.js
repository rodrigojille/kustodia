/**
 * 🔍 PAYMENT 87 AUTOMATION DEBUG SCRIPT
 * 
 * Purpose: Systematically debug why Payment 87 automation isn't processing
 * the available Juno deposit and document all findings.
 */

const { listJunoTransactions } = require('./dist/services/junoService');
const ormconfig = require('./dist/ormconfig').default;

async function debugPayment87() {
  console.log('🔍 PAYMENT 87 AUTOMATION DEBUG');
  console.log('═'.repeat(50));
  
  try {
    await ormconfig.initialize();
    
    // STEP 1: Check payment status and automation criteria
    console.log('\n📋 STEP 1: Payment Database Status');
    console.log('-'.repeat(30));
    
    const payment = await ormconfig.query(`
      SELECT id, amount, deposit_clabe, reference, status, transaction_id, created_at 
      FROM payment WHERE id = 87
    `);
    
    if (payment.length === 0) {
      console.log('❌ Payment 87 not found in database');
      return;
    }
    
    const p = payment[0];
    console.log(`Payment ID: ${p.id}`);
    console.log(`Amount: ${p.amount} MXN`);
    console.log(`Status: ${p.status}`);
    console.log(`CLABE: ${p.deposit_clabe}`);
    console.log(`Reference: ${p.reference || 'NULL'}`);
    console.log(`Transaction ID: ${p.transaction_id || 'NULL'}`);
    console.log(`Created: ${p.created_at}`);
    
    // Check automation criteria
    const shouldProcessAutomation = p.status === 'pending' && !p.reference && p.deposit_clabe;
    console.log(`\n✅ Automation Criteria Check:`);
    console.log(`  Status = 'pending': ${p.status === 'pending' ? '✅' : '❌'} (${p.status})`);
    console.log(`  Reference is null: ${!p.reference ? '✅' : '❌'} (${p.reference || 'NULL'})`);
    console.log(`  CLABE assigned: ${p.deposit_clabe ? '✅' : '❌'} (${p.deposit_clabe || 'NULL'})`);
    console.log(`  Should process: ${shouldProcessAutomation ? '✅ YES' : '❌ NO'}`);
    
    // STEP 2: Check Juno deposits via our service
    console.log('\n📡 STEP 2: Juno Deposits via PaymentAutomationService');
    console.log('-'.repeat(50));
    
    try {
      const junoTransactions = await listJunoTransactions();
      console.log(`Total deposits returned: ${junoTransactions.length}`);
      
      if (junoTransactions.length > 0) {
        console.log('\n🔍 Sample deposit structure:');
        console.log(JSON.stringify(junoTransactions[0], null, 2));
        
        // STEP 3: Test exact matching logic
        console.log('\n🎯 STEP 3: Matching Logic Test');
        console.log('-'.repeat(30));
        
        const targetAmount = Number(p.amount);
        const targetClabe = p.deposit_clabe;
        
        console.log(`Target Amount: ${targetAmount}`);
        console.log(`Target CLABE: ${targetClabe}`);
        
        let matchFound = false;
        
        junoTransactions.forEach((tx, index) => {
          const depositAmount = Number(tx.amount);
          const statusMatch = tx.status === 'complete';
          const amountMatch = depositAmount === targetAmount;
          const clabeMatch = tx.receiver_clabe === targetClabe;
          const isExactMatch = statusMatch && amountMatch && clabeMatch;
          
          console.log(`\nDeposit ${index + 1}:`);
          console.log(`  FID: ${tx.fid}`);
          console.log(`  Amount: ${tx.amount} (match: ${amountMatch ? '✅' : '❌'})`);
          console.log(`  Status: ${tx.status} (match: ${statusMatch ? '✅' : '❌'})`);
          console.log(`  CLABE: ${tx.receiver_clabe} (match: ${clabeMatch ? '✅' : '❌'})`);
          console.log(`  EXACT MATCH: ${isExactMatch ? '🎉 YES!' : '❌ NO'}`);
          
          if (isExactMatch) {
            matchFound = true;
            console.log(`\n🎉 PERFECT MATCH FOUND!`);
            console.log(`  This deposit should trigger automation for Payment 87`);
            console.log(`  Deposit Details:`);
            console.log(`    - FID: ${tx.fid}`);
            console.log(`    - Deposit ID: ${tx.deposit_id}`);
            console.log(`    - Created: ${tx.created_at}`);
          }
        });
        
        if (!matchFound) {
          console.log('\n❌ No exact matches found');
          console.log('Analyzing why:');
          
          const clabeMatches = junoTransactions.filter(d => d.receiver_clabe === targetClabe);
          const amountMatches = junoTransactions.filter(d => Number(d.amount) === targetAmount);
          const completeDeposits = junoTransactions.filter(d => d.status === 'complete');
          
          console.log(`  - Deposits with correct CLABE: ${clabeMatches.length}`);
          console.log(`  - Deposits with correct amount (${targetAmount}): ${amountMatches.length}`);
          console.log(`  - Deposits with 'complete' status: ${completeDeposits.length}`);
        }
        
        // STEP 4: Check if automation is running
        console.log('\n⚙️ STEP 4: Automation Status Check');
        console.log('-'.repeat(30));
        
        // Check recent payment events to see if automation has run
        const recentEvents = await ormconfig.query(`
          SELECT type, description, created_at 
          FROM payment_event 
          WHERE created_at > NOW() - INTERVAL '1 hour'
          ORDER BY created_at DESC 
          LIMIT 10
        `);
        
        console.log(`Recent payment events (last hour): ${recentEvents.length}`);
        recentEvents.forEach(event => {
          console.log(`  ${event.created_at}: ${event.type} - ${event.description || 'No description'}`);
        });
        
        if (recentEvents.length === 0) {
          console.log('⚠️ No recent payment events - automation may not be running');
        }
        
      } else {
        console.log('❌ No deposits returned from Juno API');
      }
      
    } catch (junoError) {
      console.error('❌ Error fetching Juno deposits:', junoError.message);
    }
    
    // STEP 5: Final diagnosis
    console.log('\n🏥 STEP 5: Final Diagnosis');
    console.log('-'.repeat(25));
    
    if (shouldProcessAutomation) {
      console.log('✅ Payment 87 meets all automation criteria');
      console.log('🔍 Next steps to investigate:');
      console.log('  1. Check if automation cron job is running');
      console.log('  2. Check if automation finds the matching deposit');
      console.log('  3. Check for any errors in automation execution');
      console.log('  4. Manually trigger processNewDeposits() method');
    } else {
      console.log('❌ Payment 87 does NOT meet automation criteria');
      console.log('🔧 Required fixes:');
      if (p.status !== 'pending') {
        console.log('  - Change status back to "pending"');
      }
      if (p.reference) {
        console.log('  - Clear reference field (set to NULL)');
      }
      if (!p.deposit_clabe) {
        console.log('  - Assign a valid CLABE');
      }
    }
    
    await ormconfig.destroy();
    
  } catch (error) {
    console.error('❌ Debug script error:', error.message);
    process.exit(1);
  }
}

// Execute debug
debugPayment87().catch(console.error);
