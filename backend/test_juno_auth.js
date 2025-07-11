/**
 * 🔐 Test Juno Authentication Implementation
 * Verify our HMAC signature generation matches Juno's requirements
 */

const { getRegisteredBankAccounts } = require('./dist/services/junoService');

async function testJunoAuth() {
  console.log('🔐 Testing Juno Authentication...');
  console.log('═'.repeat(40));
  
  try {
    // Test 1: Get registered bank accounts (simple GET request)
    console.log('\n📋 Test 1: Get Registered Bank Accounts');
    console.log('-'.repeat(30));
    
    const bankAccounts = await getRegisteredBankAccounts();
    
    if (bankAccounts && bankAccounts.length >= 0) {
      console.log('✅ Authentication successful!');
      console.log(`📊 Found ${bankAccounts.length} registered bank accounts`);
      
      if (bankAccounts.length > 0) {
        console.log('\n📋 Available bank accounts for redemptions:');
        bankAccounts.forEach((account, index) => {
          console.log(`  ${index + 1}. ID: ${account.id}`);
          console.log(`     CLABE: ${account.clabe}`);
          console.log(`     Name: ${account.recipient_legal_name}`);
          console.log('');
        });
      } else {
        console.log('⚠️ No bank accounts registered - redemptions will fail');
        console.log('💡 Register a bank account in Juno console first');
      }
    } else {
      console.log('❌ Authentication failed or unexpected response');
    }
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n🔧 Authentication troubleshooting:');
      console.log('1. Check JUNO_STAGE_API_KEY environment variable');
      console.log('2. Check JUNO_STAGE_API_SECRET environment variable');
      console.log('3. Verify API credentials are valid in Juno console');
      console.log('4. Ensure signature generation matches Juno docs exactly');
    }
  }
}

testJunoAuth().catch(console.error);
