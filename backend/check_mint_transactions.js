require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

async function checkMintTransactions() {
  const JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
  const JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;
  const JUNO_BASE_URL = 'https://stage.buildwithjuno.com';
  
  try {
    console.log('=== Checking Mint Platform Transactions ===');
    
    const endpoint = '/mint_platform/v1/transactions';
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
      const transactions = response.data.payload.content || [];
      console.log('Total mint platform transactions found:', transactions.length);
      
      // Look for ISSUANCE transactions with amount 1000
      const issuanceTransactions = transactions.filter(tx => 
        tx.transaction_type === 'ISSUANCE' && 
        parseFloat(tx.amount) === 1000
      );
      
      console.log('\n=== ISSUANCE transactions with amount 1000 ===');
      issuanceTransactions.forEach(tx => {
        console.log('ID:', tx.id);
        console.log('Amount:', tx.amount);
        console.log('CLABE:', tx.clabe || 'null');
        console.log('Status:', tx.status);
        console.log('Created:', tx.created_at);
        console.log('---');
      });
      
      // Show recent transactions (last 10)
      const recentTransactions = transactions.slice(0, 10);
      console.log('\n=== Recent 10 transactions ===');
      recentTransactions.forEach(tx => {
        console.log('ID:', tx.id);
        console.log('Type:', tx.transaction_type);
        console.log('Amount:', tx.amount);
        console.log('CLABE:', tx.clabe || 'null');
        console.log('Status:', tx.status);
        console.log('Created:', tx.created_at);
        console.log('---');
      });
      
      // Check transactions created today
      const today = new Date().toISOString().split('T')[0];
      console.log(`\nChecking for transactions created today: ${today}`);
      
      const todayTransactions = transactions.filter(tx => 
        tx.created_at && tx.created_at.startsWith(today)
      );
      
      console.log(`\n=== Transactions created today (${today}) ===`);
      if (todayTransactions.length === 0) {
        console.log('No transactions found for today');
      } else {
        todayTransactions.forEach(tx => {
          console.log('ID:', tx.id);
          console.log('Type:', tx.transaction_type);
          console.log('Amount:', tx.amount);
          console.log('CLABE:', tx.clabe || 'null');
          console.log('Status:', tx.status);
          console.log('Created:', tx.created_at);
          console.log('---');
        });
      }
      
    } else {
      console.log('No transactions found or unexpected response format');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('Error checking mint transactions:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

checkMintTransactions();
