import dotenv from 'dotenv';
import crypto from 'crypto';
import axios from 'axios';

// Load environment variables
dotenv.config();

const STAGING_API_KEY = process.env.JUNO_STAGE_API_KEY!;
const STAGING_API_SECRET = process.env.JUNO_STAGE_API_SECRET!;
const STAGING_BASE_URL = process.env.JUNO_STAGE_BASE_URL!;

async function testStagingClabeCreation() {
  console.log('=== TESTING STAGING CLABE CREATION ===');
  console.log('Environment: staging');
  console.log('API Key:', STAGING_API_KEY);
  console.log('Base URL:', STAGING_BASE_URL);
  console.log('');

  try {
    // Create CLABE in staging
    const url = `${STAGING_BASE_URL}/mint_platform/v1/clabes`;
    const requestPath = '/mint_platform/v1/clabes';
    const httpMethod = 'POST';
    const jsonPayload = '{}';
    
    // Generate signature
    const nonce = Date.now().toString();
    const message = nonce + httpMethod + requestPath + jsonPayload;
    const signature = crypto.createHmac('sha256', STAGING_API_SECRET).update(message).digest('hex');
    const authHeader = `Bitso ${STAGING_API_KEY}:${nonce}:${signature}`;

    console.log('--- STAGING CLABE CREATION DEBUG ---');
    console.log('Full URL:', url);
    console.log('String to sign:', message);
    console.log('Signature:', signature);
    console.log('Auth Header:', authHeader);
    console.log('Request body:', jsonPayload);
    console.log('');

    const response = await axios.post(url, JSON.parse(jsonPayload), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    console.log('✅ STAGING CLABE CREATION SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.payload) {
      console.log('');
      console.log('🎉 CLABE Created Successfully in Staging:');
      console.log('CLABE:', response.data.payload.clabe);
      console.log('Bank:', response.data.payload.bank);
      console.log('Status:', response.data.payload.status);
    }

  } catch (error: any) {
    console.log('❌ STAGING CLABE CREATION FAILED');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status Text:', error.response.statusText);
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 403) {
        console.log('');
        console.log('🚨 403 Forbidden in STAGING too!');
        console.log('This suggests the issue might be with our implementation or staging account setup');
      } else if (error.response.status === 401) {
        console.log('');
        console.log('🚨 401 Unauthorized in STAGING');
        console.log('Check staging API credentials');
      }
    } else {
      console.log('Error:', error.message);
    }
  }
}

async function testStagingListTransactions() {
  console.log('');
  console.log('=== TESTING STAGING LIST TRANSACTIONS ===');
  
  try {
    const url = `${STAGING_BASE_URL}/spei/v1/deposits/`;
    const requestPath = '/spei/v1/deposits/';
    const httpMethod = 'GET';
    
    // Generate signature
    const nonce = Date.now().toString();
    const message = nonce + httpMethod + requestPath;
    const signature = crypto.createHmac('sha256', STAGING_API_SECRET).update(message).digest('hex');
    const authHeader = `Bitso ${STAGING_API_KEY}:${nonce}:${signature}`;

    console.log('Full URL:', url);
    console.log('Auth Header:', authHeader);

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    console.log('✅ STAGING LIST TRANSACTIONS SUCCESS!');
    console.log('Total items:', response.data.payload?.total_items || 0);
    
  } catch (error: any) {
    console.log('❌ STAGING LIST TRANSACTIONS FAILED');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

async function main() {
  console.log('🧪 TESTING STAGING JUNO API ENDPOINTS');
  console.log('=====================================');
  console.log('');
  
  // Test list transactions first (should work)
  await testStagingListTransactions();
  
  // Then test CLABE creation
  await testStagingClabeCreation();
  
  console.log('');
  console.log('=== TEST COMPLETE ===');
}

main().catch(console.error);
