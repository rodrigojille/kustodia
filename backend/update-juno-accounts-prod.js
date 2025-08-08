// CRITICAL PRODUCTION FIX - Update Juno bank account IDs for both users
// This fixes the Payment 121 payout failure and ensures automation works correctly

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

console.log('🚨 CRITICAL PRODUCTION FIX - Updating Juno Bank Account IDs');
console.log('============================================================');

const updates = [
  {
    email: 'rodrigojille6@gmail.com',
    junoAccountId: 'f221c81a-d7f4-4456-b4cb-7a78c9308104',
    clabe: '002668900881819471',
    description: 'Original user with CLABE mapping'
  },
  {
    email: 'rodrigo@kustodia.mx', 
    junoAccountId: 'e782bf90-75bb-455e-8c09-a8d2013dcfac',
    clabe: 'TBD',
    description: 'Kustodia admin user'
  }
];

async function updateUser(userUpdate) {
  const { email, junoAccountId, description } = userUpdate;
  
  console.log(`\n📝 Updating ${email} (${description})`);
  console.log(`   Setting juno_bank_account_id = ${junoAccountId}`);
  
  const sql = `UPDATE \"user\" SET juno_bank_account_id = '${junoAccountId}' WHERE email = '${email}';`;
  const command = `heroku pg:psql -a kustodia-backend -c '${sql}'`;
  
  try {
    console.log(`   Executing: ${sql}`);
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('UPDATE 1')) {
      console.error(`   ❌ Error: ${stderr}`);
      return false;
    }
    
    console.log(`   ✅ Success: ${stdout.trim()}`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Failed to update ${email}:`, error.message);
    return false;
  }
}

async function verifyUpdates() {
  console.log('\n🔍 Verifying updates...');
  
  const verifySQL = `SELECT email, juno_bank_account_id, payout_clabe FROM \"user\" WHERE email IN ('rodrigojille6@gmail.com', 'rodrigo@kustodia.mx') ORDER BY email;`;
  const command = `heroku pg:psql -a kustodia-backend -c '${verifySQL}'`;
  
  try {
    const { stdout } = await execAsync(command);
    console.log('\n📋 Current user data:');
    console.log(stdout);
    return true;
  } catch (error) {
    console.error('❌ Failed to verify updates:', error.message);
    return false;
  }
}

async function checkPayment121() {
  console.log('\n🔍 Checking Payment 121 seller...');
  
  const sql = `SELECT p.id, u.email, u.juno_bank_account_id, u.payout_clabe FROM payment p JOIN \"user\" u ON p.seller_id = u.id WHERE p.id = 121;`;
  const command = `heroku pg:psql -a kustodia-backend -c '${sql}'`;
  
  try {
    const { stdout } = await execAsync(command);
    console.log('\n📋 Payment 121 seller data:');
    console.log(stdout);
    return true;
  } catch (error) {
    console.error('❌ Failed to check Payment 121:', error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('\n🚀 Starting database updates...');
    
    // Update both users
    let allSuccess = true;
    for (const userUpdate of updates) {
      const success = await updateUser(userUpdate);
      if (!success) allSuccess = false;
    }
    
    if (!allSuccess) {
      console.error('\n❌ Some updates failed. Check the errors above.');
      process.exit(1);
    }
    
    // Verify the updates
    await verifyUpdates();
    
    // Check Payment 121 specifically
    await checkPayment121();
    
    console.log('\n🎉 ALL UPDATES COMPLETED SUCCESSFULLY!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. ✅ Database updated with correct Juno bank account IDs');
    console.log('2. 🔄 Payment automation should now work correctly');
    console.log('3. 👀 Monitor logs for Payment 121 retry and successful payout');
    console.log('4. 🛠️  Fix the auto-registration logic to prevent future issues');
    
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

main();
