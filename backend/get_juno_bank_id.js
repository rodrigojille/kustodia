/**
 * Simple script to get Juno bank account ID and update database
 */

const axios = require('axios');
const crypto = require('crypto');
const { Client } = require('pg');

// Load environment variables
require('dotenv').config();

// Juno API configuration
const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY : process.env.JUNO_API_KEY;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET : process.env.JUNO_API_SECRET;
const JUNO_BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';

// Database configuration
const dbClient = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '140290',
  database: 'kustodia',
});

async function getJunoBankAccounts() {
  const url = `${JUNO_BASE_URL}/mint_platform/v1/accounts/banks`;
  const requestPath = '/mint_platform/v1/accounts/banks';
  const method = 'GET';
  const nonce = Date.now().toString();
  const body = '';

  // Build signature
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
  };

  try {
    console.log('🔄 Fetching bank accounts from Juno...');
    const response = await axios.get(url, { headers });
    return response.data.payload || [];
  } catch (error) {
    console.error('❌ Error fetching bank accounts:', error?.response?.data || error.message);
    return [];
  }
}

async function updateDatabase(junoAccountId, clabe) {
  try {
    console.log(`🔄 Updating database with Juno account ID: ${junoAccountId}`);
    
    const result = await dbClient.query(
      'UPDATE "user" SET juno_bank_account_id = $1 WHERE payout_clabe = $2',
      [junoAccountId, clabe]
    );
    
    console.log(`✅ Updated ${result.rowCount} users`);
    return result.rowCount;
  } catch (error) {
    console.error('❌ Database update error:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Juno bank account sync...');
    
    // Connect to database
    await dbClient.connect();
    console.log('✅ Connected to database');
    
    // Get bank accounts from Juno
    const bankAccounts = await getJunoBankAccounts();
    console.log(`✅ Found ${bankAccounts.length} bank accounts in Juno`);
    
    // Find the account with CLABE 002668900881819471
    const targetClabe = '002668900881819471';
    const matchingAccount = bankAccounts.find(account => account.clabe === targetClabe);
    
    if (matchingAccount) {
      console.log('✅ Found matching bank account:');
      console.log(`   CLABE: ${matchingAccount.clabe}`);
      console.log(`   ID: ${matchingAccount.id}`);
      console.log(`   Holder: ${matchingAccount.account_holder_name}`);
      console.log(`   Bank: ${matchingAccount.bank_name || 'N/A'}`);
      
      // Update database
      const updatedCount = await updateDatabase(matchingAccount.id, targetClabe);
      
      console.log(`\n🎉 SUCCESS! Updated ${updatedCount} users with Juno bank account ID`);
      
      // Verify the update
      const verifyResult = await dbClient.query(
        'SELECT id, email, payout_clabe, juno_bank_account_id FROM "user" WHERE payout_clabe = $1',
        [targetClabe]
      );
      
      console.log('\n🔍 Verification - Updated users:');
      verifyResult.rows.forEach(user => {
        console.log(`   ${user.email}: ${user.juno_bank_account_id}`);
      });
      
    } else {
      console.log(`❌ No bank account found with CLABE ${targetClabe}`);
      console.log('Available accounts:');
      bankAccounts.forEach(account => {
        console.log(`   CLABE: ${account.clabe}, ID: ${account.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await dbClient.end();
    console.log('🔄 Database connection closed');
  }
}

// Run the script
main();
