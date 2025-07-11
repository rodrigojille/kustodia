require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const JUNO_BASE_URL = 'https://sandbox-api.juno.com.mx';
const JUNO_API_KEY = process.env.JUNO_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_API_SECRET;
const PAYMENT_API_BASE_URL = process.env.PAYMENT_API_BASE_URL || 'http://localhost:4000';

// Create Juno auth signature
function createJunoSignature(method, path, body, nonce) {
  const dataToSign = nonce + method + path + (body || '');
  return crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
}

async function checkJunoServiceStatus() {
  try {
    const response = await axios.get(`${JUNO_BASE_URL}/v2/bank_accounts`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JUNO_API_KEY}:${JUNO_API_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ JUNO SERVICE: ONLINE');
    return true;
  } catch (error) {
    console.log('❌ JUNO SERVICE: DOWN');
    console.log(`   Error: ${error.code || error.message}`);
    return false;
  }
}

async function registerSellerClabeWithJuno(clabe, sellerEmail) {
  console.log(`\n🔗 REGISTERING SELLER CLABE WITH JUNO:`);
  console.log(`   CLABE: ${clabe}`);
  console.log(`   Seller: ${sellerEmail}`);
  
  const url = `${JUNO_BASE_URL}/v2/bank_accounts`;
  const requestPath = '/v2/bank_accounts';
  const method = 'POST';
  const nonce = Date.now().toString();
  
  const bankCode = clabe.substring(0, 3); // First 3 digits = bank code
  const accountNumber = clabe.substring(3); // Remaining digits = account number
  
  const bodyData = {
    account_number: accountNumber,
    bank_code: bankCode,
    account_type: 'clabe',
    holder_name: sellerEmail, // Use seller email as holder name for now
    holder_document: '123456789' // Mock document for testing
  };
  
  const body = JSON.stringify(bodyData);
  const signature = createJunoSignature(method, requestPath, body, nonce);
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
  };
  
  console.log(`\n📋 Registration Request:`);
  console.log(`   Bank Code: ${bankCode}`);
  console.log(`   Account Number: ${accountNumber}`);
  console.log(`   Holder: ${sellerEmail}`);
  
  try {
    const response = await axios.post(url, bodyData, { headers });
    const bankAccountId = response.data.payload?.id;
    
    console.log(`\n✅ CLABE REGISTERED SUCCESSFULLY:`);
    console.log(`   Juno Bank Account ID: ${bankAccountId}`);
    console.log(`   Response:`, response.data);
    
    return bankAccountId;
    
  } catch (error) {
    console.error(`\n❌ CLABE REGISTRATION FAILED:`);
    console.error(`   Error:`, error?.response?.data || error.message);
    
    if (error?.response?.status === 409) {
      console.log(`\n🔍 CLABE might already be registered. Checking existing accounts...`);
      return await findExistingBankAccount(clabe);
    }
    
    return null;
  }
}

async function findExistingBankAccount(clabe) {
  try {
    const response = await axios.get(`${JUNO_BASE_URL}/v2/bank_accounts`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JUNO_API_KEY}:${JUNO_API_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
    
    const accounts = response.data.payload || [];
    const matchingAccount = accounts.find(account => {
      const accountClabe = account.bank_code + account.account_number;
      return accountClabe === clabe;
    });
    
    if (matchingAccount) {
      console.log(`✅ FOUND EXISTING ACCOUNT:`);
      console.log(`   Juno Bank Account ID: ${matchingAccount.id}`);
      return matchingAccount.id;
    } else {
      console.log(`❌ No existing account found for CLABE ${clabe}`);
      return null;
    }
    
  } catch (error) {
    console.error(`❌ Error searching existing accounts:`, error.message);
    return null;
  }
}

async function updatePayment88WithJunoId(junoId) {
  console.log(`\n💾 UPDATING PAYMENT 88 WITH JUNO ID: ${junoId}`);
  
  console.log(`\n📋 MANUAL SQL UPDATE REQUIRED:`);
  console.log(`
  -- Update Payment 88 with seller Juno bank account ID
  UPDATE payments 
  SET payout_juno_bank_account_id = '${junoId}' 
  WHERE id = 88;
  
  -- Log the update
  INSERT INTO payment_events (payment_id, event_type, description, success, created_at)
  VALUES (88, 'seller_juno_id_set', 'Seller CLABE registered with Juno, UUID: ${junoId}', true, NOW());
  
  -- Reset payment for automation retry
  UPDATE payments SET status = 'escrowed' WHERE id = 88;
  UPDATE escrows SET status = 'released' WHERE id = 76;
  `);
  
  console.log(`\n✅ After running this SQL, automation will retry Payment 88 automatically`);
}

async function main() {
  console.log('🏦 REGISTER SELLER CLABE FOR PAYMENT 88\n');
  console.log(`Current Time: ${new Date().toISOString()}`);
  
  const SELLER_CLABE = '002668900881819471';
  const SELLER_EMAIL = 'test-seller@kustodia.mx';
  
  // Check if Juno service is online
  const junoOnline = await checkJunoServiceStatus();
  
  if (!junoOnline) {
    console.log('\n⏳ CANNOT PROCEED: Juno service is down');
    console.log('   Wait for Juno service recovery before registering CLABE');
    return;
  }
  
  // Register seller CLABE with Juno
  const junoId = await registerSellerClabeWithJuno(SELLER_CLABE, SELLER_EMAIL);
  
  if (junoId) {
    await updatePayment88WithJunoId(junoId);
    
    console.log('\n🎉 PAYMENT 88 READY FOR COMPLETION:');
    console.log('1. ✅ Seller CLABE registered with Juno');
    console.log('2. ⏳ Update Payment 88 with Juno ID (run SQL above)');
    console.log('3. ⏳ Reset payment/escrow status for retry');
    console.log('4. 🤖 Automation will complete payment within 2 minutes');
    
  } else {
    console.log('\n❌ REGISTRATION FAILED');
    console.log('   Manual intervention required');
    console.log('   Check Juno API documentation and credentials');
  }
}

main().catch(console.error);
