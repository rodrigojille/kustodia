require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');

async function checkJunoBalance() {
  const JUNO_ENV = process.env.JUNO_ENV || 'stage';
  const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY : process.env.JUNO_API_KEY;
  const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET : process.env.JUNO_API_SECRET;
  const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';

  try {
    console.log('💰 Checking Juno account balance and recent withdrawals...');
    
    // Check account balance
    const balanceUrl = `${BASE_URL}/mint_platform/v1/balances`;
    const balanceRequestPath = '/mint_platform/v1/balances';
    const method = 'GET';
    const nonce = Date.now().toString();
    
    const dataToSign = nonce + method + balanceRequestPath;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    
    const headers = {
      'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
    };
    
    const balanceResponse = await axios.get(balanceUrl, { headers });
    console.log('📊 Account Balances:');
    if (balanceResponse.data.payload) {
      balanceResponse.data.payload.forEach(balance => {
        console.log(`   ${balance.asset}: ${balance.available} (locked: ${balance.locked})`);
      });
    }
    
    // Check recent withdrawals
    console.log('\n📤 Recent Withdrawals:');
    const withdrawalsUrl = `${BASE_URL}/mint_platform/v1/withdrawals`;
    const withdrawalsRequestPath = '/mint_platform/v1/withdrawals';
    const withdrawalsNonce = Date.now().toString();
    
    const withdrawalsDataToSign = withdrawalsNonce + 'GET' + withdrawalsRequestPath;
    const withdrawalsSignature = crypto.createHmac('sha256', JUNO_API_SECRET).update(withdrawalsDataToSign).digest('hex');
    
    const withdrawalsHeaders = {
      'Authorization': `Bitso ${JUNO_API_KEY}:${withdrawalsNonce}:${withdrawalsSignature}`
    };
    
    const withdrawalsResponse = await axios.get(withdrawalsUrl, { headers: withdrawalsHeaders });
    if (withdrawalsResponse.data.payload && withdrawalsResponse.data.payload.length > 0) {
      withdrawalsResponse.data.payload.slice(0, 5).forEach(withdrawal => {
        console.log(`   ID: ${withdrawal.id}, Amount: ${withdrawal.amount} ${withdrawal.asset}, Status: ${withdrawal.status}, Created: ${withdrawal.created_at}`);
      });
    } else {
      console.log('   No recent withdrawals found');
    }
    
  } catch (error) {
    console.error('❌ Error checking Juno account:', error.response?.data || error.message);
  }
}

checkJunoBalance();
