/**
 * 🔍 PAYMENT 87 AUTOMATION CLEAN DEBUG
 */

const { listJunoTransactions } = require('./dist/services/junoService');
const ormconfig = require('./dist/ormconfig').default;

async function debugPayment87Clean() {
  try {
    await ormconfig.initialize();
    
    console.log('🔍 PAYMENT 87 STATUS CHECK');
    console.log('═'.repeat(40));
    
    // Get Payment 87 details
    const payment = await ormconfig.query(`
      SELECT id, amount, deposit_clabe, reference, status, transaction_id, created_at 
      FROM payment WHERE id = 87
    `);
    
    if (payment.length === 0) {
      console.log('❌ Payment 87 not found');
      return;
    }
    
    const p = payment[0];
    console.log('\n📊 Payment 87 Database State:');
    console.log(`  ID: ${p.id}`);
    console.log(`  Amount: ${p.amount} MXN`);
    console.log(`  Status: "${p.status}"`);
    console.log(`  CLABE: ${p.deposit_clabe}`);
    console.log(`  Reference: ${p.reference || 'NULL'}`);
    console.log(`  Created: ${p.created_at}`);
    
    // Check automation criteria
    const isPending = p.status === 'pending';
    const hasNoReference = !p.reference;
    const hasClabe = !!p.deposit_clabe;
    const shouldProcess = isPending && hasNoReference && hasClabe;
    
    console.log(`\n✅ Automation Criteria:`);
    console.log(`  Status = 'pending': ${isPending ? '✅' : '❌'} (currently: "${p.status}")`);
    console.log(`  Reference is null: ${hasNoReference ? '✅' : '❌'} (currently: "${p.reference || 'NULL'}")`);
    console.log(`  Has CLABE: ${hasClabe ? '✅' : '❌'} (${p.deposit_clabe || 'MISSING'})`);
    console.log(`  Should process: ${shouldProcess ? '✅ YES' : '❌ NO'}`);
    
    // Check for matching deposits
    console.log(`\n📡 Checking Juno Deposits:`);
    const junoTransactions = await listJunoTransactions();
    console.log(`  Total deposits found: ${junoTransactions.length}`);
    
    if (junoTransactions.length > 0) {
      const targetAmount = Number(p.amount);
      const targetClabe = p.deposit_clabe;
      
      const exactMatch = junoTransactions.find(tx => {
        const depositAmount = Number(tx.amount);
        const statusMatch = tx.status === 'complete';
        const amountMatch = depositAmount === targetAmount;
        const clabeMatch = tx.receiver_clabe === targetClabe;
        return statusMatch && amountMatch && clabeMatch;
      });
      
      if (exactMatch) {
        console.log(`\n🎉 EXACT MATCH FOUND!`);
        console.log(`  FID: ${exactMatch.fid}`);
        console.log(`  Amount: ${exactMatch.amount} MXN`);
        console.log(`  Status: ${exactMatch.status}`);
        console.log(`  CLABE: ${exactMatch.receiver_clabe}`);
        console.log(`  Created: ${exactMatch.created_at}`);
      } else {
        console.log(`\n❌ No exact match found`);
        
        // Analysis
        const clabeMatches = junoTransactions.filter(d => d.receiver_clabe === targetClabe);
        const amountMatches = junoTransactions.filter(d => Number(d.amount) === targetAmount);
        const completeDeposits = junoTransactions.filter(d => d.status === 'complete');
        
        console.log(`  Deposits with CLABE ${targetClabe}: ${clabeMatches.length}`);
        console.log(`  Deposits with amount ${targetAmount}: ${amountMatches.length}`);
        console.log(`  Deposits with 'complete' status: ${completeDeposits.length}`);
      }
    }
    
    // Final recommendation
    console.log(`\n🏥 DIAGNOSIS:`);
    if (!shouldProcess) {
      console.log(`❌ Payment 87 blocked from automation by database state`);
      console.log(`🔧 SQL fixes needed:`);
      if (!isPending) {
        console.log(`   UPDATE payment SET status = 'pending' WHERE id = 87;`);
      }
      if (!hasNoReference) {
        console.log(`   UPDATE payment SET reference = NULL WHERE id = 87;`);
      }
    } else {
      console.log(`✅ Payment 87 ready for automation!`);
      console.log(`🚀 Next step: Run automation or check why it's not triggering`);
    }
    
    await ormconfig.destroy();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugPayment87Clean().catch(console.error);
