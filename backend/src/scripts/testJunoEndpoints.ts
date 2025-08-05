import { initializeJunoService, listJunoTransactions, getRegisteredBankAccounts } from '../services/junoService';

async function testJunoEndpoints() {
  console.log('🔧 Initializing Juno Service...');
  initializeJunoService();
  
  console.log('\n📋 Testing Juno Endpoints in Production...\n');
  
  // Test 1: List Juno Transactions
  console.log('1️⃣ Testing listJunoTransactions()...');
  try {
    const transactions = await listJunoTransactions();
    console.log('✅ SUCCESS: listJunoTransactions()');
    console.log(`   📊 Found ${transactions.length} transactions`);
    if (transactions.length > 0) {
      console.log(`   📝 Latest transaction: ${JSON.stringify(transactions[0], null, 2)}`);
    }
  } catch (error: any) {
    console.log('❌ FAILED: listJunoTransactions()');
    console.log(`   🚨 Error: ${error.message}`);
    if (error.response) {
      console.log(`   📄 Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
  
  console.log('\n');
  
  // Test 2: Get Registered Bank Accounts
  console.log('2️⃣ Testing getRegisteredBankAccounts()...');
  try {
    const accounts = await getRegisteredBankAccounts();
    console.log('✅ SUCCESS: getRegisteredBankAccounts()');
    console.log(`   🏦 Found ${accounts.length} registered accounts`);
    if (accounts.length > 0) {
      console.log(`   📝 Accounts: ${JSON.stringify(accounts, null, 2)}`);
    }
  } catch (error: any) {
    console.log('❌ FAILED: getRegisteredBankAccounts()');
    console.log(`   🚨 Error: ${error.message}`);
    if (error.response) {
      console.log(`   📄 Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
  
  console.log('\n📊 Test Summary Complete');
}

// Run the test
testJunoEndpoints().catch(console.error);
