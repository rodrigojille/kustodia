require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

async function checkSpeiDeposits() {
  const JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
  const JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;
  const JUNO_BASE_URL = 'https://stage.buildwithjuno.com';
  
  try {
    console.log('=== Checking SPEI deposits ===');
    
    const endpoint = '/spei/v1/deposits';
    const fullUrl = `${JUNO_BASE_URL}${endpoint}`;
    const body = '';
    
    const signature = crypto
      .createHmac('sha256', JUNO_API_SECRET)
      .update(body)
      .digest('hex');
    
    const response = await axios.get(fullUrl, {
      headers: {
        'X-API-Key': JUNO_API_KEY,
        'X-Signature': signature,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.payload) {
      const deposits = response.data.payload.content || [];
      console.log('Total SPEI deposits found:', deposits.length);
      
      // Look for our specific deposit
      const ourDeposit = deposits.find(d => d.id === 'f86f16a5793b765eb92d5c966ebb2');
      
      if (ourDeposit) {
        console.log('\n=== FOUND OUR DEPOSIT ===');
        console.log('ID:', ourDeposit.id);
        console.log('Amount:', ourDeposit.amount);
        console.log('CLABE:', ourDeposit.receiver_clabe);
        console.log('Status:', ourDeposit.status);
        console.log('Created:', ourDeposit.created_at);
        console.log('Sender:', ourDeposit.sender_name);
        console.log('Receiver:', ourDeposit.receiver_name);
      } else {
        console.log('\n❌ Our deposit f86f16a5793b765eb92d5c966ebb2 NOT FOUND');
      }
      
      // Show all deposits with amount 1000
      const deposits1000 = deposits.filter(d => parseFloat(d.amount) === 1000);
      console.log('\n=== All deposits with amount 1000 ===');
      deposits1000.forEach(d => {
        console.log('ID:', d.id);
        console.log('CLABE:', d.receiver_clabe);
        console.log('Status:', d.status);
        console.log('Created:', d.created_at);
        console.log('---');
      });
      
      // Show deposits for our CLABE
      const ourClabeDeposits = deposits.filter(d => d.receiver_clabe === '710969000000396022');
      console.log('\n=== Deposits for CLABE 710969000000396022 ===');
      ourClabeDeposits.forEach(d => {
        console.log('ID:', d.id);
        console.log('Amount:', d.amount);
        console.log('Status:', d.status);
        console.log('Created:', d.created_at);
        console.log('---');
      });
      
    } else {
      console.log('No deposits found or unexpected response format');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('Error checking SPEI deposits:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

checkSpeiDeposits();
